import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { customers } from "../../data/customerData";
import { vehicles } from "../../data/vehiclesData";
import { serviceTypeOptions, mechanicOptions } from "../../data/serviceRecordsData";
import { CheckCircle2 } from "lucide-react";

const CHECK_ITEMS = [
  { key: "oilChange", label: "Oil Change" },
  { key: "brakeService", label: "Brake Service" },
  { key: "batteryReplacement", label: "Battery" },
  { key: "tyreReplacement", label: "Tyres" },
  { key: "airFilter", label: "Air Filter" },
  { key: "coolant", label: "Coolant" },
  { key: "acService", label: "AC" },
  { key: "suspensionWork", label: "Suspension" },
  { key: "engineWork", label: "Engine Work" },
];

const initialState = {
  customerId: "",
  vehicleId: "",
  odometer: "",
  serviceDate: "",
  serviceType: "",
  partsReplaced: "",
  partsRepaired: "",
  cost: "",
  mechanic: "",
  remarks: "",
  checks: {},
};

/**
 * Admin — Add Service Record form. Phase 1: frontend form + validation
 * only. Submission does not persist data; Phase 2 will wire this to a
 * real "create service record" API.
 */
export default function AddService() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const customerVehicles = vehicles.filter((v) => v.ownerId === form.customerId);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value, ...(field === "customerId" ? { vehicleId: "" } : {}) }));
  }

  function toggleCheck(key) {
    setForm((f) => ({ ...f, checks: { ...f.checks, [key]: !f.checks[key] } }));
  }

  function validate() {
    const next = {};
    if (!form.customerId) next.customerId = "Select a customer.";
    if (!form.vehicleId) next.vehicleId = "Select a vehicle.";
    if (!form.odometer) next.odometer = "Enter the current odometer reading.";
    if (!form.serviceDate) next.serviceDate = "Select a service date.";
    if (!form.serviceType) next.serviceType = "Select a service type.";
    if (!form.cost) next.cost = "Enter the service cost.";
    if (!form.mechanic) next.mechanic = "Select a mechanic.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Service record captured</h1>
        <p className="mt-2 text-sm text-slate-500">
          This Phase 1 form does not persist data yet — it will call a real API once the
          backend is built.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              setForm(initialState);
              setSubmitted(false);
            }}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Add Another
          </button>
          <button
            onClick={() => navigate("/admin/services")}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            View Service Records
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Add Service Record" description="Log a new service visit for a customer's vehicle." />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Select Customer"
            value={form.customerId}
            onChange={(v) => update("customerId", v)}
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.customerId}
          />
          <SelectField
            label="Select Vehicle"
            value={form.vehicleId}
            onChange={(v) => update("vehicleId", v)}
            options={customerVehicles.map((v) => ({ value: v.id, label: `${v.brand} ${v.model} (${v.registrationNumber})` }))}
            error={errors.vehicleId}
            disabled={!form.customerId}
            placeholder={form.customerId ? "Select vehicle" : "Select a customer first"}
          />
          <TextField label="Odometer (km)" type="number" value={form.odometer} onChange={(v) => update("odometer", v)} error={errors.odometer} />
          <TextField label="Service Date" type="date" value={form.serviceDate} onChange={(v) => update("serviceDate", v)} error={errors.serviceDate} />
          <SelectField
            label="Service Type"
            value={form.serviceType}
            onChange={(v) => update("serviceType", v)}
            options={serviceTypeOptions.map((t) => ({ value: t, label: t }))}
            error={errors.serviceType}
          />
          <SelectField
            label="Mechanic"
            value={form.mechanic}
            onChange={(v) => update("mechanic", v)}
            options={mechanicOptions.map((m) => ({ value: m, label: m }))}
            error={errors.mechanic}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Work Performed</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CHECK_ITEMS.map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={!!form.checks[item.key]}
                  onChange={() => toggleCheck(item.key)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Parts Replaced" value={form.partsReplaced} onChange={(v) => update("partsReplaced", v)} placeholder="e.g. Oil Filter, Brake Pads" />
          <TextField label="Parts Repaired" value={form.partsRepaired} onChange={(v) => update("partsRepaired", v)} placeholder="e.g. Suspension Bushing" />
        </div>

        <TextField label="Cost (₹)" type="number" value={form.cost} onChange={(v) => update("cost", v)} error={errors.cost} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Mechanic Remarks</label>
          <textarea
            value={form.remarks}
            onChange={(e) => update("remarks", e.target.value)}
            rows={3}
            placeholder="Notes about the work performed..."
            className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setForm(initialState)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Reset
          </button>
          <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            Save Service Record
          </button>
        </div>
      </form>
    </div>
  );
}

function TextField({ label, value, onChange, error, type = "text", placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, error, disabled, placeholder = "Select" }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
