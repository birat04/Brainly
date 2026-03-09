import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { contentRouter } from "../modules/content/content.routes";
import { shareRouter } from "../modules/share/share.routes";

export const routerV1 = Router();

routerV1.use("/auth", authRouter);
routerV1.use("/content", contentRouter);
routerV1.use("/brain", shareRouter);

