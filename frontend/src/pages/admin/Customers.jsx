import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import useAdminData from "../../hooks/useAdminData";

export default function Customers() {
  const { customers = [], loading, error } = useAdminData() || {};
  const [search, setSearch] = useState("");

  if (loading) {
    return (
      <div className="flex min-h-87.5 items-center justify-center">
        <p className="text-sm text-slate-500">Loading customers...</p>
      </div>
    );
  }

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const rows = safeCustomers.filter((c) =>
    `${c?.name || ""} ${c?.email || ""} ${c?.phone || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Customers" description="All registered customers." />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {String(error)}
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search customers by name, email, or phone"
        className="mb-4 w-full max-w-sm rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Vehicles</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, index) => (
              <tr key={c.id || c._id || index} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="p-3 font-medium text-slate-800">{c.name || "Customer"}</td>
                <td className="p-3 text-slate-500">{c.email || "—"}</td>
                <td className="p-3 text-slate-500">{c.phone || "—"}</td>
                <td className="p-3 font-semibold text-slate-700">{c.vehicleCount ?? 0}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}