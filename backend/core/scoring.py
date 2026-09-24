"""
Rule-based Vehicle Health scoring engine.

No machine learning, no prediction models — every score is produced by a
plain, documented, adjustable rule. This module is organized in two layers
so both halves stay independently testable:

  1. PURE FUNCTIONS (no database access) — one per factor, each takes
     plain values in and returns a 0-100 float out. These are what you
     change if you want to tune a rule.

  2. ORCHESTRATION (reads the DB via the ORM) — pulls a Vehicle's related
     rows, turns them into the plain values the pure functions expect,
     and assembles the final weighted score with a full breakdown.

Nothing here reads Vehicle.registration_number. It is a unique identifier
only, never a scoring input — see the assertion in FACTOR_WEIGHTS and the
docstring on Vehicle in core/models.py.

Health Score = Σ(factor_score × factor_weight), rounded to 2 decimals.
"""

from dataclasses import dataclass, field
from datetime import date

from django.utils import timezone

# ---------------------------------------------------------------------------
# 1. Weights — must sum to 100. Change a number here to change how much a
#    factor counts; nothing else needs to change.
# ---------------------------------------------------------------------------

FACTOR_WEIGHTS = {
    "engine_condition": 25,
    "service_history": 15,
    "mileage_usage": 15,
    "brake_condition": 10,
    "suspension_condition": 10,
    "accident_repair_history": 10,
    "battery_condition": 7,
    "tyre_condition": 8,
}
assert sum(FACTOR_WEIGHTS.values()) == 100, "FACTOR_WEIGHTS must sum to 100"

FACTOR_LABELS = {
    "engine_condition": "Engine Condition",
    "service_history": "Service History",
    "mileage_usage": "Mileage / Usage",
    "brake_condition": "Brake Condition",
    "suspension_condition": "Suspension Condition",
    "accident_repair_history": "Accident / Repair History",
    "battery_condition": "Battery Condition",
    "tyre_condition": "Tyre Condition",
}

STATUS_THRESHOLDS = [
    (80, "Healthy"),   # 80-100
    (60, "Moderate"),  # 60-79
    (0, "Needs Attention"),  # 0-59
]

# Component-inspection condition rating -> standardized 0-100 score.
# This is the rule an admin's judgment call ("Good", "Fair", ...) is
# converted through.
CONDITION_SCORE_MAP = {
    "excellent": 100,
    "good": 80,
    "fair": 60,
    "poor": 35,
    "critical": 10,
}

# Average annual usage (km/year) -> standardized 0-100 score. Benchmarked
# against ~10-12k km/year as typical passenger-vehicle usage in India;
# higher sustained usage accelerates wear, so it scores lower.
MILEAGE_BREAKPOINTS = [
    (10_000, 100),
    (15_000, 85),
    (20_000, 65),
    (25_000, 45),
    (float("inf"), 25),
]

# Accident/repair severity -> base penalty points subtracted from 100.
ACCIDENT_BASE_PENALTY = {
    "minor": 5,
    "moderate": 15,
    "severe": 35,
}
# Incidents older than this many years count at half weight — the vehicle
# has had time to be properly repaired and the risk has aged out somewhat.
ACCIDENT_RECENCY_HALF_LIFE_YEARS = 2
ACCIDENT_OLD_INCIDENT_MULTIPLIER = 0.5

# Service-history recency buckets: days since last service -> score.
SERVICE_RECENCY_BUCKETS = [
    (180, 100),
    (365, 70),
    (730, 40),
    (float("inf"), 15),
]
SERVICE_RECENCY_WEIGHT = 0.6
SERVICE_REGULARITY_WEIGHT = 0.4
# Expected services per year of vehicle age (e.g. one every 6 months).
EXPECTED_SERVICES_PER_YEAR = 2


class HealthScoreInputError(Exception):
    """
    Raised when the data needed to calculate a health score is missing or
    invalid. Deliberately never swallowed into a default of 0 — the caller
    (API view) turns this into a 400 response naming exactly what's missing,
    per the "do not silently assume missing values are zero" requirement.
    """

    def __init__(self, message, missing=None):
        super().__init__(message)
        self.missing = missing or []


# ---------------------------------------------------------------------------
# 2. Pure per-factor rules
# ---------------------------------------------------------------------------

def score_from_condition_rating(rating, *, factor_label="component"):
    """Engine / Brake / Suspension / Battery / Tyre condition -> 0-100."""
    if not rating:
        raise HealthScoreInputError(f"Missing condition rating for {factor_label}.")
    rating = str(rating).lower().strip()
    if rating not in CONDITION_SCORE_MAP:
        raise HealthScoreInputError(
            f"Invalid condition rating '{rating}' for {factor_label}. "
            f"Expected one of: {', '.join(CONDITION_SCORE_MAP)}."
        )
    return float(CONDITION_SCORE_MAP[rating])


