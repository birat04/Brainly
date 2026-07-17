import type { ObjectId } from "mongodb";
import type { WorkspaceRole } from "@/lib/repos/types";

export interface SessionDoc {
  _id: ObjectId;
  userId: ObjectId;
  refreshTokenHash: string;
  workspaceId: ObjectId;
  role: WorkspaceRole;
  userAgent?: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
