import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Users } from "lucide-react";

export default function Home() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const { createRoom, joinRoom, roomState } = useGame();
  const [, setLocation] = useLocation();

  // If we successfully get a roomState, redirect to the room page
  useEffect(() => {
    if (roomState?.roomId) {
      setLocation(`/room/${roomState.roomId}`);
    }
  }, [roomState?.roomId, setLocation]);

  const handleCreate = () => {
    if (!name.trim()) return;
    createRoom(name);
  };

  const handleJoin = () => {
    if (!name.trim() || !code.trim()) return;
    joinRoom(code.toUpperCase(), name);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-20 h-20 bg-primary text-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-primary/30 mb-6"
        >
          <Sparkles className="w-10 h-10" />
        </motion.div>
        <h1 className="text-5xl font-display font-bold text-gradient mb-4">
          Truth or Dare
        </h1>
        <p className="text-lg text-muted-foreground">
          Real-time multiplayer party game. No app required.
        </p>
      </div>

      <Card className="glass-card p-8 border-0">
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Your Name
            </label>
            <Input
              placeholder="Enter your nickname..."
              className="h-14 text-lg rounded-2xl bg-white/50 border-white focus-visible:ring-primary/20 shadow-inner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
            />
          </div>

          <div className="pt-4 space-y-4">
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create New Room
            </Button>

            <div className="flex items-center gap-4 py-2">
              <Separator className="flex-1" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">or</span>
              <Separator className="flex-1" />
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Room Code"
                className="h-14 text-lg rounded-2xl bg-white/50 border-white uppercase text-center font-display tracking-widest focus-visible:ring-primary/20 shadow-inner"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-8 rounded-2xl text-lg font-semibold bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all"
                onClick={handleJoin}
                disabled={!name.trim() || !code.trim()}
              >
                <Users className="w-5 h-5 mr-2" />
                Join
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
