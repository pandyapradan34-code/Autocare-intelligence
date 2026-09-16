import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import ServiceHistoryCard from "../../components/service/ServiceHistoryCard";
import EmptyState from "../../components/common/EmptyState";
import { serviceHistory } from "../../data/serviceHistoryData";
import { History, Search } from "lucide-react";

export default function ServiceHistory() {
  const [query, setQuery] = useState("");

  const filtered = serviceHistory.filter((r) =>
    `${r.serviceType} ${r.mechanicRemarks}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Service History"
        description="A complete timeline of every service performed on your vehicle."
        actions={
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search service history..."
              className="w-64 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="No matching records" description="Try a different search term." />
      ) : (
        <div className="space-y-4">
          {filtered.map((record) => (
            <ServiceHistoryCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
