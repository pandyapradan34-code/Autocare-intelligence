import { apiFetch } from "../../utils/api";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import ServiceTable from "../../components/service/ServiceTable";
import { serviceTypeOptions } from "../../data/serviceRecordsData";
import { Search, PlusCircle, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
export default function ServiceRecords() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch(`${API}/api/service-records`).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not load service records"); return d; })
      .then(rows => setRecords(rows.map(r => ({ id:r.id, vehicle:`${r.brand} ${r.model}`, vehicleReg:r.registration_number, customer:r.customer_name, date:r.service_date, serviceType:r.service_type, cost:Number(r.cost), mechanic:r.mechanic_name || "Not assigned", remarks:r.remarks, parts:r.parts, assessments:r.assessments }))))
      .catch(e => setError(`${e.message}. Ensure the backend and database are running.`)).finally(() => setLoading(false));
  }, []);
  const filtered = useMemo(() => records.filter(r => `${r.vehicle} ${r.customer} ${r.vehicleReg}`.toLowerCase().includes(query.toLowerCase()) && (typeFilter === "All" || r.serviceType === typeFilter)), [records, query, typeFilter]);
  return <div><PageHeader title="Service Records" description="Live service history loaded from the connected database." actions={<Link to="/admin/services/add" className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"><PlusCircle size={15}/>Add Service</Link>}/>
    {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={18}/>{error}</div>}
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by vehicle, customer, or reg. number..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"/></div><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"><option value="All">All Service Types</option>{serviceTypeOptions.map(t=><option key={t}>{t}</option>)}</select></div>
    {loading ? <div className="rounded-xl border bg-white p-8 text-sm text-slate-600">Loading service history…</div> : <ServiceTable records={filtered}/>}</div>;
}
