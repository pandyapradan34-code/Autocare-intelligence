import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import HealthScoreCard from "../../components/health/HealthScoreCard";
import HealthProgressBar from "../../components/common/HealthProgressBar";
import { useVehicle } from "../../context/VehicleContext";
import useApi from "../../hooks/useApi";
import { HEALTH_TONES, toneForScore } from "../../utils/healthStatus";

export default function VehicleHealth() {
  const api = useApi();
  const { vehicles, selectedId, selectedVehicle, loading: vehicleLoading } = useVehicle();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedId && (!vehicles || vehicles.length === 0)) {
      setLoading(false);
      return;
    }

    const fetchHealth = async () => {
      try {
        setLoading(true);
        setError("");
        const query = selectedId ? `?vehicleId=${selectedId}` : "";
        const res = await api.get(`/health${query}`);
        setHealth(res.data);
      } catch (err) {
        console.error("Failed to load vehicle health:", err);
        setError(err.response?.data?.message || "Failed to load vehicle health data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, [api, selectedId, vehicles]);

  if (vehicleLoading || loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-slate-500">Loading vehicle health...</p>
      </div>
    );
  }

  if (!vehicles?.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <p className="text-sm text-slate-500">Please add a car in My Car to view health analysis.</p>
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

  const score = Number(health?.score ?? selectedVehicle?.healthScore ?? 85);
  const toneKey = toneForScore(score);
  const tone = HEALTH_TONES[toneKey] || HEALTH_TONES.emerald;
  const breakdown = health?.breakdown ?? [];

  return (
    <div>
      <PageHeader
        title="Vehicle Health"
        description="A breakdown of what shapes your vehicle's overall health score."
      />

      {/* Health Score */}
      <div className="mb-6">
        <HealthScoreCard score={score} lastUpdated={health?.lastUpdated} />
      </div>

      {/* Current Status */}
      <div className={`mb-6 rounded-2xl border p-5 ${tone.bg} ${tone.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Current Health Status
            </p>
            <p className={`mt-1 text-lg font-semibold ${tone.text}`}>{tone.label}</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badgeBg} ${tone.badgeText}`}>
            {score}/100
          </div>
        </div>
      </div>

      {/* Why this score */}
      <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
            <Lightbulb size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-800">Why this score?</p>
            <p className="mt-1 text-sm leading-relaxed text-brand-800/80">
              {health?.explanation ||
                "Your vehicle health score is calculated using service records, inspection metrics, mileage, and component age."}
            </p>
          </div>
        </div>
      </div>

      {/* Health Factors */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Health Score Factors</h2>
        <p className="mb-5 text-xs text-slate-400">
          The score is dynamically calculated across powertrain, brakes, suspension, and maintenance factors.
        </p>

        <div className="space-y-5">
          {breakdown.length === 0 ? (
            <p className="text-sm text-slate-400">No health factors breakdown available.</p>
          ) : (
            breakdown.map((factor, index) => {
              const factorScore = Number(factor.score ?? 0);
              const weight = Number(factor.weight ?? 0);

              return (
                <div key={factor.factor ?? index}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{factor.factor}</span>
                    <span className="text-xs text-slate-400">
                      {factorScore}/100 • {weight}% weight
                    </span>
                  </div>
                  <HealthProgressBar value={factorScore} size="sm" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}