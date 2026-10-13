import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useVehicle } from "../../context/VehicleContext";
import useApi from "../../hooks/useApi";
import PageHeader from "../../components/common/PageHeader";
import { Mail, Phone, User, Car, Edit2, Check, X, Loader2 } from "lucide-react";

export default function CustomerProfile() {
  const { user } = useAuth();
  const { selectedVehicle } = useVehicle();
  const api = useApi();

  const [profile, setProfile] = useState({
    name: user?.fullName || user?.name || "AutoCare User",
    email: user?.primaryEmailAddress?.emailAddress || user?.email || "",
    phone: "",
    role: "customer",
  });
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        if (res.data) {
          setProfile({
            name: res.data.name || user?.fullName || "AutoCare User",
            email: res.data.email || user?.primaryEmailAddress?.emailAddress || "",
            phone: res.data.phone || "",
            role: res.data.role || "customer",
          });
          setNameInput(res.data.name || user?.fullName || "");
          setPhoneInput(res.data.phone || "");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchProfile();
  }, [api, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await api.put("/profile", {
        name: nameInput,
        phone: phoneInput,
      });

      setProfile((prev) => ({
        ...prev,
        name: res.data.name || nameInput,
        phone: res.data.phone || phoneInput,
      }));
      setEditing(false);
      setMsg({ ok: true, text: "Profile updated successfully!" });
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const initials = (profile.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" description="Your customer account details and vehicle linkage." />

      <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        {msg && (
          <div
            className={`mb-4 rounded-xl p-3 text-xs font-semibold ${
              msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-slate-900 shadow-sm">
              {initials}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{profile.name}</p>
              <p className="text-xs uppercase tracking-wider font-semibold text-brand-600">
                {profile.role} Portal
              </p>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setNameInput(profile.name);
                setPhoneInput(profile.phone);
                setEditing(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Edit2 size={13} />
              Edit
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Phone</label>
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <ProfileRow icon={User} label="Full Name" value={profile.name} />
            <ProfileRow icon={Mail} label="Email" value={profile.email} />
            <ProfileRow icon={Phone} label="Phone" value={profile.phone || "Not set"} />
            <ProfileRow
              icon={Car}
              label="Active Vehicle"
              value={
                selectedVehicle
                  ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.registrationNumber || selectedVehicle.vehicleNumber})`
                  : "None"
              }
            />
          </div>
        )}
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
