import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import MaintenanceCostCard from "../../components/dashboard/MaintenanceCostCard";
import ChartCard from "../../components/charts/ChartCard";
import CostTrendChart from "../../components/charts/CostTrendChart";
import { useVehicle } from "../../context/VehicleContext";
import useApi from "../../hooks/useApi";
import { Sparkles } from "lucide-react";

export default function MaintenanceCost() {
  const api = useApi();
  const { vehicles, selectedId, loading: vehicleLoading } = useVehicle();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedId && (!vehicles || vehicles.length === 0)) {
      setLoading(false);
      return;
    }

    const fetchMaintenance = async () => {
      try {
        setLoading(true);
        setError("");
        const query = selectedId ? `?vehicleId=${selectedId}` : "";
        const res = await api.get(`/maintenance${query}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load maintenance costs:", err);
        setError(err.response?.data?.message || "Failed to load maintenance cost data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, [api, selectedId, vehicles]);

  if (vehicleLoading || loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-slate-500">Loading maintenance financials...</p>
      </div>
    );
  }

  if (!vehicles?.length) {
    return (
      <div>
        <PageHeader title="Maintenance Cost" description="A breakdown of how much you've spent, and where." />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm text-slate-500">Add a vehicle in My Car to view maintenance cost analytics.</p>
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

  const breakdown = data?.breakdown || [];
  const trend = data?.trend || [];
  const insights = data?.insights || [];

  return (
    <div>
      <PageHeader title="Maintenance Cost" description="A breakdown of how much you've spent, and where." />

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MaintenanceCostCard
          total={data?.total || 0}
          yearOverYearChange={data?.yearOverYearChange}
          breakdown={breakdown}
        />
        <ChartCard title="Maintenance Cost Trend" subtitle="Year-over-year spend" height={260}>
          <CostTrendChart data={trend} />
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-slate-800">Financial Insights</h2>
        </div>
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
