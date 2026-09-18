// Dummy vehicle data for the logged-in customer's primary vehicle.
// Phase 1: static values only. Phase 2 will source this from a REST API.

export const currentVehicle = {
  id: "veh-001",
  ownerId: "cust-001",
  registrationNumber: "MH12 AB 4521",
  brand: "Honda",
  model: "City VX",
  variant: "Petrol CVT",
  manufacturingYear: 2020,
  purchaseDate: "2020-03-14",
  fuelType: "Petrol",
  engineType: "1.5L i-VTEC, 4-Cylinder",
  currentKm: 82450,
  previousOwners: 1,
  accidentHistory: "1 minor accident (rear bumper, repaired Jun 2022)",
  insuranceValidTill: "2027-03-13",
  pucValidTill: "2026-12-05",
  lastServiceDate: "2026-08-12",
  lastServiceKm: 82450,
  nextServiceDueKm: 4500,
  nextServiceDueMonths: 3,
  image: "car-sedan",
  color: "Lunar Silver Metallic",
};

export const vehicleSummary = {
  name: "Honda City VX",
  yearLabel: "2020 Model",
  currentMileage: "82,450 km",
  lastService: "12 Aug 2026",
  nextService: "4,500 km / 3 months",
};
