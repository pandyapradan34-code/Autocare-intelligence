// Dummy overview data for the admin dashboard.

export const adminOverview = {
  totalCustomers: 6,
  totalVehicles: 7,
  totalServices: 132,
  vehiclesRequiringAttention: 3,
};

export const recentServices = [
  { id: "svc-1008", vehicle: "Honda City VX", customer: "Rohan Mehta", date: "2026-08-12", cost: 8500 },
  { id: "svc-7001", vehicle: "Honda Amaze VX", customer: "Neha Kapoor", date: "2026-08-20", cost: 4200 },
  { id: "svc-4002", vehicle: "Maruti Suzuki Swift VXI", customer: "Vikram Singh", date: "2026-08-01", cost: 5600 },
  { id: "svc-2004", vehicle: "Hyundai Creta SX", customer: "Ananya Iyer", date: "2026-07-28", cost: 7200 },
];

export const criticalAlerts = [
  {
    id: "alert-1",
    vehicle: "Toyota Innova Crysta (KL07 GH 5567)",
    customer: "Karthik Nair",
    issue: "Health score critical at 39/100 — engine and suspension concerns.",
  },
  {
    id: "alert-2",
    vehicle: "Tata Nexon XZ+ (DL08 CQ 1123)",
    customer: "Vikram Singh",
    issue: "Repeated brake repairs detected, inspection overdue.",
  },
  {
    id: "alert-3",
    vehicle: "Kia Seltos HTX (TS09 EF 3345)",
    customer: "Fatima Sheikh",
    issue: "Health score moderate at 61/100 — service overdue by 1,200 km.",
  },
];
