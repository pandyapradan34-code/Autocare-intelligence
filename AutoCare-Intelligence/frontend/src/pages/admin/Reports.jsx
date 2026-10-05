import { apiFetch } from "../../utils/api";
import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { Users, Car, Wallet, ShieldAlert, Download, ClipboardList, AlertCircle } from "lucide-react";
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
export default function Reports() {
 const [data,setData]=useState(null); const [error,setError]=useState("");
 useEffect(()=>{apiFetch(`${API}/api/reports/summary`).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not load reports");return d;}).then(setData).catch(e=>setError(e.message));},[]);
 const exportCsv=()=>{window.location.href=`${API}/api/reports/export.csv`;};
 return <div><PageHeader title="Reports" description="Live reporting from the connected MySQL database." actions={<button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"><Download size={15}/> Export CSV</button>}/>
 {error&&<div role="alert" className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={18}/>{error}</div>}
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <StatCard label="Total Customers" value={data?.customers ?? "—"} icon={Users} tone="brand"/><StatCard label="Total Vehicles" value={data?.vehicles ?? "—"} icon={Car} tone="emerald"/><StatCard label="Service Records" value={data?.services ?? "—"} icon={ClipboardList} tone="slate"/><StatCard label="Avg. Fleet Health" value={data ? `${data.averageHealth}/100` : "—"} icon={ShieldAlert} tone="amber"/>
 </div><div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Total maintenance spend</p><p className="mt-1 text-2xl font-bold text-slate-900">{data?new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(data.maintenanceSpend):"—"}</p><p className="mt-2 text-xs text-slate-500">Export includes saved service records, vehicle registration, customer contact details and service costs. If no records exist, the CSV contains only its header.</p></div></div>;
}
