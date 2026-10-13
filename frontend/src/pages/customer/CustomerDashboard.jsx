import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Car, Gauge, Wallet, AlertTriangle, Plus } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import HealthScoreCard from "../../components/health/HealthScoreCard";
import ComponentHealthCard from "../../components/health/ComponentHealthCard";
import RecommendationCard from "../../components/recommendations/RecommendationCard";
import ChartCard from "../../components/charts/ChartCard";
import HealthTrendChart from "../../components/charts/HealthTrendChart";

import useApi from "../../hooks/useApi";
import { useAuth } from "../../context/AuthContext";
import { useVehicle } from "../../context/VehicleContext";

import { formatKm, formatCurrency } from "../../utils/formatters";

export default function CustomerDashboard() {
  const api = useApi();
  const { user } = useAuth();
  const { vehicles, selectedId, selectedVehicle, loading: vehicleLoading } = useVehicle();

  const [health, setHealth] = useState(null);
  const [components, setComponents] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [maintenance, setMaintenance] = useState(null);
  const [healthOverTime, setHealthOverTime] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // If no vehicles registered
    if (!vehicleLoading && (!vehicles || vehicles.length === 0)) {
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const query = selectedId ? `?vehicleId=${selectedId}` : "";

        const [
          healthRes,
          componentsRes,
          recommendationsRes,
          maintenanceRes,
          trendRes,
        ] = await Promise.all([
          api.get(`/health${query}`),
          api.get(`/health/components${query}`),
          api.get(`/recommendations${query}`),
          api.get(`/maintenance${query}`),
          api.get(`/health/trend${query}`),
        ]);

        setHealth(healthRes.data || null);
        setComponents(componentsRes.data || []);
        setRecommendations(recommendationsRes.data || []);
        setMaintenance(maintenanceRes.data || null);
        setHealthOverTime(trendRes.data || []);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError(
          err?.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (selectedId || (vehicles && vehicles.length > 0)) {
      loadDashboard();
    }
  }, [api, selectedId, vehicles, vehicleLoading]);

  if (vehicleLoading || loading) {
    return (
      <div className="flex min-h-87.5 items-center justify-center">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  const currentVehicle = selectedVehicle || vehicles[0];

  const topComponents = [...components]
    .sort((a, b) => (a.value || a.score || 0) - (b.value || b.score || 0))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's how your vehicle is doing today."
      />

      {!currentVehicle ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Car size={32} />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            No vehicle registered yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Add a vehicle to start tracking its health score, component status, upcoming services, and maintenance costs.
          </p>

          <Link
            to="/customer/car"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus size={18} />
            Add your first car
          </Link>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Vehicle"
              value={`${currentVehicle.brand || ""} ${currentVehicle.model || ""}`}
              icon={Car}
              tone="brand"
            />

            <StatCard
              label="Current Mileage"
              value={formatKm(currentVehicle.currentMileage || currentVehicle.currentKm || 0)}
              icon={Gauge}
              tone="slate"
            />

            <StatCard
              label="Maintenance (This Year)"
              value={formatCurrency(maintenance?.total || 0)}
              icon={Wallet}
              tone="amber"
            />

            <StatCard
              label="Open Recommendations"
              value={recommendations.length}
              icon={AlertTriangle}
              tone="red"
            />
          </div>

          {/* Health + Trend */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <HealthScoreCard
                score={health?.score || currentVehicle.healthScore || 0}
                lastUpdated={health?.lastUpdated}
              />
            </div>

            <div className="lg:col-span-3">
              <ChartCard
                title="Vehicle Health Over Time"
                subtitle="Annual health score trend"
                height={220}
              >
                <HealthTrendChart data={healthOverTime} />
              </ChartCard>
            </div>
          </div>

          {/* Components */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              Components Needing Attention
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {topComponents.length > 0 ? (
                topComponents.map((component) => (
                  <ComponentHealthCard
                    key={component._id || component.id || component.name}
                    component={component}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">
                    No component health data available.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-800">
              Top Recommendations
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 4).map((recommendation) => (
                  <RecommendationCard
                    key={recommendation._id || recommendation.id || recommendation.title}
                    recommendation={recommendation}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">
                    No recommendations available.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}