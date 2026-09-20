import { cx } from "../../utils/formatters";
import { useAnimatedNumber, staggerDelay, prefersReducedMotion } from "../../utils/motion";

/**
 * Reusable KPI/overview card.
 * Animates the numeric value from 0 on mount (if value is a number).
 * Hover: subtle lift + shadow. Icon: subtle scale on card hover.
 */
export default function StatCard({ label, value, icon: Icon, tone = "brand", trend = null, index = 0 }) {
  const isNumeric = typeof value === "number";
  const animated = useAnimatedNumber(isNumeric ? value : 0, 800);
  const displayValue = isNumeric ? animated.toLocaleString("en-IN") : value;

  const toneClasses = {
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      className="group animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-card card-hover-lift"
      style={prefersReducedMotion() ? {} : staggerDelay(index, 75)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{displayValue}</p>
          {trend && (
            <p
              className={cx(
                "mt-1 text-xs font-medium",
                trend.direction === "up" ? "text-emerald-600" : "text-red-500"
              )}
            >
              {trend.direction === "up" ? "▲" : "▼"} {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={cx(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
              toneClasses[tone]
            )}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
