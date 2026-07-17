import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/server-auth";
import { changePassword } from "@/lib/services/user.service";
import { changePasswordSchema } from "@/lib/validations";

export async function PUT(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireAuth(request);
    const validated = changePasswordSchema.parse(await request.json());
    await changePassword(user.userId, validated.currentPassword, validated.newPassword);
    return ok({ message: "Password changed successfully" });
  });
}
