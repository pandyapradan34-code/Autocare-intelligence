import { formatCurrency } from "../../utils/formatters";
import { TrendingUp } from "lucide-react";

/**
 * Cost breakdown card used on the Maintenance Cost page and dashboard.
 * Renders a simple horizontal stacked bar plus a legend, driven entirely
 * by the `breakdown` data passed in.
 */
export default function MaintenanceCostCard({ total, yearOverYearChange, breakdown }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total Maintenance Cost
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(total)}</p>
        </div>
        {typeof yearOverYearChange === "number" && (
          <div className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
            <TrendingUp size={13} />
            {yearOverYearChange}% vs last year
          </div>
        )}
      </div>

      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {breakdown.map((item) => (
          <div
            key={item.id}
            style={{ width: `${(item.amount / total) * 100}%`, backgroundColor: item.color }}
            title={`${item.label}: ${formatCurrency(item.amount)}`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {breakdown.map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <div>
              <p className="font-medium text-slate-700">{item.label}</p>
              <p className="text-slate-400">{formatCurrency(item.amount)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
