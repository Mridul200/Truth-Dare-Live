import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerList } from "./player-list";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { VideoGrid } from "./video-grid";
import { CircularPlayers } from "./circular-players";
import { Input } from "@/components/ui/input";

export function GameView() {
  const { roomState, myPlayerId, isHost, spinBottle, endGame, toggleMedia, askQuestion } = useGame();
  const [audioOn, setAudioOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [videoStreams] = useState<Map<string, MediaStream>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [questionText, setQuestionText] = useState("");

  const handleToggleAudio = async () => {
    if (!audioOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setLocalStream(stream);
        setAudioOn(true);
      } catch (err) {
        console.error("Failed to access microphone:", err);
      }
    } else {
      localStream?.getAudioTracks().forEach(t => t.stop());
      setAudioOn(false);
    }
    toggleMedia(videoOn, !audioOn);
  };

  const handleToggleVideo = async () => {
    if (!videoOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioOn, video: true });
        setLocalStream(stream);
        setVideoOn(true);
      } catch (err) {
        console.error("Failed to access camera:", err);
      }
    } else {
      localStream?.getVideoTracks().forEach(t => t.stop());
      setVideoOn(false);
    }
    toggleMedia(!videoOn, audioOn);
  };

  const handleAskQuestion = (action: "truth" | "dare") => {
    if (questionText.trim()) {
      askQuestion(action, questionText);
      setQuestionText("");
    }
  };

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
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 items-center">
      <div className="w-full flex justify-between items-center gap-3">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={audioOn ? "default" : "outline"}
            className="rounded-full"
            onClick={handleToggleAudio}
          >
            {audioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant={videoOn ? "default" : "outline"}
            className="rounded-full"
            onClick={handleToggleVideo}
          >
            {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
        </div>
        <Button 
          variant="outline" 
          className="bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 text-primary font-semibold rounded-xl"
          onClick={spinBottle}
        >
          Spin Bottle
        </Button>
        <Button 
          variant="destructive"
          onClick={endGame}
        >
          End Game
        </Button>
      </div>

      {(localStream || videoStreams.size > 0) && (
        <Card className="glass-card p-4 border-0 w-full">
          <VideoGrid
            localStream={localStream}
            remoteStreams={videoStreams}
            playerMap={new Map(roomState.players.map(p => [p.id, p.name]))}
            myPlayerId={myPlayerId}
          />
        </Card>
      )}

      <Card className="glass-card p-8 border-0 w-full">
        <CircularPlayers 
          roomState={roomState}
          myPlayerId={myPlayerId}
          isSpinning={roomState.bottleSpinning}
          onSpinComplete={() => {}}
        />
      </Card>

      <Card className="glass-card p-8 sm:p-12 border-0 w-full flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!roomState.currentQuestion ? (
              <motion.div
                key="asking"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center w-full gap-6"
              >
                <h2 className="text-4xl sm:text-5xl font-display font-bold text-gradient mb-4">
                  {roomState.questionAskerPlayerId === myPlayerId 
                    ? "Ask a Question!" 
                    : `Waiting for ${roomState.players.find(p => p.id === roomState.questionAskerPlayerId)?.name || "player"} to ask...`}
                </h2>

                {roomState.questionAskerPlayerId === myPlayerId && (
                  <div className="w-full max-w-lg flex flex-col gap-4">
                    <Input
                      placeholder="Type your question..."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="h-12 rounded-2xl"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button 
                        className="truth-gradient text-white h-16 rounded-2xl text-2xl font-display font-bold"
                        onClick={() => handleAskQuestion("truth")}
                        disabled={!questionText.trim()}
                      >
                        TRUTH
                      </Button>
                      <Button 
                        className="dare-gradient text-white h-16 rounded-2xl text-2xl font-display font-bold"
                        onClick={() => handleAskQuestion("dare")}
                        disabled={!questionText.trim()}
                      >
                        DARE
                      </Button>
                    </div>
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

                <p className="text-lg text-muted-foreground font-medium">
                  <strong>{roomState.players.find(p => p.id === roomState.currentTurnPlayerId)?.name}</strong> is answering!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </Card>
    </div>
  );
}
