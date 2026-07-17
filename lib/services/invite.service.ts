import { randomBytes } from "crypto";
import { AppError } from "@/lib/errors";
import { parseObjectId } from "@/lib/object-id";
import {
  invitesCollection,
  membershipsCollection,
  usersCollection,
  workspacesCollection,
} from "@/lib/repos/collections";
import type { WorkspaceRole } from "@/lib/repos/types";
import { requireWorkspaceMember } from "@/lib/services/workspace.service";
import { createNotification } from "@/lib/services/notification.service";
import { normalizeLoginIdentifier } from "@/lib/utils";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

async function sendInviteEmail(params: {
  to: string;
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
  role: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim() || "Cortexly <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(
      `[invite] Email not configured. Invite for ${params.to}: ${params.inviteUrl}`,
    );
    return { sent: false as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `Join ${params.workspaceName} on Cortexly`,
      html: `<p>${params.inviterName} invited you to <strong>${params.workspaceName}</strong> as <strong>${params.role}</strong>.</p>
             <p><a href="${params.inviteUrl}">Accept invite</a></p>
             <p>This link expires in 7 days.</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[invite] Resend failed", text);
    throw AppError.badRequest("Failed to send invite email");
  }
  return { sent: true as const };
}

export async function listWorkspaceMembers(userId: string, workspaceId: string) {
  await requireWorkspaceMember(userId, workspaceId, "member");
  const memberships = await membershipsCollection();
  const users = await usersCollection();
  const wid = parseObjectId(workspaceId, "workspaceId");
  const rows = await memberships.find({ workspaceId: wid }).toArray();
  const userIds = rows.map((r) => r.userId);
  const userDocs = await users
    .find({ _id: { $in: userIds } }, { projection: { password: 0 } })
    .toArray();
  const byId = new Map(userDocs.map((u) => [u._id.toString(), u]));

  return rows.map((m) => {
    const u = byId.get(m.userId.toString());
    return {
      userId: m.userId.toString(),
      role: m.role,
      email: u?.email ?? "",
      username: u?.username ?? "",
      fullName: u?.fullName ?? "",
      avatar: u?.avatar ?? null,
      joinedAt: m.createdAt.toISOString(),
    };
  });
}

export async function listWorkspaceInvites(userId: string, workspaceId: string) {
  await requireWorkspaceMember(userId, workspaceId, "admin");
  const invites = await invitesCollection();
  const docs = await invites
    .find({
      workspaceId: parseObjectId(workspaceId, "workspaceId"),
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
    .sort({ createdAt: -1 })
    .toArray();

  return docs.map((i) => ({
    id: i._id.toString(),
    email: i.email,
    role: i.role,
    status: i.status,
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${i.token}`,
  }));
}

