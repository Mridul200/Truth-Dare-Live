import { motion } from "framer-motion";
import { type RoomState } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Sparkles } from "lucide-react";

export function PlayerList({ roomState, myPlayerId }: { roomState: RoomState, myPlayerId: string | null }) {
  return (
    <div className="w-full">
      <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
        Players in Room ({roomState.players.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {roomState.players.map((player, idx) => {
          const isHost = player.id === roomState.hostId;
          const isMe = player.id === myPlayerId;
          const isTurn = player.id === roomState.currentTurnPlayerId;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`
                relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300
                ${isTurn ? 'bg-primary/5 border-primary/20 shadow-md shadow-primary/5' : 'bg-white/50 border-white/40 shadow-sm'}
                ${isMe ? 'ring-2 ring-primary/10' : ''}
              `}
            >
              <Avatar className={`w-10 h-10 ${isTurn ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                <AvatarFallback className="bg-primary/10 text-primary font-bold font-display text-sm">
                  {player.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="font-semibold text-sm truncate flex items-center gap-1.5">
                  {player.name}
                  {isMe && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                </span>
                {isHost && (
                  <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Host
                  </span>
                )}
              </div>
              
              {isTurn && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
