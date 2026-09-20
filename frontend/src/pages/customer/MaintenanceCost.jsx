import PageHeader from "../../components/common/PageHeader";
import MaintenanceCostCard from "../../components/dashboard/MaintenanceCostCard";
import ChartCard from "../../components/charts/ChartCard";
import CostTrendChart from "../../components/charts/CostTrendChart";
import { maintenanceCost, maintenanceCostTrend } from "../../data/maintenanceData";
import { Sparkles } from "lucide-react";

export default function MaintenanceCost() {
  return (
    <div>
      <PageHeader title="Maintenance Cost" description="A breakdown of how much you've spent, and where." />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <MaintenanceCostCard
            total={maintenanceCost.total}
            yearOverYearChange={maintenanceCost.yearOverYearChange}
            breakdown={maintenanceCost.breakdown}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <ChartCard title="Maintenance Cost Trend" subtitle="Year-over-year spend" height={260}>
            <CostTrendChart data={maintenanceCostTrend} />
          </ChartCard>
        </div>
      </div>

      <div
        className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
        style={{ animationDelay: "300ms" }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-slate-800">Insights</h2>
        </div>
        <ul className="space-y-2">
          {maintenanceCost.insights.map((insight, i) => (
            <li
              key={i}
              className="flex animate-fade-in-up items-start gap-2.5 text-sm text-slate-600"
              style={{ animationDelay: `${360 + i * 100}ms` }}
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
