import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerList } from "./player-list";
import { ArrowRight, Sparkles, UserCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export function GameView() {
  const { roomState, myPlayerId, isHost, chooseAction, nextTurn, endGame } = useGame();

  if (!roomState) return null;

  if (roomState.gameState === "ended") {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4">
        <Card className="glass-card p-12 text-center border-0 overflow-hidden relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-display font-bold text-gradient mb-6">Game Over!</h2>
            <p className="text-xl text-muted-foreground mb-12">
              Thanks for playing! We'd love to hear your thoughts.
            </p>
            
            <Button 
              size="lg"
              className="w-full max-w-md h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all"
              onClick={() => window.open("https://forms.google.com", "_blank")}
            >
              Share Your Feedback
            </Button>
            
            <p className="mt-8 text-sm text-muted-foreground">
              Your feedback helps us make the game even better!
            </p>
          </motion.div>
        </Card>
      </div>
    );
  }

  const currentPlayer = roomState.players.find(p => p.id === roomState.currentTurnPlayerId);
  const isMyTurn = myPlayerId === roomState.currentTurnPlayerId;

  // Trigger confetti when a new question is revealed
  useEffect(() => {
    if (roomState.currentQuestion) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: roomState.currentAction === 'truth' ? ['#34d399', '#14b8a6'] : ['#fb7185', '#f97316']
      });
    }
  }, [roomState.currentQuestion, roomState.currentAction]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 items-center">
      <div className="w-full flex justify-end">
        {isHost && (
          <Button 
            variant="outline" 
            className="bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-primary font-semibold rounded-xl"
            onClick={nextTurn}
          >
            Skip Turn <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 w-full">
        {/* Main Play Area */}
        <Card className="glass-card p-8 sm:p-12 border-0 min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!roomState.currentAction ? (
              <motion.div
                key="choosing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center w-full"
              >
                <div className="mb-12">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-full mb-6"
                  >
                    <UserCircle2 className="w-12 h-12 text-primary" />
                  </motion.div>
                  <h2 className="text-4xl sm:text-5xl font-display font-bold text-gradient mb-4">
                    {isMyTurn ? "It's your turn!" : `${currentPlayer?.name}'s turn`}
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    {isMyTurn ? "Choose your fate wisely..." : "Waiting for them to choose..."}
                  </p>
                </div>

                {isMyTurn ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
                    <Button 
                      className="truth-gradient text-white h-32 rounded-3xl text-3xl font-display font-bold hover:scale-105 hover:shadow-2xl transition-all duration-300 border-0"
                      onClick={() => chooseAction("truth")}
                    >
                      TRUTH
                    </Button>
                    <Button 
                      className="dare-gradient text-white h-32 rounded-3xl text-3xl font-display font-bold hover:scale-105 hover:shadow-2xl transition-all duration-300 border-0"
                      onClick={() => chooseAction("dare")}
                    >
                      DARE
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center justify-center mt-8">
                    <div className="w-3 h-3 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="flex flex-col items-center w-full max-w-2xl"
              >
                <div className={`
                  px-6 py-2 rounded-full font-display font-bold text-lg mb-8 shadow-lg
                  ${roomState.currentAction === 'truth' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}
                `}>
                  {roomState.currentAction.toUpperCase()}
                </div>
                
                <h3 className="text-3xl sm:text-5xl font-display font-bold leading-tight mb-12 text-gray-900">
                  "{roomState.currentQuestion}"
                </h3>

                <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  {currentPlayer?.name} is on the spot!
                </p>

                {isHost && (
                  <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full justify-center">
                    <Button 
                      size="lg"
                      className="rounded-2xl px-10 py-6 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all"
                      onClick={nextTurn}
                    >
                      Next Player <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="rounded-2xl px-10 py-6 text-lg font-semibold border-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                      onClick={endGame}
                    >
                      End Game
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </Card>

        {/* Sidebar */}
        <div className="w-full flex flex-col gap-6">
          <Card className="glass-card p-6 border-0">
            <PlayerList roomState={roomState} myPlayerId={myPlayerId} />
          </Card>
        </div>
      </div>
    </div>
  );
}
