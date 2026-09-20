import {
  Cog,
  Disc3,
  BatteryMedium,
  CircleDot,
  Snowflake,
  Thermometer,
  Compass,
  Zap,
  Settings2,
  CarFront,
} from "lucide-react";
import HealthProgressBar from "../common/HealthProgressBar";
import { HEALTH_TONES, toneForScore } from "../../utils/healthStatus";
import { cx } from "../../utils/formatters";

const ICONS = {
  engine: CarFront,
  cog: Cog,
  disc: Disc3,
  suspension: Settings2,
  battery: BatteryMedium,
  tyre: CircleDot,
  ac: Snowflake,
  cooling: Thermometer,
  steering: Compass,
  electrical: Zap,
};

/**
 * Single reusable card for every component's health.
 * Icon container color reacts to health tone.
 * Card lifts on hover.
 * animDelay (ms): stagger delay for the card entrance animation.
 */
export default function ComponentHealthCard({ component, showSummary = true, barDelay = 0, animDelay = 0 }) {
  const Icon = ICONS[component.icon] || Cog;
  const tone = HEALTH_TONES[toneForScore(component.value)];

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card card-hover-lift animate-fade-in-up"
      style={animDelay > 0 ? { animationDelay: `${animDelay}ms` } : undefined}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className={cx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
            tone.bg,
            tone.text
          )}
        >
          <Icon size={18} />
        </div>
        <p className="text-sm font-semibold text-slate-800">{component.name}</p>
      </div>
      <HealthProgressBar value={component.value} delay={barDelay} />
      {showSummary && component.summary && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">{component.summary}</p>
      )}
    </div>
  );
}
