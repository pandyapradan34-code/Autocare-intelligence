import Inspection from "../models/Inspection.js";
import HealthScore from "../models/HealthScore.js";
import ServiceRecord from "../models/ServiceRecord.js";
import { isConnected } from "../config/db.js";

export async function generateStarterData(vehicle, clerkUserId) {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - (Number(vehicle.year) || currentYear));
  const mileage = Number(vehicle.currentMileage) || Number(vehicle.currentKm) || 15000;

  // 1. Component scores based on age and mileage
  const engine = Math.max(50, Math.min(98, Math.round(98 - age * 2.2 - (mileage / 100000) * 12)));
  const brakes = Math.max(45, Math.min(95, Math.round(96 - ((mileage % 25000) / 25000) * 25 - age * 1.5)));
  const battery = Math.max(45, Math.min(98, Math.round(98 - ((age % 4) + 1) * 8)));
  const tyres = Math.max(45, Math.min(95, Math.round(95 - ((mileage % 40000) / 40000) * 30)));
  const suspension = Math.max(48, Math.min(96, Math.round(96 - age * 2.5 - (mileage / 120000) * 10)));
  const transmission = Math.max(52, Math.min(98, Math.round(98 - age * 1.8 - (mileage / 150000) * 8)));
  const cooling = Math.max(50, Math.min(97, Math.round(97 - age * 2 - (mileage / 100000) * 8)));

  const overallScore = Math.round(
    engine * 0.25 +
    brakes * 0.2 +
    suspension * 0.15 +
    battery * 0.1 +
    tyres * 0.1 +
    transmission * 0.1 +
    cooling * 0.1
  );

  const nextServiceKm = Math.round(mileage + 5000);
  const nextServiceDate = new Date();
  nextServiceDate.setMonth(nextServiceDate.getMonth() + 4);

  // Update vehicle
  vehicle.healthScore = overallScore;
  vehicle.nextServiceDate = nextServiceDate;
  vehicle.nextServiceKm = nextServiceKm;

  if (isConnected()) {
    try {
      // Inspection
      await Inspection.create({
        vehicleId: vehicle._id,
        clerkUserId,
        engine,
        brakes,
        battery,
        tyres,
        suspension,
        transmission,
        cooling,
        inspectionDate: new Date(),
      });

      // Historical Health trend (last 4 years up to current year)
      const healthPoints = [];
      const startYear = Math.max(Number(vehicle.year) || (currentYear - 3), currentYear - 3);
      for (let yr = startYear; yr <= currentYear; yr++) {
        const offset = currentYear - yr;
        const ptScore = Math.min(100, Math.round(overallScore + offset * 3.5));
        healthPoints.push({
          vehicleId: vehicle._id,
          clerkUserId,
          date: `${yr}-06-15`,
          score: ptScore,
          status: ptScore >= 80 ? "Good" : ptScore >= 60 ? "Fair" : "Attention",
        });
      }
      // Also add current date
      const todayStr = new Date().toISOString().slice(0, 10);
      healthPoints.push({
        vehicleId: vehicle._id,
        clerkUserId,
        date: todayStr,
        score: overallScore,
        status: overallScore >= 80 ? "Good" : overallScore >= 60 ? "Fair" : "Attention",
      });

      for (const hp of healthPoints) {
        await HealthScore.findOneAndUpdate(
          { vehicleId: vehicle._id, date: hp.date },
          hp,
          { upsert: true }
        );
      }

      // Starter Service records
      const s1Km = Math.max(5000, Math.round(mileage * 0.35));
      const s2Km = Math.max(10000, Math.round(mileage * 0.7));
      const s3Km = Math.max(15000, Math.round(mileage * 0.95));

      const d1 = new Date();
      d1.setMonth(d1.getMonth() - 12);
      const d2 = new Date();
      d2.setMonth(d2.getMonth() - 6);
      const d3 = new Date();
      d3.setMonth(d3.getMonth() - 2);

      await ServiceRecord.insertMany([
        {
          vehicleId: vehicle._id,
          clerkUserId,
          serviceDate: d1,
          odometer: s1Km,
          serviceType: "Periodic Maintenance",
          parts: ["Engine Oil", "Oil Filter"],
          cost: 4500,
          remarks: "Standard 1st annual maintenance inspection completed.",
          status: "Completed",
        },
        {
          vehicleId: vehicle._id,
          clerkUserId,
          serviceDate: d2,
          odometer: s2Km,
          serviceType: "General Service & Fluid Top-up",
          parts: ["Brake Fluid", "Coolant", "Air Filter"],
          cost: 6800,
          remarks: "All fluid levels normalized, air filter replaced.",
          status: "Completed",
        },
        {
          vehicleId: vehicle._id,
          clerkUserId,
          serviceDate: d3,
          odometer: s3Km,
          serviceType: "Wheel Alignment & Brake Check",
          parts: ["Wheel Weights", "Brake Cleaner"],
          cost: 3200,
          remarks: "Brake pads inspected (~60% remaining); alignment calibrated.",
          status: "Completed",
        },
      ]);

      await vehicle.save();
    } catch (e) {
      console.warn("Error saving starter records to DB:", e.message);
    }
  }

  return {
    overallScore,
    engine,
    brakes,
    battery,
    tyres,
    suspension,
    transmission,
    cooling,
    nextServiceKm,
    nextServiceDate,
  };
}
