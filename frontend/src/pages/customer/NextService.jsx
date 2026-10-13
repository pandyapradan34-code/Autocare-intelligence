import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import HealthProgressBar from "../../components/common/HealthProgressBar";
import StatusBadge from "../../components/common/StatusBadge";
import { CalendarClock } from "lucide-react";
import { useVehicle } from "../../context/VehicleContext";
import useApi from "../../hooks/useApi";
import { formatDate, formatKm } from "../../utils/formatters";

export default function NextService() {
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

    const fetchNextService = async () => {
      try {
        setLoading(true);
        setError("");
        const query = selectedId ? `?vehicleId=${selectedId}` : "";
        const res = await api.get(`/services/next${query}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load next service:", err);
        setError(err.response?.data?.message || "Failed to load upcoming service info.");
      } finally {
        setLoading(false);
      }
    };

    fetchNextService();
  }, [api, selectedId, vehicles]);

  if (vehicleLoading || loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-slate-500">Loading next service milestones...</p>
      </div>
    );
  }

  if (!vehicles?.length) {
    return (
      <div>
        <PageHeader title="Next Service" description="Upcoming service milestones and component-specific countdowns." />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm text-slate-500">Add a vehicle in My Car to view upcoming service countdowns.</p>
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

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title="Next Service"
        description="Upcoming service milestones and component-specific countdowns."
      />

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
          <CalendarClock size={22} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
            Next Recommended Service
          </p>
          <p className="text-xl font-bold text-brand-900">
            {formatKm(data?.dueKm || 0)} / Approx. {data?.dueMonths || 3} months ({data?.nextServiceDate ? formatDate(data.nextServiceDate) : "Scheduled"})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const total = item.totalKm || 10000;
          const remaining = item.remainingKm || 0;
          const percentRemaining = Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));

          return (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <StatusBadge
                  tone={item.status || "good"}
                  label={`${remaining.toLocaleString("en-IN")} km left`}
                />
              </div>
              <HealthProgressBar value={percentRemaining} showLabel={false} />
              <p className="mt-2 text-xs text-slate-400">
                {remaining.toLocaleString("en-IN")} km remaining of {total.toLocaleString("en-IN")} km interval
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
