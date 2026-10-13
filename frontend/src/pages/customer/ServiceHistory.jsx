import { useEffect, useState } from "react";
import { History, Plus, Calendar, Wrench, X, Loader2, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useVehicle } from "../../context/VehicleContext";
import useApi from "../../hooks/useApi";
import { formatDate, formatCurrency, formatKm } from "../../utils/formatters";

export default function ServiceHistory() {
  const api = useApi();
  const { vehicles, selectedId, loading: vehicleLoading } = useVehicle();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    serviceType: "Periodic Maintenance",
    serviceDate: new Date().toISOString().slice(0, 10),
    odometer: "",
    cost: "",
    remarks: "",
  });

  const loadServices = async () => {
    if (!selectedId && (!vehicles || vehicles.length === 0)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const query = selectedId ? `?vehicleId=${selectedId}` : "";
      const res = await api.get(`/services${query}`);
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load services:", err);
      setError(err.response?.data?.message || "Failed to load service records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [api, selectedId, vehicles]);

  const handleAddService = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      await api.post("/services", {
        vehicleId: selectedId,
        serviceType: form.serviceType,
        serviceDate: form.serviceDate,
        odometer: Number(form.odometer) || 0,
        cost: Number(form.cost) || 0,
        remarks: form.remarks,
      });

      setMsg({ ok: true, text: "Service record logged successfully!" });
      await loadServices();
      setTimeout(() => {
        setModalOpen(false);
        setMsg(null);
        setForm({
          serviceType: "Periodic Maintenance",
          serviceDate: new Date().toISOString().slice(0, 10),
          odometer: "",
          cost: "",
          remarks: "",
        });
      }, 700);
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "Failed to log service record." });
    } finally {
      setSaving(false);
    }
  };

  if (vehicleLoading || loading) {
    return (
      <div className="flex min-h-75 items-center justify-center">
        <p className="text-sm text-slate-500">Loading service history...</p>
      </div>
    );
  }

  if (!vehicles?.length) {
    return (
      <div>
        <PageHeader title="Service History" description="Past maintenance records and service timeline." />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm text-slate-500">Add a vehicle in My Car to view service history.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service History</h1>
          <p className="text-sm text-slate-500">Past maintenance records and service timeline.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={18} />
          Log Service
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="p-4">Service Date</th>
              <th className="p-4">Service Type</th>
              <th className="p-4">Odometer</th>
              <th className="p-4">Cost</th>
              <th className="p-4">Status</th>
              <th className="p-4">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {services.length > 0 ? (
              services.map((s) => (
                <tr key={s._id || s.id} className="border-t border-slate-100 transition hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-800">
                    {formatDate(s.serviceDate || s.date)}
                  </td>
                  <td className="p-4 text-slate-700">
                    <span className="font-semibold text-slate-900">{s.serviceType || s.type}</span>
                    {s.parts && s.parts.length > 0 && (
                      <p className="text-xs text-slate-400">Parts: {s.parts.join(", ")}</p>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{formatKm(s.odometer || 0)}</td>
                  <td className="p-4 font-semibold text-slate-800">{formatCurrency(s.cost || 0)}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {s.status || "Completed"}
                    </span>
                  </td>
                  <td className="max-w-xs truncate p-4 text-xs text-slate-500">
                    {s.remarks || "Regular inspection and maintenance completed."}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No service records logged yet for this vehicle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench size={20} className="text-brand-600" />
                <h2 className="text-lg font-bold text-slate-900">Log Service Record</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddService} className="mt-4 space-y-4">
              {msg && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Service Type *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Periodic Maintenance, Brake Pad Replacement"
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Date *</label>
                  <input
                    required
                    type="date"
                    value={form.serviceDate}
                    onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Odometer (KM) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 25000"
                    value={form.odometer}
                    onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Cost (INR) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="e.g. 4500"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Notes, parts changed, workshop details..."
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}