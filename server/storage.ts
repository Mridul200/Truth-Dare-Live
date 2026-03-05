import { RoomState, Player } from "@shared/schema";

export interface IStorage {
  // Empty, as we use in-memory game state in game.ts
}

export class MemStorage implements IStorage {
  // Empty
}

export const storage = new MemStorage();
