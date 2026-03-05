import { z } from "zod";
import { pgTable, serial } from "drizzle-orm/pg-core";

export const dummyTable = pgTable("dummy", {
  id: serial("id").primaryKey(),
});

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  isOnline: z.boolean().default(true),
  isVideoEnabled: z.boolean().default(false),
  isAudioEnabled: z.boolean().default(false),
});

export type Player = z.infer<typeof playerSchema>;

export const messageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  content: z.string(),
  timestamp: z.number(),
});

export type Message = z.infer<typeof messageSchema>;

export const gameStateSchema = z.enum(["lobby", "playing"]);

export const roomStateSchema = z.object({
  roomId: z.string(),
  hostId: z.string(),
  players: z.array(playerSchema),
  messages: z.array(messageSchema),
  gameState: gameStateSchema,
  currentTurnPlayerId: z.string().nullable(),
  currentAction: z.enum(["truth", "dare"]).nullable(),
  currentQuestion: z.string().nullable(),
  turnStartTime: z.number().nullable(),
  turnDuration: z.number().default(30),
});

export type RoomState = z.infer<typeof roomStateSchema>;
