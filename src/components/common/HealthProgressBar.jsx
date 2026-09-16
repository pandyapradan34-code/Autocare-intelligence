import { HEALTH_TONES, toneForScore } from "../../utils/healthStatus";
import { cx } from "../../utils/formatters";

/**
 * Horizontal progress bar that colors itself based on the score value.
 * Reused by ComponentHealthCard, NextService progress rows, etc.
 */
export default function HealthProgressBar({ value, showLabel = true, size = "md" }) {
  const tone = HEALTH_TONES[toneForScore(value)];
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-2.5" };

  return (
    <div className="w-full">
      <div className={cx("w-full overflow-hidden rounded-full bg-slate-100", heights[size])}>
        <div
          className={cx("h-full rounded-full transition-all duration-500", tone.bar)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className={cx("font-medium", tone.text)}>{tone.label}</span>
          <span className="font-semibold text-slate-600">{value}%</span>
        </div>
      )}
    </div>
  );
}
