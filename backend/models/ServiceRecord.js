import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    serviceDate: { type: Date, required: true },
    odometer: { type: Number, required: true },
    serviceType: { type: String, required: true },
    parts: [String],
    cost: { type: Number, default: 0 },
    remarks: String,
  },
  { timestamps: true }
);

export default mongoose.model("ServiceRecord", serviceSchema);