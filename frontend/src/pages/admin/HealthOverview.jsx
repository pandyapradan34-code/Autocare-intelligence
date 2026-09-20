import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import HealthProgressBar from "../../components/common/HealthProgressBar";
import EmptyState from "../../components/common/EmptyState";
import { vehicles } from "../../data/vehiclesData";
import { toneForScore } from "../../utils/healthStatus";
import { cx } from "../../utils/formatters";
import { staggerDelay } from "../../utils/motion";
import { Gauge } from "lucide-react";

const FILTERS = ["All", "Healthy", "Moderate", "Attention Required", "Critical"];

export default function HealthOverview() {
  const [filter, setFilter] = useState("All");

  const filtered = vehicles.filter((v) => filter === "All" || v.healthStatus === filter);

  return (
    <div>
      <PageHeader title="Vehicle Health Overview" description="Fleet vehicles grouped and filterable by health status." />

      <div className="mb-5 flex animate-fade-in-up flex-wrap gap-2 delay-100">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
              filter === f
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Gauge} title="No vehicles in this category" description="Try a different filter." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v, i) => (
            <div
              key={v.id}
              className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-card card-hover-lift"
              style={staggerDelay(i, 60)}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {v.brand} {v.model}
                  </p>
                  <p className="text-xs text-slate-400">
                    {v.registrationNumber} • {v.ownerName}
                  </p>
                </div>
                <StatusBadge tone={toneForScore(v.healthScore)} />
              </div>
              <HealthProgressBar value={v.healthScore} delay={i * 60 + 200} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
