import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type RoomState } from "@shared/schema";
import { Sparkles, Send, Rocket } from "lucide-react";
import { useState } from "react";

interface GamePhasesProps {
  roomState: RoomState;
  myPlayerId: string | null;
  onChooseAction: (action: "truth" | "dare") => void;
  onAskQuestion: (question: string) => void;
  onNextRound: () => void;
}

export function GamePhases({
  roomState,
  myPlayerId,
  onChooseAction,
  onAskQuestion,
  onNextRound,
}: GamePhasesProps) {
  const [question, setQuestion] = useState("");
  const isMyTurn = myPlayerId === roomState.currentTurnPlayerId;
  const isAsker = myPlayerId === roomState.questionAskerPlayerId;
  const selectedPlayer = roomState.players.find(p => p.id === roomState.currentTurnPlayerId);
  const askerPlayer = roomState.players.find(p => p.id === roomState.questionAskerPlayerId);

  if (roomState.phase === "bottleSpinning") {
    return (
      <div className="neon-card p-12 rounded-3xl w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-8"
        >
          <h2
            className="text-4xl font-display font-black"
            style={{
              background: "linear-gradient(135deg, #8A2BE2, #00C2FF, #FF2E9F)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Spinning the Bottle...
          </h2>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="text-6xl"
            style={{ filter: "drop-shadow(0 0 15px rgba(138, 43, 226, 0.8))" }}
          >
            🍾
          </motion.div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Next player will be selected soon...
          </p>
        </motion.div>
      </div>
    );
  }

  if (roomState.phase === "choosing") {
    return (
      <div className="neon-card p-10 rounded-3xl w-full max-w-2xl">
        <div className="flex flex-col items-center gap-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-black"
            style={{
              background: "linear-gradient(135deg, #8A2BE2, #FF2E9F)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {isMyTurn ? "Your Turn!" : `${selectedPlayer?.name}'s Turn`}
          </motion.h2>

          {isMyTurn ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4 w-full max-w-sm"
            >
              <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                Choose your fate wisely...
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  data-testid="button-choose-truth"
                  className="h-24 rounded-2xl text-2xl font-display font-black border-0 text-white"
                  style={{
                    background: "linear-gradient(135deg, #00C2FF, #0060ff)",
                    boxShadow: "0 0 25px rgba(0, 194, 255, 0.5)",
                  }}
                  onClick={() => onChooseAction("truth")}
                >
                  TRUTH
                </Button>
                <Button
                  data-testid="button-choose-dare"
                  className="h-24 rounded-2xl text-2xl font-display font-black border-0 text-white"
                  style={{
                    background: "linear-gradient(135deg, #FF2E9F, #ff6b00)",
                    boxShadow: "0 0 25px rgba(255, 46, 159, 0.5)",
                  }}
                  onClick={() => onChooseAction("dare")}
                >
                  DARE
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="flex gap-3 items-center justify-center"
            >
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#8A2BE2", boxShadow: "0 0 8px #8A2BE2" }} />
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Waiting for them to choose...</p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (roomState.phase === "asking") {
    return (
      <div className="neon-card p-10 rounded-3xl w-full max-w-2xl">
        <div className="flex flex-col items-center gap-6">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-black text-center"
            style={{
              background: "linear-gradient(135deg, #FF2E9F, #8A2BE2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {isAsker ? "Ask a Question!" : `${askerPlayer?.name} is asking...`}
          </motion.h2>

          <div
            className="text-2xl font-black text-center px-8 py-4 rounded-xl w-full font-orbitron tracking-wider"
            style={{
              background: roomState.currentAction === "truth"
                ? "linear-gradient(135deg, rgba(0,194,255,0.2), rgba(0,96,255,0.2))"
                : "linear-gradient(135deg, rgba(255,46,159,0.2), rgba(255,107,0,0.2))",
              border: `1px solid ${roomState.currentAction === "truth" ? "rgba(0,194,255,0.4)" : "rgba(255,46,159,0.4)"}`,
              color: roomState.currentAction === "truth" ? "#00C2FF" : "#FF2E9F",
              textShadow: `0 0 20px ${roomState.currentAction === "truth" ? "rgba(0,194,255,0.7)" : "rgba(255,46,159,0.7)"}`,
            }}
          >
            {roomState.currentAction?.toUpperCase()}
          </div>

          {isAsker ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4 w-full"
            >
              <Input
                data-testid="input-question"
                placeholder={`Type a ${roomState.currentAction} question...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-12 rounded-2xl text-base text-white placeholder:opacity-30 focus-visible:ring-1"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(138, 43, 226, 0.3)",
                }}
                autoFocus
              />
              <Button
                data-testid="button-send-question"
                onClick={() => {
                  onAskQuestion(question);
                  setQuestion("");
                }}
                disabled={!question.trim()}
                size="lg"
                className="gap-2 border-0 text-white font-bold"
                style={{
                  background: "linear-gradient(135deg, #8A2BE2, #FF2E9F)",
                  boxShadow: "0 0 20px rgba(138, 43, 226, 0.4)",
                }}
              >
                <Send className="w-4 h-4" />
                Send Question
              </Button>
            </motion.div>
          ) : (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Waiting for the question...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (roomState.phase === "answering") {
    return (
      <div className="neon-card p-10 rounded-3xl w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="text-center w-full">
            <p
              className="text-sm font-bold tracking-widest uppercase mb-3 font-orbitron"
              style={{
                color: roomState.currentAction === "truth" ? "#00C2FF" : "#FF2E9F",
                textShadow: `0 0 15px ${roomState.currentAction === "truth" ? "rgba(0,194,255,0.6)" : "rgba(255,46,159,0.6)"}`,
              }}
            >
              {roomState.currentAction?.toUpperCase()}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-display font-black leading-tight"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              "{roomState.currentQuestion}"
            </h2>
          </div>

          <div
            className="rounded-2xl p-8 w-full text-center min-h-32 flex flex-col items-center justify-center"
            style={{
              background: "rgba(138, 43, 226, 0.08)",
              border: "2px solid rgba(138, 43, 226, 0.25)",
              boxShadow: "0 0 20px rgba(138, 43, 226, 0.1)",
            }}
          >
            {isMyTurn ? (
              <div>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Share your answer aloud with everyone!
                </p>
                <Button
                  data-testid="button-next-round"
                  onClick={onNextRound}
                  size="lg"
                  className="gap-2 border-0 text-white font-bold"
                  style={{
                    background: "linear-gradient(135deg, #8A2BE2, #00C2FF)",
                    boxShadow: "0 0 25px rgba(138, 43, 226, 0.5)",
                  }}
                >
                  <Rocket className="w-4 h-4" />
                  Next Round
                </Button>
              </div>
            ) : (
              <p className="text-base" style={{ color: "rgba(255,255,255,0.35)" }}>
                <span style={{ color: "#8A2BE2" }}>{selectedPlayer?.name}</span> is answering...
              </p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
