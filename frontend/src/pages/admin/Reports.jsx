import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import ChartCard from "../../components/charts/ChartCard";
import HealthTrendChart from "../../components/charts/HealthTrendChart";
import { adminOverview } from "../../data/adminDashboardData";
import { vehicles } from "../../data/vehiclesData";
import { healthOverTime } from "../../data/chartData";
import { maintenanceCost } from "../../data/maintenanceData";
import { formatCurrency } from "../../utils/formatters";
import { Users, Car, Wallet, ShieldAlert, Download } from "lucide-react";

export default function Reports() {
  const avgHealth = Math.round(vehicles.reduce((sum, v) => sum + v.healthScore, 0) / vehicles.length);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Summary reporting across customers, vehicles, and maintenance activity."
        actions={
          <button className="btn-hover flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-card hover:bg-slate-50">
            <Download size={15} />
            Export (coming soon)
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Customers" value={adminOverview.totalCustomers} icon={Users} tone="brand" index={0} />
        <StatCard label="Total Vehicles" value={adminOverview.totalVehicles} icon={Car} tone="emerald" index={1} />
        <StatCard label="Avg. Fleet Health" value={`${avgHealth}/100`} icon={ShieldAlert} tone="amber" index={2} />
        <StatCard label="Total Maintenance Spend" value={formatCurrency(maintenanceCost.total)} icon={Wallet} tone="slate" index={3} />
      </div>

      <div className="animate-fade-in-up delay-300">
        <ChartCard title="Fleet Health Trend" subtitle="Sample vehicle health trend, 2022–2026" height={280}>
          <HealthTrendChart data={healthOverTime} />
        </ChartCard>
      </div>

      <p className="mt-4 animate-fade-in-up text-xs text-slate-400 delay-400">
        Detailed exportable PDF/Excel reports will be available once backend reporting
        services are implemented in a later phase.
      </p>
    </div>
  );
}
