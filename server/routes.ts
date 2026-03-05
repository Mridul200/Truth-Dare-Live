import type { Express } from "express";
import type { Server } from "http";
import { setupWebSockets } from "./game";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Simple health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Attach WebSocket server logic
  setupWebSockets(httpServer);

  return httpServer;
}
