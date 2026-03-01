/// <reference path="../../types/express.d.ts" />
import { Request, Response } from "express";
import * as ContentService from "./content.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/response";
import { ApiError } from "../../utils/ApiError";

export const createContentController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) throw new ApiError(401, "Unauthorized");
    const content = await ContentService.createContent(req.userId, req.body);
    return success(res, { content }, 201);
  }
);

export const listContentController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) throw new ApiError(401, "Unauthorized");
    const content = await ContentService.getUserContent(req.userId);
    return success(res, { content });
  }
);

export const deleteContentController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) throw new ApiError(401, "Unauthorized");
    const { contentId } = req.body;
    await ContentService.deleteContent(req.userId, contentId);
    return success(res, { message: "Content deleted" });
  }
);

