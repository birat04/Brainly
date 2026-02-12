import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/db";
import { logger } from "./config/logger";

async function start() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(env.port, () => {
    logger.info(`✅ Server listening on port ${env.port}`);
  });

  const shutdown = async (signal: string) => {
    try {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed");
        await disconnectDB();
        process.exit(0);
      });
    } catch (err) {
      logger.error("Error during shutdown", err as Error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  logger.error("Failed to start server", err as Error);
  process.exit(1);
});

