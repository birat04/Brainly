import { parseObjectId } from "@/lib/object-id";
import { notificationsCollection } from "@/lib/repos/collections";
import type { NotificationType } from "@/lib/repos/collab-types";
import { AppError } from "@/lib/errors";

export async function createNotification(params: {
  userId: string;
  workspaceId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  href?: string | null;
  meta?: Record<string, unknown>;
}) {
  const notifications = await notificationsCollection();
  const doc = {
    userId: parseObjectId(params.userId, "userId"),
    workspaceId: params.workspaceId
      ? parseObjectId(params.workspaceId, "workspaceId")
      : null,
    type: params.type,
    title: params.title,
    body: params.body,
    href: params.href ?? null,
    readAt: null as Date | null,
    meta: params.meta ?? {},
    createdAt: new Date(),
  };
  const result = await notifications.insertOne(doc as never);
  return { id: result.insertedId.toString(), ...doc };
}

export async function listNotifications(userId: string, opts?: { unreadOnly?: boolean }) {
  const notifications = await notificationsCollection();
  const filter: Record<string, unknown> = {
    userId: parseObjectId(userId, "userId"),
  };
  if (opts?.unreadOnly) filter.readAt = null;

  const docs = await notifications.find(filter).sort({ createdAt: -1 }).limit(50).toArray();
  return docs.map((n) => ({
    id: n._id.toString(),
    type: n.type,
    title: n.title,
    body: n.body,
    href: n.href ?? null,
    readAt: n.readAt ? n.readAt.toISOString() : null,
    workspaceId: n.workspaceId ? n.workspaceId.toString() : null,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notifications = await notificationsCollection();
  const result = await notifications.updateOne(
    {
      _id: parseObjectId(notificationId),
      userId: parseObjectId(userId, "userId"),
    },
    { $set: { readAt: new Date() } },
  );
  if (result.matchedCount === 0) throw AppError.notFound("Notification not found");
}

export async function markAllNotificationsRead(userId: string) {
  const notifications = await notificationsCollection();
  await notifications.updateMany(
    { userId: parseObjectId(userId, "userId"), readAt: null },
    { $set: { readAt: new Date() } },
  );
}

export async function countUnreadNotifications(userId: string) {
  const notifications = await notificationsCollection();
  return notifications.countDocuments({
    userId: parseObjectId(userId, "userId"),
    readAt: null,
  });
}
