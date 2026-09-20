import PageHeader from "../../components/common/PageHeader";
import HealthScoreCard from "../../components/health/HealthScoreCard";
import HealthProgressBar from "../../components/common/HealthProgressBar";
import { overallHealth, healthFactors, healthExplanation } from "../../data/healthData";
import { Lightbulb } from "lucide-react";

export default function VehicleHealth() {
  return (
    <div>
      <PageHeader title="Vehicle Health" description="A breakdown of what shapes your vehicle's overall health score." />

      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <HealthScoreCard score={overallHealth.score} lastUpdated={overallHealth.lastUpdated} />
      </div>

      <div
        className="mb-6 animate-fade-in-up rounded-2xl border border-brand-100 bg-brand-50/60 p-5"
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
            <Lightbulb size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-800">Why this score?</p>
            <p className="mt-1 text-sm leading-relaxed text-brand-800/80">{healthExplanation}</p>
          </div>
        </div>
      </div>

      <div
        className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
        style={{ animationDelay: "300ms" }}
      >
        <h2 className="mb-1 text-sm font-semibold text-slate-800">Health Score Factors</h2>
        <p className="mb-5 text-xs text-slate-400">
          Future factor weighting shown below — Phase 1 uses static/dummy contribution values only.
        </p>
        <div className="space-y-5">
          {healthFactors.map((f, i) => (
            <div
              key={f.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${350 + i * 50}ms` }}
            >
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  {f.label} <span className="text-slate-400">({f.weight}% weight)</span>
                </span>
              </div>
              <HealthProgressBar value={f.contribution} size="sm" delay={i * 60 + 300} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
