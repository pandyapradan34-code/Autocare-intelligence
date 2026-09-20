import { Users, Car, ClipboardList, AlertTriangle, AlertOctagon } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { useAdminData } from "../../context/AdminDataContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { staggerDelay } from "../../utils/motion";

const SEVERITY_STYLES = {
  high: "border-red-200 bg-red-50/60",
  medium: "border-amber-200 bg-amber-50/60",
  low: "border-slate-200 bg-white",
};

export default function AdminDashboard() {
  const { overview, recentServices, criticalAlerts } = useAdminData();

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Fleet-wide overview across all customers and vehicles." />

      {/* KPI StatCards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Customers" value={overview.totalCustomers} icon={Users} tone="brand" index={0} />
        <StatCard label="Total Vehicles" value={overview.totalVehicles} icon={Car} tone="emerald" index={1} />
        <StatCard label="Total Services" value={overview.totalServices} icon={ClipboardList} tone="slate" index={2} />
        <StatCard
          label="Vehicles Requiring Attention"
          value={overview.vehiclesRequiringAttention}
          icon={AlertTriangle}
          tone="red"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Services */}
        <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-card delay-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Recent Services</h2>
          <div className="space-y-1">
            {recentServices.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors duration-150 hover:bg-slate-50"
                style={staggerDelay(i, 60)}
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.vehicle}</p>
                  <p className="text-xs text-slate-400">
                    {s.customer} • {formatDate(s.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{formatCurrency(s.cost)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Vehicle Alerts */}
        <div className="animate-fade-in-up rounded-2xl border border-red-100 bg-red-50/40 p-5 delay-300">
          <div className="mb-4 flex items-center gap-2">
            <AlertOctagon size={16} className="text-red-600" />
            <h2 className="text-sm font-semibold text-red-700">Critical Vehicle Alerts</h2>
          </div>
          <div className="space-y-3">
            {criticalAlerts.map((a, i) => (
              <div
                key={a.id}
                className="animate-fade-in-up rounded-xl border border-red-100 bg-white p-3 shadow-card card-hover-lift"
                style={staggerDelay(i, 80)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{a.vehicle}</p>
                    <p className="text-xs text-slate-400">{a.customer}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                    Alert
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-red-600">{a.issue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}