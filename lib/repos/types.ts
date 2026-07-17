import type { ObjectId } from "mongodb";
import type { ContentType } from "@/types";

export type WorkspaceRole = "owner" | "admin" | "member";

export interface UserDoc {
  _id: ObjectId;
  email: string;
  username: string;
  fullName: string;
  password: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceDoc {
  _id: ObjectId;
  name: string;
  slug: string;
  ownerId: ObjectId;
  plan: "free";
  createdAt: Date;
  updatedAt: Date;
}

export interface MembershipDoc {
  _id: ObjectId;
  userId: ObjectId;
  workspaceId: ObjectId;
  role: WorkspaceRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentDoc {
  _id: ObjectId;
  userId: ObjectId;
  /** Present after workspace migration; optional for dual-read of legacy docs. */
  workspaceId?: ObjectId;
  createdBy?: ObjectId;
  title: string;
  description: string | null;
  type: ContentType;
  tags: string[];
  url: string | null;
  body: string | null;
  shareId: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
