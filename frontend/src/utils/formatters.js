// Small formatting helpers used across the app.

export function formatCurrency(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "₹0";
  return `₹${num.toLocaleString("en-IN")}`;
}

export function formatKm(km) {
  const num = Number(km);
  if (!Number.isFinite(num)) return "0 km";
  return `${num.toLocaleString("en-IN")} km`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
