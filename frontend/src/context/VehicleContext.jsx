import { createContext, useContext, useEffect, useState, useCallback } from "react";
import useApi from "../hooks/useApi";

const VehicleCtx = createContext(null);
export const useVehicle = () => useContext(VehicleCtx);

export function VehicleProvider({ children }) {
  const api = useApi();
  const [vehicles, setVehicles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/vehicles");
      const list = Array.isArray(res.data) ? res.data : [];
      setVehicles(list);

      setSelectedId((current) => {
        if (current && list.some((v) => v._id === current || v.id === current)) {
          return current;
        }
        return list[0]?._id || list[0]?.id || null;
      });
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setError(err?.response?.data?.message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const selectedVehicle = vehicles.find((v) => (v._id || v.id) === selectedId) || vehicles[0] || null;

  return (
    <VehicleCtx.Provider
      value={{
        vehicles,
        selectedId: selectedVehicle?._id || selectedVehicle?.id || null,
        setSelectedId,
        selectedVehicle,
        selected: selectedVehicle,
        loading,
        error,
        reloadVehicles: loadVehicles,
      }}
    >
      {children}
    </VehicleCtx.Provider>
  );
}