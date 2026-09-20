/**
 * Reusable wrapper that gives every chart the same card shell.
 * Includes fade-in-up entrance and hover shadow.
 */
export default function ChartCard({ title, subtitle, action = null, children, height = 280 }) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-card-hover">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}
