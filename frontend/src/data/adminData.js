export const healthTone = (health) => {
  if (health <= 40) return "red";
  if (health <= 70) return "amber";
  return "emerald";
};

export const toneBar = {
  red: "bg-red-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
};

export const toneText = {
  red: "text-red-600",
  amber: "text-amber-600",
  emerald: "text-emerald-600",
};

export const serviceTypes = [
  "General Service",
  "Oil Change",
  "Brake Repair",
  "Engine Repair",
  "Tyre Replacement",
  "Battery Replacement",
  "AC Service",
];
