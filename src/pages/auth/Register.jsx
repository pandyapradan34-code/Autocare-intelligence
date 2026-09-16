import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";

/**
 * Customer registration page. Phase 1: frontend form validation only —
 * no account is actually created. Admin registration is intentionally
 * not exposed here (admins are provisioned separately).
 */
export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    else if (!/^[0-9+\-\s]{10,15}$/.test(form.phone)) next.phone = "Enter a valid phone number.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6) next.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
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
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Registration submitted</h1>
        <p className="mt-2 text-sm text-slate-500">
          This is a Phase 1 frontend demo, so no account was actually created. In a future
          phase, this form will call a real registration API.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Register to start tracking your vehicle's health.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field
          label="Full Name"
          icon={User}
          value={form.fullName}
          onChange={(v) => update("fullName", v)}
          placeholder="Rohan Mehta"
          error={errors.fullName}
        />
        <Field
          label="Email"
          icon={Mail}
          value={form.email}
          onChange={(v) => update("email", v)}
          placeholder="you@example.com"
          error={errors.email}
        />
        <Field
          label="Phone Number"
          icon={Phone}
          value={form.phone}
          onChange={(v) => update("phone", v)}
          placeholder="+91 98765 43210"
          error={errors.phone}
        />
        <Field
          label="Password"
          icon={Lock}
          type="password"
          value={form.password}
          onChange={(v) => update("password", v)}
          placeholder="••••••••"
          error={errors.password}
        />
        <Field
          label="Confirm Password"
          icon={Lock}
          type="password"
          value={form.confirmPassword}
          onChange={(v) => update("confirmPassword", v)}
          placeholder="••••••••"
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Register
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, placeholder, error, type = "text" }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
