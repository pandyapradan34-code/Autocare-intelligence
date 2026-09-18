import { Link } from "react-router-dom";
import { Activity, Wrench, LineChart, ShieldCheck, ArrowRight } from "lucide-react";
import Logo from "../components/common/Logo";

/**
 * Simple public landing page introducing the product before login.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo theme="light" className="h-16 w-auto" />
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          MCA Academic Project — Phase 1 Frontend
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Vehicle Health Intelligence &amp; Predictive Maintenance
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
          Go beyond storing service records. AutoCare Intelligence analyzes service
          history, mileage, component condition, and repair patterns to give you a
          real picture of your vehicle's health — and what to do next.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Create free account
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard icon={Activity} title="Health Scoring" text="A single, explainable health score built from real usage signals." />
        <FeatureCard icon={Wrench} title="Service Tracking" text="Every service, part, and repair organized in one clear timeline." />
        <FeatureCard icon={LineChart} title="Predictive Insights" text="Estimated remaining life and upcoming maintenance needs." />
        <FeatureCard icon={ShieldCheck} title="Early Warnings" text="Spot recurring issues before they become expensive repairs." />
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 text-left shadow-card">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={20} />
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}
