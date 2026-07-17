import { created, handleRoute } from "@/lib/api/http";
import { signUpUser } from "@/lib/services/auth.service";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await request.json();
    const validated = signUpSchema.parse(body);
    const { token, user, workspaceId } = await signUpUser({
      email: validated.email,
      username: validated.username,
      fullName: validated.fullName,
      password: validated.password,
    });
    return created({
      token,
      user,
      workspaceId,
      message: "Account created successfully",
    });
  });
}
