import { motion } from "framer-motion";
import { type RoomState } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Sparkles } from "lucide-react";

export function PlayerList({ roomState, myPlayerId }: { roomState: RoomState, myPlayerId: string | null }) {
  const neonColors = [
    { bg: "rgba(138, 43, 226, 0.2)", text: "#8A2BE2", border: "rgba(138, 43, 226, 0.4)" },
    { bg: "rgba(255, 46, 159, 0.2)", text: "#FF2E9F", border: "rgba(255, 46, 159, 0.4)" },
    { bg: "rgba(0, 194, 255, 0.2)", text: "#00C2FF", border: "rgba(0, 194, 255, 0.4)" },
    { bg: "rgba(138, 43, 226, 0.2)", text: "#a855f7", border: "rgba(168, 85, 247, 0.4)" },
    { bg: "rgba(0, 194, 255, 0.15)", text: "#38bdf8", border: "rgba(56, 189, 248, 0.4)" },
  ];

  return (
    <div className="w-full">
      <h3 className="font-display font-semibold text-xs uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
        Players in Room ({roomState.players.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {roomState.players.map((player, idx) => {
          const isHost = player.id === roomState.hostId;
          const isMe = player.id === myPlayerId;
          const isTurn = player.id === roomState.currentTurnPlayerId;
          const color = neonColors[idx % neonColors.length];

          return (
            <motion.div
              key={player.id}
              data-testid={`card-player-${player.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ delay: idx * 0.05 }}
              className="relative flex items-center gap-3 p-3 rounded-2xl transition-all duration-300"
              style={{
                background: isTurn ? `${color.bg}` : "rgba(255,255,255,0.03)",
                border: `1px solid ${isTurn ? color.border : "rgba(255,255,255,0.07)"}`,
                boxShadow: isTurn ? `0 0 15px ${color.bg}` : "none",
                outline: isMe ? `2px solid ${color.border}` : "none",
                outlineOffset: isMe ? "2px" : undefined,
              }}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback
                  className="font-bold font-display text-sm"
                  style={{ background: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                >
                  {player.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="font-semibold text-sm truncate flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {player.name}
                  {isMe && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: `${color.bg}`, color: color.text, border: `1px solid ${color.border}` }}
                    >
                      YOU
                    </span>
                  )}
                </span>
                {isHost && (
                  <span className="text-xs font-medium flex items-center gap-1" style={{ color: "#f59e0b" }}>
                    <Crown className="w-3 h-3" /> Host
                  </span>
                )}
              </div>

              {isTurn && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                  style={{ background: color.text, boxShadow: `0 0 8px ${color.text}` }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-black" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
