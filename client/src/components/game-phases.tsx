import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { type RoomState } from "@shared/schema";
import { Bottle, Sparkles, Send } from "lucide-react";
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
      <Card className="glass-card p-12 border-0 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-8"
        >
          <h2 className="text-4xl font-display font-bold text-gradient">
            Spinning the Bottle...
          </h2>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl"
          >
            🍾
          </motion.div>
          <p className="text-lg text-muted-foreground">
            Next player will be selected soon...
          </p>
        </motion.div>
      </Card>
    );
  }

  if (roomState.phase === "choosing") {
    return (
      <Card className="glass-card p-12 border-0 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-8">
          <h2 className="text-3xl font-display font-bold text-gradient">
            {isMyTurn ? "Your Turn!" : `${selectedPlayer?.name}'s Turn`}
          </h2>

          {isMyTurn ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4 w-full max-w-sm"
            >
              <p className="text-center text-muted-foreground">
                Choose your fate wisely...
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  className="truth-gradient text-white h-24 rounded-2xl text-2xl font-display font-bold"
                  onClick={() => onChooseAction("truth")}
                >
                  TRUTH
                </Button>
                <Button
                  className="dare-gradient text-white h-24 rounded-2xl text-2xl font-display font-bold"
                  onClick={() => onChooseAction("dare")}
                >
                  DARE
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex gap-3 items-center justify-center"
            >
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <p className="text-muted-foreground">Waiting for them to choose...</p>
            </motion.div>
          )}
        </div>
      </Card>
    );
  }

  if (roomState.phase === "asking") {
    return (
      <Card className="glass-card p-12 border-0 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-3xl font-display font-bold text-gradient">
            {isAsker ? "Ask a Question!" : `${askerPlayer?.name} is asking...`}
          </h2>

          <div className="text-2xl font-bold text-center p-4 bg-primary/5 rounded-xl w-full">
            {roomState.currentAction?.toUpperCase()}
          </div>

          {isAsker ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-4 w-full"
            >
              <Input
                placeholder={`Ask a ${roomState.currentAction} question...`}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="h-12 rounded-2xl text-lg"
                autoFocus
              />
              <Button
                onClick={() => {
                  onAskQuestion(question);
                  setQuestion("");
                }}
                disabled={!question.trim()}
                className="gap-2"
                size="lg"
              >
                <Send className="w-4 h-4" />
                Send Question
              </Button>
            </motion.div>
          ) : (
            <p className="text-muted-foreground text-center">
              Waiting for the question...
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (roomState.phase === "answering") {
    return (
      <Card className="glass-card p-12 border-0 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-muted-foreground mb-2">
              {roomState.currentAction?.toUpperCase()}
            </h3>
            <h2 className="text-3xl font-display font-bold text-gray-900 leading-tight">
              "{roomState.currentQuestion}"
            </h2>
          </div>

          <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-8 w-full text-center min-h-32 flex flex-col items-center justify-center">
            {isMyTurn ? (
              <div>
                <p className="text-muted-foreground mb-3">Share your answer aloud with everyone!</p>
                <Button
                  onClick={onNextRound}
                  className="gap-2"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Next Round
                </Button>
              </div>
            ) : (
              <p className="text-lg text-muted-foreground">
                {selectedPlayer?.name} is answering...
              </p>
            )}
          </div>
        </motion.div>
      </Card>
    );
  }

  return null;
}
