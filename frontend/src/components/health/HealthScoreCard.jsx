import { HEALTH_TONES, toneForScore } from "../../utils/healthStatus";
import { useAnimationProgress, prefersReducedMotion } from "../../utils/motion";

/**
 * Circular gauge showing overall vehicle health score.
 * SVG ring fills smoothly from 0 → score% on mount.
 * Center number counts up from 0 → score simultaneously.
 * Uses dynamic score prop from data.
 */
export default function HealthScoreCard({ score, lastUpdated, compact = false }) {
  const tone = HEALTH_TONES[toneForScore(score)];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const progress = useAnimationProgress(1100, 80, score);
  const isReduced = prefersReducedMotion();

  const activeProgress = isReduced ? 1 : progress;
  const displayScore = Math.round(activeProgress * score);
  const currentRingScore = activeProgress * score;

  // SVG ring offset: circumference when currentRingScore = 0, target offset when currentRingScore = score
  const offset = circumference - (currentRingScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:gap-8">
      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
          {/* Track ring */}
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
          {/* Animated progress ring */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={tone.text}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-slate-900">{displayScore}</span>
          <span className="text-xs font-medium text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Overall Vehicle Health
        </p>
        <p className={`mt-1 text-xl font-bold ${tone.text}`}>{tone.label}</p>
        {!compact && lastUpdated && (
          <p className="mt-2 text-sm text-slate-500">Last updated on {lastUpdated}</p>
        )}
      </div>
    </div>
  );
}

