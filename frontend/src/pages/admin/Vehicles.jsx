import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { vehicles } from "../../data/vehiclesData";
import { toneForScore } from "../../utils/healthStatus";
import { formatDate, formatKm } from "../../utils/formatters";
import { Search, Car, Eye } from "lucide-react";

export default function Vehicles() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.registrationNumber} ${v.ownerName}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description="Every vehicle registered across all customers."
        actions={
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vehicles..."
              className="w-64 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Car} title="No vehicles found" description="Try a different search term." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Mileage</th>
                <th className="px-4 py-3 font-medium">Health</th>
                <th className="px-4 py-3 font-medium">Last Service</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{v.brand} {v.model}</p>
                    <p className="text-xs text-slate-400">{v.registrationNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{v.ownerName}</td>
                  <td className="px-4 py-3 text-slate-600">{v.manufacturingYear}</td>
                  <td className="px-4 py-3 text-slate-600">{formatKm(v.currentKm)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={toneForScore(v.healthScore)} label={`${v.healthScore}/100`} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(v.lastServiceDate)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(v)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.brand} ${selected.model}` : ""} size="sm">
        {selected && (
          <div className="space-y-3 text-sm">
            <Detail label="Registration" value={selected.registrationNumber} />
            <Detail label="Owner" value={selected.ownerName} />
            <Detail label="Manufacturing Year" value={selected.manufacturingYear} />
            <Detail label="Current Mileage" value={formatKm(selected.currentKm)} />
            <Detail label="Health Score" value={`${selected.healthScore}/100 (${selected.healthStatus})`} />
            <Detail label="Last Service" value={formatDate(selected.lastServiceDate)} />
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
