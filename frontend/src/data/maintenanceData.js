// Dummy maintenance cost analysis data.

export const maintenanceCost = {
  total: 128500,
  yearOverYearChange: 34,
  breakdown: [
    { id: "engine", label: "Engine", amount: 42000, color: "#3b82f6" },
    { id: "brakes", label: "Brakes", amount: 18000, color: "#f97316" },
    { id: "suspension", label: "Suspension", amount: 27000, color: "#dc2626" },
    { id: "tyres", label: "Tyres", amount: 21000, color: "#eab308" },
    { id: "others", label: "Others", amount: 20500, color: "#64748b" },
  ],
  insights: [
    "Maintenance cost increased 34% compared with last year.",
    "Suspension-related repairs account for 21% of total spend this year.",
    "Average cost per service visit: ₹11,275.",
  ],
};

export const maintenanceCostTrend = [
  { year: "2022", cost: 18500 },
  { year: "2023", cost: 24200 },
  { year: "2024", cost: 35900 },
  { year: "2025", cost: 40800 },
  { year: "2026", cost: 28600 },
];
