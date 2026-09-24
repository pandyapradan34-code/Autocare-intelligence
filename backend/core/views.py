from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.models import AccidentRecord, ComponentInspection, Customer, HealthScore, ServiceRecord, Vehicle
from core.scoring import HealthScoreInputError, persist_health_score
from core.serializers import (
    AccidentRecordSerializer,
    ComponentInspectionSerializer,
    CustomerSerializer,
    HealthScoreSerializer,
    ServiceRecordSerializer,
    VehicleSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filterset_fields = ["status"]


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.select_related("customer").all()
    serializer_class = VehicleSerializer
    filterset_fields = ["customer"]

    def get_queryset(self):
        qs = super().get_queryset()
        customer_id = self.request.query_params.get("customer_id")
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs

    @action(detail=True, methods=["get"], url_path="health")
    def health(self, request, pk=None):
        """
        GET /api/vehicles/{vehicle_id}/health/

        Returns the vehicle's most recently calculated health score. If none
        has been calculated yet, calculates and stores one now from current
        data. 400 (not 200-with-a-guessed-number) if required inspection
        data is still missing.
        """
        vehicle = self.get_object()
        latest = vehicle.latest_health_score
        if latest is None:
            try:
                latest = persist_health_score(vehicle)
            except HealthScoreInputError as exc:
                return Response(
                    {"vehicle_id": vehicle.id, "error": str(exc), "missing": exc.missing},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(self._simple_payload(vehicle, latest))

    @action(detail=True, methods=["post"], url_path="health/recalculate")
    def recalculate_health(self, request, pk=None):
        """POST /api/vehicles/{vehicle_id}/health/recalculate/ — force a fresh calculation now."""
        vehicle = self.get_object()
        try:
            latest = persist_health_score(vehicle)
        except HealthScoreInputError as exc:
            return Response(
                {"vehicle_id": vehicle.id, "error": str(exc), "missing": exc.missing},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(self._simple_payload(vehicle, latest))

    @action(detail=True, methods=["get"], url_path="health/history")
    def health_history(self, request, pk=None):
        """GET /api/vehicles/{vehicle_id}/health/history/ — every past calculation, newest first."""
        vehicle = self.get_object()
        scores = vehicle.health_scores.prefetch_related("factor_scores").all()
        return Response(HealthScoreSerializer(scores, many=True).data)

    @staticmethod
    def _simple_payload(vehicle, health_score):
        # Matches the requested response shape exactly, plus a transparent
        # breakdown so any score can be explained without a second request.
        return {
            "vehicle_id": vehicle.id,
            "health_score": float(health_score.score),
            "status": health_score.status,
            "calculated_at": health_score.calculated_at,
            "breakdown": HealthScoreSerializer(health_score).data["factors"],
        }


class ComponentInspectionViewSet(viewsets.ModelViewSet):
    queryset = ComponentInspection.objects.select_related("vehicle").all()
    serializer_class = ComponentInspectionSerializer
    filterset_fields = ["vehicle", "component"]


class AccidentRecordViewSet(viewsets.ModelViewSet):
    queryset = AccidentRecord.objects.select_related("vehicle").all()
    serializer_class = AccidentRecordSerializer
    filterset_fields = ["vehicle"]


class ServiceRecordViewSet(viewsets.ModelViewSet):
    queryset = ServiceRecord.objects.select_related("vehicle").prefetch_related("work_items", "parts").all()
    serializer_class = ServiceRecordSerializer
    filterset_fields = ["vehicle"]


class HealthScoreViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only browse of every stored health score (mainly for admin/debugging)."""

    queryset = HealthScore.objects.select_related("vehicle").prefetch_related("factor_scores").all()
    serializer_class = HealthScoreSerializer
    filterset_fields = ["vehicle"]
