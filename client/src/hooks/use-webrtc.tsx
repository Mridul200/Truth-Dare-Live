import { useEffect, useRef, useState, useCallback } from "react";
import { type Player } from "@shared/schema";
import { Socket } from "socket.io-client";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

type SignalMessage =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | { type: "candidate"; candidate: RTCIceCandidateInit };

interface UseWebRTCOptions {
  socket: Socket | null;
  myPlayerId: string | null;
  players: Player[];
  localStream: MediaStream | null;
}

export function useWebRTC({ socket, myPlayerId, players, localStream }: UseWebRTCOptions) {
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const setStream = useCallback((playerId: string, stream: MediaStream) => {
    setRemoteStreams(prev => new Map(prev).set(playerId, stream));
  }, []);

  const clearStream = useCallback((playerId: string) => {
    setRemoteStreams(prev => {
      const next = new Map(prev);
      next.delete(playerId);
      return next;
    });
  }, []);

  const closePC = useCallback((remoteId: string) => {
    const pc = pcsRef.current.get(remoteId);
    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onconnectionstatechange = null;
      pc.close();
    }
    pcsRef.current.delete(remoteId);
    clearStream(remoteId);
  }, [clearStream]);

  const createPC = useCallback((remoteId: string): RTCPeerConnection => {
    closePC(remoteId);

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Send ICE candidates to remote peer via server relay
    pc.onicecandidate = (evt) => {
      if (evt.candidate && socket) {
        socket.emit("signal", {
          targetId: remoteId,
          signal: { type: "candidate", candidate: evt.candidate.toJSON() },
        });
      }
    };

    // Receive remote audio/video tracks
    const remoteStream = new MediaStream();
    pc.ontrack = (evt) => {
      evt.streams[0]?.getTracks().forEach(t => remoteStream.addTrack(t));
      setStream(remoteId, remoteStream);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "failed" || state === "closed" || state === "disconnected") {
        pcsRef.current.delete(remoteId);
        clearStream(remoteId);
      }
    };

    pcsRef.current.set(remoteId, pc);
    return pc;
  }, [socket, setStream, clearStream, closePC]);

  const initiateCall = useCallback(async (remoteId: string, stream: MediaStream) => {
    if (!socket) return;

    const pc = createPC(remoteId);

    // Add all local tracks to the connection
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
    await pc.setLocalDescription(offer);

    socket.emit("signal", {
      targetId: remoteId,
      signal: { type: "offer", sdp: offer.sdp },
    });
  }, [socket, createPC]);

  // Handle incoming signals from other players
  useEffect(() => {
    if (!socket || !myPlayerId) return;

    const handleSignal = async ({ fromId, signal }: { fromId: string; signal: SignalMessage }) => {
      if (signal.type === "offer") {
        const pc = createPC(fromId);

        // Add local tracks so they can hear/see us too
        if (localStream) {
          localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: signal.sdp }));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("signal", {
          targetId: fromId,
          signal: { type: "answer", sdp: answer.sdp },
        });
      } else if (signal.type === "answer") {
        const pc = pcsRef.current.get(fromId);
        if (pc && pc.signalingState !== "stable") {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: signal.sdp }));
        }
      } else if (signal.type === "candidate") {
        const pc = pcsRef.current.get(fromId);
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (e) {
            // Ignore ICE errors if remote description not set yet
          }
        }
      }
    };

    socket.on("signal", handleSignal);
    return () => { socket.off("signal", handleSignal); };
  }, [socket, myPlayerId, localStream, createPC]);

  // Initiate connections when local stream or player media state changes
  useEffect(() => {
    if (!localStream || !myPlayerId || !socket) return;

    const playersWithMedia = players.filter(
      p => p.id !== myPlayerId && (p.isAudioEnabled || p.isVideoEnabled)
    );

    for (const player of playersWithMedia) {
      if (!pcsRef.current.has(player.id) && myPlayerId < player.id) {
        // Deterministic: lower ID initiates. This prevents two peers initiating simultaneously.
        initiateCall(player.id, localStream);
      }
    }
  }, [localStream, players, myPlayerId, socket, initiateCall]);

  // Clean up peers for players who left
  useEffect(() => {
    const currentIds = new Set(players.map(p => p.id));
    for (const peerId of Array.from(pcsRef.current.keys())) {
      if (!currentIds.has(peerId)) closePC(peerId);
    }
  }, [players, closePC]);

  // Destroy all when local stream removed
  useEffect(() => {
    if (!localStream) {
      for (const peerId of Array.from(pcsRef.current.keys())) closePC(peerId);
      setRemoteStreams(new Map());
    }
  }, [localStream, closePC]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const peerId of Array.from(pcsRef.current.keys())) closePC(peerId);
      pcsRef.current.clear();
    };
  }, [closePC]);

  return { remoteStreams };
}
