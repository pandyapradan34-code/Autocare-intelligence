import { HEALTH_TONES, toneForScore } from "../../utils/healthStatus";
import { cx } from "../../utils/formatters";
import { useAnimationProgress, prefersReducedMotion } from "../../utils/motion";

/**
 * Animated horizontal progress bar.
 * Width animates smoothly from 0% → value% on mount.
 * Percentage number counts up from 0% → value% simultaneously.
 */
export default function HealthProgressBar({ value, showLabel = true, size = "md", delay = 0 }) {
  const tone = HEALTH_TONES[toneForScore(value)];
  const heights = { sm: "h-2", md: "h-2.5", lg: "h-3" };

  const progress = useAnimationProgress(900, delay, value);
  const isReduced = prefersReducedMotion();

  const activeProgress = isReduced ? 1 : progress;
  const animatedNum = Math.round(activeProgress * value);
  const widthPct = activeProgress * value;

  return (
    <div className="w-full">
      <div className={cx("w-full overflow-hidden rounded-full bg-slate-100 p-0.5", heights[size])}>
        <div
          className={cx("h-full rounded-full", tone.bar)}
          style={{
            width: `${Math.min(100, Math.max(0, widthPct))}%`,
          }}
        />
      </div>
      {showLabel && (
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className={cx("font-semibold", tone.text)}>{tone.label}</span>
          <span className="font-bold text-slate-700">{animatedNum}%</span>
        </div>
      )}
    </div>
  );
}

