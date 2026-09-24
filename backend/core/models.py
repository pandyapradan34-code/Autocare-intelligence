"""
Core data models for the Vehicle Health Intelligence System.

Field names/shapes deliberately mirror the frontend's dummy data
(src/data/customerData.js, vehiclesData.js, serviceRecordsData.js,
componentHealthData.js) and the planned schema in
schema-project/schema.sql, so a future API integration doesn't require
redesigning either side.

IMPORTANT — registration_number is a unique identifier only. It is never
read by core.scoring; that module never even imports Vehicle.registration_number
into a calculation. See core/scoring.py.
"""

import re

from django.db import models


def normalize_registration_number(value):
    """
    Collapses formatting differences ("MH12 AB 4521", "mh12ab4521",
    "MH-12-AB-4521") down to one canonical form so duplicate-prevention
    actually catches duplicates regardless of how different admins type a
    plate number. Used by both Vehicle.save() and VehicleSerializer, so
    there's exactly one place this rule lives.
    """
    if not value:
        return value
    return re.sub(r"[\s\-]+", "", value).upper()


class Customer(models.Model):
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Active")
    joined_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} <{self.email}>"


class Vehicle(models.Model):
    FUEL_TYPE_CHOICES = [
        ("Petrol", "Petrol"),
        ("Diesel", "Diesel"),
        ("CNG", "CNG"),
        ("Electric", "Electric"),
        ("Hybrid", "Hybrid"),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="vehicles")

    # Unique identifier for the vehicle. Deliberately NOT a scoring input —
    # see the module docstring and core/scoring.py.
    registration_number = models.CharField(max_length=20, unique=True)

    brand = models.CharField(max_length=60)
    model = models.CharField(max_length=60)
    variant = models.CharField(max_length=60, blank=True, default="")
    manufacturing_year = models.PositiveSmallIntegerField()
    purchase_date = models.DateField(null=True, blank=True)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES, blank=True, default="")
    engine_type = models.CharField(max_length=80, blank=True, default="")
    current_km = models.PositiveIntegerField(default=0)
    previous_owners = models.PositiveSmallIntegerField(default=0)
    insurance_valid_till = models.DateField(null=True, blank=True)
    puc_valid_till = models.DateField(null=True, blank=True)
    color = models.CharField(max_length=40, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.brand} {self.model} ({self.registration_number})"

    def save(self, *args, **kwargs):
        # Normalize so "mh12ab4521", "MH12 AB 4521" and "MH-12-AB-4521" all
        # collide on the uniqueness check instead of silently creating a
        # duplicate vehicle.
        self.registration_number = normalize_registration_number(self.registration_number)
        super().save(*args, **kwargs)

    @property
    def latest_health_score(self):
        return self.health_scores.order_by("-calculated_at").first()


