import { motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Rocket, X } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { VideoGrid } from "./video-grid";
import { CircularPlayers } from "./circular-players";
import { GamePhases } from "./game-phases";

export function GameView() {
  const { roomState, myPlayerId, spinBottle, endGame, toggleMedia, chooseAction, askQuestion, nextTurn } = useGame();
  const [audioOn, setAudioOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [videoStreams] = useState<Map<string, MediaStream>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

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

  if (!roomState) return null;

  if (roomState.gameState === "ended") {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4">
        <div className="neon-card rounded-3xl p-12 text-center overflow-hidden relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-6">🎉</div>
            <h2
              className="text-5xl font-display font-black mb-6"
              style={{
                background: "linear-gradient(135deg, #8A2BE2, #00C2FF, #FF2E9F)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Game Over!
            </h2>
            <p className="text-base mb-12" style={{ color: "rgba(255,255,255,0.4)" }}>
              Thanks for playing! We'd love to hear your thoughts.
            </p>

            <Button
              size="lg"
              className="w-full max-w-md h-16 rounded-2xl text-xl font-bold border-0 text-white"
              style={{
                background: "linear-gradient(135deg, #8A2BE2, #FF2E9F)",
                boxShadow: "0 0 30px rgba(138, 43, 226, 0.5)",
              }}
              onClick={() => window.open("https://forms.google.com", "_blank")}
            >
              Share Your Feedback
            </Button>

            <p className="mt-8 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Your feedback helps us make the game even better!
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (roomState.currentQuestion) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: roomState.currentAction === "truth"
          ? ["#00C2FF", "#0060ff", "#8A2BE2"]
          : ["#FF2E9F", "#ff6b00", "#8A2BE2"],
      });
    }
  }, [roomState.currentQuestion, roomState.currentAction]);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 items-center">
      {/* Top controls */}
      <div className="w-full flex justify-between items-center gap-3">
        <div className="flex gap-2">
          <Button
            data-testid="button-toggle-audio"
            size="icon"
            className="rounded-full border text-white w-10 h-10"
            style={{
              background: audioOn ? "rgba(0, 194, 255, 0.2)" : "rgba(255,255,255,0.06)",
              borderColor: audioOn ? "rgba(0, 194, 255, 0.5)" : "rgba(255,255,255,0.1)",
              boxShadow: audioOn ? "0 0 12px rgba(0, 194, 255, 0.4)" : "none",
            }}
            onClick={handleToggleAudio}
          >
            {audioOn ? <Mic className="w-4 h-4" style={{ color: "#00C2FF" }} /> : <MicOff className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />}
          </Button>
          <Button
            data-testid="button-toggle-video"
            size="icon"
            className="rounded-full border text-white w-10 h-10"
            style={{
              background: videoOn ? "rgba(138, 43, 226, 0.2)" : "rgba(255,255,255,0.06)",
              borderColor: videoOn ? "rgba(138, 43, 226, 0.5)" : "rgba(255,255,255,0.1)",
              boxShadow: videoOn ? "0 0 12px rgba(138, 43, 226, 0.4)" : "none",
            }}
            onClick={handleToggleVideo}
          >
            {videoOn ? <Video className="w-4 h-4" style={{ color: "#8A2BE2" }} /> : <VideoOff className="w-4 h-4" style={{ color: "rgba(255,255,255,0.4)" }} />}
          </Button>
        </div>

        <Button
          data-testid="button-spin"
          className="border-0 text-white font-bold rounded-xl px-5"
          style={{
            background: "linear-gradient(135deg, #8A2BE2, #00C2FF)",
            boxShadow: "0 0 15px rgba(138, 43, 226, 0.4)",
          }}
          onClick={spinBottle}
        >
          <Rocket className="w-4 h-4 mr-2" />
          Spin Bottle
        </Button>

        <Button
          data-testid="button-end-game"
          variant="ghost"
          className="rounded-xl border font-semibold"
          style={{
            borderColor: "rgba(255, 46, 159, 0.3)",
            color: "#FF2E9F",
          }}
          onClick={endGame}
        >
          <X className="w-4 h-4 mr-1" />
          End Game
        </Button>
      </div>

      {/* Video grid */}
      {(localStream || videoStreams.size > 0) && (
        <div className="neon-card rounded-3xl p-4 w-full">
          <VideoGrid
            localStream={localStream}
            remoteStreams={videoStreams}
            playerMap={new Map(roomState.players.map(p => [p.id, p.name]))}
            myPlayerId={myPlayerId}
          />
        </div>
      )}

      {/* Circular player layout */}
      <div
        className="rounded-3xl p-6 w-full"
        style={{
          background: "rgba(15, 18, 50, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(138, 43, 226, 0.2)",
        }}
      >
        <CircularPlayers
          roomState={roomState}
          myPlayerId={myPlayerId}
          isSpinning={roomState.phase === "bottleSpinning"}
          onSpinComplete={() => {}}
        />
      </div>

      {/* Phase UI */}
      <GamePhases
        roomState={roomState}
        myPlayerId={myPlayerId}
        onChooseAction={chooseAction}
        onAskQuestion={askQuestion}
        onNextRound={spinBottle}
      />
    </div>
  );
}
