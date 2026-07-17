import type { NextRequest } from "next/server";
import { z } from "zod";
import { created, handleRoute, ok } from "@/lib/api/http";
import { requireAuthContext } from "@/lib/server-auth";
import {
  createWorkspaceInvite,
  listWorkspaceInvites,
  listWorkspaceMembers,
  removeMember,
  revokeInvite,
} from "@/lib/services/invite.service";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const ctx = await requireAuthContext(request);
    const [members, invites] = await Promise.all([
      listWorkspaceMembers(ctx.userId, ctx.workspaceId),
      listWorkspaceInvites(ctx.userId, ctx.workspaceId).catch(() => []),
    ]);
    return ok({ data: { members, invites, role: ctx.role } });
  });
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]).default("member"),
});

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const ctx = await requireAuthContext(request);
    await enforceRateLimit(request, {
      prefix: "invite:create",
      limit: 20,
      windowMs: 60_000,
      identity: ctx.userId,
    });
    const body = inviteSchema.parse(await request.json());
    const data = await createWorkspaceInvite({
      userId: ctx.userId,
      workspaceId: ctx.workspaceId,
      email: body.email,
      role: body.role,
      inviterName: ctx.username,
    });
    return created({ data, message: "Invite created" });
  });
}

const removeSchema = z.object({
  memberUserId: z.string().min(1),
});

export async function DELETE(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const ctx = await requireAuthContext(request);
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get("inviteId");
    if (inviteId) {
      await revokeInvite(ctx.userId, ctx.workspaceId, inviteId);
      return ok({ message: "Invite revoked" });
    }
    const body = removeSchema.parse(await request.json());
    await removeMember({
      actorId: ctx.userId,
      workspaceId: ctx.workspaceId,
      memberUserId: body.memberUserId,
    });
    return ok({ message: "Member removed" });
  });
}
