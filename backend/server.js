import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { connectDB } from "./config/db.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("AutoCare API running"));
app.use("/api/vehicles", vehicleRoutes);

connectDB().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`Server on ${process.env.PORT}`)
  );
});