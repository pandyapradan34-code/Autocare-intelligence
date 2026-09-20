import { cx } from "../../utils/formatters";

/**
 * Skeleton loading placeholder. Used while dummy data "loads" or can be
 * reused later for real API loading states.
 */
export default function LoadingState({ rows = 3, className = "" }) {
  return (
    <div className={cx("animate-pulse space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 w-full rounded bg-slate-200" style={{ width: `${90 - i * 10}%` }} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-3 h-3 w-1/3 rounded bg-slate-200" />
      <div className="h-7 w-1/2 rounded bg-slate-200" />
    </div>
  );
}
