import axiosInstance from "@/lib/axios";
import { clearAuthToken } from "@/lib/utils";
import type { Content, DashboardStats, SharedContentPublic, User } from "@/types";

export interface SignUpPayload {
  email: string;
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface SignInPayload {
  identifier: string;
  password: string;
}

export const authAPI = {
  async signup(data: SignUpPayload) {
    const response = await axiosInstance.post("/api/auth/signup", data);
    return response.data as {
      success: boolean;
      token: string;
      user: User;
      message?: string;
    };
  },

  async signin(data: SignInPayload) {
    try {
      const response = await axiosInstance.post("/api/auth/signin", {
        identifier: data.identifier.trim(),
        password: data.password,
      });

      return response.data as {
        success: boolean;
        token: string;
        user: User;
      };
    } catch (error) {
      const res = error as { response?: { status?: number; data?: { message?: string } } };
      const apiMessage = res.response?.data?.message;
      const message =
        typeof apiMessage === "string" && apiMessage.length > 0
          ? apiMessage
          : res.response?.status === 401
            ? "Invalid email or password."
            : "Sign in failed.";

      throw new Error(message);
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get("/api/auth/me");
    return response.data.data as User;
  },

  logout() {
    if (typeof window === "undefined") return;
    clearAuthToken();
    window.location.href = "/";
  },
};

export const contentAPI = {
  async getAll(filters?: { type?: string; search?: string }): Promise<Content[]> {
    const response = await axiosInstance.get("/api/content", { params: filters });
    return response.data.data as Content[];
  },

  async getSharedList(): Promise<Content[]> {
    const response = await axiosInstance.get("/api/content/shared");
    return response.data.data as Content[];
  },

  async getById(id: string): Promise<Content> {
    const response = await axiosInstance.get(`/api/content/${id}`);
    return response.data.data as Content;
  },

  async create(data: {
    title: string;
    description?: string;
    type: string;
    tags: string[];
    url?: string;
    body?: string;
  }): Promise<Content> {
    const response = await axiosInstance.post("/api/content", data);
    return response.data.data as Content;
  },

  async update(id: string, data: Partial<Content>): Promise<Content> {
    const response = await axiosInstance.put(`/api/content/${id}`, data);
    return response.data.data as Content;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/api/content/${id}`);
  },

  async generateShareLink(
    id: string,
  ): Promise<{ shareId: string; url: string; isPublic: boolean }> {
    const response = await axiosInstance.post(`/api/content/${id}/share`);
    return response.data.data;
  },

  async getShared(shareId: string): Promise<SharedContentPublic> {
    const response = await axiosInstance.get(`/api/brain/${shareId}`);
    return response.data.data as SharedContentPublic;
  },

  async updateShareState(
    id: string,
    body: { isPublic: boolean; revoke?: boolean },
  ): Promise<Content> {
    const response = await axiosInstance.patch(`/api/content/${id}/share`, body);
    return response.data.data as Content;
  },
};

export const statsAPI = {
  async get(): Promise<DashboardStats> {
    const response = await axiosInstance.get("/api/stats");
    return response.data.data as DashboardStats;
  },
};

export const userAPI = {
  async updateProfile(body: {
    fullName: string;
    bio?: string;
    avatar?: string | null;
    username?: string;
  }) {
    const response = await axiosInstance.put("/api/user/profile", body);
    return response.data;
  },

  async changePassword(body: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await axiosInstance.put("/api/user/password", body);
    return response.data;
  },

  async deleteAccount(body: { password: string }) {
    const response = await axiosInstance.delete("/api/user/account", { data: body });
    return response.data;
  },
};
