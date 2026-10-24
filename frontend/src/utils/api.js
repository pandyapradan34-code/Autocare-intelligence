// Demo API adapter: keeps the existing screens and workflows working without a server.
// Changes live in memory for the current browser session only and reset on refresh.
import { customers as seedCustomers } from '../data/customerData';
import { vehicles as seedVehicles } from '../data/vehiclesData';
import { serviceRecords as seedServices, mechanicOptions } from '../data/serviceRecordsData';
import { serviceHistory } from '../data/serviceHistoryData';

let customers = seedCustomers.map((c, i) => ({ id: i + 1, ...c, status: (c.status || 'Active').toLowerCase(), created_at: c.joinedDate || '2024-01-01' }));
let vehicles = seedVehicles.map((v, i) => ({ id: i + 1, customer_id: Number(String(v.ownerId).replace('cust-','')) || 1, owner_name: v.ownerName, registration_number: v.registrationNumber, brand: v.brand, model: v.model, manufacturing_year: v.manufacturingYear, current_km: v.currentKm, health_score: v.healthScore, health_status: v.healthStatus, insurance_valid_till: '2027-03-13', last_service_date: v.lastServiceDate, ...v }));
let services = seedServices.map((s, i) => ({ id: i + 1, vehicle_id: i + 1, customer_id: i + 1, vehicle_reg: s.vehicleReg, registration_number: s.vehicleReg, vehicle: s.vehicle, brand: vehicles[i]?.brand || s.vehicle.split(' ')[0], model: s.vehicle.split(' ').slice(1).join(' '), customer: s.customer, customer_name: s.customer, mechanic_name: s.mechanic, service_date: s.date, date: s.date, service_type: s.serviceType, cost: s.cost, mechanic: s.mechanic, remarks: s.remarks, odometer: vehicles[i]?.current_km || 0, parts: [], ...s }));
let notifications = [{ id: 1, title: 'Vehicle service record updated', message: 'A sample service record is available in your demo dashboard.', created_at: new Date().toISOString(), read_at: null }];
let nextCustomerId = 20, nextVehicleId = 20, nextServiceId = 100;
const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
const readBody = (options) => { try { return JSON.parse(options?.body || '{}'); } catch { return {}; } };
const vehicleRow = (v) => ({ ...v, registration_number: v.registration_number || v.registrationNumber, current_km: v.current_km ?? v.currentKm ?? 0, health_score: v.health_score ?? v.healthScore ?? 78, owner_name: v.owner_name || v.ownerName || customers.find(c => c.id === Number(v.customer_id))?.name || 'Demo Customer', customer_id: Number(v.customer_id ?? v.ownerId?.replace('cust-','') ?? 1), manufacturing_year: v.manufacturing_year ?? v.manufacturingYear, purchase_date: v.purchase_date ?? v.purchaseDate, fuel_type: v.fuel_type ?? v.fuelType, engine_type: v.engine_type ?? v.engineType, previous_owners: v.previous_owners ?? v.previousOwners, insurance_valid_till: v.insurance_valid_till ?? v.insuranceValidTill, puc_valid_till: v.puc_valid_till ?? v.pucValidTill, accident_history: v.accident_history ?? v.accidentHistory, color: v.color || 'Lunar Silver Metallic' });

