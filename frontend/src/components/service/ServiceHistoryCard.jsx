import { CheckCircle2, Wrench } from "lucide-react";
import { formatCurrency, formatDate, formatKm } from "../../utils/formatters";

/**
 * Timeline-style card for a single service record — used on the
 * Service History page so customers can quickly see what work was done.
 */
export default function ServiceHistoryCard({ record }) {
  const highlights = [
    record.oilChange && "Engine oil changed",
    record.brakeService && "Brake service performed",
    record.batteryReplacement && "Battery replaced",
    record.tyreReplacement && "Tyres replaced",
    record.airFilter && "Air filter serviced",
    record.coolant && "Coolant topped up",
    record.acService && "AC serviced",
    record.suspensionWork && "Suspension work done",
    record.engineWork && "Engine work done",
    ...record.partsReplaced.map((p) => `${p} replaced`),
    ...record.partsRepaired.map((p) => `${p} repaired`),
  ].filter(Boolean);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Wrench size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{formatDate(record.date)}</p>
            <p className="text-xs text-slate-400">{record.serviceType}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{formatCurrency(record.cost)}</p>
          <p className="text-xs text-slate-400">{formatKm(record.odometer)}</p>
        </div>
      </div>

      {highlights.length > 0 && (
        <ul className="mb-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
              <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
              {h}
            </li>
          ))}
        </ul>
      )}

      {record.mechanicRemarks && (
        <p className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
          "{record.mechanicRemarks}"
        </p>
      )}
    </div>
  );
}
