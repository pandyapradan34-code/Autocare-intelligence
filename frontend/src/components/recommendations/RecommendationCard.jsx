import { AlertTriangle, CheckCircle2, AlertCircle, Wrench } from "lucide-react";
import { cx } from "../../utils/formatters";
import StatusBadge from "../common/StatusBadge";

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertTriangle,
    tone: "critical",
    riskLabel: "HIGH RISK",
    bg: "bg-red-50/70",
    border: "border-red-200",
    accentLeft: "border-l-4 border-l-red-500",
    text: "text-red-900",
    titleText: "text-red-950",
    iconBg: "bg-red-100 text-red-600",
    categoryLabel: "CRITICAL MAINTENANCE",
  },
  attention: {
    icon: AlertTriangle,
    tone: "attention",
    riskLabel: "ATTENTION REQUIRED",
    bg: "bg-orange-50/70",
    border: "border-orange-200",
    accentLeft: "border-l-4 border-l-orange-500",
    text: "text-orange-900",
    titleText: "text-orange-950",
    iconBg: "bg-orange-100 text-orange-600",
    categoryLabel: "MAINTENANCE RECOMMENDATION",
  },
  moderate: {
    icon: AlertCircle,
    tone: "moderate",
    riskLabel: "MEDIUM RISK",
    bg: "bg-amber-50/70",
    border: "border-amber-200",
    accentLeft: "border-l-4 border-l-amber-500",
    text: "text-amber-900",
    titleText: "text-amber-950",
    iconBg: "bg-amber-100 text-amber-600",
    categoryLabel: "MAINTENANCE RECOMMENDATION",
  },
  good: {
    icon: CheckCircle2,
    tone: "excellent",
    riskLabel: "HEALTHY",
    bg: "bg-emerald-50/70",
    border: "border-emerald-200",
    accentLeft: "border-l-4 border-l-emerald-500",
    text: "text-emerald-900",
    titleText: "text-emerald-950",
    iconBg: "bg-emerald-100 text-emerald-600",
    categoryLabel: "PREVENTIVE CARE",
  },
};

/**
 * RecommendationCard — Prominent, condition-driven maintenance recommendation card.
 * Color & risk badge dynamically reflect vehicle component condition severity.
 */
export default function RecommendationCard({ recommendation }) {
  const config = SEVERITY_CONFIG[recommendation.severity] || SEVERITY_CONFIG.good;
  const Icon = config.icon;

  return (
    <div
      className={cx(
        "rounded-2xl border p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-elevated",
        config.bg,
        config.border,
        config.accentLeft
      )}
    >
      {/* Category header & Risk badge */}
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-900/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <Wrench size={13} className="text-slate-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {config.categoryLabel}
          </span>
        </div>
        <StatusBadge tone={config.tone} label={config.riskLabel} />
      </div>

      {/* Title & icon */}
      <div className="flex items-start gap-3.5">
        <div className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-2xs", config.iconBg)}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className={cx("text-base font-bold leading-snug", config.titleText)}>
            {recommendation.title}
          </h3>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-700">
            {recommendation.message}
          </p>
        </div>
      </div>
    </div>
  );
}
