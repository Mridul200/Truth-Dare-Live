import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { type RoomState } from "@shared/schema";
import { ws as wsConfig } from "@shared/routes";
import { useToast } from "./use-toast";

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
  chooseAction: (action: "truth" | "dare") => void;
  nextTurn: () => void;
  leaveRoom: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerName, setPlayerName] = useState<string>(() => sessionStorage.getItem("playerName") || "");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    sessionStorage.setItem("playerName", playerName);
  }, [playerName]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connect = () => {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => setIsConnected(true);
      
      socket.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000); // Reconnect loop
      };

      socket.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);
          
          if (type === "roomUpdate") {
            const parsed = wsConfig.receive.roomUpdate.parse(payload);
            setRoomState(parsed);
          } else if (type === "error") {
            toast({
              title: "Error",
              description: payload.message || "An error occurred",
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [toast]);

  const sendEvent = (type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
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
