import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { UserModel } from "../users/user.model";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

export async function signup(username: string, password: string) {
  const existing = await UserModel.findOne({ username });
  if (existing) {
    throw new ApiError(409, "User already exists");
  }

  const user = await UserModel.create({ username, password });

  const payload = { id: String(user._id) };
  const secret: Secret = env.jwt.secret;
  const options: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"] };

  const token = jwt.sign(payload, secret, options);

  return { user, token };
}

export async function signin(username: string, password: string) {
  const user = await UserModel.findOne({ username });
  if (!user) {
    throw new ApiError(403, "Invalid credentials");
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new ApiError(403, "Invalid credentials");
  }

  const payload = { id: String(user._id) };
  const secret: Secret = env.jwt.secret;
  const options: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"] };

  const token = jwt.sign(payload, secret, options);

  return { user, token };
}

