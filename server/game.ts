import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import { RoomState, Player, Message } from "@shared/schema";
import { randomUUID } from "crypto";
import { ws as wsSchema } from "@shared/routes";

const rooms = new Map<string, RoomState>();
const socketToPlayer = new Map<string, { roomId: string; playerId: string }>();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function setupSocketIO(httpServer: Server) {
  const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("createRoom", (payload) => {
      try {
        const parsed = wsSchema.send.createRoom.parse(payload);
        const roomId = generateRoomCode();
        const playerId = randomUUID();
        const player: Player = { id: playerId, name: parsed.playerName, isOnline: true, isVideoEnabled: false, isAudioEnabled: false };
        
        const room: RoomState = {
          roomId,
          hostId: playerId,
          players: [player],
          messages: [],
          gameState: "lobby",
          phase: "bottleSpinning",
          currentTurnPlayerId: null,
          questionAskerPlayerId: null,
          currentAction: null,
          currentQuestion: null,
          turnStartTime: null,
          turnDuration: 30,
        };
        
        rooms.set(roomId, room);
        socketToPlayer.set(socket.id, { roomId, playerId });
        socket.join(roomId);
        socket.emit("roomUpdate", room);
      } catch (e) {
        socket.emit("error", { message: "Invalid room creation" });
      }
    });

    socket.on("joinRoom", (payload) => {
      try {
        const parsed = wsSchema.send.joinRoom.parse(payload);
        const room = rooms.get(parsed.roomId.toUpperCase());
        if (!room) return socket.emit("error", { message: "Room not found" });
        if (room.players.length >= 15) return socket.emit("error", { message: "Room full" });

        const playerId = randomUUID();
        const player: Player = { id: playerId, name: parsed.playerName, isOnline: true, isVideoEnabled: false, isAudioEnabled: false };
        room.players.push(player);
        socketToPlayer.set(socket.id, { roomId: room.roomId, playerId });
        socket.join(room.roomId);
        io.to(room.roomId).emit("roomUpdate", room);
      } catch (e) {
        socket.emit("error", { message: "Invalid join request" });
      }
    });

    socket.on("startGame", () => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || room.hostId !== info.playerId) return;

      room.gameState = "playing";
      room.phase = "bottleSpinning";
      selectNextPlayer(room);
      io.to(room.roomId).emit("roomUpdate", room);
      setTimeout(() => {
        if (room) {
          room.phase = "choosing";
          io.to(room.roomId).emit("roomUpdate", room);
        }
      }, 3000);
    });

    socket.on("spinBottle", () => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room) return;

      room.phase = "bottleSpinning";
      selectNextPlayer(room);
      io.to(room.roomId).emit("roomUpdate", room);
      setTimeout(() => {
        if (room) {
          room.phase = "choosing";
          room.currentAction = null;
          room.currentQuestion = null;
          io.to(room.roomId).emit("roomUpdate", room);
        }
      }, 3000);
    });

    socket.on("chooseAction", (payload) => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || room.currentTurnPlayerId !== info.playerId) return;

      const parsed = wsSchema.send.chooseAction.parse(payload);
      room.currentAction = parsed.action;
      room.questionAskerPlayerId = getRandomPlayer(room, room.currentTurnPlayerId);
      room.phase = "asking";
      io.to(room.roomId).emit("roomUpdate", room);
    });

    socket.on("askQuestion", (payload) => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || room.questionAskerPlayerId !== info.playerId) return;

      const parsed = wsSchema.send.askQuestion.parse(payload);
      room.currentQuestion = parsed.question;
      room.phase = "answering";
      io.to(room.roomId).emit("roomUpdate", room);
    });

    socket.on("sendMessage", (payload) => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === info.playerId);
      if (!player) return;

      const message: Message = {
        id: randomUUID(),
        senderId: player.id,
        senderName: player.name,
        content: payload.content,
        timestamp: Date.now()
      };
      room.messages.push(message);
      io.to(room.roomId).emit("newMessage", message);
    });

    socket.on("toggleMedia", (payload) => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === info.playerId);
      if (!player) return;

      if (payload.video !== undefined) player.isVideoEnabled = payload.video;
      if (payload.audio !== undefined) player.isAudioEnabled = payload.audio;

      io.to(room.roomId).emit("roomUpdate", room);
    });

    socket.on("signal", (payload) => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const { targetId, signal } = payload;
      
      // Find the target's socket
      for (const [sId, sInfo] of socketToPlayer.entries()) {
        if (sInfo.playerId === targetId && sInfo.roomId === info.roomId) {
          io.to(sId).emit("signal", { fromId: info.playerId, signal });
          break;
        }
      }
    });

    socket.on("nextRound", () => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room) return;

      room.phase = "bottleSpinning";
      selectNextPlayer(room);
      io.to(room.roomId).emit("roomUpdate", room);
      setTimeout(() => {
        if (room) {
          room.phase = "choosing";
          room.currentAction = null;
          room.currentQuestion = null;
          room.questionAskerPlayerId = null;
          io.to(room.roomId).emit("roomUpdate", room);
        }
      }, 3000);
    });

    socket.on("endGame", () => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || room.hostId !== info.playerId) return;

      room.gameState = "ended";
      io.to(room.roomId).emit("roomUpdate", room);
    });

    socket.on("disconnect", () => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      
      const room = rooms.get(info.roomId);
      if (room) {
        room.players = room.players.filter(p => p.id !== info.playerId);
        if (room.players.length === 0) {
          rooms.delete(info.roomId);
        } else {
          if (room.hostId === info.playerId) room.hostId = room.players[0].id;
          if (room.currentTurnPlayerId === info.playerId) selectNextPlayer(room);
          io.to(room.roomId).emit("roomUpdate", room);
        }
      }
      socketToPlayer.delete(socket.id);
    });
  });
}

function selectNextPlayer(room: RoomState) {
  if (room.players.length === 0) return;
  const currentIndex = room.players.findIndex(p => p.id === room.currentTurnPlayerId);
  const nextIndex = (currentIndex + 1) % room.players.length;
  room.currentTurnPlayerId = room.players[nextIndex].id;
  room.turnStartTime = Date.now();
}

function getRandomPlayer(room: RoomState, excludeId?: string | null): string | null {
  const eligible = room.players.filter(p => p.id !== excludeId);
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)].id;
}
