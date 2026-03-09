import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "production" | "test";

function getEnv(name: string, required = true): string {
  const value = process.env[name];
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value as string;
}

export const env = {
  nodeEnv: (process.env.NODE_ENV || "development") as NodeEnv,
  port: parseInt(process.env.PORT || "3000", 10),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/brainly",
  jwt: {
    secret: getEnv("JWT_PASSWORD"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  },
  logLevel: process.env.LOG_LEVEL || "info",
};

