import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  createContentController,
  listContentController,
  deleteContentController,
} from "./content.controller";
import { createContentValidation } from "./content.validation";
import { validate } from "../../middleware/validate";

export const contentRouter = Router();

contentRouter.use(authMiddleware);

contentRouter.get("/", listContentController);
contentRouter.post("/", createContentValidation, validate, createContentController);
contentRouter.delete("/", deleteContentController);

