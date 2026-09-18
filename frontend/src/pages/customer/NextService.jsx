import PageHeader from "../../components/common/PageHeader";
import HealthProgressBar from "../../components/common/HealthProgressBar";
import StatusBadge from "../../components/common/StatusBadge";
import { CalendarClock } from "lucide-react";
import { nextService, nextServiceItems } from "../../data/recommendationData";

export default function NextService() {
  return (
    <div>
      <PageHeader title="Next Service" description="Upcoming service milestones and component-specific countdowns." />

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
          <CalendarClock size={22} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">Next Recommended Service</p>
          <p className="text-xl font-bold text-brand-900">
            {nextService.dueKm.toLocaleString("en-IN")} km / {nextService.dueMonths} months
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {nextServiceItems.map((item) => {
          const percentRemaining = Math.round((item.remainingKm / item.totalKm) * 100);
          return (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <StatusBadge tone={item.status} label={`${item.remainingKm.toLocaleString("en-IN")} km left`} />
              </div>
              <HealthProgressBar value={percentRemaining} showLabel={false} />
              <p className="mt-2 text-xs text-slate-400">
                {item.remainingKm.toLocaleString("en-IN")} km remaining of {item.totalKm.toLocaleString("en-IN")} km interval
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
