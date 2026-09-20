import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { useAdminData } from "../../context/AdminDataContext";
import { serviceTypeOptions, mechanicOptions } from "../../data/serviceRecordsData";
import { cx } from "../../utils/formatters";
import { CheckCircle2, Users, UserPlus, ArrowLeft, ArrowRight, Check } from "lucide-react";

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

const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

const initialCustomerForm = { name: "", phone: "", email: "", address: "" };

const initialVehicleForm = {
  registrationNumber: "",
  brand: "",
  model: "",
  manufacturingYear: "",
  purchaseDate: "",
  fuelType: "",
  engineType: "",
  currentKm: "",
  previousOwners: "",
  accidentHistory: "",
  insuranceValidTill: "",
  pucValidTill: "",
};

const initialServiceForm = {
  customerId: "",
  vehicleId: "",
  odometer: "",
  serviceDate: "",
  serviceType: "",
  partsReplaced: "",
  partsRepaired: "",
  cost: "",
  mechanic: "",
  nextServiceDue: "",
  remarks: "",
  checks: {},
};

/**
 * Admin — Add Service Record.
 *
 * Two entry paths:
 *  - "existing": pick an existing customer + their existing vehicle, then
 *    log a service — this is the original Phase 1 flow, unchanged.
 *  - "new": register a brand-new customer and their vehicle first (a short
 *    2-step form), then log the first service for that vehicle. Saving the
 *    customer/vehicle and saving the service are still two separate steps,
 *    matching the required Customer -> Vehicle -> Service flow.
 *
 * Both paths end up calling the same addServiceRecord() from
 * AdminDataContext, and share the same "Service Details" fields below so
 * nothing about that part of the form is duplicated.
 */