class ComponentInspection(models.Model):
    """
    Admin/mechanic-entered inspection condition for one component of one
    vehicle. One row per (vehicle, component) — re-inspecting a component
    updates this row rather than creating a new one, matching the planned
    schema's `component_health` table (current-state, not a log).

    condition_rating is the RAW input an admin actually enters during an
    inspection (a judgment call, not a precise number). core.scoring
    converts it into a standardized 0-100 score via CONDITION_SCORE_MAP.
    """

    COMPONENT_CHOICES = [
        ("engine", "Engine"),
        ("brake", "Brake"),
        ("suspension", "Suspension"),
        ("battery", "Battery"),
        ("tyre", "Tyre"),
    ]

    CONDITION_CHOICES = [
        ("excellent", "Excellent"),
        ("good", "Good"),
        ("fair", "Fair"),
        ("poor", "Poor"),
        ("critical", "Critical"),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="component_inspections")
    component = models.CharField(max_length=20, choices=COMPONENT_CHOICES)
    condition_rating = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    notes = models.TextField(blank=True, default="")
    inspected_date = models.DateField()
    inspected_by = models.CharField(max_length=120, blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("vehicle", "component")
        ordering = ["component"]

    def __str__(self):
        return f"{self.vehicle} — {self.get_component_display()}: {self.get_condition_rating_display()}"


class AccidentRecord(models.Model):
    """
    One accident or major-repair incident for a vehicle. Zero rows for a
    vehicle is a legitimate, meaningful state (clean history) — it is not
    treated as missing data by the scoring engine.
    """

    INCIDENT_TYPE_CHOICES = [
        ("accident", "Accident"),
        ("major_repair", "Major Repair"),
    ]
    SEVERITY_CHOICES = [
        ("minor", "Minor"),
        ("moderate", "Moderate"),
        ("severe", "Severe"),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="accident_records")
    incident_type = models.CharField(max_length=20, choices=INCIDENT_TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    incident_date = models.DateField()
    description = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-incident_date"]

    def __str__(self):
        return f"{self.vehicle} — {self.get_incident_type_display()} ({self.get_severity_display()})"


class ServiceRecord(models.Model):
    SERVICE_TYPE_CHOICES = [
        ("Periodic Maintenance", "Periodic Maintenance"),
        ("Repair", "Repair"),
        ("Inspection", "Inspection"),
        ("Warranty Service", "Warranty Service"),
        ("Other", "Other"),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="service_records")
    service_date = models.DateField()
    odometer = models.PositiveIntegerField()
    service_type = models.CharField(max_length=60, choices=SERVICE_TYPE_CHOICES, default="Periodic Maintenance")
    mechanic_name = models.CharField(max_length=120, blank=True, default="")
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    next_service_due = models.DateField(null=True, blank=True)
    remarks = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-service_date"]

    def __str__(self):
        return f"{self.vehicle} — {self.service_type} on {self.service_date}"


class ServiceWorkItem(models.Model):
    WORK_TYPE_CHOICES = [
        ("oil_change", "Oil Change"),
        ("brake_service", "Brake Service"),
        ("battery_replacement", "Battery Replacement"),
        ("tyre_replacement", "Tyre Replacement"),
        ("air_filter", "Air Filter"),
        ("coolant", "Coolant"),
        ("ac_service", "AC Service"),
        ("suspension_work", "Suspension Work"),
        ("engine_work", "Engine Work"),
    ]

    service_record = models.ForeignKey(ServiceRecord, on_delete=models.CASCADE, related_name="work_items")
    work_type = models.CharField(max_length=30, choices=WORK_TYPE_CHOICES)

    class Meta:
        unique_together = ("service_record", "work_type")


class ServicePart(models.Model):
    ACTION_CHOICES = [
        ("replaced", "Replaced"),
        ("repaired", "Repaired"),
    ]

    service_record = models.ForeignKey(ServiceRecord, on_delete=models.CASCADE, related_name="parts")
    part_name = models.CharField(max_length=100)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)

    def __str__(self):
        return f"{self.part_name} ({self.action})"


class HealthScore(models.Model):
    """
    One calculated health score for a vehicle at a point in time. A new row
    is written every time the score is (re)calculated, so the full history
    is queryable for a trend view — nothing is overwritten.
    """

    STATUS_CHOICES = [
        ("Healthy", "Healthy"),
        ("Moderate", "Moderate"),
        ("Needs Attention", "Needs Attention"),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="health_scores")
    score = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-calculated_at"]
        get_latest_by = "calculated_at"

    def __str__(self):
        return f"{self.vehicle} — {self.score}/100 ({self.status}) @ {self.calculated_at:%Y-%m-%d}"


class HealthFactorScore(models.Model):
    """
    One factor's contribution to a HealthScore row — the full, auditable
    "how was this number calculated" breakdown. This is what makes the
    system transparent: for any HealthScore, its factor_scores explain the
    total to the last decimal.
    """

    health_score = models.ForeignKey(HealthScore, on_delete=models.CASCADE, related_name="factor_scores")
    factor_key = models.CharField(max_length=40)       # e.g. "engine_condition"
    factor_label = models.CharField(max_length=80)      # e.g. "Engine Condition"
    raw_input_summary = models.CharField(max_length=200)  # e.g. "Condition rating: Good"
    factor_score = models.DecimalField(max_digits=5, decimal_places=2)   # 0-100
    weight_pct = models.DecimalField(max_digits=5, decimal_places=2)     # e.g. 25.00
    contribution = models.DecimalField(max_digits=5, decimal_places=2)   # factor_score * weight_pct / 100

    class Meta:
        ordering = ["-weight_pct"]

    def __str__(self):
        return f"{self.factor_label}: {self.factor_score} x {self.weight_pct}% = {self.contribution}"
