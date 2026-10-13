import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/common/PageHeader";
import { ShieldCheck, Mail, User, Shield } from "lucide-react";

export default function AdminProfile() {
  const { user } = useAuth();

  const name = user?.fullName || user?.name || "AutoCare Administrator";
  const email = user?.primaryEmailAddress?.emailAddress || user?.email || "admin@autocare.local";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <PageHeader title="Admin Profile" description="Your administrator account and fleet permissions." />

      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white shadow-sm">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{name}</p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ShieldCheck size={14} /> 
              <span>Verified Super Administrator</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User size={15} />
              Full Name
            </div>
            <p className="text-sm font-medium text-slate-800">{name}</p>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mail size={15} />
              Email
            </div>
            <p className="text-sm font-medium text-slate-800">{email}</p>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Shield size={15} />
              Role Access
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-0.5 text-xs font-semibold text-white">
              admin
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Administrative Privileges
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Full fleet vehicle and diagnostic health visibility
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Service record logging and workshop maintenance authority
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Customer database and multi-vehicle account administration
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}