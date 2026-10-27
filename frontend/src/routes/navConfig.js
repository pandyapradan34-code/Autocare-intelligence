import {
  LayoutDashboard,
  Car,
  HeartPulse,
  History,
  CalendarClock,
  Lightbulb,
  UserCircle,
  Users,
  ClipboardList,
  PlusCircle,
  FileBarChart,
  Bell,
} from "lucide-react";

// Centralized nav item definitions so Sidebar stays a dumb, reusable shell.

export const customerNavItems = [
  { to: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/customer/car", label: "My Car", icon: Car },
  { to: "/customer/health", label: "Vehicle Health", icon: HeartPulse },
  { to: "/customer/service-history", label: "Service History", icon: History },
  { to: "/customer/next-service", label: "Next Service", icon: CalendarClock },
  { to: "/customer/recommendations", label: "Recommendations", icon: Lightbulb },
  { to: "/customer/notifications", label: "Notifications", icon: Bell },
  { to: "/customer/profile", label: "Profile", icon: UserCircle },
];

export const adminNavItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/vehicles", label: "Vehicles", icon: Car },
  { to: "/admin/services", label: "Service Records", icon: ClipboardList },
  { to: "/admin/services/add", label: "Add Service", icon: PlusCircle },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart },
  { to: "/admin/profile", label: "Profile", icon: UserCircle },
];
