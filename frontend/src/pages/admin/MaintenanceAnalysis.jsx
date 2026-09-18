import PageHeader from "../../components/common/PageHeader";
import ChartCard from "../../components/charts/ChartCard";
import CostTrendChart from "../../components/charts/CostTrendChart";
import RepairFrequencyChart from "../../components/charts/RepairFrequencyChart";
import ComponentDegradationChart from "../../components/charts/ComponentDegradationChart";
import MileageTrendChart from "../../components/charts/MileageTrendChart";
import { maintenanceCostTrend } from "../../data/maintenanceData";
import { repairFrequency, componentDegradation, mileageTrend } from "../../data/chartData";

export default function MaintenanceAnalysis() {
  return (
    <div>
      <PageHeader title="Maintenance Analysis" description="Fleet-wide trends across cost, repairs, and component wear." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Maintenance Cost Trend" subtitle="Fleet-wide annual spend">
          <CostTrendChart data={maintenanceCostTrend} />
        </ChartCard>
        <ChartCard title="Repair Frequency by Category" subtitle="Sample vehicle — Honda City VX">
          <RepairFrequencyChart data={repairFrequency} />
        </ChartCard>
        <ChartCard title="Component Degradation" subtitle="Sample vehicle over recent services">
          <ComponentDegradationChart data={componentDegradation} />
        </ChartCard>
        <ChartCard title="Mileage Trend" subtitle="Sample vehicle — Honda City VX">
          <MileageTrendChart data={mileageTrend} />
        </ChartCard>
      </div>
    </div>
  );
}
