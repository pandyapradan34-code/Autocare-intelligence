import { Menu, Car } from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useVehicle } from "../../context/VehicleContext";

export default function Navbar({ onMenuClick }) {
  const { user } = useUser();
  const vehicleContext = useVehicle();

  const vehicles = vehicleContext?.vehicles || [];
  const selectedId = vehicleContext?.selectedId;
  const setSelectedId = vehicleContext?.setSelectedId;

  const firstName = user?.firstName || "";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const fullName = `${firstName} ${user?.lastName || ""}`.trim() || email || "User";

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Vehicle Selector */}
        {vehicles.length > 1 && setSelectedId ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium text-slate-400 sm:inline">Active Car:</span>
            <div className="relative flex items-center">
              <Car size={15} className="pointer-events-none absolute left-2.5 text-brand-600" />
              <select
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-8 pr-7 text-xs font-semibold text-slate-800 shadow-sm outline-none transition hover:bg-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                {vehicles.map((v) => (
                  <option key={v._id || v.id} value={v._id || v.id}>
                    {v.brand} {v.model} ({v.registrationNumber || v.vehicleNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : vehicles.length === 1 ? (
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 sm:flex">
            <Car size={13} className="text-brand-600" />
            <span>
              {vehicles[0].brand} {vehicles[0].model} ({vehicles[0].registrationNumber || vehicles[0].vehicleNumber})
            </span>
          </div>
        ) : null}
      </div>

      {/* Clerk Profile */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="max-w-40 truncate text-sm font-semibold text-slate-800">
            {fullName}
          </p>
          <p className="max-w-40 truncate text-xs text-slate-400">
            {email}
          </p>
        </div>

        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
          afterSignOutUrl="/login"
        />
      </div>
    </header>
  );
}