import PageHeader from "../../components/common/PageHeader";
import useAdminData from "../../hooks/useAdminData";
import { healthTone, toneBar, toneText } from "../../data/adminData";

export default function HealthOverview() {
  const { vehicles = [], loading, error } = useAdminData() || {};

  if (loading) {
    return (
      <div className="flex min-h-87.5 items-center justify-center">
        <p className="text-sm text-slate-500">Loading vehicle health overview...</p>
      </div>
    );
  }

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];
  const sorted = [...safeVehicles].sort((a, b) => (a?.health || 0) - (b?.health || 0));

  return (
    <div>
      <PageHeader title="Vehicle Health Overview" description="Fleet-wide vehicle health, lowest health score first." />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {String(error)}
        </div>
      )}

      <div className="space-y-3">
        {sorted.length > 0 ? (
          sorted.map((v, index) => {
            const h = Number(v.health ?? 85);
            const t = healthTone(h);
            return (
              <div key={v.id || v._id || index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">
                    {v.number || "Vehicle"} - {v.brand || ""} {v.model || ""}
                  </p>
                  <p className={`text-sm font-semibold ${toneText[t] || "text-emerald-600"}`}>
                    {h}%
                  </p>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${toneBar[t] || "bg-emerald-500"} transition-all duration-300`}
                    style={{ width: `${Math.min(100, Math.max(0, h))}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">Owner: {v.owner || "Customer"}</p>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
            No vehicles registered yet.
          </div>
        )}
      </div>
    </div>
  );
}