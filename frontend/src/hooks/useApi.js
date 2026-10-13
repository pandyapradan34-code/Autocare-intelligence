import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import api, { setTokenGetter } from "../services/api";

export default function useApi() {
  const { getToken } = useAuth();

  useEffect(() => {
    if (getToken) {
      setTokenGetter(getToken);
    }
  }, [getToken]);

  return api;
}

export { api };