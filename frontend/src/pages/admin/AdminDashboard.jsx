import {
  Users,
  Car,
  ClipboardList,
  AlertTriangle,
  AlertOctagon,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import useAdminData from "../../hooks/useAdminData";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function AdminDashboard() {
  const adminData = useAdminData();
  const {
    stats = {},
    recentServices = [],
    criticalAlerts = [],
    loading = false,
    error = "",
    reload,
  } = adminData || {};

  if (loading) {
    return (
      <div className="flex min-h-87.5 items-center justify-center">
        <p className="text-sm text-slate-500">Loading admin fleet metrics...</p>
      </div>
    );
  }

  const safeStats = {
    totalCustomers: 0,
    totalVehicles: 0,
    totalServices: 0,
    vehiclesRequiringAttention: 0,
    ...(stats || {}),
  };

  const services = Array.isArray(recentServices) ? recentServices : [];
  const alerts = Array.isArray(criticalAlerts) ? criticalAlerts : [];

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Fleet-wide overview across all customers and vehicles."
      />

      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <span>{String(error)}</span>
          {reload && (
            <button
              onClick={reload}
              className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold hover:bg-amber-200"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Customers"
          value={safeStats.totalCustomers}
          icon={Users}
          tone="brand"
        />

        <StatCard
          label="Total Vehicles"
          value={safeStats.totalVehicles}
          icon={Car}
          tone="emerald"
        />

        <StatCard
          label="Total Services"
          value={safeStats.totalServices}
          icon={ClipboardList}
          tone="slate"
        />

        <StatCard
          label="Vehicles Requiring Attention"
          value={safeStats.vehiclesRequiringAttention}
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Services */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">
            Recent Services
          </h2>

          <div className="space-y-3">
            {services.length > 0 ? (
              services.map((service, index) => (
                <div
                  key={service._id || service.id || index}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {service.vehicle || service.vehicleName || "Vehicle"}
                    </p>

                    <p className="text-xs text-slate-400">
                      {service.customer || service.customerName || "Customer"}
                      {" • "}
                      {service.date ? formatDate(service.date) : "Date unavailable"}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    {formatCurrency(service.cost ?? service.amount ?? 0)}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">
                No recent services available.
              </p>
            )}
          </div>
        </section>

        {/* Critical Alerts */}
        <section className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertOctagon size={16} className="text-red-600" />
            <h2 className="text-sm font-semibold text-red-700">
              Critical Vehicle Alerts
            </h2>
          </div>

          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div
                  key={alert._id || alert.id || index}
                  className="rounded-xl bg-white p-3 shadow-xs"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {alert.vehicle || alert.vehicleName || "Vehicle"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {alert.customer || alert.customerName || "Customer"}
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    {alert.issue || alert.message || "Attention required"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-white p-4 text-center">
                <p className="text-sm text-slate-400">No critical alerts. All vehicles healthy.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
