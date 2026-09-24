"""
Auto-recalculation: whenever a ServiceRecord, ComponentInspection, or
AccidentRecord is saved or deleted for a vehicle, its health score is
recalculated from the latest available data and a new HealthScore row is
written. This is the mechanism, not the rule — the rule itself lives in
core/scoring.py.

Recalculation deliberately does not raise past this point: if a vehicle
still has missing inspection data, HealthScoreInputError is caught and
logged rather than blowing up whatever unrelated save triggered the
signal (e.g. saving vehicle A's accident record must never break the
request just because vehicle A doesn't have a tyre inspection yet). The
explicit `GET .../health/` and `POST .../health/recalculate/` endpoints
surface that same error directly to the caller instead.
"""

import logging

from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from core.models import AccidentRecord, ComponentInspection, ServiceRecord
from core.scoring import HealthScoreInputError, persist_health_score

logger = logging.getLogger(__name__)


def _recalculate(vehicle):
    try:
        persist_health_score(vehicle)
    except HealthScoreInputError as exc:
        logger.info("Skipped health-score recalculation for vehicle %s: %s", vehicle.id, exc)


@receiver(post_save, sender=ServiceRecord)
@receiver(post_delete, sender=ServiceRecord)
def recalc_on_service_record_change(sender, instance, **kwargs):
    _recalculate(instance.vehicle)


@receiver(post_save, sender=ComponentInspection)
@receiver(post_delete, sender=ComponentInspection)
def recalc_on_component_inspection_change(sender, instance, **kwargs):
    _recalculate(instance.vehicle)


@receiver(post_save, sender=AccidentRecord)
@receiver(post_delete, sender=AccidentRecord)
def recalc_on_accident_record_change(sender, instance, **kwargs):
    _recalculate(instance.vehicle)
