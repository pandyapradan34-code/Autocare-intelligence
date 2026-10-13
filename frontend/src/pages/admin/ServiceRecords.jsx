import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import useAdminData from "../../hooks/useAdminData";
import { formatCurrency, formatDate } from "../../utils/formatters";

export default function ServiceRecords() {
  const { services = [], loading, error } = useAdminData() || {};
  const [search, setSearch] = useState("");

  if (loading) {
    return (
      <div className="flex min-h-87.5 items-center justify-center">
        <p className="text-sm text-slate-500">Loading service records...</p>
      </div>
    );
  }

  const safeServices = Array.isArray(services) ? services : [];
  const rows = safeServices.filter((s) =>
    `${s?.vehicle || ""} ${s?.customer || ""} ${s?.type || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Service Records" description="Complete fleet maintenance and service history." />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {String(error)}
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search vehicle, customer, or service type"
        className="mb-4 w-full max-w-sm rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Service</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, index) => (
              <tr key={s.id || s._id || index} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="p-3 text-slate-500">{formatDate(s.date)}</td>
                <td className="p-3 font-medium text-slate-800">{s.vehicle || "Vehicle"}</td>
                <td className="p-3 text-slate-500">{s.customer || "Customer"}</td>
                <td className="p-3 text-slate-700">{s.type || "Service"}</td>
                <td className="p-3 font-semibold text-slate-700">{formatCurrency(s.cost || 0)}</td>
                <td className="p-3">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    {s.status || "Completed"}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No service records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}