export async function createWorkspaceInvite(params: {
  userId: string;
  workspaceId: string;
  email: string;
  role: Exclude<WorkspaceRole, "owner">;
  inviterName: string;
}) {
  await requireWorkspaceMember(params.userId, params.workspaceId, "admin");
  const email = normalizeLoginIdentifier(params.email).toLowerCase();
  if (!email.includes("@")) throw AppError.badRequest("Valid email required");

  const workspaces = await workspacesCollection();
  const ws = await workspaces.findOne({
    _id: parseObjectId(params.workspaceId, "workspaceId"),
  });
  if (!ws) throw AppError.notFound("Workspace not found");

  const users = await usersCollection();
  const existingUser = await users.findOne({ email });
  if (existingUser) {
    const memberships = await membershipsCollection();
    const already = await memberships.findOne({
      userId: existingUser._id,
      workspaceId: ws._id,
    });
    if (already) throw AppError.conflict("User is already a workspace member");
  }

  const invites = await invitesCollection();
  const pending = await invites.findOne({
    workspaceId: ws._id,
    email,
    status: "pending",
    expiresAt: { $gt: new Date() },
  });
  if (pending) throw AppError.conflict("An invite is already pending for this email");

  const now = new Date();
  const token = randomBytes(24).toString("base64url");
  const result = await invites.insertOne({
    workspaceId: ws._id,
    email,
    role: params.role,
    token,
    invitedBy: parseObjectId(params.userId, "userId"),
    status: "pending",
    expiresAt: new Date(now.getTime() + INVITE_TTL_MS),
    acceptedAt: null,
    acceptedBy: null,
    createdAt: now,
    updatedAt: now,
  } as never);

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`;

  if (existingUser) {
    await createNotification({
      userId: existingUser._id.toString(),
      workspaceId: params.workspaceId,
      type: "workspace_invite",
      title: `Invite to ${ws.name}`,
      body: `${params.inviterName} invited you as ${params.role}.`,
      href: `/invite/${token}`,
      meta: { inviteId: result.insertedId.toString(), role: params.role },
    });
  }

  const emailResult = await sendInviteEmail({
    to: email,
    workspaceName: ws.name,
    inviterName: params.inviterName,
    inviteUrl,
    role: params.role,
  });

  return {
    id: result.insertedId.toString(),
    email,
    role: params.role,
    inviteUrl,
    emailSent: emailResult.sent,
    expiresAt: new Date(now.getTime() + INVITE_TTL_MS).toISOString(),
  };
}

export async function revokeInvite(userId: string, workspaceId: string, inviteId: string) {
  await requireWorkspaceMember(userId, workspaceId, "admin");
  const invites = await invitesCollection();
  const result = await invites.updateOne(
    {
      _id: parseObjectId(inviteId),
      workspaceId: parseObjectId(workspaceId, "workspaceId"),
      status: "pending",
    },
    { $set: { status: "revoked", updatedAt: new Date() } },
  );
  if (result.matchedCount === 0) throw AppError.notFound("Invite not found");
}

export async function getInviteByToken(token: string) {
  const invites = await invitesCollection();
  const invite = await invites.findOne({ token });
  if (!invite) throw AppError.notFound("Invite not found");

  if (invite.status !== "pending" || invite.expiresAt < new Date()) {
    if (invite.status === "pending") {
      await invites.updateOne({ _id: invite._id }, { $set: { status: "expired", updatedAt: new Date() } });
    }
    throw AppError.badRequest("This invite is no longer valid");
  }

  const workspaces = await workspacesCollection();
  const ws = await workspaces.findOne({ _id: invite.workspaceId });
  return {
    id: invite._id.toString(),
    email: invite.email,
    role: invite.role,
    workspaceId: invite.workspaceId.toString(),
    workspaceName: ws?.name ?? "Workspace",
    expiresAt: invite.expiresAt.toISOString(),
  };
}

export async function acceptInvite(params: {
  token: string;
  userId: string;
  userEmail: string;
}) {
  const invites = await invitesCollection();
  const invite = await invites.findOne({ token: params.token });
  if (!invite) throw AppError.notFound("Invite not found");
  if (invite.status !== "pending" || invite.expiresAt < new Date()) {
    throw AppError.badRequest("This invite is no longer valid");
  }

  const email = normalizeLoginIdentifier(params.userEmail).toLowerCase();
  if (email !== invite.email) {
    throw AppError.forbidden(`Sign in as ${invite.email} to accept this invite`);
  }

  const memberships = await membershipsCollection();
  const existing = await memberships.findOne({
    userId: parseObjectId(params.userId, "userId"),
    workspaceId: invite.workspaceId,
  });

  if (!existing) {
    const now = new Date();
    await memberships.insertOne({
      userId: parseObjectId(params.userId, "userId"),
      workspaceId: invite.workspaceId,
      role: invite.role,
      createdAt: now,
      updatedAt: now,
    } as never);
  }

  await invites.updateOne(
    { _id: invite._id },
    {
      $set: {
        status: "accepted",
        acceptedAt: new Date(),
        acceptedBy: parseObjectId(params.userId, "userId"),
        updatedAt: new Date(),
      },
    },
  );

  const workspaces = await workspacesCollection();
  const ws = await workspaces.findOne({ _id: invite.workspaceId });

  // Notify inviter
  await createNotification({
    userId: invite.invitedBy.toString(),
    workspaceId: invite.workspaceId.toString(),
    type: "invite_accepted",
    title: "Invite accepted",
    body: `${email} joined ${ws?.name ?? "your workspace"} as ${invite.role}.`,
    href: "/dashboard/team",
  });

  return {
    workspaceId: invite.workspaceId.toString(),
    workspaceName: ws?.name ?? "Workspace",
    role: invite.role,
  };
}

export async function removeMember(params: {
  actorId: string;
  workspaceId: string;
  memberUserId: string;
}) {
  await requireWorkspaceMember(params.actorId, params.workspaceId, "admin");
  if (params.actorId === params.memberUserId) {
    throw AppError.badRequest("You cannot remove yourself");
  }

  const memberships = await membershipsCollection();
  const wid = parseObjectId(params.workspaceId, "workspaceId");
  const target = await memberships.findOne({
    userId: parseObjectId(params.memberUserId, "userId"),
    workspaceId: wid,
  });
  if (!target) throw AppError.notFound("Member not found");
  if (target.role === "owner") {
    throw AppError.forbidden("Cannot remove the workspace owner");
  }

  await memberships.deleteOne({ _id: target._id });
}
