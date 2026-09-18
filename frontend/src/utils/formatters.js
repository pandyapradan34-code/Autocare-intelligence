// Small formatting helpers used across the app.

export function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function formatKm(km) {
  return `${Number(km).toLocaleString("en-IN")} km`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
