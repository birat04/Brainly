import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/server-auth";
import { updateProfile } from "@/lib/services/user.service";
import { updateProfileSchema } from "@/lib/validations";

export async function PUT(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireAuth(request);
    const validated = updateProfileSchema.parse(await request.json());
    await updateProfile(user.userId, user.username, validated);
    return ok({ message: "Profile updated successfully" });
  });
}
