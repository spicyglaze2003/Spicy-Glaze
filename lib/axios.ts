import axios from "axios";
import { config } from "./config";

export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

api.interceptors.request.use((req) => {
  let url = req.url || "";

  // Normalize path so it always routes to /api/...
  if (!url.startsWith("http")) {
    if (!url.startsWith("/api")) {
      url = `/api${url.startsWith("/") ? url : `/${url}`}`;
    }
    // On server-side execution, prepend site origin
    if (typeof window === "undefined") {
      const site = config.siteUrl || "http://localhost:3000";
      url = `${site}${url}`;
    }
  }

  req.url = url;
  return req;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.warn("[API Error]", error.response.status, error.response.data);
    }
    return Promise.reject(error);
  }
);
