from rest_framework.routers import DefaultRouter

from core.views import (
    AccidentRecordViewSet,
    ComponentInspectionViewSet,
    CustomerViewSet,
    HealthScoreViewSet,
    ServiceRecordViewSet,
    VehicleViewSet,
)

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("vehicles", VehicleViewSet, basename="vehicle")
router.register("component-inspections", ComponentInspectionViewSet, basename="component-inspection")
router.register("accident-records", AccidentRecordViewSet, basename="accident-record")
router.register("service-records", ServiceRecordViewSet, basename="service-record")
router.register("health-scores", HealthScoreViewSet, basename="health-score")

urlpatterns = router.urls
