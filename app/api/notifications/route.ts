import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/server-auth";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notification.service";
import { assertSameOrigin } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "1";
    const [data, unreadCount] = await Promise.all([
      listNotifications(user.userId, { unreadOnly }),
      countUnreadNotifications(user.userId),
    ]);
    return ok({ data, unreadCount });
  });
}

export async function PATCH(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const user = await requireAuth(request);
    const body = (await request.json().catch(() => ({}))) as {
      id?: string;
      all?: boolean;
    };
    if (body.all) {
      await markAllNotificationsRead(user.userId);
      return ok({ message: "All notifications marked read" });
    }
    if (!body.id) {
      return ok({ message: "Nothing to update" });
    }
    await markNotificationRead(user.userId, body.id);
    return ok({ message: "Notification marked read" });
  });
}
