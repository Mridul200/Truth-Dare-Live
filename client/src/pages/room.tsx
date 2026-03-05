import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { LobbyView } from "@/components/lobby-view";
import { GameView } from "@/components/game-view";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Room() {
  const { id } = useParams<{ id: string }>();
  const { roomState, playerName, joinRoom } = useGame();
  const [, setLocation] = useLocation();
  const [localName, setLocalName] = useState(playerName);

  // If user hits this route directly without joining via WS, prompt for name
  const needsToJoin = !roomState || roomState.roomId !== id;

  useEffect(() => {
    // If the room no longer exists (kicked/left), go home
    if (!needsToJoin && !roomState) {
      setLocation("/");
    }
  }, [roomState, needsToJoin, setLocation]);

  const handleLateJoin = () => {
    if (!localName.trim() || !id) return;
    joinRoom(id.toUpperCase(), localName);
  };

  if (needsToJoin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto mt-20"
      >
        <Card className="glass-card p-8 border-0 text-center">
          <h2 className="text-2xl font-display font-bold mb-2">Joining Room {id}</h2>
          <p className="text-muted-foreground mb-8">Please enter your name to continue.</p>
          
          <div className="space-y-4">
            <Input
              placeholder="Your Name"
              className="h-14 text-lg rounded-2xl bg-white/50 text-center focus-visible:ring-primary/20"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              maxLength={15}
            />
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              onClick={handleLateJoin}
              disabled={!localName.trim()}
            >
              Enter Room
            </Button>
            <Button 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => setLocation('/')}
            >
              Go Back
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="w-full pt-20 pb-10">
      {roomState.gameState === "lobby" ? <LobbyView /> : <GameView />}
    </div>
  );
}
