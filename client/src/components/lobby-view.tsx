import { motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { PlayerList } from "./player-list";
import { Copy, Play, ArrowLeft, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LobbyView() {
  const { roomState, isHost, startGame, leaveRoom, myPlayerId } = useGame();
  const { toast } = useToast();

  if (!roomState) return null;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomState.roomId);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard.",
    });
  };

  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={leaveRoom}
          className="hover:bg-white/5 transition-colors"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Leave
        </Button>
      </div>

      <div className="neon-card rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center">
        {/* Room Code */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8 px-6 py-4 rounded-2xl"
          style={{
            background: "rgba(138, 43, 226, 0.1)",
            border: "1px solid rgba(138, 43, 226, 0.3)",
            boxShadow: "0 0 20px rgba(138, 43, 226, 0.1)",
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
            Room Code
          </span>
          <span
            className="text-3xl font-orbitron font-black tracking-widest"
            style={{
              background: "linear-gradient(135deg, #8A2BE2, #00C2FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {roomState.roomId}
          </span>
          <Button
            data-testid="button-copy-code"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-white/10"
            onClick={copyRoomCode}
          >
            <Copy className="w-4 h-4" style={{ color: "#00C2FF" }} />
          </Button>
        </motion.div>

        <h1
          className="text-3xl sm:text-4xl font-display font-black mb-3"
          style={{
            background: "linear-gradient(135deg, #8A2BE2, #00C2FF, #FF2E9F)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Waiting for players...
        </h1>
        <p className="max-w-md mx-auto mb-10 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Share the room code with your friends. The host can start the game when everyone is ready.
        </p>

        <div
          className="w-full text-left rounded-3xl p-6 mb-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <PlayerList roomState={roomState} myPlayerId={myPlayerId} />
        </div>

        {isHost ? (
          <Button
            data-testid="button-start-game"
            size="lg"
            className="w-full sm:w-auto mt-8 px-12 py-6 rounded-2xl text-lg font-bold border-0 text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #8A2BE2, #FF2E9F)",
              boxShadow: "0 0 30px rgba(138, 43, 226, 0.5)",
            }}
            onClick={startGame}
            disabled={roomState.players.length < 2}
          >
            <Rocket className="w-5 h-5 mr-2" />
            Launch Game
          </Button>
        ) : (
          <div
            className="mt-8 px-8 py-4 rounded-2xl text-sm font-medium"
            style={{
              background: "rgba(138, 43, 226, 0.1)",
              border: "1px solid rgba(138, 43, 226, 0.2)",
              color: "#8A2BE2",
            }}
          >
            Waiting for host to start the game...
          </div>
        )}

        {isHost && roomState.players.length < 2 && (
          <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            You need at least 2 players to start.
          </p>
        )}
      </div>
    </motion.div>
  );
}
