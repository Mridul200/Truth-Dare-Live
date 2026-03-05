import { z } from 'zod';
import { roomStateSchema, messageSchema } from './schema';

export const api = {
  health: {
    method: 'GET' as const,
    path: '/api/health' as const,
    responses: {
      200: z.object({ status: z.string() })
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Socket.io Event Payloads Contract
export const ws = {
  send: {
    createRoom: z.object({ playerName: z.string() }),
    joinRoom: z.object({ roomId: z.string(), playerName: z.string() }),
    startGame: z.object({}),
    endGame: z.object({}),
    nextTurn: z.object({}),
    skipTurn: z.object({}),
    kickPlayer: z.object({ playerId: z.string() }),
    endGame: z.object({}),
    chooseAction: z.object({ action: z.enum(["truth", "dare"]) }),
    sendMessage: z.object({ content: z.string() }),
    toggleMedia: z.object({ video: z.boolean().optional(), audio: z.boolean().optional() }),
    leaveRoom: z.object({}),
    signal: z.object({ targetId: z.string(), signal: z.any() }),
  },
  receive: {
    roomUpdate: roomStateSchema,
    newMessage: messageSchema,
    error: z.object({ message: z.string() }),
    signal: z.object({ fromId: z.string(), signal: z.any() }),
  }
};
