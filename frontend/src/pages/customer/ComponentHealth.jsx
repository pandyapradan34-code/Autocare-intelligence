import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import ComponentHealthCard from "../../components/health/ComponentHealthCard";
import { useVehicle } from "../../context/VehicleContext";
import useApi from "../../hooks/useApi";

export default function ComponentHealth() {
  const api = useApi();
  const { vehicles, selectedId, loading: vehicleLoading } = useVehicle();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedId && (!vehicles || vehicles.length === 0)) {
      setLoading(false);
      return;
    }

    const fetchComponents = async () => {
      try {
        setLoading(true);
        setError("");
        const query = selectedId ? `?vehicleId=${selectedId}` : "";
        const res = await api.get(`/health/components${query}`);
        setComponents(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load components:", err);
        setError(err.response?.data?.message || "Failed to load component health data.");
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [api, selectedId, vehicles]);

  if (vehicleLoading || loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-slate-500">Loading component health...</p>
      </div>
    );
  }

  if (!vehicles?.length) {
    return (
      <div>
        <PageHeader title="Component Health" description="Individual health status for every major component of your vehicle." />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm text-slate-500">Add a vehicle in My Car to view component diagnostic scores.</p>
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

  return (
    <div>
      <PageHeader
        title="Component Health"
        description="Individual health status for every major component of your vehicle."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {components.length > 0 ? (
          components.map((c) => (
            <ComponentHealthCard key={c.id || c.name} component={c} />
          ))
        ) : (
          <p className="col-span-full py-8 text-center text-sm text-slate-400">
            No component health data available.
          </p>
        )}
      </div>
    </div>
  );
}
