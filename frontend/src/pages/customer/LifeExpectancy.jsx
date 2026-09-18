import PageHeader from "../../components/common/PageHeader";
import { remainingUsefulLife } from "../../data/healthData";
import { TrendingUp, Info } from "lucide-react";

export default function LifeExpectancy() {
  const { yearsRange, kmRange, confidence, factors } = remainingUsefulLife;

  return (
    <div>
      <PageHeader
        title="Estimated Remaining Useful Life"
        description="A range-based projection, not an exact figure — based on future prediction factors."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Estimated Time</p>
          <p className="mt-2 text-3xl font-bold text-brand-700">{yearsRange}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Estimated Distance</p>
          <p className="mt-2 text-3xl font-bold text-brand-700">{kmRange}</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
        <Info size={14} />
        Prediction confidence: <span className="font-medium text-slate-700">{confidence}</span> — actual
        results depend on future ML-based prediction models (Phase 4).
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-slate-800">Factors Considered (Future Model Inputs)</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {factors.map((f) => (
            <div key={f.label} className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-700">{f.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
