import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { RoomState, Player } from "@shared/schema";
import { randomUUID } from "crypto";
import { ws as wsSchema } from "@shared/routes";

// In-memory data
const rooms = new Map<string, RoomState>();
// Map ws connection to { roomId, playerId }
const clientConnections = new Map<WebSocket, { roomId: string, playerId: string }>();

const truths = [
  "What is your biggest fear?",
  "What is the most embarrassing thing you've ever done?",
  "Have you ever lied to get out of trouble?",
  "What's the worst date you've ever been on?",
  "If you could be invisible for a day, what would you do?",
  "What's a secret you've never told anyone?",
  "What is your worst habit?",
  "Who is your secret crush?",
  "What is the most childish thing you still do?",
  "What is the weirdest dream you've ever had?",
  "Have you ever broken the law?",
  "What's the most trouble you've been in at school?",
  "What's your most embarrassing nickname?",
  "If you had to trade lives with someone in this room, who would it be?",
  "What's the grossest food you've ever eaten?"
];

const dares = [
  "Do 10 pushups.",
  "Let the group look through your phone's photo gallery for 1 minute.",
  "Sing the chorus of your favorite song.",
  "Do your best impression of someone in the room.",
  "Talk in a funny accent for the next 3 rounds.",
  "Let someone draw on your face with a pen.",
  "Eat a spoonful of a condiment chosen by the group.",
  "Do a silly dance for 30 seconds.",
  "Post an embarrassing photo on social media.",
  "Call a random contact and sing 'Happy Birthday' to them.",
  "Let the group text someone from your phone.",
  "Hold your breath for as long as you can.",
  "Act like a monkey until your next turn.",
  "Wear your clothes backward for the rest of the game.",
  "Try to juggle 3 items."
];

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function broadcastRoomUpdate(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  const payload = JSON.stringify({
    type: "roomUpdate",
    payload: room
  });

  for (const [client, info] of clientConnections.entries()) {
    if (info.roomId === roomId && client.readyState === WebSocket.OPEN) {
      // Send with ID appended so client knows who they are implicitly? 
      // Actually it's easier to just send the room state. The client can identify itself by `playerName`.
      client.send(payload);
    }
  }
}

export function setupWebSockets(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { type, payload } = message;

        if (type === "createRoom") {
          const parsed = wsSchema.send.createRoom.parse(payload);
          const roomId = generateRoomCode();
          const playerId = randomUUID();
          const newPlayer: Player = { id: playerId, name: parsed.playerName };
          
          const newRoom: RoomState = {
            roomId,
            hostId: playerId,
            players: [newPlayer],
            gameState: "lobby",
            currentTurnPlayerId: null,
            currentAction: null,
            currentQuestion: null
          };
          
          rooms.set(roomId, newRoom);
          clientConnections.set(ws, { roomId, playerId });
          
          broadcastRoomUpdate(roomId);
        }
        else if (type === "joinRoom") {
          const parsed = wsSchema.send.joinRoom.parse(payload);
          const room = rooms.get(parsed.roomId.toUpperCase());
          
          if (!room) {
            ws.send(JSON.stringify({ type: "error", payload: { message: "Room not found" } }));
            return;
          }

          if (room.gameState !== "lobby") {
             ws.send(JSON.stringify({ type: "error", payload: { message: "Game already started" } }));
             return;
          }

          // Check for duplicate name
          if (room.players.some(p => p.name === parsed.playerName)) {
             ws.send(JSON.stringify({ type: "error", payload: { message: "Name already taken in this room" } }));
             return;
          }

          const playerId = randomUUID();
          const newPlayer: Player = { id: playerId, name: parsed.playerName };
          
          room.players.push(newPlayer);
          clientConnections.set(ws, { roomId: room.roomId, playerId });
          
          broadcastRoomUpdate(room.roomId);
        }
        else if (type === "startGame") {
          const info = clientConnections.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomId);
          if (!room || room.hostId !== info.playerId) return;

          room.gameState = "playing";
          room.currentTurnPlayerId = room.players[Math.floor(Math.random() * room.players.length)].id;
          room.currentAction = null;
          room.currentQuestion = null;
          
          broadcastRoomUpdate(room.roomId);
        }
        else if (type === "nextTurn") {
          const info = clientConnections.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomId);
          if (!room || room.hostId !== info.playerId) return;

          room.currentTurnPlayerId = room.players[Math.floor(Math.random() * room.players.length)].id;
          room.currentAction = null;
          room.currentQuestion = null;
          
          broadcastRoomUpdate(room.roomId);
        }
        else if (type === "chooseAction") {
          const info = clientConnections.get(ws);
          if (!info) return;
          const room = rooms.get(info.roomId);
          if (!room || room.currentTurnPlayerId !== info.playerId) return;

          const parsed = wsSchema.send.chooseAction.parse(payload);
          room.currentAction = parsed.action;
          
          if (parsed.action === "truth") {
             room.currentQuestion = truths[Math.floor(Math.random() * truths.length)];
          } else {
             room.currentQuestion = dares[Math.floor(Math.random() * dares.length)];
          }
          
          broadcastRoomUpdate(room.roomId);
        }
        else if (type === "leaveRoom") {
          handleLeave(ws);
        }
        
      } catch (err) {
        console.error("WS Message Error", err);
        ws.send(JSON.stringify({ type: "error", payload: { message: "Invalid request" } }));
      }
    });

    ws.on("close", () => {
      handleLeave(ws);
    });
  });

  function handleLeave(ws: WebSocket) {
    const info = clientConnections.get(ws);
    if (info) {
      clientConnections.delete(ws);
      const room = rooms.get(info.roomId);
      if (room) {
        room.players = room.players.filter(p => p.id !== info.playerId);
        if (room.players.length === 0) {
          rooms.delete(info.roomId);
        } else {
          if (room.hostId === info.playerId) {
            room.hostId = room.players[0].id; // Reassign host
          }
          if (room.currentTurnPlayerId === info.playerId && room.gameState === "playing") {
            room.currentTurnPlayerId = room.players[Math.floor(Math.random() * room.players.length)].id;
            room.currentAction = null;
            room.currentQuestion = null;
          }
          broadcastRoomUpdate(info.roomId);
        }
      }
    }
  }
}
