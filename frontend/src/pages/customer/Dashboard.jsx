import { Car, Gauge, Wallet, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import HealthScoreCard from "../../components/health/HealthScoreCard";
import ComponentHealthCard from "../../components/health/ComponentHealthCard";
import RecommendationCard from "../../components/recommendations/RecommendationCard";
import ChartCard from "../../components/charts/ChartCard";
import HealthTrendChart from "../../components/charts/HealthTrendChart";
import { useAuth } from "../../context/AuthContext";
import { currentVehicle } from "../../data/vehicleData";
import { overallHealth } from "../../data/healthData";
import { componentHealth } from "../../data/componentHealthData";
import { recommendations } from "../../data/recommendationData";
import { healthOverTime } from "../../data/chartData";
import { formatKm, formatCurrency } from "../../utils/formatters";
import { maintenanceCost } from "../../data/maintenanceData";


export default function Dashboard() {
  const { user } = useAuth();
  const topComponents = [...componentHealth].sort((a, b) => a.value - b.value).slice(0, 4);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's how your vehicle is doing today."
      />

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Vehicle" value={`${currentVehicle.brand} ${currentVehicle.model}`} icon={Car} tone="brand" index={0} />
        <StatCard label="Current Mileage" value={formatKm(currentVehicle.currentKm)} icon={Gauge} tone="slate" index={1} />
        <StatCard label="Maintenance (This Year)" value={formatCurrency(maintenanceCost.total)} icon={Wallet} tone="amber" index={2} />
        <StatCard label="Open Recommendations" value={recommendations.length} icon={AlertTriangle} tone="red" index={3} />
      </div>

      {/* Health Score + Chart */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="animate-fade-in-up lg:col-span-2" style={{ animationDelay: "200ms" }}>
          <HealthScoreCard score={overallHealth.score} lastUpdated={overallHealth.lastUpdated} />
        </div>
        <div className="animate-fade-in-up lg:col-span-3" style={{ animationDelay: "260ms" }}>
          <ChartCard title="Vehicle Health Over Time" subtitle="Annual health score trend" height={220}>
            <HealthTrendChart data={healthOverTime} />
          </ChartCard>
        </div>
      </div>

      {/* Components Needing Attention */}
      <div className="mb-6">
        <h2 className="animate-fade-in-up mb-3 text-sm font-semibold text-slate-800" style={{ animationDelay: "300ms" }}>
          Components Needing Attention
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topComponents.map((c, i) => (
            <ComponentHealthCard key={c.id} component={c} barDelay={i * 80 + 300} animDelay={i * 70 + 360} />
          ))}
        </div>
      </div>

      {/* Top Recommendations */}
      <div>
        <h2 className="animate-fade-in-up mb-3 text-sm font-semibold text-slate-800" style={{ animationDelay: "500ms" }}>
          Top Recommendations
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {recommendations.slice(0, 4).map((r, i) => (
            <div key={r.id} className="animate-fade-in-up" style={{ animationDelay: `${540 + i * 80}ms` }}>
              <RecommendationCard recommendation={r} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
