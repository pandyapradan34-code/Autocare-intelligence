import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import { Mail, Phone, User, Car } from "lucide-react";
import { currentVehicle } from "../../data/vehicleData";
import { staggerDelay } from "../../utils/motion";

export default function CustomerProfile() {
  const { user } = useAuth();

  const rows = [
    { icon: User, label: "Full Name", value: user?.name },
    { icon: Mail, label: "Email", value: user?.email },
    { icon: Phone, label: "Phone", value: user?.phone },
    { icon: Car, label: "Registered Vehicle", value: `${currentVehicle.brand} ${currentVehicle.model}` },
  ];

  return (
    <div>
      <PageHeader title="Profile" description="Your account details." />

      <div className="animate-fade-in-up max-w-xl delay-100">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
          {/* Profile header */}
          <div className="flex items-center gap-5 border-b border-slate-100 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white ring-4 ring-brand-100">
              {user?.avatarInitials}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{user?.name}</p>
              <p className="mt-0.5 text-sm font-medium capitalize text-slate-500">
                {user?.role} account
              </p>
            </div>
          </div>

          {/* Info rows */}
          <div className="divide-y divide-slate-100 px-6">
            {rows.map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                className="animate-fade-in-up flex items-center justify-between py-4 transition-colors duration-150 hover:bg-slate-50/60 -mx-6 px-6"
                style={staggerDelay(i, 60)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                    <Icon size={15} />
                  </div>
                  <span className="text-sm text-slate-500">{label}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Notice */}
          <div className="px-6 pb-6 pt-4">
            <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
              Profile editing will be enabled once real authentication and backend APIs are
              integrated in a later phase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
