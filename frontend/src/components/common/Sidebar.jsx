import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import Logo from "./Logo";
import { cx } from "../../utils/formatters";

/**
 * Shared sidebar navigation shell — enhanced with polished hover/active states,
 * subtle left-border active indicator, and smooth icon transitions.
 */
export default function Sidebar({ items, brandLabel, open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-250 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <Logo theme="light" showTagline={false} className="h-14 w-auto" />
            <p className="text-[11px] font-medium leading-tight text-slate-400">{brandLabel}</p>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-none px-3 py-5">
          <ul className="space-y-0.5">
            {items.map((item, i) => (
              <li key={item.to} style={{ animationDelay: `${i * 30}ms` }}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cx(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-brand-50 text-brand-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cx(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
                          isActive
                            ? "bg-brand-100 text-brand-600"
                            : "text-slate-400 group-hover:text-slate-600"
                        )}
                      >
                        <item.icon size={16} strokeWidth={2} />
                      </span>
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-100 p-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Vehicle Health Intelligence System
            <br />
            Phase 1 — Frontend Prototype
          </p>
        </div>
      </aside>
    </>
  );
}
