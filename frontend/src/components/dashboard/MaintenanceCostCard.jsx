import { formatCurrency } from "../../utils/formatters";
import { TrendingUp } from "lucide-react";
import { useAnimatedNumber, useAnimationProgress, prefersReducedMotion, staggerDelay } from "../../utils/motion";

/**
 * Cost breakdown card.
 * Total cost number counts up from ₹0 → actual total.
 * Stacked bar segments animate from 0% width → real proportional width.
 */
export default function MaintenanceCostCard({ total, yearOverYearChange, breakdown }) {
  const animatedTotal = useAnimatedNumber(total, 1100, 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Total Maintenance Cost
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(animatedTotal)}
          </p>
        </div>
        {typeof yearOverYearChange === "number" && (
          <div className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 border border-red-100">
            <TrendingUp size={13} />
            {yearOverYearChange}% vs last year
          </div>
        )}
      </div>

      {/* Animated stacked bar */}
      <div className="mt-4 flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
        {breakdown.map((item, i) => (
          <SegmentBar key={item.id} item={item} total={total} index={i} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {breakdown.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-2 text-xs animate-fade-in-up"
            style={staggerDelay(i, 80)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
            <div>
              <p className="font-semibold text-slate-700">{item.label}</p>
              <p className="text-slate-400 font-medium">{formatCurrency(item.amount)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Individual animated bar segment */
function SegmentBar({ item, total, index }) {
  const targetPct = total > 0 ? (item.amount / total) * 100 : 0;
  const progress = useAnimationProgress(900, 100 + index * 60, targetPct);
  const isReduced = prefersReducedMotion();

  const activeProgress = isReduced ? 1 : progress;
  const widthPct = activeProgress * targetPct;

  return (
    <div
      style={{
        width: `${widthPct}%`,
        backgroundColor: item.color,
      }}
      title={`${item.label}: ${targetPct.toFixed(1)}%`}
      className="h-full rounded-full"
    />
  );
}

