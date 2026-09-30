import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useMemo } from "react";

export default function useApi() {
  const { getToken } = useAuth();

  return useMemo(() => {
    const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
    api.interceptors.request.use(async (config) => {
      const token = await getToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return api;
  }, [getToken]);
}