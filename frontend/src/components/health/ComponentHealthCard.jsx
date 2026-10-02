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
 * Single reusable card used for EVERY component's health (Engine, Brakes,
 * Suspension, Battery, Tyres, ...). Data-driven — never hard-code a
 * separate card per component.
 */
export default function ComponentHealthCard({ component, showSummary = true }) {
  const Icon = ICONS[component.icon] || Cog;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
          <Icon size={18} />
        </div>
        <p className="text-sm font-semibold text-slate-800">{component.name}</p>
      </div>
      <HealthProgressBar value={component.value} />
      {showSummary && component.summary && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500">{component.summary}</p>
      )}
    </div>
  );
}
