import type { JWTPayload as JosePayload } from "jose";

export type WorkspaceRole = "owner" | "admin" | "member";

export interface JWTPayload extends JosePayload {
  userId: string;
  email: string;
  username: string;
  /** Active workspace; may be absent on legacy tokens until next sign-in. */
  workspaceId?: string;
  role?: WorkspaceRole;
  sessionId?: string;
}
