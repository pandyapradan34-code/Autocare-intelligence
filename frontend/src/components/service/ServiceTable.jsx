import { formatCurrency, formatDate } from "../../utils/formatters";
import EmptyState from "../common/EmptyState";
import { FileText } from "lucide-react";

/**
 * Reusable tabular view of service records — used on the Admin
 * Service Records page. Accepts an actions renderer so callers can
 * plug in their own row actions without duplicating table markup.
 */
export default function ServiceTable({ records, renderActions }) {
  if (!records || records.length === 0) {
    return <EmptyState icon={FileText} title="No service records" description="No service records match your filters." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-medium">Vehicle</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Service Type</th>
            <th className="px-4 py-3 font-medium">Cost</th>
            <th className="px-4 py-3 font-medium">Mechanic</th>
            {renderActions && <th className="px-4 py-3 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50/60">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{r.vehicle}</p>
                <p className="text-xs text-slate-400">{r.vehicleReg}</p>
              </td>
              <td className="px-4 py-3 text-slate-600">{r.customer}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(r.date)}</td>
              <td className="px-4 py-3 text-slate-600">{r.serviceType}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(r.cost)}</td>
              <td className="px-4 py-3 text-slate-600">{r.mechanic}</td>
              {renderActions && <td className="px-4 py-3">{renderActions(r)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
