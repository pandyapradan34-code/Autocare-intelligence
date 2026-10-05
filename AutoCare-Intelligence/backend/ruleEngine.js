const COMPONENTS = [
  { key: 'engine', name: 'Engine', weight: 18, intervalKm: 10000, intervalDays: 365 },
  { key: 'transmission', name: 'Transmission', weight: 10, intervalKm: 40000, intervalDays: 1095 },
  { key: 'brakes', name: 'Brakes', weight: 14, intervalKm: 20000, intervalDays: 365 },
  { key: 'suspension', name: 'Suspension', weight: 10, intervalKm: 30000, intervalDays: 730 },
  { key: 'battery', name: 'Battery', weight: 8, intervalKm: 0, intervalDays: 1095 },
  { key: 'tyres', name: 'Tyres', weight: 12, intervalKm: 40000, intervalDays: 1460 },
  { key: 'ac', name: 'AC', weight: 5, intervalKm: 15000, intervalDays: 365 },
  { key: 'cooling', name: 'Cooling System', weight: 7, intervalKm: 20000, intervalDays: 365 },
  { key: 'steering', name: 'Steering', weight: 8, intervalKm: 30000, intervalDays: 730 },
  { key: 'electrical', name: 'Electrical System', weight: 8, intervalKm: 20000, intervalDays: 365 },
];
const FACTORS = ['roughDriving', 'roadType', 'overallCondition', 'vibration', 'unusualNoise', 'warningLights', 'overheating', 'accidentHistory'];
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Number(n) || 0));

function factorPenalty(factors = {}) {
  let penalty = 0;
  const add = (key, values) => { if (values[factors[key]]) penalty += values[factors[key]]; };
  add('roughDriving', { mostly: 12, sometimes: 6, rare: 2, never: 0 });
  add('roadType', { rough: 8, city: 4, mixed: 2, highway: 0 });
  add('overallCondition', { poor: 15, fair: 8, good: 2, excellent: 0 });
  add('vibration', { severe: 12, moderate: 6, slight: 2, none: 0 });
  add('unusualNoise', { yes: 7, sometimes: 3, no: 0 });
  add('warningLights', { multiple: 10, one: 6, none: 0 });
  add('overheating', { frequent: 12, once: 5, never: 0 });
  add('accidentHistory', { major: 10, minor: 4, none: 0 });
  return Math.min(25, penalty);
}

function calculateHealth(components = {}, factors = {}, vehicle = {}) {
  let totalWeight = 0;
  let weighted = 0;
  const details = COMPONENTS.map((component) => {
    const raw = components[component.key];
    const score = raw && raw.health !== '' && raw.health != null ? clamp(raw.health) : 75;
    totalWeight += component.weight;
    weighted += score * component.weight;
    return { ...component, score, condition: score < 30 ? 'critical' : score < 50 ? 'attention' : score < 70 ? 'moderate' : 'good' };
  });
  const componentScore = weighted / totalWeight;
  const penalty = factorPenalty(factors);
  const age = Math.max(0, new Date().getFullYear() - (Number(vehicle.manufacturingYear) || new Date().getFullYear()));
  const agePenalty = Math.min(10, Math.max(0, age - 5) * 1.2);
  const score = Math.round(clamp(componentScore - penalty - agePenalty));
  const status = score >= 85 ? 'Healthy' : score >= 70 ? 'Good' : score >= 50 ? 'Moderate' : score >= 30 ? 'Attention Required' : 'Critical';
  const recommendations = details.map((c) => {
    if (c.score < 30) return { component: c.name, severity: 'critical', title: `Urgent ${c.name} inspection`, message: `${c.name} condition is rated ${c.score}%. Arrange an inspection promptly; do not rely on this estimate as a safety clearance.` };
    if (c.score < 50) return { component: c.name, severity: 'attention', title: `${c.name} needs attention`, message: `${c.name} condition is rated ${c.score}%. Inspection/service is recommended soon.` };
    if (c.score < 70) return { component: c.name, severity: 'moderate', title: `Monitor ${c.name}`, message: `${c.name} condition is rated ${c.score}%. Include it in the next service inspection.` };
    return null;
  }).filter(Boolean);
  if (factors.vibration && factors.vibration !== 'none') recommendations.push({ component: null, severity: factors.vibration === 'severe' ? 'critical' : 'attention', title: 'Investigate vehicle vibration', message: 'Vibration can have multiple causes. Check tyres, wheel balance, suspension and drivetrain with a qualified mechanic.' });
  if (factors.overheating && factors.overheating !== 'never') recommendations.push({ component: 'Cooling System', severity: 'critical', title: 'Cooling system inspection', message: 'Overheating can damage the engine. Stop driving if the temperature warning is active and arrange a qualified inspection.' });
  const annualKm = Math.max(3000, Number(vehicle.annualKm) || 12000);
  const ageFactor = Math.max(0.45, 1 - age * 0.035);
  const healthFactor = Math.max(0.25, score / 100);
  const remainingKmLow = Math.round((30000 + 70000 * healthFactor) * ageFactor / 1000) * 1000;
  const remainingKmHigh = Math.round((50000 + 100000 * healthFactor) * ageFactor / 1000) * 1000;
  const remainingYearsLow = Math.max(0.5, Math.round((remainingKmLow / annualKm) * 10) / 10);
  const remainingYearsHigh = Math.max(remainingYearsLow, Math.round((remainingKmHigh / annualKm) * 10) / 10);
  return {
    score, status, componentScore: Math.round(componentScore), factorPenalty: penalty, agePenalty: Math.round(agePenalty),
    components: details, recommendations,
    remainingLife: { kmLow: remainingKmLow, kmHigh: remainingKmHigh, yearsLow: remainingYearsLow, yearsHigh: remainingYearsHigh, confidence: 'Low', note: 'Rule-based planning estimate only; not a certified mechanical-life prediction.' },
    factorsUsed: FACTORS,
  };
}

function calculateNextServices(components = {}, currentKm = 0, lastServices = []) {
  const today = new Date();
  return COMPONENTS.map((c) => {
    const latest = lastServices.filter((s) => String(s.category || '').toLowerCase().includes(c.key) || String(s.service_type || '').toLowerCase().includes(c.name.toLowerCase())).sort((a,b) => new Date(b.service_date) - new Date(a.service_date))[0];
    const intervalKm = c.intervalKm;
    const remainingKm = intervalKm ? Math.max(0, intervalKm - (Number(currentKm) - Number(latest?.odometer || 0))) : null;
    const daysElapsed = latest ? Math.floor((today - new Date(latest.service_date)) / 86400000) : null;
    const remainingDays = c.intervalDays && daysElapsed != null ? Math.max(0, c.intervalDays - daysElapsed) : null;
    const health = clamp(components[c.key]?.health ?? 75);
    let status = health < 40 || remainingKm === 0 || remainingDays === 0 ? 'attention' : health < 65 || (remainingKm != null && remainingKm < 1500) || (remainingDays != null && remainingDays < 30) ? 'moderate' : 'good';
    return { component: c.name, intervalKm: intervalKm || null, remainingKm, remainingDays, status, reason: health < 40 ? 'Component condition is low' : remainingKm === 0 || remainingDays === 0 ? 'Service interval reached' : 'Based on configured rule and available service history' };
  });
}
module.exports = { COMPONENTS, FACTORS, calculateHealth, calculateNextServices };
