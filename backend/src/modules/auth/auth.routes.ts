import { Router } from "express";
import { signupController, signinController } from "./auth.controller";
import { signupValidation, signinValidation } from "./auth.validation";
import { validate } from "../../middleware/validate";

export const authRouter = Router();

authRouter.post("/signup", signupValidation, validate, signupController);
authRouter.post("/signin", signinValidation, validate, signinController);

