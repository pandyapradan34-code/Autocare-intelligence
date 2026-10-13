import { useCallback, useEffect, useState } from "react";
import useApi from "./useApi";

export default function useAdminData() {
  const api = useApi();

  const [stats, setStats] = useState({});
  const [customers, setCustomers] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, customersResponse] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/customers"),
      ]);

      const statsData = statsResponse.data?.data ?? statsResponse.data ?? {};
      const customersData =
        customersResponse.data?.data ?? customersResponse.data ?? {};

      setStats(
        statsData && typeof statsData === "object" && !Array.isArray(statsData)
          ? statsData
          : {}
      );

      setCustomers(
        Array.isArray(customersData)
          ? customersData
          : Array.isArray(customersData.customers)
            ? customersData.customers
            : []
      );

      setRecentServices(
        Array.isArray(statsData.recentServices)
          ? statsData.recentServices
          : []
      );

      setCriticalAlerts(
        Array.isArray(statsData.criticalAlerts)
          ? statsData.criticalAlerts
          : []
      );
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load admin dashboard data."
      );

      setStats({});
      setCustomers([]);
      setRecentServices([]);
      setCriticalAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return {
    stats,
    customers,
    recentServices,
    criticalAlerts,
    loading,
    error,
    refetch: fetchAdminData,
  };
}
