import { createLogger, format, transports } from "winston";
import { env } from "./env";

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

export const logger = createLogger({
  level: env.logLevel,
  format: combine(colorize(), timestamp(), errors({ stack: true }), logFormat),
  transports: [new transports.Console()],
});

