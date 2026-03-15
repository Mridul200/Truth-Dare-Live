import { motion } from "framer-motion";
import { useGame } from "@/hooks/use-game";
import { useWebRTC } from "@/hooks/use-webrtc";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, Rocket, X } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect, useState, useRef } from "react";
import { VideoGrid } from "./video-grid";
import { CircularPlayers } from "./circular-players";
import { GamePhases } from "./game-phases";
import { useToast } from "@/hooks/use-toast";

export function GameView() {
  const {
    roomState,
    myPlayerId,
    spinBottle,
    endGame,
    toggleMedia,
    chooseAction,
    askQuestion,
    socketRef,
  } = useGame();

  const { toast } = useToast();
  const [audioOn, setAudioOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const players = roomState?.players ?? [];

  const { remoteStreams } = useWebRTC({
    socket: socketRef.current,
    myPlayerId,
    players,
    localStream,
  });

  // Keep ref in sync so WebRTC hook can access latest stream without stale closure
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const applyStream = (stream: MediaStream | null) => {
    // Stop old tracks before replacing
    if (localStreamRef.current && localStreamRef.current !== stream) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setLocalStream(stream);
  };

  const handleToggleAudio = async () => {
    const nextAudio = !audioOn;
    const nextVideo = videoOn;

    if (!nextAudio && !nextVideo) {
      // Turn everything off
      applyStream(null);
      setAudioOn(false);
      toggleMedia(false, false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: nextAudio,
        video: nextVideo ? { width: 320, height: 240 } : false,
      });
      applyStream(stream);
      setAudioOn(nextAudio);
      toggleMedia(nextVideo, nextAudio);
    } catch (err: any) {
      toast({
        title: "Microphone Error",
        description: err.message || "Could not access microphone. Check browser permissions.",
        variant: "destructive",
      });
    }
  };

  const handleToggleVideo = async () => {
    const nextAudio = audioOn;
    const nextVideo = !videoOn;

    if (!nextAudio && !nextVideo) {
      applyStream(null);
      setVideoOn(false);
      toggleMedia(false, false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: nextAudio,
        video: nextVideo ? { width: 320, height: 240 } : false,
      });
      applyStream(stream);
      setVideoOn(nextVideo);
      toggleMedia(nextVideo, nextAudio);
    } catch (err: any) {
      toast({
        title: "Camera Error",
        description: err.message || "Could not access camera. Check browser permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop local stream when leaving
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  if (!roomState) return null;

  if (roomState.gameState === "ended") {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4">
        <div className="neon-card rounded-3xl p-12 text-center overflow-hidden relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
              Thanks for playing! Hope you had a blast.
            </p>
            <Button
              size="lg"
              className="w-full max-w-md h-16 rounded-2xl text-xl font-bold border-0 text-white"
              style={{
                background: "linear-gradient(135deg, #8A2BE2, #FF2E9F)",
                boxShadow: "0 0 30px rgba(138, 43, 226, 0.5)",
              }}
              onClick={() => window.location.href = "/"}
            >
              Play Again
            </Button>
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

  const hasAnyMedia = localStream || remoteStreams.size > 0;
  const playerMap = new Map(roomState.players.map(p => [p.id, p.name]));

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 items-center">
      {/* Top controls */}
      <div className="w-full flex justify-between items-center gap-3 flex-wrap">
        <div className="flex gap-2">
          <Button
            data-testid="button-toggle-audio"
            size="icon"
            className="rounded-full border text-white w-11 h-11 transition-all"
            style={{
              background: audioOn ? "rgba(0, 194, 255, 0.2)" : "rgba(255,255,255,0.06)",
              borderColor: audioOn ? "#00C2FF" : "rgba(255,255,255,0.12)",
              boxShadow: audioOn ? "0 0 15px rgba(0, 194, 255, 0.5)" : "none",
            }}
            onClick={handleToggleAudio}
            title={audioOn ? "Mute microphone" : "Enable microphone"}
          >
            {audioOn
              ? <Mic className="w-4 h-4" style={{ color: "#00C2FF" }} />
              : <MicOff className="w-4 h-4" style={{ color: "rgba(255,255,255,0.35)" }} />
            }
          </Button>

          <Button
            data-testid="button-toggle-video"
            size="icon"
            className="rounded-full border text-white w-11 h-11 transition-all"
            style={{
              background: videoOn ? "rgba(138, 43, 226, 0.2)" : "rgba(255,255,255,0.06)",
              borderColor: videoOn ? "#8A2BE2" : "rgba(255,255,255,0.12)",
              boxShadow: videoOn ? "0 0 15px rgba(138, 43, 226, 0.5)" : "none",
            }}
            onClick={handleToggleVideo}
            title={videoOn ? "Turn off camera" : "Enable camera"}
          >
            {videoOn
              ? <Video className="w-4 h-4" style={{ color: "#8A2BE2" }} />
              : <VideoOff className="w-4 h-4" style={{ color: "rgba(255,255,255,0.35)" }} />
            }
          </Button>

          {/* Live indicator */}
          {hasAnyMedia && (
            <div
              className="flex items-center gap-1.5 px-3 rounded-full border text-xs font-medium h-11"
              style={{
                background: "rgba(0, 255, 100, 0.08)",
                borderColor: "rgba(0, 255, 100, 0.3)",
                color: "#00ff80",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {remoteStreams.size > 0
                ? `${remoteStreams.size + 1} connected`
                : "Live"
              }
            </div>
          )}
        </div>

        <Button
          data-testid="button-spin"
          className="border-0 text-white font-bold rounded-xl px-5 h-11"
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
          className="rounded-xl border font-semibold h-11"
          style={{ borderColor: "rgba(255, 46, 159, 0.3)", color: "#FF2E9F" }}
          onClick={endGame}
        >
          <X className="w-4 h-4 mr-1" />
          End Game
        </Button>
      </div>

      {/* Video/audio grid — only shown when media is active */}
      {hasAnyMedia && (
        <div className="neon-card rounded-3xl p-4 w-full">
          <VideoGrid
            localStream={localStream ?? undefined}
            remoteStreams={remoteStreams}
            playerMap={playerMap}
            myPlayerId={myPlayerId ?? undefined}
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

      {/* Phase-specific UI */}
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
