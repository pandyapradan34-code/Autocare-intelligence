import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import ServiceRecord from "../models/ServiceRecord.js";
import Inspection from "../models/Inspection.js";
import HealthScore from "../models/HealthScore.js";

const email = process.argv[2];
if (!email) { console.log("Use: node db/seed.js customer@email.com"); process.exit(1); }

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

await mongoose.connect(process.env.MONGO_URI);
const owner = await User.findOne({ email: new RegExp(`^${email}$`, "i") });
if (!owner) { console.log("User nahi mila. Pehle us email se ek baar login karo."); process.exit(1); }

const numbers = ["GJ18AB1234", "GJ01CD5678"];
const old = await Vehicle.find({ vehicleNumber: { $in: numbers } });
const oldIds = old.map((v) => v._id);
await Promise.all([
  ServiceRecord.deleteMany({ vehicleId: { $in: oldIds } }),
  Inspection.deleteMany({ vehicleId: { $in: oldIds } }),
  HealthScore.deleteMany({ vehicleId: { $in: oldIds } }),
  Vehicle.deleteMany({ _id: { $in: oldIds } }),
]);

const [creta, swift] = await Vehicle.create([
  { ownerId: owner._id, vehicleNumber: numbers[0], brand: "Hyundai", model: "Creta", year: 2018, currentMileage: 82450, fuelType: "Diesel", accidentHistory: false },
  { ownerId: owner._id, vehicleNumber: numbers[1], brand: "Maruti", model: "Swift", year: 2021, currentMileage: 31200, fuelType: "Petrol", accidentHistory: true },
]);

const svc = (v, d, odo, type, parts, cost) => ({ vehicleId: v._id, serviceDate: daysAgo(d), odometer: odo, serviceType: type, parts, cost, remarks: "" });
await ServiceRecord.insertMany([
  svc(creta, 700, 62000, "Oil Change", ["Oil filter"], 3200),
  svc(creta, 540, 67000, "Brake Service", ["Brake pads"], 5400),
  svc(creta, 380, 72000, "General Service", ["Air filter", "Oil filter"], 4800),
  svc(creta, 210, 77000, "Brake Service", ["Brake pads", "Brake oil"], 6200),
  svc(creta, 45, 82000, "Oil Change", ["Oil filter"], 3500),
  svc(swift, 300, 25000, "General Service", ["Oil filter"], 3900),
  svc(swift, 100, 30000, "Oil Change", ["Oil filter"], 2800),
]);

const insp = (v, d, s) => ({ vehicleId: v._id, inspectionDate: daysAgo(d), ...s });
await Inspection.insertMany([
  insp(creta, 200, { engine: 84, brakes: 52, battery: 80, tyres: 72, suspension: 64, transmission: 83, cooling: 88 }),
  insp(creta, 30, { engine: 85, brakes: 55, battery: 78, tyres: 70, suspension: 58, transmission: 82, cooling: 90 }),
  insp(swift, 60, { engine: 90, brakes: 82, battery: 85, tyres: 78, suspension: 80, transmission: 88, cooling: 92 }),
]);

// health trend chart ke liye pichle 6 mahine ke snapshots
const trend = [74, 72, 70, 69, 67, 66];
await HealthScore.insertMany(trend.map((score, i) => ({
  vehicleId: creta._id,
  date: daysAgo((trend.length - i) * 28).toISOString().slice(0, 10),
  score, status: score >= 80 ? "Good" : score >= 60 ? "Fair" : "Attention",
})));

console.log("Seed done for", owner.email);
process.exit(0);