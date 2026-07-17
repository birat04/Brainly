import type { NextRequest } from "next/server";
import { handleRoute, ok } from "@/lib/api/http";
import { requireAuth } from "@/lib/server-auth";
import { deleteAccount } from "@/lib/services/user.service";
import { deleteAccountSchema } from "@/lib/validations";

export async function DELETE(request: NextRequest) {
  return handleRoute(async () => {
    const user = await requireAuth(request);
    const { password } = deleteAccountSchema.parse(await request.json());
    await deleteAccount(user.userId, password);
    return ok({ message: "Account deleted" });
  });
}
