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

export function CircularPlayers({ roomState, myPlayerId, isSpinning, onSpinComplete }: CircularPlayersProps) {
  const players = roomState.players;
  const playerCount = players.length;
  const radius = Math.max(150, 100 + playerCount * 15);
  const angleSlice = 360 / playerCount;

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      {/* Bottle in center */}
      <motion.div
        animate={isSpinning ? { rotate: 3600 } : { rotate: 0 }}
        transition={isSpinning ? { duration: 3, ease: "easeOut" } : { duration: 0.3 }}
        onAnimationComplete={onSpinComplete}
        className="absolute z-20"
      >
        <div className="w-12 h-24 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 rounded-full relative shadow-2xl">
          <div className="absolute top-2 left-2 w-8 h-4 bg-amber-200 rounded-full opacity-60" />
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-b from-amber-800 to-yellow-900 rounded-b-full" />
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

        const avatarColors = [
          "bg-purple-100 text-purple-600",
          "bg-pink-100 text-pink-600",
          "bg-blue-100 text-blue-600",
          "bg-orange-100 text-orange-600",
          "bg-emerald-100 text-emerald-600",
          "bg-red-100 text-red-600",
          "bg-indigo-100 text-indigo-600",
          "bg-cyan-100 text-cyan-600",
        ];
        const colorClass = avatarColors[idx % avatarColors.length];

        return (
          <motion.div
            key={player.id}
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
              animate={isCurrentTurn ? { scale: 1.15 } : { scale: 1 }}
              className={`relative`}
            >
              <Avatar className={`w-16 h-16 border-4 ${
                isCurrentTurn
                  ? "border-purple-500 shadow-lg shadow-purple-500/50"
                  : isAsking
                  ? "border-orange-500 shadow-lg shadow-orange-500/50"
                  : "border-white/50"
              }`}>
                <AvatarFallback className={`${colorClass} text-lg font-bold font-display`}>
                  {player.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isCurrentTurn && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-3 border-2 border-transparent border-t-purple-500 border-r-purple-500 rounded-full pointer-events-none"
                />
              )}

              {isAsking && (
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-6"
                >
                  <Sparkles className="w-5 h-5 text-orange-500" />
                </motion.div>
              )}
            </motion.div>

            <p className="text-sm font-semibold text-center mt-3 text-foreground">
              {player.name}
            </p>

            <div className="flex gap-1 mt-1 items-center justify-center">
              {isMe && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  YOU
                </span>
              )}
              {isHost && (
                <Crown className="w-3 h-3 text-amber-500" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
