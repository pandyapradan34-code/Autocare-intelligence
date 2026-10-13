import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import ServiceRecord from "../models/ServiceRecord.js";
import { isConnected } from "../config/db.js";

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    if (!isConnected()) {
      return res.json({
        totalCustomers: 0,
        customers: 0,
        totalVehicles: 0,
        vehicles: 0,
        totalServices: 0,
        services: 0,
        vehiclesRequiringAttention: 0,
        attention: 0,
      });
    }

    const [customerCount, vehicleCount, serviceCount, attentionCount] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Vehicle.countDocuments(),
      ServiceRecord.countDocuments(),
      Vehicle.countDocuments({ healthScore: { $lt: 60 } }),
    ]);

    res.json({
      totalCustomers: customerCount,
      customers: customerCount,
      totalVehicles: vehicleCount,
      vehicles: vehicleCount,
      totalServices: serviceCount,
      services: serviceCount,
      vehiclesRequiringAttention: attentionCount,
      attention: attentionCount,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/customers
export const getCustomers = async (req, res) => {
  try {
    if (!isConnected()) return res.json([]);

    const users = await User.find({ role: "customer" }).sort("-createdAt").lean();
    const counts = await Vehicle.aggregate([{ $group: { _id: "$ownerId", count: { $sum: 1 } } }]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

    const result = users.map((u) => ({
      _id: u._id,
      id: u._id,
      name: u.name || "Customer",
      email: u.email || "",
      phone: u.phone || "+91 98765 43210",
      role: u.role,
      vehicleCount: countMap[String(u._id)] || 0,
      createdAt: u.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error("Admin getCustomers error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/vehicles
export const getAdminVehicles = async (req, res) => {
  try {
    if (!isConnected()) return res.json([]);

    const vehicles = await Vehicle.find()
      .populate("ownerId", "name email phone")
      .sort("-createdAt")
      .lean();

    const formatted = vehicles.map((v) => ({
      _id: v._id,
      id: v._id,
      number: v.registrationNumber || v.vehicleNumber || "N/A",
      vehicleNumber: v.registrationNumber || v.vehicleNumber || "N/A",
      brand: v.brand,
      model: v.model,
      variant: v.variant || "",
      year: v.year,
      owner: v.ownerId?.name || "Customer",
      ownerEmail: v.ownerId?.email || "",
      km: v.currentMileage || v.currentKm || 0,
      health: v.healthScore || 85,
      healthScore: v.healthScore || 85,
      nextService: v.nextServiceDate || null,
      lastService: v.updatedAt || null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Admin getAdminVehicles error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/service-records
export const getAdminServiceRecords = async (req, res) => {
  try {
    if (!isConnected()) return res.json([]);

    const services = await ServiceRecord.find()
      .populate({
        path: "vehicleId",
        populate: { path: "ownerId", select: "name email" },
      })
      .sort("-serviceDate")
      .lean();

    const formatted = services.map((s) => ({
      _id: s._id,
      id: s._id,
      vehicle: s.vehicleId ? `${s.vehicleId.registrationNumber || s.vehicleId.vehicleNumber} (${s.vehicleId.brand} ${s.vehicleId.model})` : "Vehicle",
      vehicleId: s.vehicleId?._id,
      customer: s.vehicleId?.ownerId?.name || "Customer",
      type: s.serviceType,
      date: s.serviceDate,
      cost: s.cost || 0,
      odometer: s.odometer || 0,
      status: s.status || "Completed",
      remarks: s.remarks || "",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Admin getAdminServiceRecords error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/recent-services
export const getRecentServices = async (req, res) => {
  try {
    if (!isConnected()) return res.json([]);

    const services = await ServiceRecord.find()
      .populate({
        path: "vehicleId",
        populate: { path: "ownerId", select: "name email" },
      })
      .sort("-serviceDate")
      .limit(8)
      .lean();

    const formatted = services.map((s) => ({
      _id: s._id,
      id: s._id,
      vehicle: s.vehicleId ? `${s.vehicleId.brand} ${s.vehicleId.model} (${s.vehicleId.registrationNumber || s.vehicleId.vehicleNumber})` : "Vehicle",
      customer: s.vehicleId?.ownerId?.name || "Customer",
      date: s.serviceDate,
      cost: s.cost || 0,
      type: s.serviceType,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Admin getRecentServices error:", err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/critical-alerts
export const getCriticalAlerts = async (req, res) => {
  try {
    if (!isConnected()) return res.json([]);

    // Vehicles with health < 60 or high mileage without recent service
    const lowHealthVehicles = await Vehicle.find({ healthScore: { $lt: 65 } })
      .populate("ownerId", "name email")
      .limit(6)
      .lean();

    const alerts = lowHealthVehicles.map((v) => ({
      id: v._id,
      vehicle: `${v.registrationNumber || v.vehicleNumber} - ${v.brand} ${v.model}`,
      customer: v.ownerId?.name || "Customer",
      issue: `Health score at ${v.healthScore || 50}%. Major component inspection required.`,
    }));

    res.json(alerts);
  } catch (err) {
    console.error("Admin getCriticalAlerts error:", err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/services
export const addAdminService = async (req, res) => {
  try {
    const { vehicleId, serviceType, type, date, serviceDate, cost, odometer, remarks } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: "Vehicle is required" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const odo = Number(odometer) || vehicle.currentMileage || 0;
    const finalDate = date || serviceDate || new Date();

    const service = await ServiceRecord.create({
      vehicleId: vehicle._id,
      clerkUserId: vehicle.clerkUserId,
      serviceDate: finalDate,
      odometer: odo,
      serviceType: serviceType || type || "Periodic Maintenance",
      cost: Number(cost) || 0,
      remarks: remarks || "Service logged by AutoCare Admin",
      status: "Completed",
    });

    if (odo > (vehicle.currentMileage || 0)) {
      vehicle.currentMileage = odo;
      vehicle.currentKm = odo;
    }
    const nextDate = new Date(finalDate);
    nextDate.setMonth(nextDate.getMonth() + 6);
    vehicle.nextServiceDate = nextDate;
    vehicle.nextServiceKm = odo + 10000;
    await vehicle.save();

    res.status(201).json(service);
  } catch (err) {
    console.error("Admin addAdminService error:", err);
    res.status(400).json({ message: err.message });
  }
};

// GET /api/admin/profile
export const getAdminProfile = async (req, res) => {
  try {
    res.json({
      name: req.user?.name || "AutoCare Administrator",
      email: req.user?.email || "",
      role: "admin",
      permissions: ["fleet_manager", "service_coordinator", "customer_admin"],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};