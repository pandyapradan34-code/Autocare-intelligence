export const SERVICE_INTERVAL_KM = 5000;
export const SERVICE_INTERVAL_DAYS = 180; // 6 months

const WEIGHTS = {
  serviceRegularity: 20,
  mileage: 15,
  engine: 20,
  brakes: 10,
  suspension: 10,
  battery: 5,
  tyres: 5,
  accident: 10,
  age: 5,
};

const LABELS = {
  engine: "Engine", brakes: "Brakes", battery: "Battery", tyres: "Tyres",
  suspension: "Suspension", transmission: "Transmission", cooling: "Cooling",
};

export const classify = (score) => (score >= 80 ? "Good" : score >= 60 ? "Fair" : "Attention");

/* ---------- individual factor scores (0-100) ---------- */

const serviceRegularityScore = (vehicle, lastService) => {
  if (!lastService) return 30; // kabhi service nahi hui

  const days = (Date.now() - new Date(lastService.serviceDate)) / 86400000;
  const km = vehicle.currentMileage - lastService.odometer;

  const dayScore = days <= 180 ? 100 : days <= 270 ? 80 : days <= 365 ? 60 : days <= 540 ? 40 : 20;
  const kmScore = km <= 5000 ? 100 : km <= 6000 ? 80 : km <= 8000 ? 50 : 25;

  return Math.round((dayScore + kmScore) / 2);
};

const mileageScore = (km) =>
  km <= 40000 ? 100 : km <= 80000 ? 85 : km <= 120000 ? 70 : km <= 160000 ? 55 : km <= 200000 ? 40 : 25;

const ageScore = (year) => {
  const age = new Date().getFullYear() - year;
  return age <= 3 ? 100 : age <= 6 ? 85 : age <= 10 ? 70 : age <= 15 ? 50 : 30;
};

/* ---------- overall health ---------- */

export const calculateHealth = (vehicle, lastService, inspection) => {
  const NEUTRAL = 70; // inspection nahi hui toh neutral score

  const scores = {
    serviceRegularity: serviceRegularityScore(vehicle, lastService),
    mileage: mileageScore(vehicle.currentMileage),
    engine: inspection ? inspection.engine : NEUTRAL,
    brakes: inspection ? inspection.brakes : NEUTRAL,
    suspension: inspection ? inspection.suspension : NEUTRAL,
    battery: inspection ? inspection.battery : NEUTRAL,
    tyres: inspection ? inspection.tyres : NEUTRAL,
    accident: vehicle.accidentHistory ? 50 : 100,
    age: ageScore(vehicle.year),
  };

  let total = 0;
  const breakdown = Object.keys(WEIGHTS).map((key) => {
    const contribution = (scores[key] * WEIGHTS[key]) / 100;
    total += contribution;
    return { factor: key, score: scores[key], weight: WEIGHTS[key], contribution: +contribution.toFixed(1) };
  });

  const score = Math.round(total);
  return { score, status: classify(score), hasInspection: !!inspection, breakdown };
};

/* ---------- component health ---------- */

export const getComponentHealth = (inspection) => {
  if (!inspection) return [];
  return Object.keys(LABELS).map((key) => ({
    key,
    name: LABELS[key],
    score: inspection[key],
    status: classify(inspection[key]),
  }));
};

/* ---------- next service ---------- */

export const getNextService = (vehicle, lastService) => {
  if (!lastService) {
    return { hasHistory: false, status: "No history", message: "Koi service record nahi hai. Pehli service karwayein." };
  }

  const nextServiceKm = lastService.odometer + SERVICE_INTERVAL_KM;
  const remainingKm = nextServiceKm - vehicle.currentMileage;

  const nextServiceDate = new Date(lastService.serviceDate);
  nextServiceDate.setDate(nextServiceDate.getDate() + SERVICE_INTERVAL_DAYS);
  const remainingDays = Math.ceil((nextServiceDate - Date.now()) / 86400000);

  const overdue = remainingKm < 0 || remainingDays < 0;
  const dueSoon = !overdue && (remainingKm <= 500 || remainingDays <= 15);

  return {
    hasHistory: true,
    lastServiceKm: lastService.odometer,
    interval: SERVICE_INTERVAL_KM,
    nextServiceKm,
    remainingKm,
    nextServiceDate,
    remainingDays,
    status: overdue ? "Overdue" : dueSoon ? "Due soon" : "On track",
  };
};

/* ---------- recommendations (rule-based) ---------- */

export const getRecommendations = ({ vehicle, components, inspections, nextService, health }) => {
  const recs = [];
  const add = (priority, title, message, component = null) => recs.push({ priority, title, message, component });

  // 1) component rules: score < 60
  components.forEach((c) => {
    if (c.score < 60) add("high", `${c.name} inspection recommended`, `${c.name} ka health ${c.score}/100 hai. Jaldi check karwayein.`, c.key);
    else if (c.score < 80) add("medium", `${c.name} needs monitoring`, `${c.name} ka health ${c.score}/100 (Fair). Agle service mein dhyan dein.`, c.key);
  });

  // 2) repeated issue: pichli inspections mein 2+ baar < 60
  components.forEach((c) => {
    const badCount = inspections.filter((i) => i[c.key] < 60).length;
    if (badCount >= 2) add("high", `Repeated ${c.name} Problem Detected`, `Pichli ${inspections.length} inspections mein ${c.name} ${badCount} baar kharab mila.`, c.key);
  });

  // 3) service rules
  if (nextService.status === "Overdue") add("high", "Service overdue", "Service ka time nikal chuka hai. Jaldi service karwayein.");
  else if (nextService.status === "Due soon") add("medium", "Service due soon", `Sirf ${Math.max(nextService.remainingKm, 0)} KM / ${Math.max(nextService.remainingDays, 0)} din bache hain.`);
  else if (nextService.status === "No history") add("medium", "No service history", "Service record add karein taaki accurate health mile.");

  // 4) vehicle-level rules
  if (!health.hasInspection) add("medium", "Inspection pending", "Abhi tak inspection nahi hui. Workshop se inspection karwayein.");
  if (vehicle.accidentHistory) add("medium", "Accident history", "Accident history hai. Body aur suspension alignment check karwana better hai.");
  if (vehicle.currentMileage > 150000) add("low", "High mileage vehicle", "150,000 KM se zyada chali hai. Regular inspection rakhein.");

  const order = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => order[a.priority] - order[b.priority]);
};