import { HEALTH_TONES, toneForScore } from "../../utils/healthStatus";

/**
 * Large circular gauge showing the overall vehicle health score.
 * Reused on the Customer Dashboard and the dedicated Vehicle Health page.
 */
export default function HealthScoreCard({ score, lastUpdated, compact = false }) {
  const tone = HEALTH_TONES[toneForScore(score)];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:gap-8">
      <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />
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
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-slate-900">{score}</span>
          <span className="text-xs text-slate-400">/ 100</span>
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
