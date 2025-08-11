import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function Call({ currentUserId, otherUserId }) {
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pcRef = useRef(null);

  const [callAccepted, setCallAccepted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    if (!currentUserId) return;

    // Register this user with the backend
    socket.emit("register-user", currentUserId);

    // Handle incoming call
    socket.on("incoming-call", async ({ from, offer }) => {
      setIncomingCall(true);
      setOffer({ from, offer });
    });

    // Handle call answer
    socket.on("call-answered", async ({ answer }) => {
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setCallAccepted(true);
    });

    // Handle ICE candidates
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
    };
  }, [currentUserId]);

  // Create peer connection
  const createPeerConnection = async (isInitiator, remoteOffer) => {
    pcRef.current = new RTCPeerConnection();

    // Local audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localAudioRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));

    // Remote audio
    pcRef.current.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
    };

    // ICE candidates
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          targetUserId: otherUserId,
          candidate: event.candidate,
        });
      }
    };

    if (isInitiator) {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socket.emit("call-user", {
        targetUserId: otherUserId,
        offer,
      });
    } else if (remoteOffer) {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(remoteOffer));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("answer-call", {
        targetUserId: otherUserId,
        answer,
      });
      setCallAccepted(true);
    }
  };

  // Start a call
  const startCall = () => {
    createPeerConnection(true);
  };

  // Accept a call
  const acceptCall = () => {
    setIncomingCall(false);
    createPeerConnection(false, offer.offer);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow">
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />

      {/* Start call button */}
      {!callAccepted && !incomingCall && (
        <button
          onClick={startCall}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Start Call
        </button>
      )}

      {/* Incoming call prompt */}
      {incomingCall && (
        <div className="flex gap-4">
          <p>Incoming Call...</p>
          <button
            onClick={acceptCall}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Accept
          </button>
        </div>
      )}

      {/* Ongoing call */}
      {callAccepted && <p className="mt-2 text-green-700">Call in progress...</p>}
    </div>
  );
}
