import { handleRoute, ok } from "@/lib/api/http";
import { signInUser } from "@/lib/services/auth.service";
import { signInSchema } from "@/lib/validations";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const parsed = signInSchema.parse(await request.json());
    const { token, user, workspaceId } = await signInUser(parsed.identifier, parsed.password);
    return ok({
      token,
      user,
      workspaceId,
      message: "Signed in successfully",
    });
  });
}
