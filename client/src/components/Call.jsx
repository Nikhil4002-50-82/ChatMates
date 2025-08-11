// Call.jsx
import React, { useEffect, useRef } from "react";
import socket from "../socket";

export default function Call({ currentUserId, otherUserId }) {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    pcRef.current = new RTCPeerConnection();
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        localStreamRef.current = stream;
        stream
          .getTracks()
          .forEach((track) => pcRef.current.addTrack(track, stream));
      });
    pcRef.current.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
    };
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          targetSocketId: otherUserId,
          candidate: event.candidate,
        });
      }
    };
    socket.on("incoming-call", async ({ from, offer }) => {
      const accept = window.confirm("Incoming call — accept?");
      if (!accept) return;

      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socket.emit("answer-call", {
        targetSocketId: from,
        answer,
      });
    });
    socket.on("call-answered", async ({ answer }) => {
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });
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
      if (pcRef.current) pcRef.current.close();
    };
  }, [currentUserId, otherUserId]);
  const startCall = async () => {
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    socket.emit("call-user", {
      targetSocketId: otherUserId,
      offer,
    });
  };
  return (
    <div>
      <button
        onClick={startCall}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Start Call
      </button>
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}
