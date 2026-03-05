import { z } from 'zod';
import { roomStateSchema } from './schema';

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

// WebSocket Event Payloads Contract
export const ws = {
  send: {
    createRoom: z.object({ playerName: z.string() }),
    joinRoom: z.object({ roomId: z.string(), playerName: z.string() }),
    startGame: z.object({}),
    nextTurn: z.object({}),
    chooseAction: z.object({ action: z.enum(["truth", "dare"]) }),
    leaveRoom: z.object({}),
  },
  receive: {
    roomUpdate: roomStateSchema,
    error: z.object({ message: z.string() })
  }
};
