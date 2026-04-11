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

export interface Content {
  id: string;
  userId: string;
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

export interface ShareLink {
  id: string;
  contentId: string;
  shareId: string;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalContent: number;
  sharedContent: number;
  totalViews: number;
}

export interface SharedContentPublic extends Omit<Content, "userId"> {
  author: {
    username: string;
    fullName: string;
    avatar?: string | null;
  } | null;
}
