import { Request, Response } from "express";
import * as ShareService from "./share.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";

export const createShareController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) throw new ApiError(401, "Unauthorized");
  const { share } = req.body as { share?: boolean };

  if (share) {
    const hash = await ShareService.createOrGetShareLink(req.userId);
    return success(res, { message: "Shareable link created", hash });
  } else {
    await ShareService.removeShareLink(req.userId);
    return success(res, { message: "Shareable link removed" });
  }
});

export const getSharedController = asyncHandler(async (req: Request, res: Response) => {
  const hash = req.params.shareLink;
  const result = await ShareService.getSharedContent(hash);
  return success(res, result);
});
