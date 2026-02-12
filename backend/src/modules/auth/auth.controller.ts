import { Request, Response } from "express";
import * as AuthService from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { success } from "../../utils/response";

export const signupController = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const { user, token } = await AuthService.signup(username, password);
    return success(
      res,
      { token, user: { id: user._id, username: user.username } },
      201
    );
  }
);

export const signinController = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const { user, token } = await AuthService.signin(username, password);
    return success(res, {
      token,
      user: { id: user._id, username: user.username },
    });
  }
);

