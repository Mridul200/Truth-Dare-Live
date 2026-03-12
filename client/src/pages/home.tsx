import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Users, Laugh, Flame, PartyPopper, Rocket } from "lucide-react";

const features = [
  { icon: Laugh, label: "Funny Truth Questions", color: "#00C2FF", glow: "rgba(0, 194, 255, 0.4)" },
  { icon: Flame, label: "Crazy Dares", color: "#FF2E9F", glow: "rgba(255, 46, 159, 0.4)" },
  { icon: PartyPopper, label: "Perfect for Parties", color: "#8A2BE2", glow: "rgba(138, 43, 226, 0.4)" },
  { icon: Users, label: "Play with Friends", color: "#00C2FF", glow: "rgba(0, 194, 255, 0.4)" },
];

export default function Home() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const { createRoom, joinRoom, roomState } = useGame();
  const [, setLocation] = useLocation();

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-12 py-8"
    >
      {/* Hero Section */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 10 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center mb-8"
          style={{
            background: "linear-gradient(135deg, #8A2BE2 0%, #00C2FF 100%)",
            boxShadow: "0 0 40px rgba(138, 43, 226, 0.7), 0 0 80px rgba(138, 43, 226, 0.3)",
          }}
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl font-display font-black mb-4"
          style={{
            background: "linear-gradient(135deg, #8A2BE2 0%, #00C2FF 50%, #FF2E9F 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 20px rgba(138, 43, 226, 0.4))",
          }}
        >
          Truth or Dare
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Real-time multiplayer party game. No app required.
        </motion.p>
      </div>

      {/* Game Join Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="neon-card rounded-3xl p-8"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label
              className="text-xs font-semibold uppercase tracking-[0.2em] ml-1"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Your Name
            </label>
            <Input
              data-testid="input-name"
              placeholder="Enter your nickname..."
              className="h-14 text-lg rounded-2xl text-white placeholder:opacity-30 focus-visible:ring-1"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(138, 43, 226, 0.3)",
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
            />
          </div>

          <div className="pt-2 space-y-4">
            <Button
              data-testid="button-create-room"
              size="lg"
              className="w-full h-14 rounded-2xl text-lg font-bold border-0 text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #8A2BE2 0%, #00C2FF 100%)",
                boxShadow: "0 0 20px rgba(138, 43, 226, 0.5), 0 4px 20px rgba(0,0,0,0.4)",
              }}
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Create New Room
            </Button>

            <div className="flex items-center gap-4 py-2">
              <Separator style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>or</span>
              <Separator style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>

            <div className="flex gap-3">
              <Input
                data-testid="input-room-code"
                placeholder="Room Code"
                className="h-14 text-lg rounded-2xl uppercase text-center font-display tracking-widest text-white placeholder:opacity-30 focus-visible:ring-1"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0, 194, 255, 0.3)",
                }}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
              <Button
                data-testid="button-join-room"
                size="lg"
                className="h-14 px-8 rounded-2xl text-lg font-bold text-white border-0 transition-all"
                style={{
                  background: "linear-gradient(135deg, #FF2E9F 0%, #8A2BE2 100%)",
                  boxShadow: "0 0 20px rgba(255, 46, 159, 0.3)",
                }}
                onClick={handleJoin}
                disabled={!name.trim() || !code.trim()}
              >
                <Users className="w-5 h-5 mr-2" />
                Join
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Game Description Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <h2
          className="text-2xl sm:text-3xl font-display font-black mb-4"
          style={{
            background: "linear-gradient(135deg, #00C2FF, #FF2E9F)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The Ultimate Truth & Dare Experience
        </h2>
        <p className="text-sm leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
          Turn every hangout into pure chaos and laughter. Challenge your friends with hilarious dares,
          reveal surprising truths, and watch everyone panic when it's their turn. Whether you're at a party,
          sleepover, or just bored — this game guarantees unforgettable moments.
        </p>
        <p
          className="text-sm font-bold tracking-widest uppercase mb-10"
          style={{
            background: "linear-gradient(135deg, #8A2BE2, #00C2FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Tap. Choose. Laugh. Repeat.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, label, color, glow }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="rounded-2xl p-4 flex flex-col items-center gap-3 cursor-default"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${color}30`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}20`, boxShadow: `0 0 15px ${glow}` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-xs font-semibold text-center leading-tight" style={{ color: "rgba(255,255,255,0.6)" }}>
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
