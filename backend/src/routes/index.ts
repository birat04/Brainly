import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { contentRouter } from "../modules/content/content.routes";

export const routerV1 = Router();

routerV1.use("/auth", authRouter);
routerV1.use("/content", contentRouter);

