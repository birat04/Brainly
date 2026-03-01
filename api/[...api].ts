import type { VercelRequest, VercelResponse } from "@vercel/node";
import { app } from "../backend/src/app";

// Vercel serverless function - routes all /api requests to Express app
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};
