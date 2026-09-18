import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * Dummy/static authentication — Phase 1 only. Credentials are checked
 * against src/data/authData.js, not a real backend.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  function validate() {
    const next = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    const result = login({ email, password, role });
    if (!result.success) {
      setError(result.message);
      return;
    }
    const redirectTo = location.state?.from || `/${role}/dashboard`;
    navigate(redirectTo, { replace: true });
  }

  function fillDemo(demoRole) {
    setRole(demoRole);
    setEmail(demoRole === "customer" ? "customer@demo.com" : "admin@demo.com");
    setPassword(demoRole === "customer" ? "customer123" : "admin123");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to access your vehicle health dashboard.</p>

      {/* Role toggle */}
      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setRole("customer")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            role === "customer" ? "bg-white text-brand-700 shadow-card" : "text-slate-500"
          }`}
        >
          <User size={15} />
          Customer
        </button>
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
            role === "admin" ? "bg-white text-brand-700 shadow-card" : "text-slate-500"
          }`}
        >
          <ShieldCheck size={15} />
          Admin
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email / Username</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Login
        </button>
      </form>

      <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
        <p className="mb-1.5 font-medium text-slate-600">Demo credentials</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => fillDemo("customer")} className="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200">
            Fill customer@demo.com
          </button>
          <button onClick={() => fillDemo("admin")} className="rounded-md bg-slate-100 px-2 py-1 hover:bg-slate-200">
            Fill admin@demo.com
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        New customer?{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}
