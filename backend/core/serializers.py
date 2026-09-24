from rest_framework import serializers

from core.models import (
    AccidentRecord,
    ComponentInspection,
    Customer,
    HealthFactorScore,
    HealthScore,
    ServicePart,
    ServiceRecord,
    ServiceWorkItem,
    Vehicle,
    normalize_registration_number,
)


class CustomerSerializer(serializers.ModelSerializer):
    vehicle_count = serializers.IntegerField(source="vehicles.count", read_only=True)

    class Meta:
        model = Customer
        fields = ["id", "name", "email", "phone", "address", "status", "joined_date", "vehicle_count"]

    def validate_email(self, value):
        qs = Customer.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A customer with this email already exists.")
        return value


class HealthFactorScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthFactorScore
        fields = ["factor_key", "factor_label", "raw_input_summary", "factor_score", "weight_pct", "contribution"]


class HealthScoreSerializer(serializers.ModelSerializer):
    factors = HealthFactorScoreSerializer(source="factor_scores", many=True, read_only=True)

    class Meta:
        model = HealthScore
        fields = ["id", "vehicle", "score", "status", "calculated_at", "factors"]


class VehicleSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="customer.name", read_only=True)
    health_score = serializers.SerializerMethodField()
    health_status = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            "id", "customer", "owner_name", "registration_number", "brand", "model", "variant",
            "manufacturing_year", "purchase_date", "fuel_type", "engine_type", "current_km",
            "previous_owners", "insurance_valid_till", "puc_valid_till", "color",
            "created_at", "updated_at", "health_score", "health_status",
        ]

    def get_health_score(self, obj):
        latest = obj.latest_health_score
        return float(latest.score) if latest else None

    def get_health_status(self, obj):
        latest = obj.latest_health_score
        return latest.status if latest else "Not Yet Calculated"

    def validate_registration_number(self, value):
        value = normalize_registration_number(value)
        qs = Vehicle.objects.filter(registration_number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                f"A vehicle with registration number '{value}' is already registered."
            )
        return value


class ComponentInspectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentInspection
        fields = [
            "id", "vehicle", "component", "condition_rating", "notes",
            "inspected_date", "inspected_by", "updated_at",
        ]
        # DRF would otherwise auto-generate a UniqueTogetherValidator from
        # the model's unique_together and reject a re-inspection before our
        # create() below gets a chance to upsert it. The upsert IS the
        # uniqueness handling here, so the auto-validator is turned off.
        validators = []

    def create(self, validated_data):
        # One row per (vehicle, component): re-inspecting a component
        # updates its existing row instead of erroring on the unique
        # constraint, matching the "current inspection state" model.
        instance, _created = ComponentInspection.objects.update_or_create(
            vehicle=validated_data["vehicle"],
            component=validated_data["component"],
            defaults={
                "condition_rating": validated_data["condition_rating"],
                "notes": validated_data.get("notes", ""),
                "inspected_date": validated_data["inspected_date"],
                "inspected_by": validated_data.get("inspected_by", ""),
            },
        )
        return instance


class AccidentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccidentRecord
        fields = ["id", "vehicle", "incident_type", "severity", "incident_date", "description", "created_at"]


class ServiceWorkItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceWorkItem
        fields = ["work_type"]


class ServicePartSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServicePart
        fields = ["part_name", "action"]


class ServiceRecordSerializer(serializers.ModelSerializer):
    work_items = ServiceWorkItemSerializer(many=True, required=False, default=list)
    parts = ServicePartSerializer(many=True, required=False, default=list)

    class Meta:
        model = ServiceRecord
        fields = [
            "id", "vehicle", "service_date", "odometer", "service_type", "mechanic_name",
            "cost", "next_service_due", "remarks", "created_at", "work_items", "parts",
        ]

    def create(self, validated_data):
        work_items = validated_data.pop("work_items", [])
        parts = validated_data.pop("parts", [])
        service_record = ServiceRecord.objects.create(**validated_data)
        ServiceWorkItem.objects.bulk_create(
            [ServiceWorkItem(service_record=service_record, **item) for item in work_items]
        )
        ServicePart.objects.bulk_create(
            [ServicePart(service_record=service_record, **part) for part in parts]
        )
        # Keep the vehicle's odometer current — later of what's on file vs.
        # this service's reading, so a backdated entry can't roll it back.
        vehicle = service_record.vehicle
        if service_record.odometer > vehicle.current_km:
            vehicle.current_km = service_record.odometer
            vehicle.save(update_fields=["current_km"])
        return service_record
