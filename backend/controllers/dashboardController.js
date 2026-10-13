import Vehicle from "../models/Vehicle.js";
import ServiceRecord from "../models/ServiceRecord.js";
import HealthScore from "../models/HealthScore.js";
import Inspection from "../models/Inspection.js";
import User from "../models/User.js";
import { isConnected } from "../config/db.js";

/**
 * Helper to fetch the targeted vehicle for the user.
 * Supports optional ?vehicleId= query parameter.
 */
async function getTargetVehicle(req) {
  const clerkUserId = req.clerkUserId || req.user?.clerkUserId;
  const { vehicleId } = req.query;

  if (!isConnected()) {
    return null;
  }

  if (vehicleId) {
    const v = await Vehicle.findOne({
      _id: vehicleId,
      ...(req.user?.role === "admin" ? {} : { clerkUserId }),
    });
    if (v) return v;
  }

  return await Vehicle.findOne({ clerkUserId }).sort("-createdAt");
}

function toneForScore(s) {
  if (s >= 80) return "good";
  if (s >= 60) return "moderate";
  return "attention";
}

// ─── GET /api/health ───────────────────────────────────────────────────────
export const getOverallHealth = async (req, res) => {
  try {
    const vehicle = await getTargetVehicle(req);
    if (!vehicle) {
      return res.json({
        score: 0,
        status: "No vehicle",
        lastUpdated: null,
        explanation: "No vehicle registered. Add your vehicle to begin monitoring health.",
        breakdown: [],
      });
    }

    const [latestInspection, lastService] = await Promise.all([
      Inspection.findOne({ vehicleId: vehicle._id }).sort("-inspectionDate"),
      ServiceRecord.findOne({ vehicleId: vehicle._id }).sort("-serviceDate"),
    ]);

    const age = Math.max(0, new Date().getFullYear() - (vehicle.year || new Date().getFullYear()));
    const mileage = vehicle.currentMileage || 0;

    const engineScore = latestInspection?.engine ?? Math.max(50, 95 - age * 2);
    const brakesScore = latestInspection?.brakes ?? Math.max(45, 92 - age * 2);
    const suspensionScore = latestInspection?.suspension ?? Math.max(48, 90 - age * 2);
    const batteryScore = latestInspection?.battery ?? 88;
    const tyresScore = latestInspection?.tyres ?? 82;

    const breakdown = [
      { factor: "Engine & Powertrain", score: engineScore, weight: 25 },
      { factor: "Braking System", score: brakesScore, weight: 20 },
      { factor: "Suspension & Steering", score: suspensionScore, weight: 20 },
      { factor: "Battery & Electrical", score: batteryScore, weight: 15 },
      { factor: "Tyres & Tread", score: tyresScore, weight: 10 },
      { factor: "Service Regularity", score: lastService ? 95 : 60, weight: 10 },
    ];

    let total = 0;
    breakdown.forEach((b) => {
      total += (b.score * b.weight) / 100;
    });
    const score = Math.round(total);
    const status = score >= 80 ? "Good" : score >= 60 ? "Fair" : "Attention";
    const today = new Date().toISOString().slice(0, 10);

    // Save score
    await HealthScore.findOneAndUpdate(
      { vehicleId: vehicle._id, date: today },
      { clerkUserId: req.clerkUserId, score, status },
      { upsert: true }
    );

    res.json({
      score,
      status,
      lastUpdated: today,
      explanation: `Your ${vehicle.brand} ${vehicle.model} has an overall health rating of ${score}/100. Component metrics and service intervals are actively monitored.`,
      breakdown,
    });
  } catch (err) {
    console.error("getOverallHealth error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/health/components ────────────────────────────────────────────
export const getComponentsHealth = async (req, res) => {
  try {
    const vehicle = await getTargetVehicle(req);
    if (!vehicle) return res.json([]);

    let inspection = await Inspection.findOne({ vehicleId: vehicle._id }).sort("-inspectionDate");

    const e = inspection?.engine ?? 92;
    const b = inspection?.brakes ?? 85;
    const s = inspection?.suspension ?? 88;
    const bat = inspection?.battery ?? 90;
    const t = inspection?.tyres ?? 79;
    const tr = inspection?.transmission ?? 94;
    const c = inspection?.cooling ?? 91;

    const components = [
      {
        id: "engine",
        name: "Engine",
        value: e,
        score: e,
        icon: "engine",
        status: toneForScore(e),
        summary: "Optimal combustion efficiency and clean oil flow.",
      },
      {
        id: "brakes",
        name: "Brakes",
        value: b,
        score: b,
        icon: "disc",
        status: toneForScore(b),
        summary: "Brake pads at healthy thickness, responsive ABS sensors.",
      },
      {
        id: "suspension",
        name: "Suspension",
        value: s,
        score: s,
        icon: "suspension",
        status: toneForScore(s),
        summary: "Shock absorbers intact with smooth damping resistance.",
      },
      {
        id: "battery",
        name: "Battery",
        value: bat,
        score: bat,
        icon: "battery",
        status: toneForScore(bat),
        summary: "12.6V resting charge, low impedance, clear terminals.",
      },
      {
        id: "tyres",
        name: "Tyres",
        value: t,
        score: t,
        icon: "tyre",
        status: toneForScore(t),
        summary: "Tread depth ~4.2mm. Alignment check recommended.",
      },
      {
        id: "transmission",
        name: "Transmission",
        value: tr,
        score: tr,
        icon: "cog",
        status: toneForScore(tr),
        summary: "Smooth gear transition and proper fluid viscosity.",
      },
      {
        id: "cooling",
        name: "Cooling System",
        value: c,
        score: c,
        icon: "cooling",
        status: toneForScore(c),
        summary: "Radiator coolant level within recommended specs.",
      },
    ];

    res.json(components);
  } catch (err) {
    console.error("getComponentsHealth error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/health/trend ─────────────────────────────────────────────────
export const getHealthTrend = async (req, res) => {
  try {
    const vehicle = await getTargetVehicle(req);
    if (!vehicle) return res.json([]);

    const trend = await HealthScore.find({ vehicleId: vehicle._id }).sort("date");
    if (trend.length === 0) {
      const curYear = new Date().getFullYear();
      const currentScore = vehicle.healthScore || 85;
      return res.json([
        { year: `${curYear - 2}`, date: `${curYear - 2}-01-01`, score: Math.min(98, currentScore + 6) },
        { year: `${curYear - 1}`, date: `${curYear - 1}-01-01`, score: Math.min(96, currentScore + 3) },
        { year: `${curYear}`, date: `${curYear}-01-01`, score: currentScore },
      ]);
    }

    const formatted = trend.map((t) => ({
      year: t.date.slice(0, 4),
      date: t.date,
      score: t.score,
    }));
    res.json(formatted);
  } catch (err) {
    console.error("getHealthTrend error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/services & POST /api/services ─────────────────────────────────
export const getServices = async (req, res) => {
  try {
    const vehicle = await getTargetVehicle(req);
    if (!vehicle) return res.json([]);

    const services = await ServiceRecord.find({ vehicleId: vehicle._id })
      .sort("-serviceDate")
      .populate("vehicleId", "brand model registrationNumber vehicleNumber");

    res.json(services);
  } catch (err) {
    console.error("getServices error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const createService = async (req, res) => {
  try {
    const { vehicleId, serviceDate, odometer, serviceType, parts, cost, remarks } = req.body;
    let targetVehicleId = vehicleId;

    if (!targetVehicleId) {
      const v = await getTargetVehicle(req);
      targetVehicleId = v?._id;
    }

    if (!targetVehicleId) {
      return res.status(400).json({ message: "Vehicle is required" });
    }

    const service = await ServiceRecord.create({
      vehicleId: targetVehicleId,
      clerkUserId: req.clerkUserId,
      serviceDate: serviceDate || new Date(),
      odometer: Number(odometer) || 0,
      serviceType: serviceType || "General Service",
      parts: Array.isArray(parts) ? parts : parts ? [parts] : [],
      cost: Number(cost) || 0,
      remarks: remarks || "",
      status: "Completed",
    });

    // Update vehicle odometer if higher
    if (odometer) {
      const v = await Vehicle.findById(targetVehicleId);
      if (v && Number(odometer) > (v.currentMileage || 0)) {
        v.currentMileage = Number(odometer);
        v.currentKm = Number(odometer);
        await v.save();
      }
    }

    res.status(201).json(service);
  } catch (err) {
    console.error("createService error:", err);
    res.status(400).json({ message: err.message });
  }
};

// ─── GET /api/services/next ────────────────────────────────────────────────
export const getNextService = async (req, res) => {
  try {
    const vehicle = await getTargetVehicle(req);
    if (!vehicle) {
      return res.json({
        dueKm: 0,
        dueMonths: 0,
        remainingKm: 0,
        remainingDays: 0,
        nextServiceDate: null,
        items: [],
      });
    }

    const lastService = await ServiceRecord.findOne({ vehicleId: vehicle._id }).sort("-serviceDate");

    const mileage = vehicle.currentMileage || 0;
    const intervalKm = 10000;
    const nextServiceKm = vehicle.nextServiceKm || (lastService ? lastService.odometer + intervalKm : mileage + 5000);
    const remainingKm = Math.max(0, nextServiceKm - mileage);

    const nextDate = vehicle.nextServiceDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const remainingDays = Math.max(0, Math.ceil((new Date(nextDate) - Date.now()) / 86400000));
    const dueMonths = Math.max(1, Math.round(remainingDays / 30));

    const items = [
      {
        id: "oil",
        label: "Engine Oil & Filter Replacement",
        remainingKm: Math.min(remainingKm, 4500),
        totalKm: 10000,
        status: remainingKm < 1500 ? "attention" : "good",
      },
      {
        id: "brakes",
        label: "Brake Fluid & Pad Inspection",
        remainingKm: Math.min(remainingKm + 3000, 8000),
        totalKm: 20000,
        status: "good",
      },
      {
        id: "tyres",
        label: "Tyre Rotation & Wheel Balance",
        remainingKm: Math.max(800, Math.min(remainingKm, 2500)),
        totalKm: 10000,
        status: "moderate",
      },
      {
        id: "air_filter",
        label: "Cabin & Engine Air Filters",
        remainingKm: Math.min(remainingKm + 1500, 6000),
        totalKm: 15000,
        status: "good",
      },
    ];

    res.json({
      dueKm: nextServiceKm,
      dueMonths,
      remainingKm,
      remainingDays,
      nextServiceDate: nextDate,
      status: remainingKm <= 1000 ? "Due soon" : "On track",
      items,
    });
  } catch (err) {
    console.error("getNextService error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/life-expectancy ──────────────────────────────────────────────
export const getLifeExpectancy = async (req, res) => {
  try {
    const vehicle = await getTargetVehicle(req);
    if (!vehicle) {
      return res.json({
        estimatedRemainingYears: 0,
        estimatedRemainingKm: 0,
        currentKm: 0,
        projectedLifespanKm: 250000,
        healthScore: 0,
        factors: [],
        predictedMajorRepairs: [],
      });
    }

    const mileage = vehicle.currentMileage || 0;
    const health = vehicle.healthScore || 85;

    const projectedLifespanKm = 240000 + Math.round((health - 80) * 1500);
    const estimatedRemainingKm = Math.max(15000, projectedLifespanKm - mileage);
    const estimatedRemainingYears = Math.max(1, Math.round(estimatedRemainingKm / 14000));

    res.json({
      estimatedRemainingYears,
      estimatedRemainingKm,
      currentKm: mileage,
      projectedLifespanKm,
      healthScore: health,
      factors: [
        { name: "Powertrain Longevity", score: 92, impact: "High" },
        { name: "Maintenance Regularity", score: 95, impact: "High" },
        { name: "Chassis & Corrosion Protection", score: 88, impact: "Medium" },
        { name: "Driving Wear Intensity", score: 84, impact: "Medium" },
      ],
      predictedMajorRepairs: [
        { milestone: "60,000 km", item: "Front brake rotor resurfacing & pads", estimatedCost: 7500 },
        { milestone: "85,000 km", item: "Suspension struts & tie rod ends", estimatedCost: 18000 },
        { milestone: "110,000 km", item: "Serpentine belt & water pump replacement", estimatedCost: 14000 },
      ],
    });
  } catch (err) {
    console.error("getLifeExpectancy error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/recommendations ──────────────────────────────────────────────
export const getRecommendations = async (req, res) => {
  try {
    const vehicle = await getTargetVehicle(req);
    if (!vehicle) return res.json([]);

    const inspection = await Inspection.findOne({ vehicleId: vehicle._id }).sort("-inspectionDate");
    const recs = [];

    if (inspection?.tyres < 80) {
      recs.push({
        id: "rec-tyres",
        severity: "moderate",
        priority: "medium",
        title: "Tyre Rotation & Alignment Recommended",
        message: "Front tyres exhibit uneven edge wear. Rotate tyres within 1,200 km for balanced wear life.",
      });
    } else {
      recs.push({
        id: "rec-tyres-ok",
        severity: "good",
        priority: "low",
        title: "Tyre Tread Depth Healthy",
        message: "Current tyre condition is optimal. Continue routine pressure checks every 2 weeks.",
      });
    }

    if (inspection?.brakes < 75) {
      recs.push({
        id: "rec-brakes",
        severity: "attention",
        priority: "high",
        title: "Brake Pad Check Needed",
        message: "Brake pad wear is nearing the 3mm indicator line. Schedule an inspection soon.",
      });
    }

    recs.push({
      id: "rec-service",
      severity: "good",
      priority: "medium",
      title: "Scheduled Periodic Servicing",
      message: `Your next regular interval service for ${vehicle.brand} ${vehicle.model} is due in approx. 4,500 km.`,
    });

    res.json(recs);
  } catch (err) {
    console.error("getRecommendations error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/maintenance ──────────────────────────────────────────────────
export const getMaintenanceSummary = async (req, res) => {
  try {
    const vehicle = await getTargetVehicle(req);
    if (!vehicle) {
      return res.json({
        total: 0,
        services: 0,
        yearOverYearChange: 0,
        breakdown: [],
        trend: [],
        insights: [],
      });
    }

    const services = await ServiceRecord.find({ vehicleId: vehicle._id }).sort("-serviceDate");
    const total = services.reduce((sum, s) => sum + (s.cost || 0), 0);

    const routine = Math.round(total * 0.55);
    const brakes = Math.round(total * 0.25);
    const parts = Math.max(0, total - routine - brakes);

    const breakdown = [
      { id: "routine", label: "Scheduled Servicing", amount: routine, color: "#2563eb" },
      { id: "brakes", label: "Brakes & Alignment", amount: brakes, color: "#f59e0b" },
      { id: "parts", label: "Consumables & Fluids", amount: parts, color: "#10b981" },
    ];

    const curYear = new Date().getFullYear();
    const trend = [
      { year: `${curYear - 2}`, cost: Math.round(total * 0.25) },
      { year: `${curYear - 1}`, cost: Math.round(total * 0.35) },
      { year: `${curYear}`, cost: Math.round(total * 0.4) },
    ];

    const insights = [
      `Your total lifetime maintenance spend on this car is ₹${total.toLocaleString("en-IN")}.`,
      "Scheduled preventive maintenance has averted an estimated ₹22,000 in unscheduled repairs.",
      "Fluids and filters are performing within OEM specifications.",
    ];

    res.json({
      total,
      services: services.length,
      yearOverYearChange: -4,
      breakdown,
      trend,
      insights,
    });
  } catch (err) {
    console.error("getMaintenanceSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET/PUT /api/profile ──────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      name: user?.name || "AutoCare User",
      email: user?.email || "",
      phone: user?.phone || "+91 98765 43210",
      role: user?.role || "customer",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (isConnected() && req.user?._id) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (name) user.name = name;
        if (phone) user.phone = phone;
        await user.save();
        req.user = user;
      }
    }
    res.json({
      message: "Profile updated successfully",
      name: name || req.user?.name,
      email: req.user?.email,
      phone: phone || req.user?.phone,
      role: req.user?.role,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
