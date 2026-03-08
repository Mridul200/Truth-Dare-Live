import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface VideoStreamProps {
  stream: MediaStream;
  playerName?: string;
  isLocal?: boolean;
}

function VideoStream({ stream, playerName, isLocal }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-black rounded-2xl overflow-hidden aspect-square"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      {playerName && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-white text-sm font-semibold truncate">{playerName}</p>
        </div>
      )}
    </motion.div>
  );
}

interface VideoGridProps {
  localStream?: MediaStream;
  remoteStreams: Map<string, MediaStream>;
  playerMap: Map<string, string>;
  myPlayerId?: string;
}

export function VideoGrid({ localStream, remoteStreams, playerMap, myPlayerId }: VideoGridProps) {
  const totalVideos = (localStream ? 1 : 0) + remoteStreams.size;
  
  if (totalVideos === 0) return null;

  return (
    <div className="grid gap-4 w-full" style={{
      gridTemplateColumns: totalVideos === 1 ? "1fr" : totalVideos === 2 ? "repeat(2, 1fr)" : "repeat(3, 1fr)"
    }}>
      {localStream && (
        <VideoStream
          stream={localStream}
          playerName="You"
          isLocal
        />
      )}
      {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
        <VideoStream
          key={peerId}
          stream={stream}
          playerName={playerMap.get(peerId)}
        />
      ))}
    </div>
  );
}
