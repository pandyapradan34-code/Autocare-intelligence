import { AlertOctagon } from "lucide-react";
import { cx } from "../../utils/formatters";

const SEVERITY_STYLES = {
  critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", iconBg: "bg-red-100" },
  attention: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", iconBg: "bg-orange-100" },
  moderate: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconBg: "bg-amber-100" },
};

/**
 * Early-warning card showing a detected pattern (e.g. repeated brake
 * repairs). Phase 1 renders static demo warnings only — no real
 * pattern-detection logic runs yet.
 */
export default function WarningCard({ warning }) {
  const style = SEVERITY_STYLES[warning.severity] || SEVERITY_STYLES.moderate;

  return (
    <div className={cx("rounded-2xl border p-4", style.bg, style.border)}>
      <div className="flex items-start gap-3">
        <div className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", style.iconBg, style.text)}>
          <AlertOctagon size={18} />
        </div>
        <div className="flex-1">
          <p className={cx("text-sm font-semibold", style.text)}>{warning.title}</p>
          <p className="mt-1 text-sm text-slate-600">{warning.detail}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {warning.pattern.map((p, i) => (
              <span
                key={i}
                className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 border border-slate-200"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
