// Shared health-status helpers so every component classifies scores identically.
// Kept in one place so that swapping in a real health-scoring engine later
// only requires changing this file.

export const HEALTH_TONES = {
  excellent: {
    label: "Healthy",
    text: "text-health-excellent",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    bar: "bg-health-excellent",
    dot: "bg-health-excellent",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },

  good: {
    label: "Good",
    text: "text-lime-600",
    bg: "bg-lime-50",
    border: "border-lime-200",
    bar: "bg-lime-500",
    dot: "bg-lime-500",
    badgeBg: "bg-lime-100",
    badgeText: "text-lime-700",
  },

  moderate: {
    label: "Moderate",
    text: "text-health-moderate",
    bg: "bg-amber-50",
    border: "border-amber-200",
    bar: "bg-health-moderate",
    dot: "bg-health-moderate",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },

  attention: {
    label: "Attention Required",
    text: "text-health-attention",
    bg: "bg-orange-50",
    border: "border-orange-200",
    bar: "bg-health-attention",
    dot: "bg-health-attention",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
  },

  critical: {
    label: "Critical",
    text: "text-health-critical",
    bg: "bg-red-50",
    border: "border-red-200",
    bar: "bg-health-critical",
    dot: "bg-health-critical",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
};

export function toneForScore(score) {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "moderate";
  if (score >= 40) return "attention";

  return "critical";
}

export function statusLabelForScore(score) {
  return HEALTH_TONES[toneForScore(score)].label;
}