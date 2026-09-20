import { cx } from "../../utils/formatters";

/**
 * Reusable KPI/overview card used across customer and admin dashboards.
 * e.g. <StatCard label="Total Vehicles" value={7} icon={Car} />
 */
export default function StatCard({ label, value, icon: Icon, tone = "brand", trend = null }) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p
              className={cx(
                "mt-1 text-xs font-medium",
                trend.direction === "up" ? "text-emerald-600" : "text-red-600"
              )}
            >
              {trend.direction === "up" ? "▲" : "▼"} {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", toneClasses[tone])}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