def score_mileage_usage(current_km, manufacturing_year, purchase_date=None, today=None):
    """Average annual usage -> 0-100. Higher sustained usage scores lower."""
    if current_km is None:
        raise HealthScoreInputError("Missing current odometer reading (current_km).")
    if current_km < 0:
        raise HealthScoreInputError("current_km cannot be negative.")
    if not manufacturing_year:
        raise HealthScoreInputError("Missing manufacturing_year for mileage calculation.")

    today = today or timezone.localdate()
    start_date = purchase_date or date(manufacturing_year, 1, 1)
    age_days = (today - start_date).days
    if age_days <= 0:
        # Vehicle registered today / in the future — nothing to average yet.
        avg_annual_km = float(current_km)
    else:
        age_years = age_days / 365.25
        avg_annual_km = current_km / age_years

    for threshold, score in MILEAGE_BREAKPOINTS:
        if avg_annual_km <= threshold:
            return float(score)
    return float(MILEAGE_BREAKPOINTS[-1][1])  # unreachable (last bound is inf); kept for safety


def score_service_history(last_service_date, service_count, vehicle_age_years, today=None):
    """
    Service regularity/recency -> 0-100.

    last_service_date=None and service_count=0 are legitimate inputs
    (vehicle has never been serviced) and are scored as such, not treated
    as missing data — the absence of service records is itself the fact
    being scored.
    """
    if service_count is None:
        raise HealthScoreInputError("Missing service_count for service-history calculation.")
    if service_count < 0:
        raise HealthScoreInputError("service_count cannot be negative.")
    if vehicle_age_years is None or vehicle_age_years < 0:
        raise HealthScoreInputError("Missing or invalid vehicle age for service-history calculation.")

    today = today or timezone.localdate()

    # Recency component
    if last_service_date is None:
        recency_score = 0.0
    else:
        days_since = (today - last_service_date).days
        recency_score = None
        for threshold, score in SERVICE_RECENCY_BUCKETS:
            if days_since <= threshold:
                recency_score = float(score)
                break
        if recency_score is None:
            recency_score = float(SERVICE_RECENCY_BUCKETS[-1][1])

    # Regularity component
    if vehicle_age_years < 0.5:
        # Too new to expect a service yet — don't penalize.
        regularity_score = 100.0
    else:
        expected_services = max(round(vehicle_age_years * EXPECTED_SERVICES_PER_YEAR), 1)
        regularity_score = min(100.0, (service_count / expected_services) * 100)

    return round(SERVICE_RECENCY_WEIGHT * recency_score + SERVICE_REGULARITY_WEIGHT * regularity_score, 2)


def score_accident_repair_history(incidents, today=None):
    """
    incidents: iterable of {"severity": "minor"|"moderate"|"severe", "date": date}.
    An empty list is a legitimate clean-history input, scored 100 — not
    treated as missing data.
    """
    if incidents is None:
        raise HealthScoreInputError("incidents must be a list (use [] for a clean history, not None).")

    today = today or timezone.localdate()
    score = 100.0
    for incident in incidents:
        severity = incident.get("severity")
        incident_date = incident.get("date")
        if severity not in ACCIDENT_BASE_PENALTY:
            raise HealthScoreInputError(f"Invalid accident/repair severity '{severity}'.")
        if incident_date is None:
            raise HealthScoreInputError("Accident/repair record is missing its date.")

        penalty = ACCIDENT_BASE_PENALTY[severity]
        age_years = (today - incident_date).days / 365.25
        if age_years > ACCIDENT_RECENCY_HALF_LIFE_YEARS:
            penalty *= ACCIDENT_OLD_INCIDENT_MULTIPLIER
        score -= penalty

    return round(max(0.0, min(100.0, score)), 2)


def status_for_score(score):
    for threshold, status in STATUS_THRESHOLDS:
        if score >= threshold:
            return status
    return STATUS_THRESHOLDS[-1][1]


@dataclass
class FactorResult:
    key: str
    label: str
    raw_input_summary: str
    score: float
    weight_pct: float
    contribution: float = field(init=False)

    def __post_init__(self):
        self.contribution = round(self.score * self.weight_pct / 100, 2)


def aggregate(factor_scores: dict) -> float:
    """
    factor_scores: {factor_key: 0-100 score, ...} — must contain exactly
    the keys in FACTOR_WEIGHTS. This is the direct implementation of
    Health Score = Σ(Factor Score × Factor Weight).
    """
    missing = [k for k in FACTOR_WEIGHTS if k not in factor_scores]
    if missing:
        raise HealthScoreInputError(
            f"Missing factor scores for: {', '.join(missing)}.", missing=missing
        )
    extra = [k for k in factor_scores if k not in FACTOR_WEIGHTS]
    if extra:
        raise HealthScoreInputError(f"Unknown factor keys: {', '.join(extra)}.")

    for key, value in factor_scores.items():
        if value is None:
            raise HealthScoreInputError(f"Factor '{key}' has no score (None).")
        if not (0 <= value <= 100):
            raise HealthScoreInputError(f"Factor '{key}' score {value} is out of range 0-100.")

    total = sum(factor_scores[key] * FACTOR_WEIGHTS[key] for key in FACTOR_WEIGHTS) / 100
    return round(total, 2)


# ---------------------------------------------------------------------------
# 3. Orchestration — reads a Vehicle's related rows and runs the rules above.
# ---------------------------------------------------------------------------

