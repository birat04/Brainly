import axiosInstance from "@/lib/axios";
import { clearAuthToken } from "@/lib/utils";
import type {
  AppNotification,
  BillingStatus,
  Content,
  DashboardStats,
  SharedContentPublic,
  User,
  Workspace,
  WorkspaceInvite,
  WorkspaceMember,
} from "@/types";

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
      workspaceId?: string;
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
        workspaceId?: string;
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

  async refresh(): Promise<{ token: string; user: User; workspaceId?: string } | null> {
    try {
      const response = await axiosInstance.post("/api/auth/refresh");
      return response.data as { token: string; user: User; workspaceId?: string };
    } catch {
      return null;
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await axiosInstance.get("/api/auth/me");
    return response.data.data as User;
  },

  async logout() {
    try {
      await axiosInstance.post("/api/auth/logout");
    } catch {
      // ignore — clear local state anyway
    }
    if (typeof window === "undefined") return;
    clearAuthToken();
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

export const workspacesAPI = {
  async list(): Promise<{ data: Workspace[]; activeWorkspaceId: string; role?: string }> {
    const response = await axiosInstance.get("/api/workspaces");
    return {
      data: response.data.data as Workspace[],
      activeWorkspaceId: response.data.activeWorkspaceId as string,
      role: response.data.role as string | undefined,
    };
  },

  async switch(workspaceId: string): Promise<{ token: string; workspaceId: string; role: string }> {
    const response = await axiosInstance.post("/api/workspaces", { workspaceId });
    return {
      token: response.data.token as string,
      workspaceId: response.data.workspaceId as string,
      role: response.data.role as string,
    };
  },
};

export const billingAPI = {
  async status(): Promise<BillingStatus> {
    const response = await axiosInstance.get("/api/billing/status");
    return response.data.data as BillingStatus;
  },

  async checkout(plan: "pro" | "enterprise"): Promise<{ url: string }> {
    const response = await axiosInstance.post("/api/billing/checkout", { plan });
    return response.data.data as { url: string };
  },

  async portal(): Promise<{ url: string }> {
    const response = await axiosInstance.post("/api/billing/portal");
    return response.data.data as { url: string };
  },
};

export const teamAPI = {
  async list(): Promise<{
    members: WorkspaceMember[];
    invites: WorkspaceInvite[];
    role: string;
  }> {
    const response = await axiosInstance.get("/api/workspaces/members");
    return response.data.data as {
      members: WorkspaceMember[];
      invites: WorkspaceInvite[];
      role: string;
    };
  },

  async invite(email: string, role: "admin" | "member" = "member") {
    const response = await axiosInstance.post("/api/workspaces/members", { email, role });
    return response.data.data as WorkspaceInvite & { emailSent: boolean };
  },

  async revokeInvite(inviteId: string) {
    await axiosInstance.delete("/api/workspaces/members", { params: { inviteId } });
  },

  async removeMember(memberUserId: string) {
    await axiosInstance.delete("/api/workspaces/members", { data: { memberUserId } });
  },

  async getInvite(token: string) {
    const response = await axiosInstance.get(`/api/invites/${token}`);
    return response.data.data as {
      id: string;
      email: string;
      role: string;
      workspaceId: string;
      workspaceName: string;
      expiresAt: string;
    };
  },

  async acceptInvite(token: string) {
    const response = await axiosInstance.post(`/api/invites/${token}`);
    return response.data.data as {
      workspaceId: string;
      workspaceName: string;
      role: string;
    };
  },
};

export const notificationsAPI = {
  async list(unreadOnly = false): Promise<{ data: AppNotification[]; unreadCount: number }> {
    const response = await axiosInstance.get("/api/notifications", {
      params: unreadOnly ? { unread: "1" } : undefined,
    });
    return {
      data: response.data.data as AppNotification[],
      unreadCount: response.data.unreadCount as number,
    };
  },

  async markRead(id: string) {
    await axiosInstance.patch("/api/notifications", { id });
  },

  async markAllRead() {
    await axiosInstance.patch("/api/notifications", { all: true });
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
