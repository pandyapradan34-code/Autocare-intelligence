// Dummy component-wise health data.
// Phase 3 will replace these static percentages with a real component health
// calculation engine driven by service history and sensor/usage data.

export const componentHealth = [
  {
    id: "engine",
    name: "Engine",
    value: 91,
    icon: "engine",
    summary: "Running smoothly, no unusual wear detected.",
  },
  {
    id: "transmission",
    name: "Transmission",
    value: 88,
    icon: "cog",
    summary: "Shifting normally, fluid last changed 18,000 km ago.",
  },
  {
    id: "brakes",
    name: "Brakes",
    value: 67,
    icon: "disc",
    summary: "Pad wear moderate, inspection recommended soon.",
  },
  {
    id: "suspension",
    name: "Suspension",
    value: 54,
    icon: "suspension",
    summary: "Repeated suspension repairs in last 3 services.",
  },
  {
    id: "battery",
    name: "Battery",
    value: 84,
    icon: "battery",
    summary: "Good charge retention, replaced 14 months ago.",
  },
  {
    id: "tyres",
    name: "Tyres",
    value: 63,
    icon: "tyre",
    summary: "Front tyres showing uneven wear pattern.",
  },
  {
    id: "ac",
    name: "AC",
    value: 82,
    icon: "ac",
    summary: "Cooling performance normal for the season.",
  },
  {
    id: "cooling",
    name: "Cooling System",
    value: 87,
    icon: "cooling",
    summary: "Coolant topped up during last service.",
  },
  {
    id: "steering",
    name: "Steering",
    value: 89,
    icon: "steering",
    summary: "No play or noise reported in recent inspection.",
  },
  {
    id: "electrical",
    name: "Electrical System",
    value: 79,
    icon: "electrical",
    summary: "Minor dashboard flicker reported once, monitor.",
  },
];

export function getHealthStatus(value) {
  if (value >= 85) return { label: "Healthy", tone: "excellent" };
  if (value >= 70) return { label: "Good", tone: "good" };
  if (value >= 55) return { label: "Moderate", tone: "moderate" };
  if (value >= 40) return { label: "Attention Required", tone: "attention" };
  return { label: "Critical", tone: "critical" };
}
