import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    clerkUserId: { type: String, required: true, index: true },
    vehicleNumber: { type: String, uppercase: true, trim: true },
    registrationNumber: { type: String, uppercase: true, trim: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    variant: { type: String, default: "" },
    year: { type: Number, required: true },
    currentMileage: { type: Number, default: 0, min: 0 },
    currentKm: { type: Number, default: 0 },
    fuelType: { type: String, default: "Petrol" },
    accidentHistory: { type: mongoose.Schema.Types.Mixed, default: "None reported" },
    healthScore: { type: Number, default: 85 },
    nextServiceDate: { type: Date },
    nextServiceKm: { type: Number },
    color: { type: String, default: "Silver" },
    engineType: { type: String, default: "1.5L Petrol" },
    purchaseDate: { type: Date },
    insuranceValidTill: { type: Date },
    pucValidTill: { type: Date },
    previousOwners: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Keep vehicleNumber and registrationNumber synced, as well as currentMileage and currentKm
// Mongoose 8/9 synchronous pre-save hook (no next callback parameter)
vehicleSchema.pre("save", function () {
  if (!this.registrationNumber && this.vehicleNumber) {
    this.registrationNumber = this.vehicleNumber;
  }
  if (!this.vehicleNumber && this.registrationNumber) {
    this.vehicleNumber = this.registrationNumber;
  }
  if (this.currentMileage != null && this.currentKm == null) {
    this.currentKm = this.currentMileage;
  } else if (this.currentKm != null && this.currentMileage == null) {
    this.currentMileage = this.currentKm;
  }
});

export default mongoose.model("Vehicle", vehicleSchema);