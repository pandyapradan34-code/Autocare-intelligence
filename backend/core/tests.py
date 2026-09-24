from datetime import date

from django.db import transaction
from django.test import TestCase
from rest_framework.test import APIClient

from core import scoring
from core.models import AccidentRecord, ComponentInspection, Customer, ServiceRecord, Vehicle


class AggregateWorkedExampleTests(TestCase):
    """Reproduces the exact worked example from the spec:

    Engine=85, Service=90, Mileage=80, Brake=65, Suspension=85,
    Accident/Repair=70, Battery=90, Tyres=90
    -> 82.25 / 100, Healthy
    """

    def test_worked_example_matches_exactly(self):
        factor_scores = {
            "engine_condition": 85,
            "service_history": 90,
            "mileage_usage": 80,
            "brake_condition": 65,
            "suspension_condition": 85,
            "accident_repair_history": 70,
            "battery_condition": 90,
            "tyre_condition": 90,
        }
        total = scoring.aggregate(factor_scores)
        self.assertEqual(total, 82.25)
        self.assertEqual(scoring.status_for_score(total), "Healthy")

    def test_status_thresholds(self):
        self.assertEqual(scoring.status_for_score(100), "Healthy")
        self.assertEqual(scoring.status_for_score(80), "Healthy")
        self.assertEqual(scoring.status_for_score(79.9), "Moderate")
        self.assertEqual(scoring.status_for_score(60), "Moderate")
        self.assertEqual(scoring.status_for_score(59.9), "Needs Attention")
        self.assertEqual(scoring.status_for_score(0), "Needs Attention")

    def test_missing_factor_raises_instead_of_defaulting_to_zero(self):
        incomplete = {k: 80 for k in list(scoring.FACTOR_WEIGHTS)[:-1]}  # drop the last factor
        with self.assertRaises(scoring.HealthScoreInputError) as ctx:
            scoring.aggregate(incomplete)
        self.assertIn("tyre_condition", ctx.exception.missing)

    def test_out_of_range_factor_score_rejected(self):
        scores = {k: 80 for k in scoring.FACTOR_WEIGHTS}
        scores["engine_condition"] = 150
        with self.assertRaises(scoring.HealthScoreInputError):
            scoring.aggregate(scores)


class ConditionRatingScoringTests(TestCase):
    def test_all_ratings_map_correctly(self):
        self.assertEqual(scoring.score_from_condition_rating("excellent"), 100)
        self.assertEqual(scoring.score_from_condition_rating("Good"), 80)  # case-insensitive
        self.assertEqual(scoring.score_from_condition_rating("fair"), 60)
        self.assertEqual(scoring.score_from_condition_rating("poor"), 35)
        self.assertEqual(scoring.score_from_condition_rating("critical"), 10)

    def test_missing_rating_raises(self):
        with self.assertRaises(scoring.HealthScoreInputError):
            scoring.score_from_condition_rating(None)
        with self.assertRaises(scoring.HealthScoreInputError):
            scoring.score_from_condition_rating("")

    def test_invalid_rating_raises(self):
        with self.assertRaises(scoring.HealthScoreInputError):
            scoring.score_from_condition_rating("brand-new")


class MileageScoringTests(TestCase):
    def test_low_usage_scores_high(self):
        score = scoring.score_mileage_usage(
            current_km=8000, manufacturing_year=2025, today=date(2026, 9, 23)
        )
        self.assertEqual(score, 100)

    def test_very_high_usage_scores_low(self):
        score = scoring.score_mileage_usage(
            current_km=200000, manufacturing_year=2020, today=date(2026, 9, 23)
        )
        self.assertEqual(score, 25)

    def test_missing_km_raises(self):
        with self.assertRaises(scoring.HealthScoreInputError):
            scoring.score_mileage_usage(current_km=None, manufacturing_year=2020)

    def test_negative_km_raises(self):
        with self.assertRaises(scoring.HealthScoreInputError):
            scoring.score_mileage_usage(current_km=-5, manufacturing_year=2020)


class ServiceHistoryScoringTests(TestCase):
    def test_never_serviced_old_vehicle_scores_low(self):
        score = scoring.score_service_history(
            last_service_date=None, service_count=0, vehicle_age_years=5, today=date(2026, 9, 23)
        )
        self.assertLess(score, 30)

    def test_recently_and_regularly_serviced_scores_high(self):
        score = scoring.score_service_history(
            last_service_date=date(2026, 8, 1), service_count=10, vehicle_age_years=5, today=date(2026, 9, 23)
        )
        self.assertEqual(score, 100)

    def test_brand_new_vehicle_not_penalized_for_no_service_yet(self):
        score = scoring.score_service_history(
            last_service_date=None, service_count=0, vehicle_age_years=0.1, today=date(2026, 9, 23)
        )
        # Recency component is still 0 (never serviced) but regularity isn't
        # penalized — a 5-week-old car isn't "overdue".
        self.assertEqual(score, 40.0)  # 0.6*0 + 0.4*100


class AccidentHistoryScoringTests(TestCase):
    def test_clean_history_scores_100(self):
        self.assertEqual(scoring.score_accident_repair_history([]), 100)

    def test_none_is_rejected_not_treated_as_clean(self):
        with self.assertRaises(scoring.HealthScoreInputError):
            scoring.score_accident_repair_history(None)

    def test_recent_severe_accident_penalized_heavily(self):
        score = scoring.score_accident_repair_history(
            [{"severity": "severe", "date": date(2026, 6, 1)}], today=date(2026, 9, 23)
        )
        self.assertEqual(score, 65)  # 100 - 35

    def test_old_incident_penalized_at_half_weight(self):
        score = scoring.score_accident_repair_history(
            [{"severity": "severe", "date": date(2020, 1, 1)}], today=date(2026, 9, 23)
        )
        self.assertEqual(score, 82.5)  # 100 - 35*0.5