_COMPONENT_TO_FACTOR = {
    "engine": "engine_condition",
    "brake": "brake_condition",
    "suspension": "suspension_condition",
    "battery": "battery_condition",
    "tyre": "tyre_condition",
}
_COMPONENT_LABELS = {
    "engine": "Engine",
    "brake": "Brake",
    "suspension": "Suspension",
    "battery": "Battery",
    "tyre": "Tyre",
}


def _vehicle_age_years(vehicle, today=None):
    today = today or timezone.localdate()
    start_date = vehicle.purchase_date or date(vehicle.manufacturing_year, 1, 1)
    return max((today - start_date).days, 0) / 365.25


def calculate_health_score_for_vehicle(vehicle, today=None) -> dict:
    """
    Reads the vehicle's component inspections, service records, and
    accident/repair records, and returns:
        {"total_score": float, "status": str, "factors": [FactorResult, ...]}

    Raises HealthScoreInputError (listing exactly what's missing) if a
    required component inspection hasn't been entered yet — it never
    defaults a missing inspection to a score of 0 or 100.
    """
    today = today or timezone.localdate()
    factor_scores = {}
    factor_details = {}

    # --- Component-condition factors (engine, brake, suspension, battery, tyre) ---
    inspections_by_component = {
        insp.component: insp for insp in vehicle.component_inspections.all()
    }
    missing_components = [
        component for component in _COMPONENT_TO_FACTOR if component not in inspections_by_component
    ]
    if missing_components:
        labels = [_COMPONENT_LABELS[c] for c in missing_components]
        raise HealthScoreInputError(
            f"Cannot calculate health score for {vehicle.registration_number}: "
            f"no inspection recorded yet for: {', '.join(labels)}.",
            missing=missing_components,
        )

    for component, factor_key in _COMPONENT_TO_FACTOR.items():
        inspection = inspections_by_component[component]
        score = score_from_condition_rating(inspection.condition_rating, factor_label=factor_key)
        factor_scores[factor_key] = score
        factor_details[factor_key] = f"Condition rating: {inspection.get_condition_rating_display()}"

    # --- Service history ---
    service_dates = list(
        vehicle.service_records.order_by("-service_date").values_list("service_date", flat=True)
    )
    last_service_date = service_dates[0] if service_dates else None
    vehicle_age_years = _vehicle_age_years(vehicle, today=today)
    service_score = score_service_history(
        last_service_date=last_service_date,
        service_count=len(service_dates),
        vehicle_age_years=vehicle_age_years,
        today=today,
    )
    factor_scores["service_history"] = service_score
    factor_details["service_history"] = (
        f"{len(service_dates)} service record(s); last serviced "
        f"{last_service_date.isoformat() if last_service_date else 'never'}"
    )

    # --- Mileage / usage ---
    mileage_score = score_mileage_usage(
        current_km=vehicle.current_km,
        manufacturing_year=vehicle.manufacturing_year,
        purchase_date=vehicle.purchase_date,
        today=today,
    )
    factor_scores["mileage_usage"] = mileage_score
    avg_annual_km = round(vehicle.current_km / max(vehicle_age_years, 1 / 365), 0)
    factor_details["mileage_usage"] = f"{vehicle.current_km} km total, ~{int(avg_annual_km):,} km/year"

    # --- Accident / repair history ---
    incidents = [
        {"severity": rec.severity, "date": rec.incident_date}
        for rec in vehicle.accident_records.all()
    ]
    accident_score = score_accident_repair_history(incidents, today=today)
    factor_scores["accident_repair_history"] = accident_score
    factor_details["accident_repair_history"] = (
        f"{len(incidents)} accident/repair record(s)" if incidents else "No accident/repair records (clean history)"
    )

    total_score = aggregate(factor_scores)
    status = status_for_score(total_score)

    factors = [
        FactorResult(
            key=key,
            label=FACTOR_LABELS[key],
            raw_input_summary=factor_details[key],
            score=factor_scores[key],
            weight_pct=FACTOR_WEIGHTS[key],
        )
        for key in FACTOR_WEIGHTS
    ]

    return {"total_score": total_score, "status": status, "factors": factors}


def persist_health_score(vehicle, today=None):
    """
    Calculates and stores a new HealthScore + HealthFactorScore breakdown
    for the vehicle. Called automatically whenever a ServiceRecord,
    ComponentInspection, or AccidentRecord is saved (see core/signals.py),
    and can also be called explicitly (e.g. from a "recalculate" endpoint).
    """
    from core.models import HealthFactorScore, HealthScore  # local import avoids a circular import at module load

    result = calculate_health_score_for_vehicle(vehicle, today=today)

    health_score = HealthScore.objects.create(
        vehicle=vehicle,
        score=result["total_score"],
        status=result["status"],
    )
    HealthFactorScore.objects.bulk_create(
        [
            HealthFactorScore(
                health_score=health_score,
                factor_key=f.key,
                factor_label=f.label,
                raw_input_summary=f.raw_input_summary,
                factor_score=f.score,
                weight_pct=f.weight_pct,
                contribution=f.contribution,
            )
            for f in result["factors"]
        ]
    )
    return health_score
