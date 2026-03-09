import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { createShareController } from "./share.controller";
import { getSharedController } from "./share.controller";

export const shareRouter = Router();

shareRouter.post("/share", authMiddleware, createShareController);
shareRouter.get("/:shareLink", getSharedController);
