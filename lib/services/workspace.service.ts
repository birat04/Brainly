import type { ObjectId } from "mongodb";
import { AppError } from "@/lib/errors";
import { parseObjectId } from "@/lib/object-id";
import {
  contentsCollection,
  membershipsCollection,
  workspacesCollection,
} from "@/lib/repos/collections";
import type { MembershipDoc, WorkspaceDoc, WorkspaceRole } from "@/lib/repos/types";

function slugify(base: string): string {
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return cleaned || "workspace";
}

async function uniqueSlug(base: string): Promise<string> {
  const workspaces = await workspacesCollection();
  let slug = slugify(base);
  let n = 0;
  while (await workspaces.findOne({ slug })) {
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
  return slug;
}

export async function createPersonalWorkspace(userId: ObjectId, username: string) {
  const workspaces = await workspacesCollection();
  const memberships = await membershipsCollection();
  const now = new Date();
  const slug = await uniqueSlug(username);
  const workspace: Omit<WorkspaceDoc, "_id"> = {
    name: `${username}'s workspace`,
    slug,
    ownerId: userId,
    plan: "free",
    createdAt: now,
    updatedAt: now,
  };
  const result = await workspaces.insertOne(workspace as WorkspaceDoc);
  const membership: Omit<MembershipDoc, "_id"> = {
    userId,
    workspaceId: result.insertedId,
    role: "owner",
    createdAt: now,
    updatedAt: now,
  };
  await memberships.insertOne(membership as MembershipDoc);
  return { workspaceId: result.insertedId, role: "owner" as const };
}

/** Ensure user has a personal workspace; backfill content.workspaceId for legacy rows. */
export async function ensurePersonalWorkspace(userId: string, username: string) {
  const uid = parseObjectId(userId, "userId");
  const memberships = await membershipsCollection();
  const existing = await memberships.findOne({ userId: uid }, { sort: { createdAt: 1 } });

  let workspaceId: ObjectId;
  let role: WorkspaceRole;

  if (existing) {
    workspaceId = existing.workspaceId;
    role = existing.role;
  } else {
    const created = await createPersonalWorkspace(uid, username);
    workspaceId = created.workspaceId;
    role = created.role;
  }

  const contents = await contentsCollection();
  await contents.updateMany(
    { userId: uid, workspaceId: { $exists: false } },
    { $set: { workspaceId, createdBy: uid } },
  );

  return { workspaceId: workspaceId.toString(), role };
}

export async function requireWorkspaceMember(
  userId: string,
  workspaceId: string,
  minRole: WorkspaceRole = "member",
) {
  const uid = parseObjectId(userId, "userId");
  const wid = parseObjectId(workspaceId, "workspaceId");
  const memberships = await membershipsCollection();
  const membership = await memberships.findOne({ userId: uid, workspaceId: wid });
  if (!membership) {
    throw AppError.forbidden("Not a member of this workspace");
  }

  const rank: Record<WorkspaceRole, number> = { member: 1, admin: 2, owner: 3 };
  if (rank[membership.role] < rank[minRole]) {
    throw AppError.forbidden("Insufficient workspace permissions");
  }

  return membership;
}

export async function listWorkspacesForUser(userId: string) {
  const uid = parseObjectId(userId, "userId");
  const memberships = await membershipsCollection();
  const workspaces = await workspacesCollection();
  const mine = await memberships.find({ userId: uid }).toArray();
  const ids = mine.map((m) => m.workspaceId);
  if (ids.length === 0) return [];

  const docs = await workspaces.find({ _id: { $in: ids } }).toArray();
  const byId = new Map(docs.map((d) => [d._id.toString(), d]));

  return mine
    .map((m) => {
      const ws = byId.get(m.workspaceId.toString());
      if (!ws) return null;
      return {
        id: ws._id.toString(),
        name: ws.name,
        slug: ws.slug,
        plan: ws.plan,
        role: m.role,
        createdAt: ws.createdAt.toISOString(),
      };
    })
    .filter(Boolean);
}

export async function deleteUserWorkspacesCascade(userId: ObjectId) {
  const memberships = await membershipsCollection();
  const workspaces = await workspacesCollection();
  const contents = await contentsCollection();

  const owned = await workspaces.find({ ownerId: userId }).toArray();
  for (const ws of owned) {
    const memberCount = await memberships.countDocuments({ workspaceId: ws._id });
    if (memberCount <= 1) {
      await contents.deleteMany({ workspaceId: ws._id });
      await memberships.deleteMany({ workspaceId: ws._id });
      await workspaces.deleteOne({ _id: ws._id });
    } else {
      await memberships.deleteOne({ workspaceId: ws._id, userId });
      // Transfer ownership to another owner/admin if needed — keep simple: promote oldest admin/member
      const next = await memberships.findOne(
        { workspaceId: ws._id },
        { sort: { createdAt: 1 } },
      );
      if (next) {
        await memberships.updateOne({ _id: next._id }, { $set: { role: "owner", updatedAt: new Date() } });
        await workspaces.updateOne(
          { _id: ws._id },
          { $set: { ownerId: next.userId, updatedAt: new Date() } },
        );
      }
    }
  }

  await memberships.deleteMany({ userId });
  await contents.deleteMany({ userId, workspaceId: { $exists: false } });
}
