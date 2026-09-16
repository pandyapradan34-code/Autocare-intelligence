// Dummy authentication data — Phase 1 frontend only.
// In Phase 2 this will be replaced by real authentication against a backend API.

export const dummyUsers = [
  {
    id: "cust-001",
    role: "customer",
    name: "Rohan Mehta",
    email: "customer@demo.com",
    password: "customer123",
    phone: "+91 98765 43210",
    avatarInitials: "RM",
    vehicleId: "veh-001",
  },
  {
    id: "admin-001",
    role: "admin",
    name: "Pradan pandya",
    email: "admin@demo.com",
    password: "admin123",
    phone: "+91 91234 56789",
    avatarInitials: "PS",
  },
];

export function findUserByCredentials(email, password, role) {
  return dummyUsers.find(
    (u) =>
      u.email.toLowerCase() === String(email).toLowerCase() &&
      u.password === password &&
      u.role === role
  );
}