export default function AddService() {
  const navigate = useNavigate();
  const { customers, vehicles, addCustomer, addVehicle, addServiceRecord, isRegistrationNumberTaken, isCustomerEmailTaken } =
    useAdminData();

  const [mode, setMode] = useState(null); // null | "existing" | "new"
  const [step, setStep] = useState(1); // only relevant for mode === "new": 1=customer, 2=vehicle, 3=service

  const [customerForm, setCustomerForm] = useState(initialCustomerForm);
  const [vehicleForm, setVehicleForm] = useState(initialVehicleForm);
  const [serviceForm, setServiceForm] = useState(initialServiceForm);

  const [customerErrors, setCustomerErrors] = useState({});
  const [vehicleErrors, setVehicleErrors] = useState({});
  const [serviceErrors, setServiceErrors] = useState({});

  const [savedCustomer, setSavedCustomer] = useState(null);
  const [savedVehicle, setSavedVehicle] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const customerVehicles = vehicles.filter((v) => v.ownerId === serviceForm.customerId);

  function resetAll() {
    setMode(null);
    setStep(1);
    setCustomerForm(initialCustomerForm);
    setVehicleForm(initialVehicleForm);
    setServiceForm(initialServiceForm);
    setCustomerErrors({});
    setVehicleErrors({});
    setServiceErrors({});
    setSavedCustomer(null);
    setSavedVehicle(null);
    setSubmitted(false);
  }

  function updateService(field, value) {
    setServiceForm((f) => ({ ...f, [field]: value, ...(field === "customerId" ? { vehicleId: "" } : {}) }));
  }

  function toggleCheck(key) {
    setServiceForm((f) => ({ ...f, checks: { ...f.checks, [key]: !f.checks[key] } }));
  }

  // ---- Existing-customer path ----------------------------------------

  function validateService({ requireSelectors }) {
    const next = {};
    if (requireSelectors) {
      if (!serviceForm.customerId) next.customerId = "Select a customer.";
      if (!serviceForm.vehicleId) next.vehicleId = "Select a vehicle.";
    }
    if (!serviceForm.odometer) next.odometer = "Enter the current odometer reading.";
    if (!serviceForm.serviceDate) next.serviceDate = "Select a service date.";
    if (!serviceForm.serviceType) next.serviceType = "Select a service type.";
    if (!serviceForm.cost) next.cost = "Enter the service cost.";
    if (!serviceForm.mechanic) next.mechanic = "Select a mechanic.";
    setServiceErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleExistingSubmit(e) {
    e.preventDefault();
    if (!validateService({ requireSelectors: true })) return;
    const customer = customers.find((c) => c.id === serviceForm.customerId);
    addServiceRecord({ ...serviceForm, customerName: customer?.name || "" });
    setSubmitted(true);
  }

  // ---- New-customer path ----------------------------------------------

  function validateCustomer() {
    const next = {};
    const name = customerForm.name.trim();
    const phone = customerForm.phone.trim();
    const email = customerForm.email.trim();
    if (!name) next.name = "Enter the customer's name.";
    if (!phone) next.phone = "Enter a phone number.";
    if (!email) {
      next.email = "Enter an email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address.";
    } else if (isCustomerEmailTaken(email)) {
      next.email = "A customer with this email already exists.";
    }
    setCustomerErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleCustomerNext(e) {
    e.preventDefault();
    if (!validateCustomer()) return;
    setStep(2);
  }

  function validateVehicle() {
    const next = {};
    const reg = vehicleForm.registrationNumber.trim();
    if (!reg) {
      next.registrationNumber = "Enter the registration number.";
    } else if (isRegistrationNumberTaken(reg)) {
      next.registrationNumber = "A vehicle with this registration number already exists.";
    }
    if (!vehicleForm.brand.trim()) next.brand = "Enter the brand.";
    if (!vehicleForm.model.trim()) next.model = "Enter the model.";
    if (!vehicleForm.manufacturingYear) next.manufacturingYear = "Enter the manufacturing year.";
    if (!vehicleForm.currentKm) next.currentKm = "Enter the current odometer reading.";
    setVehicleErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleVehicleBack(e) {
    e.preventDefault();
    setStep(1);
  }

  function handleSaveCustomerAndVehicle(e) {
    e.preventDefault();
    if (!validateVehicle()) return;
    const customer = addCustomer(customerForm);
    const vehicle = addVehicle({ ...vehicleForm, ownerId: customer.id, ownerName: customer.name });
    setSavedCustomer(customer);
    setSavedVehicle(vehicle);
    setServiceForm((f) => ({ ...f, odometer: vehicleForm.currentKm }));
    setStep(3);
  }

  function handleNewServiceSubmit(e) {
    e.preventDefault();
    if (!validateService({ requireSelectors: false })) return;
    addServiceRecord({ ...serviceForm, vehicleId: savedVehicle.id, customerId: savedCustomer.id, customerName: savedCustomer.name });
    setSubmitted(true);
  }

  // ---- Success screen ---------------------------------------------------

  if (submitted) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-lg font-bold text-slate-900">
          {mode === "new" ? "Customer, vehicle & service saved" : "Service record saved"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "new"
            ? "The new customer and vehicle are now in the system, and the service has been logged against them."
            : "The service record has been logged against this vehicle."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={resetAll}
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

      {!mode && <ModeSelector onSelect={setMode} />}

      {mode === "existing" && (
        <form onSubmit={handleExistingSubmit} className="max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <BackToModeSelect onClick={resetAll} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Select Customer"
              value={serviceForm.customerId}
              onChange={(v) => updateService("customerId", v)}
              options={customers.map((c) => ({ value: c.id, label: c.name }))}
              error={serviceErrors.customerId}
            />
            <SelectField
              label="Select Vehicle"
              value={serviceForm.vehicleId}
              onChange={(v) => updateService("vehicleId", v)}
              options={customerVehicles.map((v) => ({ value: v.id, label: `${v.brand} ${v.model} (${v.registrationNumber})` }))}
              error={serviceErrors.vehicleId}
              disabled={!serviceForm.customerId}
              placeholder={serviceForm.customerId ? "Select vehicle" : "Select a customer first"}
            />
          </div>

          <ServiceDetailsFields form={serviceForm} update={updateService} toggleCheck={toggleCheck} errors={serviceErrors} />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setServiceForm(initialServiceForm)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Reset
            </button>
            <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Save Service Record
            </button>
          </div>
        </form>
      )}

      {mode === "new" && (
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <BackToModeSelect onClick={resetAll} />
            <Stepper step={step} />
          </div>

          {step === 1 && (
            <form onSubmit={handleCustomerNext} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="text-sm font-semibold text-slate-800">Step 1 — Customer Details</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Customer Name"
                  value={customerForm.name}
                  onChange={(v) => setCustomerForm((f) => ({ ...f, name: v }))}
                  error={customerErrors.name}
                />
                <TextField
                  label="Phone Number"
                  value={customerForm.phone}
                  onChange={(v) => setCustomerForm((f) => ({ ...f, phone: v }))}
                  error={customerErrors.phone}
                  placeholder="+91 98765 43210"
                />
                <TextField
                  label="Email"
                  type="email"
                  value={customerForm.email}
                  onChange={(v) => setCustomerForm((f) => ({ ...f, email: v }))}
                  error={customerErrors.email}
                  placeholder="name@example.com"
                />
                <TextField
                  label="Address"
                  value={customerForm.address}
                  onChange={(v) => setCustomerForm((f) => ({ ...f, address: v }))}
                  placeholder="Optional"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  Next: Vehicle Details
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSaveCustomerAndVehicle} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="text-sm font-semibold text-slate-800">Step 2 — Vehicle Details</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Registration Number"
                  value={vehicleForm.registrationNumber}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, registrationNumber: v }))}
                  error={vehicleErrors.registrationNumber}
                  placeholder="e.g. MH12 AB 4521"
                />
                <TextField
                  label="Brand"
                  value={vehicleForm.brand}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, brand: v }))}
                  error={vehicleErrors.brand}
                />
                <TextField
                  label="Model"
                  value={vehicleForm.model}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, model: v }))}
                  error={vehicleErrors.model}
                />
                <TextField
                  label="Manufacturing Year"
                  type="number"
                  value={vehicleForm.manufacturingYear}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, manufacturingYear: v }))}
                  error={vehicleErrors.manufacturingYear}
                />
                <TextField
                  label="Purchase Date"
                  type="date"
                  value={vehicleForm.purchaseDate}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, purchaseDate: v }))}
                />
                <SelectField
                  label="Fuel Type"
                  value={vehicleForm.fuelType}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, fuelType: v }))}
                  options={FUEL_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))}
                />
                <TextField
                  label="Engine Type"
                  value={vehicleForm.engineType}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, engineType: v }))}
                  placeholder="e.g. 1.5L i-VTEC, 4-Cylinder"
                />
                <TextField
                  label="Current Kilometers"
                  type="number"
                  value={vehicleForm.currentKm}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, currentKm: v }))}
                  error={vehicleErrors.currentKm}
                />
                <TextField
                  label="Previous Owners"
                  type="number"
                  value={vehicleForm.previousOwners}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, previousOwners: v }))}
                  placeholder="0"
                />
                <TextField
                  label="Insurance Expiry Date"
                  type="date"
                  value={vehicleForm.insuranceValidTill}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, insuranceValidTill: v }))}
                />
                <TextField
                  label="PUC Expiry Date"
                  type="date"
                  value={vehicleForm.pucValidTill}
                  onChange={(v) => setVehicleForm((f) => ({ ...f, pucValidTill: v }))}
                />
              </div>
              <TextField
                label="Accident History"
                value={vehicleForm.accidentHistory}
                onChange={(v) => setVehicleForm((f) => ({ ...f, accidentHistory: v }))}
                placeholder="e.g. None, or details of any past accidents"
              />
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleVehicleBack}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
                <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  Save Customer &amp; Vehicle
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}

          {step === 3 && savedCustomer && savedVehicle && (
            <form onSubmit={handleNewServiceSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="text-sm font-semibold text-slate-800">Step 3 — Service Details</h2>
              <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
                <p className="font-medium">{savedCustomer.name}</p>
                <p className="text-brand-700">
                  {savedVehicle.brand} {savedVehicle.model} &middot; {savedVehicle.registrationNumber}
                </p>
              </div>

              <ServiceDetailsFields form={serviceForm} update={updateService} toggleCheck={toggleCheck} errors={serviceErrors} />

              <div className="flex justify-end gap-3">
                <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  Save Service Record
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Shared sub-components ------------------------------------------------

function ModeSelector({ onSelect }) {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
      <button
        onClick={() => onSelect("existing")}
        className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-card transition hover:border-brand-300 hover:shadow-card-hover"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Users size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Existing Customer</p>
          <p className="mt-1 text-xs text-slate-500">Select a customer and one of their existing vehicles.</p>
        </div>
      </button>

      <button
        onClick={() => onSelect("new")}
        className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-card transition hover:border-brand-300 hover:shadow-card-hover"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <UserPlus size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">+ New Customer &amp; Vehicle</p>
          <p className="mt-1 text-xs text-slate-500">Register a new customer and their vehicle, then log the service.</p>
        </div>
      </button>
    </div>
  );
}

function BackToModeSelect({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600"
    >
      <ArrowLeft size={13} />
      Change customer type
    </button>
  );
}

function Stepper({ step }) {
  const steps = ["Customer", "Vehicle", "Service"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cx(
                "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                done ? "bg-emerald-500 text-white" : active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400"
              )}
            >
              {done ? <Check size={13} /> : n}
            </div>
            <span className={cx("text-xs font-medium", active ? "text-slate-800" : "text-slate-400")}>{label}</span>
            {n < steps.length && <div className="h-px w-6 bg-slate-200" />}
          </div>
        );
      })}
    </div>
  );
}

function ServiceDetailsFields({ form, update, toggleCheck, errors }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <TextField
          label="Next Service Due Date"
          type="date"
          value={form.nextServiceDue}
          onChange={(v) => update("nextServiceDue", v)}
          placeholder="Optional"
        />
        <TextField label="Cost (₹)" type="number" value={form.cost} onChange={(v) => update("cost", v)} error={errors.cost} />
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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Service Description / Remarks</label>
        <textarea
          value={form.remarks}
          onChange={(e) => update("remarks", e.target.value)}
          rows={3}
          placeholder="Notes about the work performed..."
          className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </>
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