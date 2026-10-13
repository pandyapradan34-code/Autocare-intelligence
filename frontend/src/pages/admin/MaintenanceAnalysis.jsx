import PageHeader from "../../components/common/PageHeader";
import useAdminData from "../../hooks/useAdminData";
import { formatCurrency } from "../../utils/formatters";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";

export default function MaintenanceAnalysis() {
  const { services = [], vehicles = [], loading, error } = useAdminData() || {};

  if (loading) {
    return (
      <div className="flex min-h-87.5 items-center justify-center">
        <p className="text-sm text-slate-500">Loading maintenance financials...</p>
      </div>
    );
  }

  const safeServices = Array.isArray(services) ? services : [];
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  const totalCost = safeServices.reduce((sum, s) => sum + (Number(s?.cost) || 0), 0);
  const avgPerVehicle = safeVehicles.length > 0 ? Math.round(totalCost / safeVehicles.length) : 0;
  const avgPerService = safeServices.length > 0 ? Math.round(totalCost / safeServices.length) : 0;

  // Breakdown by service type
  const typeMap = {};
  safeServices.forEach((s) => {
    const t = s?.type || "Other";
    typeMap[t] = (typeMap[t] || 0) + (Number(s?.cost) || 0);
  });
  const typeBreakdown = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <PageHeader
        title="Maintenance Analysis"
        description="Comprehensive maintenance spending, cost trends, and fleet repair analytics."
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {String(error)}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign size={16} />
            <p className="text-xs font-medium uppercase tracking-wide">Total Fleet Spend</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(totalCost)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-slate-400">
            <BarChart3 size={16} />
            <p className="text-xs font-medium uppercase tracking-wide">Avg. Cost Per Vehicle</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(avgPerVehicle)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp size={16} />
            <p className="text-xs font-medium uppercase tracking-wide">Avg. Cost Per Service</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(avgPerService)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">
          Expenditure by Service Category
        </h2>
        <div className="space-y-3">
          {typeBreakdown.length > 0 ? (
            typeBreakdown.map(([type, cost]) => {
              const pct = totalCost > 0 ? Math.round((cost / totalCost) * 100) : 0;
              return (
                <div key={type}>
                  <div className="mb-1 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{type}</span>
                    <span className="text-slate-500">
                      {formatCurrency(cost)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-brand-600 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">
              No maintenance expense data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}