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
import { authAPI, type SignUpPayload } from "@/lib/api";
import { clearAuthToken, setAuthToken } from "@/lib/utils";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (identifier: string, password: string) => Promise<void>;
  signup: (data: SignUpPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch {
      clearAuthToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      setAuthToken(token);
      await refreshUser();
      setLoading(false);
    };
    void run();
  }, [refreshUser]);

  const signin = useCallback(
    async (identifier: string, password: string) => {
      try {
        const response = await authAPI.signin({ identifier, password });
        setAuthToken(response.token);
        setUser(response.user);
        toast.success("Welcome back!");
        router.push("/dashboard");
      } catch (error: unknown) {
        const message =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
            : undefined;
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
        router.push("/dashboard");
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

  const logout = useCallback(() => {
    clearAuthToken();
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
