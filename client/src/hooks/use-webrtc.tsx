import { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer";
import { useGame } from "./use-game";

interface PeerConnection {
  peerId: string;
  peer: SimplePeer.Instance;
  stream?: MediaStream;
}

export function useWebRTC() {
  const { roomState, myPlayerId, isConnected } = useGame();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoStreams, setVideoStreams] = useState<Map<string, MediaStream>>(new Map());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const socketRef = useRef<any>(null);

  // Get local media stream
  const startMedia = useCallback(async (audio: boolean, video: boolean) => {
    try {
      if (!audio && !video) {
        if (localStream) {
          localStream.getTracks().forEach(t => t.stop());
          setLocalStream(null);
        }
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audio,
        video: video ? { width: 300, height: 300 } : false,
      });
      
      setLocalStream(stream);
      setAudioEnabled(audio);
      setVideoEnabled(video);

      // Update existing peer connections with new stream
      peersRef.current.forEach(({ peer }) => {
        stream.getTracks().forEach(track => {
          peer.addTrack(track, stream);
        });
      });
    } catch (err) {
      console.error("Failed to access media:", err);
    }
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
    } else {
      startMedia(true, videoEnabled);
    }
  }, [audioEnabled, videoEnabled, localStream, startMedia]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(!videoEnabled);
    } else {
      startMedia(audioEnabled, true);
    }
  }, [audioEnabled, videoEnabled, localStream, startMedia]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      peersRef.current.forEach(({ peer }) => peer.destroy());
      peersRef.current.clear();
    };
  }, [localStream]);

  return {
    localStream,
    videoStreams,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    startMedia,
    peersRef,
  };
}
