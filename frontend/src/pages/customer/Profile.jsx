import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import { Mail, Phone, User, Car } from "lucide-react";
import { currentVehicle } from "../../data/vehicleData";

export default function CustomerProfile() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader title="Profile" description="Your account details." />

      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {user?.avatarInitials}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{user?.name}</p>
            <p className="text-sm capitalize text-slate-400">{user?.role} account</p>
          </div>
        </div>

        <div className="space-y-4">
          <ProfileRow icon={User} label="Full Name" value={user?.name} />
          <ProfileRow icon={Mail} label="Email" value={user?.email} />
          <ProfileRow icon={Phone} label="Phone" value={user?.phone} />
          <ProfileRow icon={Car} label="Registered Vehicle" value={`${currentVehicle.brand} ${currentVehicle.model}`} />
        </div>

        <p className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Profile editing will be enabled once real authentication and backend APIs are
          integrated in a later phase.
        </p>
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon size={15} />
        {label}
      </div>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
