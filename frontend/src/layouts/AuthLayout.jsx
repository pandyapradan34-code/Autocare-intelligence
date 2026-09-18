import { Outlet, Link } from "react-router-dom";
import { ShieldCheck, LineChart, Wrench } from "lucide-react";
import Logo from "../components/common/Logo";

/**
 * Shared shell for Login / Register / Forgot Password pages —
 * branding panel on the left, form content (via <Outlet />) on the right.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-10 text-white lg:flex">
        <Link to="/" className="inline-flex w-fit items-center">
          <Logo theme="dark" glow animated className="h-24 w-auto" />
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Vehicle Health Intelligence &amp; Predictive Maintenance
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-brand-100">
            Understand your vehicle beyond service records — track component
            health, spot early warning patterns, and plan maintenance before
            small issues become expensive repairs.
          </p>

          <div className="mt-8 space-y-4">
            <Feature icon={LineChart} text="Real-time vehicle health scoring across 10+ components" />
            <Feature icon={Wrench} text="Complete service history with smart recommendations" />
            <Feature icon={ShieldCheck} text="Early warning detection for recurring issues" />
          </div>
        </div>

        <p className="text-xs text-brand-200">
          © 2026 AutoCare Intelligence — MCA Academic Project (Phase 1 Frontend)
        </p>

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-white/5" />
      </div>

      <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Logo theme="light" animated className="h-24 w-auto" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <Icon size={16} />
      </div>
      <p className="text-sm text-brand-100">{text}</p>
    </div>
  );
}
