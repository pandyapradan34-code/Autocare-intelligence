import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

/**
 * Confirmation dialog for destructive or important actions.
 * Phase 1: purely UI — no real mutation happens on confirm.
 */
export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  tone = "danger",
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3">
        <div
          className={
            tone === "danger"
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600"
          }
        >
          <AlertTriangle size={18} />
        </div>
        <p className="text-sm text-slate-600">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm?.();
            onClose?.();
          }}
          className={
            tone === "danger"
              ? "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              : "rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
