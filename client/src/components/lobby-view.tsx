import { motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerList } from "./player-list";
import { Copy, Play, ArrowLeft } from "lucide-react";
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
        <Button variant="ghost" size="sm" onClick={leaveRoom} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Leave
        </Button>
      </div>

      <Card className="glass-card p-8 sm:p-10 border-0 flex flex-col items-center text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/5 rounded-2xl mb-6">
          <span className="text-sm font-medium text-muted-foreground mr-3 uppercase tracking-widest font-display">Room Code</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-display font-bold tracking-widest text-primary">
              {roomState.roomId}
            </span>
            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-primary/10 rounded-full" onClick={copyRoomCode}>
              <Copy className="w-4 h-4 text-primary" />
            </Button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gradient mb-3">
          Waiting for players...
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-10">
          Share the room code with your friends. The host can start the game when everyone is ready.
        </p>

        <div className="w-full text-left bg-white/50 rounded-3xl p-6 border border-white">
          <PlayerList roomState={roomState} myPlayerId={myPlayerId} />
        </div>

        {isHost ? (
          <Button 
            size="lg" 
            className="w-full sm:w-auto mt-10 px-12 py-6 rounded-2xl text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1"
            onClick={startGame}
            disabled={roomState.players.length < 2}
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Start Game
          </Button>
        ) : (
          <div className="mt-10 px-8 py-4 rounded-2xl bg-primary/5 text-primary font-medium border border-primary/10">
            Waiting for host to start the game...
          </div>
        )}
        
        {isHost && roomState.players.length < 2 && (
          <p className="text-sm text-muted-foreground mt-4">
            You need at least 2 players to start.
          </p>
        )}
      </Card>
    </motion.div>
  );
}
