import { io } from "socket.io-client";
import { connect } from "./connectionManager";
import {
  webRTCConfig,
  onLocalIceCandidateUpdate,
  onRemoteIceCandidateUpdate,
  setupVideoIO,
  setupDataChannel,
} from "./signallingHelper";

async function setupWebRTCAsCallee(socket) {
  console.log("SETUP WEBRTC AS CALLEE");
  const peerConnection = new RTCPeerConnection(webRTCConfig);
  await setupVideoIO(peerConnection);
  setupDataChannel(peerConnection);
  socket.emit("sent by callee");
  socket.on("sdp", async (remoteSDP) => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(remoteSDP),
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("sdp", answer);
    console.log("callee: Received offer and sent answer");
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log("callee: connectionState=" + peerConnection.connectionState);
    if (peerConnection.connectionState === "connected") {
      // Peers connected!
      // You can start sending/receving data
      console.log("callee: callee is connected");
    }
  });

  socket.on("ice-candidate", (iceCandidates) =>
    onRemoteIceCandidateUpdate(peerConnection, iceCandidates),
  );
  peerConnection.addEventListener(
    "icecandidate",
    async (event) => await onLocalIceCandidateUpdate(event, socket),
  );

  socket.on("reset", () => {
    console.log("Have been asked to reconnect");
    peerConnection.close();
    socket.removeAllListeners();
    socket.once("ready", () => connect(socket));
  });

  socket.on("reset", () => {
    console.log("Have been asked to reconnect");
    peerConnection.close();
    socket.removeAllListeners();
    socket.once("ready", () => connect(socket));
  });
}

export async function setupConnection(socket) {
  await setupWebRTCAsCallee(socket);
}
