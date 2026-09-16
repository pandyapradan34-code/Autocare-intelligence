import { NavLink } from "react-router-dom";
import { Gauge, X } from "lucide-react";
import { cx } from "../../utils/formatters";

/**
 * Shared sidebar navigation shell used by both CustomerLayout and AdminLayout.
 * Receives its nav items as props so the same component drives two very
 * different navigation sets.
 */
export default function Sidebar({ items, brandLabel, open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Gauge size={18} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">AutoCare</p>
              <p className="text-[11px] font-medium text-slate-400">{brandLabel}</p>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cx(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                >
                  <item.icon size={18} strokeWidth={2} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <p className="text-[11px] text-slate-400">
            Vehicle Health Intelligence System
            <br />
            Phase 1 — Frontend Prototype
          </p>
        </div>
      </aside>
    </>
  );
}