export async function apiFetch(input, options = {}) {
  const url = new URL(typeof input === 'string' ? input : input.url, window.location.origin);
  const path = url.pathname.replace(/^\/api/, '');
  const method = (options.method || 'GET').toUpperCase();
  const body = readBody(options);
  let data = null;

  if (path === '/customers' && method === 'GET') data = customers;
  else if (path === '/customers' && method === 'POST') {
    const row = { id: ++nextCustomerId, name: body.name || 'Demo Customer', email: body.email || '', phone: body.phone || '', status: 'active', created_at: new Date().toISOString(), vehicleCount: 0 };
    customers = [row, ...customers]; data = row;
  } else if (path === '/vehicles' && method === 'GET') {
    const reg = url.searchParams.get('registration'); data = vehicles.filter(v => !reg || (v.registration_number || v.registrationNumber) === reg).map(vehicleRow);
  } else if (path === '/vehicles' && method === 'POST') {
    const owner = customers.find(c => c.id === Number(body.customerId)) || customers[0];
    const row = vehicleRow({ id: ++nextVehicleId, customer_id: owner?.id || 1, owner_name: owner?.name || 'Demo Customer', registration_number: body.registrationNumber || 'DEMO-0001', brand: body.brand || 'Demo', model: body.model || 'Vehicle', manufacturing_year: Number(body.manufacturingYear) || 2022, current_km: Number(body.currentKm) || 0, health_score: 100, insurance_valid_till: '', last_service_date: null });
    vehicles = [row, ...vehicles]; data = row;
  } else if (path === '/service-records' && method === 'GET') {
    const vehicleId = url.searchParams.get('vehicleId');
    if (vehicleId && Number(vehicleId) === 1) data = serviceHistory.map((r, i) => ({ id: r.id || i + 1, vehicle_id: 1, service_date: r.date, date: r.date, service_type: r.serviceType, cost: r.cost, odometer: r.odometer, remarks: r.mechanicRemarks, parts: [...(r.partsReplaced || []).map(name => ({ name, action: 'replaced' })), ...(r.partsRepaired || []).map(name => ({ name, action: 'repaired' }))], ...r }));
    else data = services.filter(s => !vehicleId || Number(s.vehicle_id) === Number(vehicleId));
  } else if (path === '/service-records' && method === 'POST') {
    const vehicle = vehicles.find(v => Number(v.id) === Number(body.vehicleId)) || vehicles[0];
    const customer = customers.find(c => Number(c.id) === Number(body.customerId)) || customers[0];
    const row = { id: ++nextServiceId, vehicle_id: Number(vehicle?.id), customer_id: Number(customer?.id), vehicle_reg: vehicle?.registration_number, registration_number: vehicle?.registration_number, brand: vehicle?.brand || '', model: vehicle?.model || '', vehicle: `${vehicle?.brand || ''} ${vehicle?.model || ''}`.trim(), customer: customer?.name, customer_name: customer?.name, mechanic_name: body.mechanic || 'Demo Mechanic', service_date: body.serviceDate || new Date().toISOString().slice(0,10), date: body.serviceDate || new Date().toISOString().slice(0,10), service_type: body.serviceType || 'Periodic Service', serviceType: body.serviceType || 'Periodic Service', cost: Number(body.cost) || 0, mechanic: body.mechanic || 'Demo Mechanic', odometer: Number(body.odometer) || vehicle?.current_km || 0, remarks: body.remarks || body.mechanicRemarks || '', parts: body.parts || [], ...body };
    services = [row, ...services];
    if (vehicle) vehicles = vehicles.map(v => Number(v.id) === Number(vehicle.id) ? { ...v, current_km: row.odometer, last_service_date: row.service_date } : v);
    notifications = [{ id: Date.now(), title: 'Service record added', message: `${row.service_type} logged for ${row.vehicle_reg}.`, created_at: new Date().toISOString(), read_at: null }, ...notifications];
    data = { success: true, record: row, ...row, health: { score: Number(vehicle?.health_score || vehicle?.healthScore || 78), status: vehicle?.health_status || vehicle?.healthStatus || 'Good', remainingLife: { yearsLow: 3, yearsHigh: 5 } } };
  } else if (path === '/mechanics' && method === 'GET') data = mechanicOptions.map((name, i) => ({ id: i + 1, name }));
  else if (path === '/customer/my-vehicles' && method === 'GET') data = vehicles.filter(v => Number(v.customer_id) === 1).map(vehicleRow);
  else if (path === '/customer/my-services' && method === 'GET') data = services.filter(s => Number(s.vehicle_id) === 1);
  else if (path === '/customer/my-notifications' && method === 'GET') data = notifications;
  else if (/^\/customer\/my-notifications\/\d+\/read$/.test(path) && method === 'PATCH') {
    const id = Number(path.split('/')[3]); notifications = notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n); data = { success: true };
  } else if (path === '/users/profile' && method === 'PATCH') data = { ...body, role: body.role || 'customer' };
  else if (/^\/vehicles\/\d+\/alert-owner$/.test(path) && method === 'POST') {
    notifications = [{ id: Date.now(), title: body.title || 'Vehicle alert', message: body.message || '', created_at: new Date().toISOString(), read_at: null }, ...notifications]; data = { success: true };
  } else if (path === '/reports/summary' && method === 'GET') data = { customers: customers.length, vehicles: vehicles.length, services: services.length, averageHealth: Math.round(vehicles.reduce((a,v) => a + Number(v.health_score || v.healthScore || 0), 0) / Math.max(vehicles.length, 1)), maintenanceSpend: services.reduce((a,s) => a + Number(s.cost || 0), 0) };
  else data = [];

  return jsonResponse(data);
}
