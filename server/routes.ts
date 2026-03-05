import type { Express } from "express";
import type { Server } from "http";
import { setupSocketIO } from "./game";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  setupSocketIO(httpServer);

  return httpServer;
}
