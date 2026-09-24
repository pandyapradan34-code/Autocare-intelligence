from django.contrib import admin

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
)


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "status", "joined_date")
    search_fields = ("name", "email", "phone")
    list_filter = ("status",)


class ComponentInspectionInline(admin.TabularInline):
    model = ComponentInspection
    extra = 0


class AccidentRecordInline(admin.TabularInline):
    model = AccidentRecord
    extra = 0


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("registration_number", "brand", "model", "customer", "current_km", "latest_score_display")
    search_fields = ("registration_number", "brand", "model", "customer__name")
    list_filter = ("brand", "fuel_type")
    inlines = [ComponentInspectionInline, AccidentRecordInline]

    def latest_score_display(self, obj):
        latest = obj.latest_health_score
        return f"{latest.score} ({latest.status})" if latest else "—"

    latest_score_display.short_description = "Health Score"


@admin.register(ComponentInspection)
class ComponentInspectionAdmin(admin.ModelAdmin):
    list_display = ("vehicle", "component", "condition_rating", "inspected_date", "inspected_by")
    list_filter = ("component", "condition_rating")


@admin.register(AccidentRecord)
class AccidentRecordAdmin(admin.ModelAdmin):
    list_display = ("vehicle", "incident_type", "severity", "incident_date")
    list_filter = ("incident_type", "severity")


class ServiceWorkItemInline(admin.TabularInline):
    model = ServiceWorkItem
    extra = 0


class ServicePartInline(admin.TabularInline):
    model = ServicePart
    extra = 0


@admin.register(ServiceRecord)
class ServiceRecordAdmin(admin.ModelAdmin):
    list_display = ("vehicle", "service_date", "service_type", "odometer", "cost")
    list_filter = ("service_type",)
    inlines = [ServiceWorkItemInline, ServicePartInline]


class HealthFactorScoreInline(admin.TabularInline):
    model = HealthFactorScore
    extra = 0
    readonly_fields = ("factor_key", "factor_label", "raw_input_summary", "factor_score", "weight_pct", "contribution")
    can_delete = False


@admin.register(HealthScore)
class HealthScoreAdmin(admin.ModelAdmin):
    list_display = ("vehicle", "score", "status", "calculated_at")
    list_filter = ("status",)
    readonly_fields = ("vehicle", "score", "status", "calculated_at")
    inlines = [HealthFactorScoreInline]
