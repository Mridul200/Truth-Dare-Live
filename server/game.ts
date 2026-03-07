import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import { RoomState, Player, Message } from "@shared/schema";
import { randomUUID } from "crypto";
import { ws as wsSchema } from "@shared/routes";

const rooms = new Map<string, RoomState>();
const socketToPlayer = new Map<string, { roomId: string; playerId: string }>();

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
          currentTurnPlayerId: null,
          currentAction: null,
          currentQuestion: null,
          turnStartTime: null,
          turnDuration: 30
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
      selectNextPlayer(room);
      io.to(room.roomId).emit("roomUpdate", room);
    });

    socket.on("chooseAction", (payload) => {
      const info = socketToPlayer.get(socket.id);
      if (!info) return;
      const room = rooms.get(info.roomId);
      if (!room || room.currentTurnPlayerId !== info.playerId) return;

      const parsed = wsSchema.send.chooseAction.parse(payload);
      room.currentAction = parsed.action;
      room.currentQuestion = parsed.action === "truth" 
        ? truths[Math.floor(Math.random() * truths.length)]
        : dares[Math.floor(Math.random() * dares.length)];
      
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
  room.currentAction = null;
  room.currentQuestion = null;
  room.turnStartTime = Date.now();
}
