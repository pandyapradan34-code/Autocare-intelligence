import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import ServiceTable from "../../components/service/ServiceTable";
import { serviceRecords, serviceTypeOptions } from "../../data/serviceRecordsData";
import { Search, PlusCircle } from "lucide-react";

export default function ServiceRecords() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = serviceRecords.filter((r) => {
    const matchesQuery = `${r.vehicle} ${r.customer} ${r.vehicleReg}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "All" || r.serviceType === typeFilter;
    return matchesQuery && matchesType;
  });

  return (
    <div>
      <PageHeader
        title="Service Records"
        description="All service records logged across the fleet."
        actions={
          <Link
            to="/admin/services/add"
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <PlusCircle size={15} />
            Add Service
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by vehicle, customer, or reg. number..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        >
          <option value="All">All Service Types</option>
          {serviceTypeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <ServiceTable records={filtered} />
    </div>
  );
}
