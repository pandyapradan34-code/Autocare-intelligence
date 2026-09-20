import PageHeader from "../../components/common/PageHeader";
import { remainingUsefulLife } from "../../data/healthData";
import { TrendingUp, Info } from "lucide-react";
import { staggerDelay } from "../../utils/motion";

export default function LifeExpectancy() {
  const { yearsRange, kmRange, confidence, factors } = remainingUsefulLife;

  return (
    <div>
      <PageHeader
        title="Estimated Remaining Useful Life"
        description="A range-based projection, not an exact figure — based on future prediction factors."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: "Estimated Time", value: yearsRange },
          { label: "Estimated Distance", value: kmRange },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card card-hover-lift"
            style={staggerDelay(i, 100)}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-brand-700">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 animate-fade-in-up flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500 delay-200">
        <Info size={14} />
        Prediction confidence:{" "}
        <span className="font-medium text-slate-700">{confidence}</span> — actual results depend on
        future ML-based prediction models (Phase 4).
      </div>

      <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-card delay-300">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-slate-800">Factors Considered (Future Model Inputs)</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {factors.map((f, i) => (
            <div
              key={f.label}
              className="animate-fade-in-up rounded-xl bg-slate-50 p-3 transition-colors duration-150 hover:bg-slate-100"
              style={staggerDelay(i, 50)}
            >
              <p className="text-sm font-medium text-slate-700">{f.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
