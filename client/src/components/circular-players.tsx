import { motion } from "framer-motion";
import { type RoomState } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Sparkles } from "lucide-react";

interface CircularPlayersProps {
  roomState: RoomState;
  myPlayerId: string | null;
  isSpinning: boolean;
  onSpinComplete?: () => void;
}

const neonColors = [
  { bg: "rgba(138, 43, 226, 0.25)", text: "#8A2BE2", border: "#8A2BE2", glow: "rgba(138, 43, 226, 0.6)" },
  { bg: "rgba(255, 46, 159, 0.25)", text: "#FF2E9F", border: "#FF2E9F", glow: "rgba(255, 46, 159, 0.6)" },
  { bg: "rgba(0, 194, 255, 0.25)", text: "#00C2FF", border: "#00C2FF", glow: "rgba(0, 194, 255, 0.6)" },
  { bg: "rgba(168, 85, 247, 0.25)", text: "#a855f7", border: "#a855f7", glow: "rgba(168, 85, 247, 0.6)" },
  { bg: "rgba(56, 189, 248, 0.25)", text: "#38bdf8", border: "#38bdf8", glow: "rgba(56, 189, 248, 0.6)" },
  { bg: "rgba(244, 114, 182, 0.25)", text: "#f472b6", border: "#f472b6", glow: "rgba(244, 114, 182, 0.6)" },
  { bg: "rgba(129, 140, 248, 0.25)", text: "#818cf8", border: "#818cf8", glow: "rgba(129, 140, 248, 0.6)" },
  { bg: "rgba(52, 211, 153, 0.25)", text: "#34d399", border: "#34d399", glow: "rgba(52, 211, 153, 0.6)" },
];

export function CircularPlayers({ roomState, myPlayerId, isSpinning, onSpinComplete }: CircularPlayersProps) {
  const players = roomState.players;
  const playerCount = players.length;
  const radius = Math.max(150, 100 + playerCount * 15);
  const angleSlice = 360 / playerCount;

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      {/* Orbit ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: radius * 2 + 80,
          height: radius * 2 + 80,
          border: "1px solid rgba(138, 43, 226, 0.15)",
          boxShadow: "0 0 30px rgba(138, 43, 226, 0.05)",
        }}
      />

      {/* Bottle in center */}
      <motion.div
        animate={isSpinning ? { rotate: 3600 } : { rotate: 0 }}
        transition={isSpinning ? { duration: 3, ease: "easeOut" } : { duration: 0.3 }}
        onAnimationComplete={onSpinComplete}
        className="absolute z-20"
      >
        <div
          className="w-10 h-20 rounded-full relative"
          style={{
            background: "linear-gradient(180deg, #d4a843 0%, #c8891e 40%, #8a5a0e 100%)",
            boxShadow: "0 0 20px rgba(212, 168, 67, 0.5), 0 0 40px rgba(212, 168, 67, 0.2)",
          }}
        >
          <div className="absolute top-2 left-2 w-6 h-3 rounded-full opacity-50" style={{ background: "rgba(255,230,150,0.8)" }} />
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-6 rounded-b-full"
            style={{ background: "linear-gradient(180deg, #5a3a0a, #3a2008)" }}
          />
        </div>
      </motion.div>

      {/* Players in circle */}
      {players.map((player, idx) => {
        const angle = (idx * angleSlice - 90) * (Math.PI / 180);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const isMe = player.id === myPlayerId;
        const isCurrentTurn = player.id === roomState.currentTurnPlayerId;
        const isAsking = player.id === roomState.questionAskerPlayerId;
        const isHost = player.id === roomState.hostId;
        const color = neonColors[idx % neonColors.length];

        return (
          <motion.div
            key={player.id}
            data-testid={`player-avatar-${player.id}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              position: "absolute",
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: "translate(-50%, -50%)",
            }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={isCurrentTurn ? { scale: 1.18 } : { scale: 1 }}
              className="relative"
            >
              <Avatar
                className="w-16 h-16"
                style={{
                  border: `3px solid ${isCurrentTurn ? "#8A2BE2" : isAsking ? "#FF2E9F" : "rgba(255,255,255,0.1)"}`,
                  boxShadow: isCurrentTurn
                    ? "0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.4)"
                    : isAsking
                    ? "0 0 20px rgba(255, 46, 159, 0.7)"
                    : "none",
                }}
              >
                <AvatarFallback
                  className="text-lg font-bold font-display"
                  style={{ background: color.bg, color: color.text }}
                >
                  {player.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isCurrentTurn && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-3 rounded-full pointer-events-none"
                  style={{
                    border: "2px solid transparent",
                    borderTopColor: "#8A2BE2",
                    borderRightColor: "#00C2FF",
                  }}
                />
              )}

              {isAsking && (
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-6"
                >
                  <Sparkles className="w-5 h-5" style={{ color: "#FF2E9F", filter: "drop-shadow(0 0 6px #FF2E9F)" }} />
                </motion.div>
              )}

              {isMe && (
                <div
                  className="absolute -inset-1 rounded-full pointer-events-none"
                  style={{
                    border: `2px solid ${color.border}`,
                    opacity: 0.4,
                  }}
                />
              )}
            </motion.div>

            <p
              className="text-xs font-semibold text-center mt-2"
              style={{ color: isCurrentTurn ? "#8A2BE2" : "rgba(255,255,255,0.75)" }}
            >
              {player.name}
            </p>

            <div className="flex gap-1 mt-0.5 items-center justify-center">
              {isMe && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: `${color.bg}`, color: color.text, border: `1px solid ${color.border}40` }}
                >
                  YOU
                </span>
              )}
              {isHost && <Crown className="w-3 h-3" style={{ color: "#f59e0b" }} />}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
