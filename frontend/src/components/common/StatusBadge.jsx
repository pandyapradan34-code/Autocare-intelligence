import { HEALTH_TONES } from "../../utils/healthStatus";
import { cx } from "../../utils/formatters";

/**
 * Prominent status & risk badge pill used across tables, headers, and cards.
 * Displays Healthy, Moderate, Attention Required, Critical, Active, Inactive, etc.
 */
export default function StatusBadge({ tone = "good", label, className = "" }) {
  const toneConfig = HEALTH_TONES[tone];

  if (toneConfig) {
    return (
      <span
        className={cx(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border shadow-2xs",
          toneConfig.badgeBg,
          toneConfig.badgeText,
          toneConfig.border,
          className
        )}
      >
        <span className={cx("h-2 w-2 rounded-full shrink-0", toneConfig.dot)} />
        {label || toneConfig.label}
      </span>
    );
  }

  // Fallback generic tones for non-health statuses (e.g. Active/Inactive/Risk levels)
  const genericTones = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    inactive: "bg-slate-200 text-slate-600 border-slate-300",
    info: "bg-brand-100 text-brand-800 border-brand-200",
    warning: "bg-orange-100 text-orange-800 border-orange-200",
    critical: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border shadow-2xs",
        genericTones[tone] || genericTones.neutral,
        className
      )}
    >
      {label}
    </span>
  );
}