class EndToEndOrchestrationTests(TestCase):
    """Exercises the DB-reading orchestrator + auto-recalculation signals."""

    def setUp(self):
        self.customer = Customer.objects.create(
            name="Rohan Mehta", email="rohan@example.com", phone="+91 90000 00001"
        )
        self.vehicle = Vehicle.objects.create(
            customer=self.customer,
            registration_number="mh12 ab 4521",  # deliberately messy casing/spacing
            brand="Honda",
            model="City VX",
            manufacturing_year=2020,
            current_km=82450,
            fuel_type="Petrol",
        )

    def test_registration_number_is_normalized_and_unique(self):
        self.vehicle.refresh_from_db()
        self.assertEqual(self.vehicle.registration_number, "MH12AB4521")
        for variant in ["mh12ab4521", "MH12 AB 4521", "MH-12-AB-4521"]:
            with self.assertRaises(Exception), transaction.atomic():
                Vehicle.objects.create(
                    customer=self.customer,
                    registration_number=variant,  # same plate, different formatting -> still blocked
                    brand="Honda", model="City VX", manufacturing_year=2020,
                )

    def test_health_calculation_fails_clearly_when_inspections_missing(self):
        with self.assertRaises(scoring.HealthScoreInputError) as ctx:
            scoring.calculate_health_score_for_vehicle(self.vehicle)
        # No inspections entered at all yet -> every component should be listed.
        self.assertEqual(len(ctx.exception.missing), 5)

    def test_registration_number_never_affects_the_score(self):
        for component, rating in [
            ("engine", "good"), ("brake", "good"), ("suspension", "good"),
            ("battery", "good"), ("tyre", "good"),
        ]:
            ComponentInspection.objects.create(
                vehicle=self.vehicle, component=component, condition_rating=rating,
                inspected_date=date(2026, 9, 1),
            )
        result_a = scoring.calculate_health_score_for_vehicle(self.vehicle, today=date(2026, 9, 23))

        self.vehicle.registration_number = "DL01 ZZ 9999"
        self.vehicle.save()
        result_b = scoring.calculate_health_score_for_vehicle(self.vehicle, today=date(2026, 9, 23))

        self.assertEqual(result_a["total_score"], result_b["total_score"])

    def test_full_flow_calculates_persists_and_recalculates_via_signals(self):
        for component, rating in [
            ("engine", "good"), ("brake", "fair"), ("suspension", "good"),
            ("battery", "excellent"), ("tyre", "good"),
        ]:
            ComponentInspection.objects.create(
                vehicle=self.vehicle, component=component, condition_rating=rating,
                inspected_date=date(2026, 9, 1),
            )
        # First save triggers the post_save signal -> a HealthScore should
        # already exist even before we call anything explicitly.
        self.assertIsNotNone(self.vehicle.latest_health_score)
        first_score = self.vehicle.latest_health_score.score

        # Adding a service record recalculates automatically.
        ServiceRecord.objects.create(
            vehicle=self.vehicle, service_date=date(2026, 9, 20), odometer=82500, service_type="Repair"
        )
        self.vehicle.refresh_from_db()
        second = self.vehicle.latest_health_score
        self.assertIsNotNone(second)
        self.assertEqual(self.vehicle.health_scores.count(), 2)

        # A severe accident recalculates again and should lower the score.
        AccidentRecord.objects.create(
            vehicle=self.vehicle, incident_type="accident", severity="severe",
            incident_date=date(2026, 9, 1),
        )
        self.vehicle.refresh_from_db()
        third = self.vehicle.latest_health_score
        self.assertLess(third.score, second.score)
        self.assertEqual(self.vehicle.health_scores.count(), 3)

        # Breakdown is fully transparent and re-sums to the stored total.
        breakdown_sum = sum(f.contribution for f in third.factor_scores.all())
        self.assertAlmostEqual(float(breakdown_sum), float(third.score), places=1)


class HealthAPIEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = Customer.objects.create(name="Ananya Iyer", email="ananya@example.com", phone="+91 90000 00002")
        self.vehicle = Vehicle.objects.create(
            customer=self.customer, registration_number="KA05 MJ 8890",
            brand="Hyundai", model="Creta SX", manufacturing_year=2022, current_km=41200,
        )

    def test_health_endpoint_returns_400_with_missing_list_when_data_incomplete(self):
        response = self.client.get(f"/api/vehicles/{self.vehicle.id}/health/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("missing", response.json())

    def test_health_endpoint_returns_expected_shape_once_complete(self):
        for component in ["engine", "brake", "suspension", "battery", "tyre"]:
            ComponentInspection.objects.create(
                vehicle=self.vehicle, component=component, condition_rating="good",
                inspected_date=date(2026, 9, 1),
            )
        response = self.client.get(f"/api/vehicles/{self.vehicle.id}/health/")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["vehicle_id"], self.vehicle.id)
        self.assertIn("health_score", body)
        self.assertIn("status", body)
        self.assertEqual(len(body["breakdown"]), 8)

    def test_duplicate_registration_number_rejected_via_api(self):
        payload = {
            "customer": self.customer.id, "registration_number": "KA05 MJ 8890",
            "brand": "Tata", "model": "Nexon", "manufacturing_year": 2021,
        }
        response = self.client.post("/api/vehicles/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("registration_number", response.json())
