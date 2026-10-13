import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

let getClerkToken = null;

export const setTokenGetter = (fn) => {
  getClerkToken = fn;
};

api.interceptors.request.use(async (config) => {
  if (getClerkToken) {
    try {
      const token = await getClerkToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn("Could not retrieve Clerk token:", err);
    }
  }
  return config;
});

export default api;
