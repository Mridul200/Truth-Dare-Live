import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { type RoomState } from "@shared/schema";
import { ws as wsConfig } from "@shared/routes";
import { useToast } from "./use-toast";
import { io, Socket } from "socket.io-client";

interface GameContextType {
  roomState: RoomState | null;
  playerName: string;
  myPlayerId: string | null;
  isHost: boolean;
  isConnected: boolean;
  setPlayerName: (name: string) => void;
  createRoom: (name: string) => void;
  joinRoom: (roomId: string, name: string) => void;
  startGame: () => void;
  endGame: () => void;
  chooseAction: (action: "truth" | "dare") => void;
  nextTurn: () => void;
  leaveRoom: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerName, setPlayerName] = useState<string>(() => sessionStorage.getItem("playerName") || "");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    sessionStorage.setItem("playerName", playerName);
  }, [playerName]);

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    
    socket.on("roomUpdate", (payload) => {
      try {
        const parsed = wsConfig.receive.roomUpdate.parse(payload);
        setRoomState(parsed);
      } catch (err) {
        console.error("Failed to parse roomUpdate", err);
      }
    });

    socket.on("newMessage", (payload) => {
      // Handle new message if needed, though roomUpdate might cover it
    });

    socket.on("error", (payload) => {
      toast({
        title: "Error",
        description: payload.message || "An error occurred",
        variant: "destructive",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  const sendEvent = (type: string, payload: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, payload);
    } else {
      toast({ title: "Disconnected", description: "Connecting to server...", variant: "destructive" });
    }
  };

  const createRoom = (name: string) => {
    setPlayerName(name);
    sendEvent("createRoom", { playerName: name });
  };

  const joinRoom = (roomId: string, name: string) => {
    setPlayerName(name);
    sendEvent("joinRoom", { roomId, playerName: name });
  };

  const startGame = () => sendEvent("startGame", {});
  const endGame = () => sendEvent("endGame", {});
  const chooseAction = (action: "truth" | "dare") => sendEvent("chooseAction", { action });
  const nextTurn = () => sendEvent("nextTurn", {});
  
  const leaveRoom = () => {
    sendEvent("leaveRoom", {});
    setRoomState(null);
  };

  const myPlayerId = roomState?.players.find((p) => p.name === playerName)?.id || null;
  const isHost = roomState?.hostId === myPlayerId && myPlayerId !== null;

  return (
    <GameContext.Provider
      value={{
        roomState,
        playerName,
        myPlayerId,
        isHost,
        isConnected,
        setPlayerName,
        createRoom,
        joinRoom,
        startGame,
        endGame,
        chooseAction,
        nextTurn,
        leaveRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
