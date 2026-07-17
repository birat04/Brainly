import { handleRoute, ok } from "@/lib/api/http";
import { getPublicByShareId } from "@/lib/services/content.service";

type Params = { params: Promise<{ shareId: string }> };

export async function GET(_request: Request, { params }: Params) {
  return handleRoute(async () => {
    const { shareId } = await params;
    const data = await getPublicByShareId(shareId);
    return ok({ data });
  });
}
