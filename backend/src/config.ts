import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_PASSWORD) {
  throw new Error("Missing required environment variable JWT_PASSWORD");
}

export const JWT_PASSWORD = process.env.JWT_PASSWORD;
export const PORT = parseInt(process.env.PORT ?? "3000", 10);
