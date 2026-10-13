import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import useAdminData from "../../hooks/useAdminData";
import { formatDate } from "../../utils/formatters";
import { healthTone, toneText } from "../../data/adminData";

export default function Vehicles() {
  const { vehicles = [], loading, error } = useAdminData() || {};
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  if (loading) {
    return (
      <div className="flex min-h-87.5 items-center justify-center">
        <p className="text-sm text-slate-500">Loading vehicles...</p>
      </div>
    );
  }

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  const rows = safeVehicles.filter((v) => {
    const match = `${v?.number || ""} ${v?.brand || ""} ${v?.model || ""} ${v?.owner || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const tone = healthTone(Number(v?.health ?? 85));
    return match && (filter === "all" || tone === filter);
  });

  return (
    <div>
      <PageHeader title="Vehicles" description="Every vehicle across all customers." />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {String(error)}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search number, brand, model, owner"
          className="w-full max-w-sm rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        >
          <option value="all">All health</option>
          <option value="emerald">Good (&gt; 70%)</option>
          <option value="amber">Fair (41% - 70%)</option>
          <option value="red">Needs attention (&le; 40%)</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-3">Vehicle</th>
              <th className="p-3">Owner</th>
              <th className="p-3">KM</th>
              <th className="p-3">Next Service</th>
              <th className="p-3">Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v, index) => {
              const h = Number(v?.health ?? 85);
              const tone = healthTone(h);
              return (
                <tr key={v?.id || v?._id || index} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3">
                    <p className="font-semibold text-slate-800">{v?.number || "Vehicle"}</p>
                    <p className="text-xs text-slate-400">
                      {v?.brand || ""} {v?.model || ""} {v?.variant ? `(${v.variant})` : ""}
                    </p>
                  </td>
                  <td className="p-3 text-slate-600">{v?.owner || "Customer"}</td>
                  <td className="p-3 text-slate-600">{(v?.km || 0).toLocaleString("en-IN")} km</td>
                  <td className="p-3 text-slate-500">{v?.nextService ? formatDate(v.nextService) : "Scheduled"}</td>
                  <td className={`p-3 font-semibold ${toneText[tone] || "text-emerald-600"}`}>{h}%</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}