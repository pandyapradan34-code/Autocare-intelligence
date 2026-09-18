// Dummy recommendation data. Phase 3 will replace this with a real
// recommendation engine driven by component health and service patterns.

export const recommendations = [
  {
    id: "rec-1",
    severity: "attention",
    title: "Suspension Health: 54%",
    message: "Suspension inspection recommended within the next 1,000 km.",
    componentId: "suspension",
  },
  {
    id: "rec-2",
    severity: "moderate",
    title: "Brake Health: 67%",
    message: "Brake-pad inspection recommended at next service visit.",
    componentId: "brakes",
  },
  {
    id: "rec-3",
    severity: "moderate",
    title: "Tyre Health: 63%",
    message: "Wheel alignment and rotation recommended, uneven wear detected.",
    componentId: "tyres",
  },
  {
    id: "rec-4",
    severity: "good",
    title: "Engine Health: 91%",
    message: "No immediate action required. Continue regular oil change schedule.",
    componentId: "engine",
  },
  {
    id: "rec-5",
    severity: "good",
    title: "Battery Health: 84%",
    message: "Battery performing well. Next check recommended in 6 months.",
    componentId: "battery",
  },
];

// Next-service specific component countdowns
export const nextServiceItems = [
  { id: "ns-1", label: "Engine Oil", remainingKm: 2000, totalKm: 5000, status: "moderate" },
  { id: "ns-2", label: "Brake Inspection", remainingKm: 1500, totalKm: 10000, status: "attention" },
  { id: "ns-3", label: "Tyre Rotation", remainingKm: 3000, totalKm: 10000, status: "good" },
  { id: "ns-4", label: "Air Filter", remainingKm: 4200, totalKm: 15000, status: "good" },
  { id: "ns-5", label: "Coolant Top-up", remainingKm: 6000, totalKm: 20000, status: "good" },
];

export const nextService = {
  dueKm: 4500,
  dueMonths: 3,
};
