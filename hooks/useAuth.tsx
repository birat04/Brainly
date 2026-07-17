"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authAPI, type SignInPayload, type SignUpPayload } from "@/lib/api";
import { clearAuthToken, setAuthToken } from "@/lib/utils";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (data: SignInPayload) => Promise<void>;
  signup: (data: SignUpPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch {
      const refreshed = await authAPI.refresh();
      if (refreshed?.token) {
        setAuthToken(refreshed.token);
        setUser(refreshed.user);
        return;
      }
      clearAuthToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setAuthToken(token);
        await refreshUser();
        setLoading(false);
        return;
      }
      // Access may live only in HttpOnly cookie — try refresh / me
      const refreshed = await authAPI.refresh();
      if (refreshed?.token) {
        setAuthToken(refreshed.token);
        setUser(refreshed.user);
      }
      setLoading(false);
    };
    void run();
  }, [refreshUser]);

  const signin = useCallback(
    async (data: SignInPayload) => {
      try {
        const response = await authAPI.signin(data);
        setAuthToken(response.token);
        setUser(response.user);
        toast.success("Signed in successfully");
        const next =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("next")
            : null;
        router.push(next && next.startsWith("/") ? next : "/dashboard");
      } catch (error: unknown) {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message?: unknown }).message ?? "")
            : "";
        toast.error(message || "Sign in failed");
        throw error;
      }
    },
    [router],
  );

  const signup = useCallback(
    async (data: SignUpPayload) => {
      try {
        const response = await authAPI.signup(data);
        setAuthToken(response.token);
        setUser(response.user);
        toast.success("Account created successfully!");
        const next =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("next")
            : null;
        router.push(next && next.startsWith("/") ? next : "/dashboard");
      } catch (error: unknown) {
        const message =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
        toast.error(message || "Sign up failed");
        throw error;
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    await authAPI.logout();
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      signin,
      signup,
      logout,
      refreshUser,
      isAuthenticated: !!user,
    }),
    [user, loading, signin, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
