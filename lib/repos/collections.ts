import type { Collection } from "mongodb";
import { getDatabase } from "@/lib/db";
import type { ContentDoc, MembershipDoc, UserDoc, WorkspaceDoc } from "@/lib/repos/types";
import type { SessionDoc } from "@/lib/repos/session-types";

export async function usersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDatabase();
  return db.collection<UserDoc>("users");
}

export async function contentsCollection(): Promise<Collection<ContentDoc>> {
  const db = await getDatabase();
  return db.collection<ContentDoc>("contents");
}

export async function workspacesCollection(): Promise<Collection<WorkspaceDoc>> {
  const db = await getDatabase();
  return db.collection<WorkspaceDoc>("workspaces");
}

export async function membershipsCollection(): Promise<Collection<MembershipDoc>> {
  const db = await getDatabase();
  return db.collection<MembershipDoc>("memberships");
}

export async function sessionsCollection(): Promise<Collection<SessionDoc>> {
  const db = await getDatabase();
  return db.collection<SessionDoc>("sessions");
}
