import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { cx } from "../../utils/formatters";

const SEVERITY_CONFIG = {
  attention: { icon: AlertTriangle, emoji: "⚠️", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  moderate: { icon: AlertCircle, emoji: "🟡", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  good: { icon: CheckCircle2, emoji: "🟢", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
};

/**
 * Single recommendation entry. Severity drives the visual treatment.
 * Later this will be populated dynamically by a recommendation engine
 * instead of the static recommendationData.js file.
 */
export default function RecommendationCard({ recommendation }) {
  const config = SEVERITY_CONFIG[recommendation.severity] || SEVERITY_CONFIG.good;
  const Icon = config.icon;

  return (
    <div className={cx("flex gap-3 rounded-2xl border p-4", config.bg, config.border)}>
      <div className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white", config.text)}>
        <Icon size={18} />
      </div>
      <div>
        <p className={cx("text-sm font-semibold", config.text)}>{recommendation.title}</p>
        <p className="mt-0.5 text-sm text-slate-600">{recommendation.message}</p>
      </div>
    </div>
  );
}
