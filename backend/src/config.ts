import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_PASSWORD || !process.env.MONGO_URI) {
  throw new Error("Missing required environment variables (JWT_PASSWORD, MONGO_URI)");
}

export const JWT_PASSWORD = process.env.JWT_PASSWORD;
export const MONGO_URI = process.env.MONGO_URI;
export const PORT = parseInt(process.env.PORT ?? "3000", 10);
