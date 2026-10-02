import { Users, Car, ClipboardList, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { adminOverview, recentServices, criticalAlerts } from "../../data/adminDashboardData";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { AlertOctagon } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Fleet-wide overview across all customers and vehicles." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Customers" value={adminOverview.totalCustomers} icon={Users} tone="brand" />
        <StatCard label="Total Vehicles" value={adminOverview.totalVehicles} icon={Car} tone="emerald" />
        <StatCard label="Total Services" value={adminOverview.totalServices} icon={ClipboardList} tone="slate" />
        <StatCard
          label="Vehicles Requiring Attention"
          value={adminOverview.vehiclesRequiringAttention}
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Recent Services</h2>
          <div className="space-y-3">
            {recentServices.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.vehicle}</p>
                  <p className="text-xs text-slate-400">{s.customer} • {formatDate(s.date)}</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{formatCurrency(s.cost)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertOctagon size={16} className="text-red-600" />
            <h2 className="text-sm font-semibold text-red-700">Critical Vehicle Alerts</h2>
          </div>
          <div className="space-y-3">
            {criticalAlerts.map((a) => (
              <div key={a.id} className="rounded-xl bg-white p-3">
                <p className="text-sm font-semibold text-slate-800">{a.vehicle}</p>
                <p className="text-xs text-slate-400">{a.customer}</p>
                <p className="mt-1 text-xs text-red-600">{a.issue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
