import { Car, Gauge, CalendarClock } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { toneForScore } from "../../utils/healthStatus";
import { formatKm } from "../../utils/formatters";

/**
 * Compact vehicle summary card — shows vehicle identity, mileage, and
 * health status at a glance. Used on the customer dashboard and admin
 * vehicle listings.
 */
export default function VehicleCard({ vehicle, healthScore, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Car size={22} />
        </div>
        <div>
          <p className="font-semibold text-slate-900">
            {vehicle.brand} {vehicle.model}
          </p>
          <p className="text-xs text-slate-400">
            {vehicle.registrationNumber} • {vehicle.manufacturingYear}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 text-sm">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Gauge size={15} />
          {formatKm(vehicle.currentKm)}
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <CalendarClock size={15} />
          Serviced {vehicle.lastServiceDate}
        </div>
        {typeof healthScore === "number" && (
          <StatusBadge tone={toneForScore(healthScore)} label={`${healthScore}/100`} />
        )}
      </div>
    </div>
  );
}
