import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let user = await User.findOne({ clerkUserId: userId });

    // pehli baar login: auto-create
    if (!user) {
      const cu = await clerkClient.users.getUser(userId);
      const email = cu.emailAddresses[0]?.emailAddress || "";
      const admins = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
      user = await User.create({
        clerkUserId: userId,
        name: `${cu.firstName || ""} ${cu.lastName || ""}`.trim(),
        email,
        role: admins.includes(email) ? "admin" : "customer",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Auth failed", error: err.message });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admin only" });
  next();
};