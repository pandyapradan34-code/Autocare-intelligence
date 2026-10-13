import { useVehicle } from "../context/VehicleContext";

export default function VehicleSelect() {
  const { vehicles, selectedId, setSelectedId } = useVehicle();
  if (!vehicles.length) return null;
  return (
    <select value={selectedId || ""} onChange={(e) => setSelectedId(e.target.value)} className="border rounded p-2">
      {vehicles.map((v) => <option key={v._id} value={v._id}>{v.brand} {v.model} ({v.vehicleNumber})</option>)}
    </select>
  );
}