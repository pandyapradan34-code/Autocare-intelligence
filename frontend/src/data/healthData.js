// Dummy vehicle health score + explainability + remaining useful life data.
// Phase 3/4 will replace these static values with a real scoring & ML engine.

export const overallHealth = {
  score: 78,
  status: "Good",
  lastUpdated: "12 Aug 2026",
};

export const healthFactors = [
  { id: "service-regularity", label: "Service Regularity", weight: 20, contribution: 85 },
  { id: "mileage", label: "Mileage", weight: 15, contribution: 60 },
  { id: "engine-condition", label: "Engine Condition", weight: 20, contribution: 91 },
  { id: "brake-condition", label: "Brake Condition", weight: 10, contribution: 67 },
  { id: "suspension", label: "Suspension", weight: 10, contribution: 54 },
  { id: "battery", label: "Battery", weight: 5, contribution: 84 },
  { id: "tyre-condition", label: "Tyre Condition", weight: 5, contribution: 63 },
  { id: "accident-history", label: "Accident History", weight: 10, contribution: 75 },
  { id: "age", label: "Vehicle Age", weight: 5, contribution: 70 },
];

export const healthExplanation =
  "Vehicle health is currently reduced mainly because of high mileage and repeated suspension-related repairs in recent services. Brake and tyre wear are also contributing factors. Engine and battery condition remain strong and are supporting the overall score.";

export const remainingUsefulLife = {
  yearsRange: "3–5 Years",
  kmRange: "45,000–60,000 km",
  confidence: "Moderate",
  factors: [
    { label: "Vehicle Age", detail: "6 years since manufacturing" },
    { label: "Total Mileage", detail: "82,450 km on odometer" },
    { label: "Annual Mileage", detail: "~13,700 km / year average" },
    { label: "Service Frequency", detail: "Regular, every ~5,000–6,000 km" },
    { label: "Repair Frequency", detail: "3 suspension repairs in 18 months" },
    { label: "Component Condition", detail: "Suspension and brakes below 70%" },
    { label: "Accident History", detail: "1 minor accident on record" },
    { label: "Driving / Usage Pattern", detail: "Mixed city and highway use" },
    { label: "Major Component Replacements", detail: "Battery replaced once" },
  ],
};
