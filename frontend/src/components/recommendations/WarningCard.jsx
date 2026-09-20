import { AlertOctagon, ShieldAlert } from "lucide-react";
import { cx } from "../../utils/formatters";
import StatusBadge from "../common/StatusBadge";

const SEVERITY_STYLES = {
  critical: {
    bg: "bg-red-50/80",
    border: "border-red-200",
    accentLeft: "border-l-4 border-l-red-600",
    text: "text-red-900",
    titleText: "text-red-950",
    iconBg: "bg-red-100 text-red-600",
    tone: "critical",
    riskLabel: "HIGH RISK SIGNAL",
  },
  attention: {
    bg: "bg-orange-50/80",
    border: "border-orange-200",
    accentLeft: "border-l-4 border-l-orange-500",
    text: "text-orange-900",
    titleText: "text-orange-950",
    iconBg: "bg-orange-100 text-orange-600",
    tone: "attention",
    riskLabel: "ATTENTION REQUIRED",
  },
  moderate: {
    bg: "bg-amber-50/80",
    border: "border-amber-200",
    accentLeft: "border-l-4 border-l-amber-500",
    text: "text-amber-900",
    titleText: "text-amber-950",
    iconBg: "bg-amber-100 text-amber-600",
    tone: "moderate",
    riskLabel: "MODERATE RISK",
  },
};

/**
 * Early-warning card showing pattern detection signals.
 * Dynamically styled based on severity condition.
 */
export default function WarningCard({ warning }) {
  const style = SEVERITY_STYLES[warning.severity] || SEVERITY_STYLES.moderate;

  return (
    <div
      className={cx(
        "rounded-2xl border p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-elevated",
        style.bg,
        style.border,
        style.accentLeft
      )}
    >
      {/* Header with Risk Level Badge */}
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-900/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <ShieldAlert size={14} className="text-slate-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            RISK ASSESSMENT SIGNAL
          </span>
        </div>
        <StatusBadge tone={style.tone} label={style.riskLabel} />
      </div>

      <div className="flex items-start gap-3.5">
        <div className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-2xs", style.iconBg)}>
          <AlertOctagon size={20} />
        </div>
        <div className="flex-1">
          <h3 className={cx("text-base font-bold leading-snug", style.titleText)}>
            {warning.title}
          </h3>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-700">
            {warning.detail}
          </p>
          {warning.pattern && warning.pattern.length > 0 && (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1">Pattern History:</span>
              {warning.pattern.map((p, i) => (
                <span
                  key={i}
                  className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
