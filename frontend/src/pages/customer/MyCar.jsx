import { Car, Fuel, Calendar, Hash, ShieldCheck, FileCheck2, Users, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { currentVehicle } from "../../data/vehicleData";
import { formatDate, formatKm } from "../../utils/formatters";
import { staggerDelay } from "../../utils/motion";

export default function MyCar() {
  const v = currentVehicle;

  const details = [
    { label: "Brand", value: v.brand, icon: Car },
    { label: "Model", value: `${v.model}${v.variant ? ` (${v.variant})` : ""}`, icon: Car },
    { label: "Manufacturing Year", value: v.manufacturingYear, icon: Calendar },
    { label: "Purchase Date", value: formatDate(v.purchaseDate), icon: Calendar },
    { label: "Fuel Type", value: v.fuelType, icon: Fuel },
    { label: "Engine Type", value: v.engineType, icon: Hash },
    { label: "Current Kilometers", value: formatKm(v.currentKm), icon: Hash },
    { label: "Previous Owners", value: v.previousOwners, icon: Users },
    { label: "Insurance Valid Till", value: formatDate(v.insuranceValidTill), icon: ShieldCheck },
    { label: "PUC Valid Till", value: formatDate(v.pucValidTill), icon: FileCheck2 },
  ];

  return (
    <div>
      <PageHeader title="My Car" description="Complete profile of your registered vehicle." />

      <div className="mb-6 animate-fade-in-up delay-100">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Car size={28} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">
                {v.brand} {v.model}
              </p>
              <p className="text-sm text-slate-400">
                {v.color} • Reg. No. {v.registrationNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {details.map((d, i) => (
          <div
            key={d.label}
            className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-4 shadow-card card-hover-lift"
            style={staggerDelay(i, 40)}
          >
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <d.icon size={15} />
              <span className="text-xs font-medium uppercase tracking-wide">{d.label}</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{d.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 animate-fade-in-up delay-500">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Accident History</p>
            <p className="mt-0.5 text-sm text-amber-700/80">{v.accidentHistory}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
