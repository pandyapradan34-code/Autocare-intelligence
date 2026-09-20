// Dummy early-warning data. This only demonstrates how future
// pattern-detection warnings will appear in the UI — no real algorithm yet.

export const earlyWarnings = [
  {
    id: "warn-1",
    severity: "attention",
    title: "Repeated brake-related issues detected",
    pattern: ["Brake Service (Feb 2026)", "Brake Service (Aug 2025)", "Brake Repair (Jan 2025)"],
    detail: "Brake work has appeared in 3 of the last 6 service visits, more frequent than typical for this model.",
  },
  {
    id: "warn-2",
    severity: "critical",
    title: "Suspension issues occurring more frequently than before",
    pattern: ["Suspension Repair (May 2026)", "Suspension Repair (Nov 2025)", "Suspension Work (Jul 2025)"],
    detail: "3 suspension-related repairs within the last 18 months, significantly above expected frequency.",
  },
  {
    id: "warn-3",
    severity: "moderate",
    title: "Battery-related replacements trending upward",
    pattern: ["Battery Replacement (Apr 2025)"],
    detail: "One early battery replacement recorded. Monitor charge performance over next few services.",
  },
];
