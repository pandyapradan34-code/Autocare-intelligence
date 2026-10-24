import { apiFetch } from "../../utils/api";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { serviceTypeOptions } from "../../data/serviceRecordsData";
import { CheckCircle2, AlertCircle, LoaderCircle, Wrench } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const COMPONENTS = [
  { key: "engine", label: "Engine", note: "Inspection result / symptoms" },
  { key: "transmission", label: "Transmission", note: "Gear shifting / clutch behaviour" },
  { key: "brakes", label: "Brakes", note: "Pad wear, noise and braking response" },
  { key: "suspension", label: "Suspension", note: "Ride, noise and shock absorber check" },
  { key: "battery", label: "Battery", note: "Battery test result / age" },
  { key: "tyres", label: "Tyres", note: "Prefer measured tread depth when available" },
  { key: "ac", label: "AC", note: "Cooling performance / leaks" },
  { key: "cooling", label: "Cooling System", note: "Coolant, leaks and temperature" },
  { key: "steering", label: "Steering", note: "Play, alignment and vibration" },
  { key: "electrical", label: "Electrical System", note: "Lights, charging and fault codes" },
];
const FACTORS = [
  { key: "roughDriving", label: "Driving style", options: [["never","Never rough"],["rare","Rarely"],["sometimes","Sometimes"],["mostly","Mostly rough"]] },
  { key: "roadType", label: "Usual road type", options: [["highway","Mostly highway"],["mixed","Mixed"],["city","City traffic"],["rough","Rough / unpaved"]] },
  { key: "overallCondition", label: "Overall vehicle condition", options: [["excellent","Excellent"],["good","Good"],["fair","Fair"],["poor","Poor"]] },
  { key: "vibration", label: "Vibration", options: [["none","None"],["slight","Slight"],["moderate","Moderate"],["severe","Severe"]] },
  { key: "unusualNoise", label: "Unusual noise", options: [["no","No"],["sometimes","Sometimes"],["yes","Yes"]] },
  { key: "warningLights", label: "Dashboard warning lights", options: [["none","None"],["one","One warning"],["multiple","Multiple warnings"]] },
  { key: "overheating", label: "Overheating history", options: [["never","Never"],["once","Once"],["frequent","Repeated / frequent"]] },
  { key: "accidentHistory", label: "Accident history", options: [["none","None known"],["minor","Minor"],["major","Major"]] },
];
const emptyComponent = { health: "", action: "inspected", notes: "", cost: "" };
const blankForm = () => ({ customerId: "", vehicleId: "", odometer: "", serviceDate: new Date().toISOString().slice(0,10), serviceType: "", category: "", cost: "", mechanicId: "", remarks: "", annualKm: "12000", components: Object.fromEntries(COMPONENTS.map(c => [c.key, { ...emptyComponent }])), factors: Object.fromEntries(FACTORS.map(f => [f.key, f.options[0][0]])), parts: [] });
const fieldClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

