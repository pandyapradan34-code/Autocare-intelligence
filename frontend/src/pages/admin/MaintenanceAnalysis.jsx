import PageHeader from "../../components/common/PageHeader";
import ChartCard from "../../components/charts/ChartCard";
import CostTrendChart from "../../components/charts/CostTrendChart";
import RepairFrequencyChart from "../../components/charts/RepairFrequencyChart";
import ComponentDegradationChart from "../../components/charts/ComponentDegradationChart";
import MileageTrendChart from "../../components/charts/MileageTrendChart";
import { maintenanceCostTrend } from "../../data/maintenanceData";
import { repairFrequency, componentDegradation, mileageTrend } from "../../data/chartData";
import { staggerDelay } from "../../utils/motion";

export default function MaintenanceAnalysis() {
  return (
    <div>
      <PageHeader title="Maintenance Analysis" description="Fleet-wide trends across cost, repairs, and component wear." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[
          { title: "Maintenance Cost Trend", subtitle: "Fleet-wide annual spend", Chart: CostTrendChart, data: maintenanceCostTrend },
          { title: "Repair Frequency by Category", subtitle: "Sample vehicle — Honda City VX", Chart: RepairFrequencyChart, data: repairFrequency },
          { title: "Component Degradation", subtitle: "Sample vehicle over recent services", Chart: ComponentDegradationChart, data: componentDegradation },
          { title: "Mileage Trend", subtitle: "Sample vehicle — Honda City VX", Chart: MileageTrendChart, data: mileageTrend },
        ].map(({ title, subtitle, Chart, data }, i) => (
          <div key={title} className="animate-fade-in-up" style={staggerDelay(i, 100)}>
            <ChartCard title={title} subtitle={subtitle}>
              <Chart data={data} />
            </ChartCard>
          </div>
        ))}
      </div>
    </div>
  );
}
