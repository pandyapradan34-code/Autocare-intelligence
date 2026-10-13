import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import RecommendationCard from "../../components/recommendations/RecommendationCard";
import { useVehicle } from "../../context/VehicleContext";
import useApi from "../../hooks/useApi";

export default function Recommendations() {
  const api = useApi();
  const { vehicles, selectedId, loading: vehicleLoading } = useVehicle();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedId && (!vehicles || vehicles.length === 0)) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");
        const query = selectedId ? `?vehicleId=${selectedId}` : "";
        const res = await api.get(`/recommendations${query}`);
        setRecommendations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
        setError(err.response?.data?.message || "Failed to load vehicle recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [api, selectedId, vehicles]);

  if (vehicleLoading || loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-slate-500">Loading recommendations...</p>
      </div>
    );
  }

  if (!vehicles?.length) {
    return (
      <div>
        <PageHeader title="Recommendations" description="Suggested maintenance actions and diagnostic alerts." />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm text-slate-500">Add a vehicle in My Car to view personalized maintenance recommendations.</p>
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
        title="Recommendations"
        description="Suggested actions based on current component health, sensor readings, and mileage thresholds."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {recommendations.length > 0 ? (
          recommendations.map((r) => (
            <RecommendationCard key={r.id || r.title} recommendation={r} />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm text-slate-400">All vehicle systems are currently operating normally. No actions pending.</p>
          </div>
        )}
      </div>
    </div>
  );
}
