import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAuthToken, setAuthToken } from "@/lib/utils";

const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post(
      `${baseURL}/api/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const token = response.data?.token as string | undefined;
    if (token) {
      setAuthToken(token);
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const url = original?.url ?? "";

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      original &&
      !original._retry &&
      !url.includes("/api/auth/signin") &&
      !url.includes("/api/auth/signup") &&
      !url.includes("/api/auth/refresh") &&
      !url.includes("/api/auth/logout")
    ) {
      original._retry = true;
      refreshPromise = refreshPromise ?? refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      }
      clearAuthToken();
      if (!window.location.pathname.startsWith("/signin")) {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
