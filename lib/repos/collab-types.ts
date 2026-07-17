import type { ObjectId } from "mongodb";
import type { WorkspaceRole } from "@/lib/repos/types";

export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";

export interface InviteDoc {
  _id: ObjectId;
  workspaceId: ObjectId;
  email: string;
  role: Exclude<WorkspaceRole, "owner">;
  token: string;
  invitedBy: ObjectId;
  status: InviteStatus;
  expiresAt: Date;
  acceptedAt?: Date | null;
  acceptedBy?: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType =
  | "workspace_invite"
  | "invite_accepted"
  | "billing"
  | "system";

export interface NotificationDoc {
  _id: ObjectId;
  userId: ObjectId;
  workspaceId?: ObjectId | null;
  type: NotificationType;
  title: string;
  body: string;
  href?: string | null;
  readAt?: Date | null;
  meta?: Record<string, unknown>;
  createdAt: Date;
}
