export type ContentType = "article" | "link" | "note" | "video" | "image";

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export type WorkspaceRole = "owner" | "admin" | "member";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: WorkspaceRole;
  createdAt: string;
}

export interface Content {
  id: string;
  userId: string;
  workspaceId?: string;
  createdBy?: string;
  title: string;
  description?: string | null;
  type: ContentType;
  tags: string[];
  url?: string | null;
  body?: string | null;
  shareId?: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalContent: number;
  sharedContent: number;
  totalViews: number;
  plan?: string;
  contentLimit?: number | null;
  pastDue?: boolean;
}

export interface BillingStatus {
  configured: boolean;
  plan: string;
  planName: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  usage: {
    content: number;
    contentLimit: number | null;
  };
  canManageBilling: boolean;
  pastDue: boolean;
  plans: Array<{
    id: string;
    name: string;
    description: string;
    priceLabel: string;
    features: string[];
    highlighted: boolean;
    maxContent: number | null;
  }>;
}

export interface SharedContentPublic extends Omit<Content, "userId"> {
  author: {
    username: string;
    fullName: string;
    avatar?: string | null;
  } | null;
}

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  email: string;
  username: string;
  fullName: string;
  avatar?: string | null;
  joinedAt: string;
}

export interface WorkspaceInvite {
  id: string;
  email: string;
  role: Exclude<WorkspaceRole, "owner">;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviteUrl: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  readAt?: string | null;
  workspaceId?: string | null;
  createdAt: string;
}