export default function AddService() {
  const navigate = useNavigate();
  const [form, setForm] = useState(blankForm);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [customerMode, setCustomerMode] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ registrationNumber: "", brand: "", model: "", variant: "", manufacturingYear: String(new Date().getFullYear()), currentKm: "0" });
  const [creatingVehicle, setCreatingVehicle] = useState(false);
  const customerVehicles = useMemo(() => vehicles.filter(v => String(v.customer_id) === String(form.customerId)), [vehicles, form.customerId]);

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch(`${API}/api/customers`), apiFetch(`${API}/api/vehicles`), apiFetch(`${API}/api/mechanics`)]).then(async ([cr, vr, mr]) => {
      const cd = await cr.json(); const vd = await vr.json(); const md = mr.ok ? await mr.json() : [];
      if (!cr.ok) throw new Error(cd.error || "Could not load customers");
      if (!vr.ok) throw new Error(vd.error || "Could not load vehicles");
      if (active) { setCustomers(cd); setVehicles(vd); setMechanics(md); }
    }).catch(e => { if (active) setError(`${e.message}. Please retry the demo action.`); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const update = (key, value) => setForm(f => ({ ...f, [key]: value, ...(key === "customerId" ? { vehicleId: "" } : {}) }));
  const updateComponent = (key, prop, value) => setForm(f => ({ ...f, components: { ...f.components, [key]: { ...f.components[key], [prop]: value } } }));
  const updateFactor = (key, value) => setForm(f => ({ ...f, factors: { ...f.factors, [key]: value } }));
  const addPart = () => setForm(f => ({ ...f, parts: [...f.parts, { name: "", action: "replaced", cost: "" }] }));
  const updatePart = (i, key, value) => setForm(f => ({ ...f, parts: f.parts.map((p, n) => n === i ? { ...p, [key]: value } : p) }));

  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if (!form.customerId || !form.vehicleId || !form.serviceDate || !form.serviceType || form.odometer === "" || form.cost === "") { setError("Choose Existing Customer or New Customer, save/select the customer, then fill vehicle, date, odometer, service type and total cost."); return; }
    if (Number(form.cost) < 0 || Number(form.odometer) < 0) { setError("Odometer and cost cannot be negative."); return; }
    setSaving(true);
    try {
      const payload = { ...form, vehicleId: Number(form.vehicleId), mechanicId: form.mechanicId ? Number(form.mechanicId) : null, odometer: Number(form.odometer), cost: Number(form.cost), annualKm: Number(form.annualKm) || 12000, components: Object.fromEntries(Object.entries(form.components).filter(([,v]) => v.health !== "").map(([k,v]) => [k,{...v,health:Number(v.health),cost:Number(v.cost)||0}])), parts: form.parts.filter(p => p.name.trim()).map(p => ({...p,cost:Number(p.cost)||0})) };
      const response = await apiFetch(`${API}/api/service-records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not save service record");
      setSuccess(data); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e2) { setError(e2.message); } finally { setSaving(false); }
  }

  if (success) return <div className="max-w-3xl rounded-2xl border border-emerald-200 bg-white p-8 shadow-card"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={28}/></div><h1 className="text-xl font-bold text-slate-900">Service record saved</h1><p className="mt-2 text-sm text-slate-600">Added to temporary demo data. Changes reset when the page is refreshed.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><Metric label="Vehicle health" value={`${success.health.score}/100`} /><Metric label="Health status" value={success.health.status} /><Metric label="Life estimate" value={`${success.health.remainingLife.yearsLow}–${success.health.remainingLife.yearsHigh} yrs`} /></div><p className="mt-4 text-xs text-slate-500">Remaining life is a low-confidence, rule-based planning estimate—not a certified prediction.</p><div className="mt-6 flex flex-wrap gap-3"><button className="rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={() => { setForm(blankForm()); setCustomerMode(""); setSuccess(null); }}>Add another</button><button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => navigate("/admin/services")}>View service records</button></div></div>;

  return <div><PageHeader title="Add Service Record" description="Record service work, assess components and update the vehicle intelligence engine." />
    {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={18} className="shrink-0"/><span>{error}</span></div>}
    {loading ? <div className="rounded-xl border bg-white p-8 text-sm text-slate-600">Loading customers and vehicles…</div> : <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><SectionTitle title="Customer selection" subtitle="Choose an existing customer or create a new customer before continuing."/><div className="mt-4 grid gap-3 sm:grid-cols-2"><button type="button" onClick={()=>{setCustomerMode("existing");update("customerId","");}} className={`rounded-xl border p-4 text-left ${customerMode==="existing"?"border-brand-500 bg-brand-50":"border-slate-200"}`}><p className="font-semibold text-slate-800">Existing Customer</p><p className="mt-1 text-xs text-slate-500">Select a customer from the demo data.</p></button><button type="button" onClick={()=>{setCustomerMode("new");update("customerId","");}} className={`rounded-xl border p-4 text-left ${customerMode==="new"?"border-brand-500 bg-brand-50":"border-slate-200"}`}><p className="font-semibold text-slate-800">New Customer</p><p className="mt-1 text-xs text-slate-500">Create a temporary demo customer.</p></button></div>
      {customerMode==="existing"&&<div className="mt-4"><Field label="Existing customer *"><select required className={fieldClass} value={form.customerId} onChange={e=>update("customerId",e.target.value)}><option value="">Select customer</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}</select></Field>{customers.length===0&&<p className="mt-2 text-sm text-amber-700">No customers exist yet. Choose New Customer to add one.</p>}</div>}
      {customerMode==="new"&&<div className="mt-4 grid gap-4 sm:grid-cols-3"><Field label="Full name *"><input required className={fieldClass} value={newCustomer.name} onChange={e=>setNewCustomer(v=>({...v,name:e.target.value}))}/></Field><Field label="Email *"><input required type="email" className={fieldClass} value={newCustomer.email} onChange={e=>setNewCustomer(v=>({...v,email:e.target.value}))}/></Field><Field label="Mobile number *"><input required inputMode="tel" className={fieldClass} value={newCustomer.phone} onChange={e=>setNewCustomer(v=>({...v,phone:e.target.value}))}/></Field><div className="sm:col-span-3"><button type="button" disabled={creatingCustomer} onClick={async()=>{setError("");if(!newCustomer.name.trim()||!newCustomer.email.trim()){setError("Customer name and email are required.");return;}setCreatingCustomer(true);try{const r=await apiFetch(`${API}/api/customers`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newCustomer)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not create customer");setCustomers(v=>[...v,d]);update("customerId",String(d.id));setCustomerMode("existing");setNewCustomer({name:"",email:"",phone:""});}catch(err){setError(err.message)}finally{setCreatingCustomer(false)}}} className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{creatingCustomer?"Saving customer…":"Save customer and continue"}</button></div></div>}
      </section>
      {customerMode!==""&&form.customerId&&customerVehicles.length===0&&<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><SectionTitle title="Register vehicle" subtitle="This customer has no vehicle yet. Add the vehicle before recording its service."/><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Registration number *"><input required className={fieldClass} value={newVehicle.registrationNumber} onChange={e=>setNewVehicle(v=>({...v,registrationNumber:e.target.value}))} placeholder="GJ01AB1234"/></Field><Field label="Brand *"><input required className={fieldClass} value={newVehicle.brand} onChange={e=>setNewVehicle(v=>({...v,brand:e.target.value}))} placeholder="Maruti Suzuki"/></Field><Field label="Model *"><input required className={fieldClass} value={newVehicle.model} onChange={e=>setNewVehicle(v=>({...v,model:e.target.value}))} placeholder="Baleno"/></Field><Field label="Variant"><input className={fieldClass} value={newVehicle.variant} onChange={e=>setNewVehicle(v=>({...v,variant:e.target.value}))}/></Field><Field label="Manufacturing year *"><input required type="number" min="1950" max={new Date().getFullYear()+1} className={fieldClass} value={newVehicle.manufacturingYear} onChange={e=>setNewVehicle(v=>({...v,manufacturingYear:e.target.value}))}/></Field><Field label="Current odometer (km)"><input type="number" min="0" className={fieldClass} value={newVehicle.currentKm} onChange={e=>setNewVehicle(v=>({...v,currentKm:e.target.value}))}/></Field><div className="sm:col-span-2 lg:col-span-3"><button type="button" disabled={creatingVehicle} onClick={async()=>{setError("");setCreatingVehicle(true);try{const r=await apiFetch(`${API}/api/vehicles`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...newVehicle,customerId:Number(form.customerId),manufacturingYear:Number(newVehicle.manufacturingYear),currentKm:Number(newVehicle.currentKm)})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Could not register vehicle");setVehicles(v=>[...v,d]);setForm(f=>({...f,vehicleId:String(d.id),odometer:String(d.current_km)}));}catch(err){setError(err.message)}finally{setCreatingVehicle(false)}}} className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{creatingVehicle?"Registering vehicle…":"Save vehicle and continue"}</button></div></div></section>}
      {customerMode!==""&&form.customerId&&customerVehicles.length>0&&<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><SectionTitle title="Vehicle & service details" subtitle="Select the customer's vehicle and enter the service details."/><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Vehicle *"><select className={fieldClass} value={form.vehicleId} onChange={e=>update("vehicleId",e.target.value)} disabled={!form.customerId}><option value="">Select vehicle</option>{customerVehicles.map(v=><option key={v.id} value={v.id}>{v.brand} {v.model} — {v.registration_number}</option>)}</select></Field>
        <Field label="Odometer (km) *"><input className={fieldClass} type="number" min="0" step="1" value={form.odometer} onChange={e=>update("odometer",e.target.value)} required/></Field>
        <Field label="Service date *"><input className={fieldClass} type="date" value={form.serviceDate} onChange={e=>update("serviceDate",e.target.value)} required/></Field>
        <Field label="Service type *"><select className={fieldClass} value={form.serviceType} onChange={e=>update("serviceType",e.target.value)} required><option value="">Select service type</option>{serviceTypeOptions.map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="Category"><select className={fieldClass} value={form.category} onChange={e=>update("category",e.target.value)}><option value="">Select category</option>{COMPONENTS.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select></Field>
        <Field label="Total service cost (₹) *"><input className={fieldClass} type="number" min="0" step="0.01" value={form.cost} onChange={e=>update("cost",e.target.value)} required/></Field>
        <Field label="Annual usage (km estimate)"><input className={fieldClass} type="number" min="1000" value={form.annualKm} onChange={e=>update("annualKm",e.target.value)}/></Field>
        <Field label="Mechanic (optional)"><select className={fieldClass} value={form.mechanicId} onChange={e=>update("mechanicId",e.target.value)}><option value="">Not assigned</option>{mechanics.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select><span className="mt-1 block text-xs text-slate-500">Mechanic options come from active mechanic accounts.</span></Field>
      </div></section>}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><SectionTitle title="Component assessment" subtitle="Only assess components inspected during this visit. Health: 0 = failed/worn, 100 = excellent. Use measured/tested values where possible."/><div className="mt-4 grid gap-4 lg:grid-cols-2">{COMPONENTS.map(c=><div key={c.key} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center gap-2 font-semibold text-slate-800"><Wrench size={16} className="text-brand-600"/>{c.label}</div><p className="mb-3 text-xs text-slate-500">{c.note}</p><div className="grid gap-3 sm:grid-cols-2"><Field label="Condition / health score"><select className={fieldClass} value={form.components[c.key].health} onChange={e=>updateComponent(c.key,"health",e.target.value)}><option value="">Not assessed</option><option value="20">20% — Critical / poor</option><option value="40">40% — Needs attention</option><option value="50">50% — Fair / workable</option><option value="60">60% — Good enough, monitor</option><option value="80">80% — Very good</option><option value="95">95% — Excellent</option></select></Field><Field label="Action"><select className={fieldClass} value={form.components[c.key].action} onChange={e=>updateComponent(c.key,"action",e.target.value)}>{[["inspected","Inspected"],["serviced","Serviced"],["repaired","Repaired"],["replaced","Replaced"],["not_touched","Not touched"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field><Field label="Component cost (₹)"><input className={fieldClass} type="number" min="0" value={form.components[c.key].cost} onChange={e=>updateComponent(c.key,"cost",e.target.value)} placeholder="0"/></Field><Field label="Notes / symptoms"><input className={fieldClass} value={form.components[c.key].notes} onChange={e=>updateComponent(c.key,"notes",e.target.value)} placeholder="Inspection notes"/></Field></div></div>)}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><SectionTitle title="Driving & condition factors" subtitle="These factors adjust the rule-based score; choose the closest observed condition."/><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{FACTORS.map(f=><Field key={f.key} label={f.label}><select className={fieldClass} value={form.factors[f.key]} onChange={e=>updateFactor(f.key,e.target.value)}>{f.options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field>)}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><div className="flex flex-wrap items-center justify-between gap-3"><SectionTitle title="Parts repaired or replaced" subtitle="Record individual part cost for complete vehicle history."/><button type="button" onClick={addPart} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">+ Add part</button></div>{form.parts.length===0 && <p className="mt-4 text-sm text-slate-500">No individual parts added yet.</p>}<div className="mt-3 space-y-3">{form.parts.map((p,i)=><div key={i} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]"><Field label="Part name"><input className={fieldClass} value={p.name} onChange={e=>updatePart(i,"name",e.target.value)} placeholder="e.g. front brake pads"/></Field><Field label="Action"><select className={fieldClass} value={p.action} onChange={e=>updatePart(i,"action",e.target.value)}><option value="replaced">Replaced</option><option value="repaired">Repaired</option></select></Field><Field label="Cost (₹)"><input className={fieldClass} type="number" min="0" value={p.cost} onChange={e=>updatePart(i,"cost",e.target.value)}/></Field><button type="button" onClick={()=>setForm(f=>({...f,parts:f.parts.filter((_,n)=>n!==i)}))} className="self-end rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600">Remove</button></div>)}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"><Field label="Mechanic remarks"><textarea className={fieldClass} rows={3} value={form.remarks} onChange={e=>update("remarks",e.target.value)} placeholder="Work performed, findings, customer concerns…"/></Field><div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" onClick={()=>{setForm(blankForm());setError("")}} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm">Reset form</button><button disabled={saving} type="submit" className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">{saving&&<LoaderCircle size={16} className="animate-spin"/>}{saving?"Saving & calculating…":"Save & calculate vehicle health"}</button></div></section>
    </form>}</div>;
}
function Field({label,children}) { return <label className="block text-sm font-medium text-slate-700">{label}<div className="mt-1.5">{children}</div></label>; }
function SectionTitle({title,subtitle}) { return <div><h2 className="text-base font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>; }
function Metric({label,value}) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>; }
