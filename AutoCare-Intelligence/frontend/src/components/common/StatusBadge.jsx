import { HEALTH_TONES } from "../../utils/healthStatus";
import { cx } from "../../utils/formatters";

/**
 * Small pill badge used to show a health/status state (Healthy, Moderate,
 * Attention Required, Critical) or a generic status like Active/Inactive.
 */
export default function StatusBadge({ tone = "good", label, className = "" }) {
  const toneConfig = HEALTH_TONES[tone];

  if (toneConfig) {
    return (
      <span
        className={cx(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          toneConfig.badgeBg,
          toneConfig.badgeText,
          className
        )}
      >
        <span className={cx("h-1.5 w-1.5 rounded-full", toneConfig.dot)} />
        {label || toneConfig.label}
      </span>
    );
  }

  // Fallback generic tones for non-health statuses (e.g. Active/Inactive)
  const genericTones = {
    neutral: "bg-slate-100 text-slate-600",
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-slate-200 text-slate-500",
    info: "bg-brand-100 text-brand-700",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        genericTones[tone] || genericTones.neutral,
        className
      )}
    >
      {label}
    </span>
  );
}
