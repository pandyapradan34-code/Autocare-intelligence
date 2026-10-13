import mongoose from "mongoose";
import Vehicle from "../models/Vehicle.js";
import User from "../models/User.js";
import ServiceRecord from "../models/ServiceRecord.js";
import HealthScore from "../models/HealthScore.js";
import Inspection from "../models/Inspection.js";
import { generateStarterData } from "../utils/starterData.js";
import { isConnected } from "../config/db.js";

const memoryVehicles = [];

export const getMe = (req, res) => {
  res.json(req.user);
};

// POST /api/vehicles
export const addVehicle = async (req, res) => {
  try {
    const {
      brand,
      model,
      variant,
      year,
      registrationNumber,
      vehicleNumber,
      fuelType,
      currentMileage,
      currentKm,
      odometer,
      accidentHistory,
      color,
    } = req.body ?? {};

    const normalizedBrand = String(brand ?? "").trim();
    const normalizedModel = String(model ?? "").trim();
    const normalizedYear = Number(year);
    const regNumber = String(
      registrationNumber ?? vehicleNumber ?? ""
    ).trim().toUpperCase();

    const mileage = Number(currentMileage ?? currentKm ?? odometer ?? 0);

    // Validate required fields
    if (!normalizedBrand || !normalizedModel || !year || !regNumber) {
      return res.status(400).json({
        message:
          "Brand, model, year and registration number are required.",
        received: {
          brand: Boolean(normalizedBrand),
          model: Boolean(normalizedModel),
          year: Boolean(year),
          registrationNumber: Boolean(regNumber),
        },
      });
    }

    if (
      !Number.isInteger(normalizedYear) ||
      normalizedYear < 1886 ||
      normalizedYear > new Date().getFullYear() + 1
    ) {
      return res.status(400).json({
        message: "Please provide a valid vehicle manufacturing year.",
      });
    }

    if (!Number.isFinite(mileage) || mileage < 0) {
      return res.status(400).json({
        message: "Mileage must be a valid non-negative number.",
      });
    }

    const clerkUserId = req.clerkUserId || req.user?.clerkUserId;

    if (!clerkUserId) {
      return res.status(401).json({
        message: "Authentication required. Please sign in again.",
      });
    }

    const vehicleData = {
      clerkUserId,
      brand: normalizedBrand,
      model: normalizedModel,
      variant: String(variant ?? "").trim(),
      year: normalizedYear,
      registrationNumber: regNumber,
      vehicleNumber: regNumber,
      currentMileage: mileage,
      currentKm: mileage,
      fuelType: fuelType || "Petrol",
      accidentHistory: accidentHistory || "None reported",
      color: color || "Silver",
    };

    let vehicle;

    if (isConnected()) {
      let ownerId = undefined;
      if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
        ownerId = req.user._id;
      } else if (clerkUserId) {
        const dbUser = await User.findOne({ clerkUserId });
        if (dbUser?._id) {
          ownerId = dbUser._id;
        }
      }

      vehicle = await Vehicle.create({
        ...vehicleData,
        ...(ownerId ? { ownerId } : {}),
      });

      try {
        await generateStarterData(vehicle, clerkUserId);
      } catch (starterError) {
        console.error("Starter data generation failed:", starterError);
      }
    } else {
      vehicle = {
        ...vehicleData,
        _id: `veh_${Date.now()}`,
        id: `veh_${Date.now()}`,
        healthScore: 88,
        createdAt: new Date().toISOString(),
      };

      memoryVehicles.push(vehicle);
    }

    const responsePayload = vehicle.toObject ? vehicle.toObject() : { ...vehicle };
    responsePayload.message = "Vehicle added successfully.";
    responsePayload.vehicle = vehicle;

    return res.status(201).json(responsePayload);
  } catch (err) {
    console.error("Add vehicle error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "This vehicle registration number already exists.",
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Vehicle validation failed.",
        errors: Object.fromEntries(
          Object.entries(err.errors ?? {}).map(([key, value]) => [
            key,
            value.message,
          ])
        ),
      });
    }

    return res.status(400).json({
      message: err.message || "Failed to add vehicle.",
    });
  }
};

