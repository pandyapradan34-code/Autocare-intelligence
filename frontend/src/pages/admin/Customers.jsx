import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { useAdminData } from "../../context/AdminDataContext";
import { formatDate } from "../../utils/formatters";
import { Search, Users, Eye } from "lucide-react";

export default function Customers() {
  const { customers, vehicles } = useAdminData();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = customers.filter((c) =>
    `${c.name} ${c.email}`.toLowerCase().includes(query.toLowerCase())
  );

  const selectedVehicles = selected ? vehicles.filter((v) => v.ownerId === selected.id) : [];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="All registered customers and their vehicles."
        actions={
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-64 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="Try a different search term." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Vehicles</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{c.vehicleCount}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={c.status === "Active" ? "active" : "inactive"} label={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(c)}
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

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Email" value={selected.email} />
              <Detail label="Phone" value={selected.phone} />
              <Detail label="Joined" value={formatDate(selected.joinedDate)} />
              <Detail label="Status" value={selected.status} />
              <div className="col-span-2">
                <Detail label="Address" value={selected.address || "—"} />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Vehicles</p>
              <div className="space-y-2">
                {selectedVehicles.map((v) => (
                  <div key={v.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="font-medium text-slate-800">
                      {v.brand} {v.model}
                    </p>
                    <p className="text-xs text-slate-400">{v.registrationNumber} • Health {v.healthScore}/100</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}