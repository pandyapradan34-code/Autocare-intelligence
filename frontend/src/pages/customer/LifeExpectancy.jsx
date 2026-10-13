import { useEffect, useState } from "react";
import { TrendingUp, Clock, ShieldCheck, Wrench, AlertCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import HealthProgressBar from "../../components/common/HealthProgressBar";
import { useVehicle } from "../../context/VehicleContext";
import useApi from "../../hooks/useApi";
import { formatCurrency, formatKm } from "../../utils/formatters";

export default function LifeExpectancy() {
  const api = useApi();
  const { vehicles, selectedId, selectedVehicle, loading: vehicleLoading } = useVehicle();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedId && (!vehicles || vehicles.length === 0)) {
      setLoading(false);
      return;
    }

    const fetchLifeExpectancy = async () => {
      try {
        setLoading(true);
        setError("");
        const query = selectedId ? `?vehicleId=${selectedId}` : "";
        const res = await api.get(`/life-expectancy${query}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load life expectancy:", err);
        setError(err.response?.data?.message || "Failed to load life expectancy data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLifeExpectancy();
  }, [api, selectedId, vehicles]);

  if (vehicleLoading || loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-slate-500">Estimating vehicle lifespan...</p>
      </div>
    );
  }

  if (!vehicles?.length) {
    return (
      <div>
        <PageHeader title="Life Expectancy" description="Predictive vehicle lifespan and long-term durability forecasting." />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm text-slate-500">Add a vehicle in My Car to view durability and life expectancy projections.</p>
        </div>
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

  const v = selectedVehicle || vehicles[0];
  const factors = data?.factors || [];
  const repairs = data?.predictedMajorRepairs || [];

  return (
    <div>
      <PageHeader
        title="Life Expectancy"
        description="Predictive durability modelling based on your driving usage, maintenance habits, and component health."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Est. Remaining Years"
          value={`${data?.estimatedRemainingYears || 7} Years`}
          icon={Clock}
          tone="brand"
        />

        <StatCard
          label="Est. Remaining Mileage"
          value={formatKm(data?.estimatedRemainingKm || 120000)}
          icon={TrendingUp}
          tone="emerald"
        />

        <StatCard
          label="Projected Total Lifespan"
          value={formatKm(data?.projectedLifespanKm || 240000)}
          icon={ShieldCheck}
          tone="slate"
        />

        <StatCard
          label="Health Index"
          value={`${data?.healthScore || v.healthScore || 85}/100`}
          icon={ShieldCheck}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Durability Factors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">
            Durability Impact Factors
          </h2>
          <div className="space-y-4">
            {factors.map((f, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{f.name}</span>
                  <span className="text-slate-400">Impact: {f.impact} • {f.score}%</span>
                </div>
                <HealthProgressBar value={f.score} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Projected Major Repairs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Wrench size={16} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-slate-800">
              Projected Long-Term Maintenance
            </h2>
          </div>
          <div className="space-y-3">
            {repairs.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3"
              >
                <div>
                  <p className="text-xs font-bold text-brand-600">{r.milestone}</p>
                  <p className="text-sm font-medium text-slate-800">{r.item}</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">
                  {formatCurrency(r.estimatedCost)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