// GET /api/vehicles
export const getVehicles = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId || req.user?.clerkUserId;
    const isAdmin = req.user?.role === "admin";

    if (!isAdmin && !clerkUserId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const filter = isAdmin ? {} : { clerkUserId };
    const { search } = req.query;

    if (isConnected()) {
      const query = { ...filter };

      if (search) {
        const rx = new RegExp(
          search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i"
        );

        query.$or = [
          { vehicleNumber: rx },
          { registrationNumber: rx },
          { brand: rx },
          { model: rx },
        ];
      }

      const vehicles = await Vehicle.find(query)
        .populate("ownerId", "name email phone")
        .sort("-createdAt");

      return res.json(vehicles);
    }

    let list = memoryVehicles.filter(
      (vehicle) => isAdmin || vehicle.clerkUserId === clerkUserId
    );

    if (search) {
      const q = search.toLowerCase();

      list = list.filter(
        (vehicle) =>
          (vehicle.registrationNumber || "").toLowerCase().includes(q) ||
          (vehicle.brand || "").toLowerCase().includes(q) ||
          (vehicle.model || "").toLowerCase().includes(q)
      );
    }

    return res.json(list);
  } catch (err) {
    console.error("Get vehicles error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/vehicles/:id
export const getVehicleById = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId || req.user?.clerkUserId;
    const isAdmin = req.user?.role === "admin";

    if (isConnected()) {
      const vehicle = await Vehicle.findById(req.params.id).populate(
        "ownerId",
        "name email phone"
      );

      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found." });
      }

      const isOwner =
        vehicle.clerkUserId === clerkUserId ||
        vehicle.ownerId?._id?.equals(req.user?._id);

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied." });
      }

      return res.json(vehicle);
    }

    const vehicle = memoryVehicles.find(
      (item) => item._id === req.params.id || item.id === req.params.id
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    if (vehicle.clerkUserId !== clerkUserId && !isAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    return res.json(vehicle);
  } catch (err) {
    console.error("Get vehicle error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/vehicles/:id
export const updateVehicle = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId || req.user?.clerkUserId;
    const isAdmin = req.user?.role === "admin";

    if (isConnected()) {
      const vehicle = await Vehicle.findById(req.params.id);

      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found." });
      }

      const isOwner =
        vehicle.clerkUserId === clerkUserId ||
        vehicle.ownerId?.equals(req.user?._id);

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied." });
      }

      const updates = { ...req.body };
      delete updates._id;
      delete updates.clerkUserId;
      delete updates.ownerId;

      if (updates.registrationNumber && !updates.vehicleNumber) {
        updates.vehicleNumber = updates.registrationNumber;
      }

      if (updates.currentKm != null && updates.currentMileage == null) {
        updates.currentMileage = updates.currentKm;
      }

      Object.assign(vehicle, updates);
      await vehicle.save();

      return res.json(vehicle);
    }

    const index = memoryVehicles.findIndex(
      (item) => item._id === req.params.id || item.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    if (
      memoryVehicles[index].clerkUserId !== clerkUserId &&
      !isAdmin
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    Object.assign(memoryVehicles[index], req.body);

    return res.json(memoryVehicles[index]);
  } catch (err) {
    console.error("Update vehicle error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// DELETE /api/vehicles/:id
export const deleteVehicle = async (req, res) => {
  try {
    const clerkUserId = req.clerkUserId || req.user?.clerkUserId;
    const isAdmin = req.user?.role === "admin";

    if (isConnected()) {
      const vehicle = await Vehicle.findById(req.params.id);

      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found." });
      }

      const isOwner =
        vehicle.clerkUserId === clerkUserId ||
        vehicle.ownerId?.equals(req.user?._id);

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied." });
      }

      await Promise.all([
        Vehicle.findByIdAndDelete(req.params.id),
        ServiceRecord.deleteMany({ vehicleId: req.params.id }),
        HealthScore.deleteMany({ vehicleId: req.params.id }),
        Inspection.deleteMany({ vehicleId: req.params.id }),
      ]);

      return res.json({ message: "Vehicle deleted successfully." });
    }

    const index = memoryVehicles.findIndex(
      (item) => item._id === req.params.id || item.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    if (
      memoryVehicles[index].clerkUserId !== clerkUserId &&
      !isAdmin
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    memoryVehicles.splice(index, 1);

    return res.json({ message: "Vehicle deleted successfully." });
  } catch (err) {
    console.error("Delete vehicle error:", err);
    return res.status(500).json({ message: err.message });
  }
};
