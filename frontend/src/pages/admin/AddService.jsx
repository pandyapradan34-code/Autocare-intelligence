import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import useApi from "../../hooks/useApi";
import useAdminData from "../../hooks/useAdminData";
import { serviceTypes } from "../../data/adminData";

const input =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const empty = {
  vehicleId: "",
  type: serviceTypes[0] || "General Service",
  date: new Date().toISOString().slice(0, 10),
  cost: "",
  odometer: "",
  remarks: "",
};

export default function AddService() {
  const api = useApi();
  const { vehicles = [], reload } = useAdminData() || {};
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api.post("/admin/services", {
        vehicleId: form.vehicleId,
        serviceType: form.type,
        date: form.date,
        cost: Number(form.cost),
        odometer: Number(form.odometer) || undefined,
        remarks: form.remarks,
      });
      setForm(empty);
      setMsg({ ok: true, text: "Service record logged successfully! It now appears in fleet records." });
      if (reload) reload();
    } catch (err) {
      setMsg({
        ok: false,
        text: err.response?.data?.message || "Could not save the service. Check the backend.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Add Service" description="Record a new maintenance or repair service for any fleet vehicle." />
      <form onSubmit={submit} className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        {msg && (
          <p className={`rounded-xl px-4 py-2.5 text-sm font-medium ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {msg.text}
          </p>
        )}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Vehicle *</label>
          <select required value={form.vehicleId} onChange={set("vehicleId")} className={input}>
            <option value="">Select vehicle</option>
            {safeVehicles.map((v) => (
              <option key={v.id || v._id} value={v.id || v._id}>
                {v.number || "Vehicle"} - {v.brand || ""} {v.model || ""} ({v.owner || "Customer"})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Service Type *</label>
          <select value={form.type} onChange={set("type")} className={input}>
            {serviceTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Service Date *</label>
            <input required type="date" value={form.date} onChange={set("date")} className={input} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Odometer (KM)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 25000"
              value={form.odometer}
              onChange={set("odometer")}
              className={input}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Cost (INR) *</label>
          <input required type="number" min="0" value={form.cost} onChange={set("cost")} placeholder="Cost (INR)" className={input} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Remarks</label>
          <textarea
            rows={2}
            value={form.remarks}
            onChange={set("remarks")}
            placeholder="Work performed, replaced components..."
            className={input}
          />
        </div>

        <button
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {saving ? "Saving..." : "Save Service"}
        </button>
      </form>
    </div>
  );
}