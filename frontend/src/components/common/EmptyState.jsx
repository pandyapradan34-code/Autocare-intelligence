import { Inbox } from "lucide-react";

/**
 * Generic empty-state placeholder for lists/tables with no data.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description = "There is no data to display right now.",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}
