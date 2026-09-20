import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { customers as initialCustomers } from "../data/customerData";
import { vehicles as initialVehicles, getVehicleFilterStatus } from "../data/vehiclesData";
import { serviceRecords as initialServiceRecords } from "../data/serviceRecordsData";
import { criticalAlerts } from "../data/adminDashboardData";

// Shared, frontend-only "admin data" store — the closest thing this Phase 1
// build has to a backend. It seeds itself from the existing dummy data files
// (same shape, same fields) and layers in-memory create operations on top,
// so records added from the Admin UI (new customers, new vehicles, new
// service records) are reflected everywhere the data is read from —
// Dashboard, Customers, Vehicles, Service Records — without touching the
// original data files. Phase 2 will swap these actions for real API calls
// against a real database; the shape of what's stored here is deliberately
// kept identical to the existing dummy schema so that swap is a drop-in.

const AdminDataContext = createContext(null);

let customerSeq = initialCustomers.length;
let vehicleSeq = initialVehicles.length;
let serviceSeq = initialServiceRecords.length;

function nextCustomerId() {
  customerSeq += 1;
  return `cust-${String(customerSeq).padStart(3, "0")}`;
}
function nextVehicleId() {
  vehicleSeq += 1;
  return `veh-${String(vehicleSeq).padStart(3, "0")}`;
}
function nextServiceId() {
  serviceSeq += 1;
  return `svc-${9000 + serviceSeq}`;
}

export function AdminDataProvider({ children }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [serviceRecords, setServiceRecords] = useState(initialServiceRecords);

  const isRegistrationNumberTaken = useCallback(
    (regNo, excludeVehicleId) => {
      const normalized = regNo.trim().toLowerCase();
      return vehicles.some(
        (v) => v.id !== excludeVehicleId && v.registrationNumber.trim().toLowerCase() === normalized
      );
    },
    [vehicles]
  );

  const isCustomerEmailTaken = useCallback(
    (email, excludeCustomerId) => {
      const normalized = email.trim().toLowerCase();
      return customers.some((c) => c.id !== excludeCustomerId && c.email.trim().toLowerCase() === normalized);
    },
    [customers]
  );

  // Creates a new customer record. Returns the created customer (with its
  // generated id) so callers can immediately link a vehicle/service to it.
  const addCustomer = useCallback((data) => {
    const customer = {
      id: nextCustomerId(),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address?.trim() || "",
      vehicleCount: 0,
      status: "Active",
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    setCustomers((prev) => [customer, ...prev]);
    return customer;
  }, []);

  // Creates a new vehicle owned by an existing (or just-created) customer.
  // Field set matches the richer per-vehicle schema already used on the
  // customer side (src/data/vehicleData.js), so nothing here is invented.
  const addVehicle = useCallback((data) => {
    const healthScore = 100;
    const vehicle = {
      id: nextVehicleId(),
      ownerId: data.ownerId,
      ownerName: data.ownerName,
      registrationNumber: data.registrationNumber.trim(),
      brand: data.brand.trim(),
      model: data.model.trim(),
      manufacturingYear: Number(data.manufacturingYear),
      purchaseDate: data.purchaseDate || "",
      fuelType: data.fuelType || "",
      engineType: data.engineType?.trim() || "",
      currentKm: Number(data.currentKm) || 0,
      previousOwners: data.previousOwners !== "" && data.previousOwners != null ? Number(data.previousOwners) : 0,
      accidentHistory: data.accidentHistory?.trim() || "None reported",
      insuranceValidTill: data.insuranceValidTill || "",
      pucValidTill: data.pucValidTill || "",
      healthScore,
      healthStatus: getVehicleFilterStatus(healthScore),
      lastServiceDate: null,
    };
    setVehicles((prev) => [vehicle, ...prev]);
    setCustomers((prev) =>
      prev.map((c) => (c.id === data.ownerId ? { ...c, vehicleCount: c.vehicleCount + 1 } : c))
    );
    return vehicle;
  }, []);

  // Creates a new service record for an existing (or just-created) vehicle,
  // and rolls the vehicle's currentKm / lastServiceDate forward to match —
  // the same thing a real "log service" endpoint would do.
  const addServiceRecord = useCallback(
    (data) => {
      const vehicle = vehicles.find((v) => v.id === data.vehicleId);
      const record = {
        id: nextServiceId(),
        vehicleId: data.vehicleId,
        vehicleReg: vehicle?.registrationNumber || "",
        vehicle: vehicle ? `${vehicle.brand} ${vehicle.model}` : "",
        customerId: data.customerId,
        customer: data.customerName,
        date: data.serviceDate,
        serviceType: data.serviceType,
        cost: Number(data.cost) || 0,
        mechanic: data.mechanic,
        partsReplaced: data.partsReplaced || "",
        partsRepaired: data.partsRepaired || "",
        nextServiceDue: data.nextServiceDue || "",
        remarks: data.remarks || "",
      };
      setServiceRecords((prev) => [record, ...prev]);
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === data.vehicleId
            ? { ...v, currentKm: Number(data.odometer) || v.currentKm, lastServiceDate: data.serviceDate }
            : v
        )
      );
      return record;
    },
    [vehicles]
  );

  // Dashboard-facing derived stats — computed live from the same arrays
  // above, instead of the separate hand-written totals the static dummy
  // data used to have, so newly added records are reflected immediately.
  const overview = useMemo(() => {
    const vehiclesRequiringAttention = vehicles.filter((v) => {
      const status = getVehicleFilterStatus(v.healthScore);
      return status === "Attention Required" || status === "Critical";
    }).length;
    return {
      totalCustomers: customers.length,
      totalVehicles: vehicles.length,
      totalServices: serviceRecords.length,
      vehiclesRequiringAttention,
    };
  }, [customers, vehicles, serviceRecords]);

  const recentServices = useMemo(
    () =>
      [...serviceRecords]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4)
        .map((r) => ({ id: r.id, vehicle: r.vehicle, customer: r.customer, date: r.date, cost: r.cost })),
    [serviceRecords]
  );

  const value = {
    customers,
    vehicles,
    serviceRecords,
    overview,
    recentServices,
    criticalAlerts, // unchanged, hand-authored narrative alerts — not derived
    addCustomer,
    addVehicle,
    addServiceRecord,
    isRegistrationNumberTaken,
    isCustomerEmailTaken,
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}