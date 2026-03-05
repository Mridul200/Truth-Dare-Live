import { z } from "zod";
import { pgTable, serial } from "drizzle-orm/pg-core";

// Dummy table to satisfy the database setup requirements if needed
export const dummyTable = pgTable("dummy", {
  id: serial("id").primaryKey(),
});

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Player = z.infer<typeof playerSchema>;

export const gameStateSchema = z.enum(["lobby", "playing"]);

export const roomStateSchema = z.object({
  roomId: z.string(),
  hostId: z.string(),
  players: z.array(playerSchema),
  gameState: gameStateSchema,
  currentTurnPlayerId: z.string().nullable(),
  currentAction: z.enum(["truth", "dare"]).nullable(),
  currentQuestion: z.string().nullable(),
});

export type RoomState = z.infer<typeof roomStateSchema>;
