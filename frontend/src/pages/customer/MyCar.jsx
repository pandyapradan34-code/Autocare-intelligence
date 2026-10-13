import { useState } from "react";
import {
  Car,
  Fuel,
  Calendar,
  Hash,
  ShieldCheck,
  Plus,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { useVehicle } from "../../context/VehicleContext";
import useApi from "../../hooks/useApi";
import { formatDate, formatKm } from "../../utils/formatters";

const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

export default function MyCar() {
  const api = useApi();
  const { vehicles, selectedVehicle, reloadVehicles, loading } = useVehicle();

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    variant: "",
    year: new Date().getFullYear(),
    registrationNumber: "",
    fuelType: "Petrol",
    currentMileage: "",
    color: "Silver",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setFormData({
      brand: "",
      model: "",
      variant: "",
      year: new Date().getFullYear(),
      registrationNumber: "",
      fuelType: "Petrol",
      currentMileage: "",
      color: "Silver",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await api.post("/vehicles", {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        variant: formData.variant.trim(),
        year: Number(formData.year),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        vehicleNumber: formData.registrationNumber.trim().toUpperCase(),
        fuelType: formData.fuelType,
        currentMileage: Number(formData.currentMileage) || 0,
        color: formData.color.trim() || "Silver",
      });

      setSuccessMsg("Car added successfully!");
      await reloadVehicles();
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg("");
      }, 700);
    } catch (err) {
      console.error("Failed to add vehicle:", err);
      setErrorMsg(err.response?.data?.message || "Failed to add vehicle. Please check inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !vehicles.length) {
    return (
      <div className="flex min-h-87.5 items-center justify-center">
        <p className="text-sm text-slate-500">Loading vehicles...</p>
      </div>
    );
  }

  // 0 cars empty state
  if (!vehicles.length) {
    return (
      <div>
        <PageHeader title="My Car" description="Complete profile of your registered vehicle." />
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Car size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No vehicles registered yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Add your car to automatically calculate vehicle health scores, predict upcoming services, and track maintenance costs.
          </p>
          <button
            onClick={handleOpenModal}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus size={18} />
            Add your first car
          </button>
        </div>

        {/* Modal */}
        {renderModal()}
      </div>
    );
  }

  const v = selectedVehicle || vehicles[0];

  const details = [
    { label: "Brand", value: v.brand, icon: Car },
    { label: "Model", value: `${v.model}${v.variant ? ` (${v.variant})` : ""}`, icon: Car },
    { label: "Manufacturing Year", value: v.year, icon: Calendar },
    { label: "Fuel Type", value: v.fuelType || "Petrol", icon: Fuel },
    { label: "Current Kilometers", value: formatKm(v.currentMileage || v.currentKm || 0), icon: Hash },
    { label: "Engine Specification", value: v.engineType || "1.5L Turbo Charged", icon: Hash },
    { label: "Health Score", value: `${v.healthScore || 85}/100`, icon: ShieldCheck },
    { label: "Next Scheduled Service", value: v.nextServiceDate ? formatDate(v.nextServiceDate) : "In 4 months", icon: Calendar },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Car</h1>
          <p className="text-sm text-slate-500">Complete profile of your registered vehicle.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={18} />
          Add Car
        </button>
      </div>

      {/* Car Summary Card */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Car size={28} />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">
              {v.brand} {v.model} {v.variant ? `• ${v.variant}` : ""}
            </p>
            <p className="text-sm text-slate-400">
              {v.color || "Silver"} • Reg. No. {v.registrationNumber || v.vehicleNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Health: {v.healthScore || 85}%
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {formatKm(v.currentMileage || v.currentKm || 0)}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {details.map((d) => (
          <div key={d.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <d.icon size={15} />
              <span className="text-xs font-medium uppercase tracking-wide">{d.label}</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{d.value}</p>
          </div>
        ))}
      </div>

      {/* Accident history */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-700">Accident History & Condition</p>
          <p className="mt-0.5 text-sm text-amber-700/80">
            {typeof v.accidentHistory === "string"
              ? v.accidentHistory
              : v.accidentHistory
              ? "Minor reported repairs"
              : "Clean record — no accidental damage recorded."}
          </p>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );

  function renderModal() {
    if (!modalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Car size={20} className="text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">Add New Vehicle</h2>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                <CheckCircle2 size={16} />
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Brand *</label>
                <input
                  required
                  type="text"
                  name="brand"
                  placeholder="e.g. Hyundai, Toyota, Honda"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Model *</label>
                <input
                  required
                  type="text"
                  name="model"
                  placeholder="e.g. Creta, City, Fortuner"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Variant</label>
                <input
                  type="text"
                  name="variant"
                  placeholder="e.g. SX(O), ZX, Titanium"
                  value={formData.variant}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Manufacturing Year *</label>
                <input
                  required
                  type="number"
                  name="year"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Registration Number *</label>
                <input
                  required
                  type="text"
                  name="registrationNumber"
                  placeholder="e.g. MH 02 CZ 4567"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full uppercase rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Fuel Type *</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Current Odometer (KM) *</label>
                <input
                  required
                  type="number"
                  name="currentMileage"
                  min="0"
                  placeholder="e.g. 24500"
                  value={formData.currentMileage}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Color</label>
                <input
                  type="text"
                  name="color"
                  placeholder="e.g. White, Black, Silver"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
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
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Registering Car..." : "Save Vehicle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
