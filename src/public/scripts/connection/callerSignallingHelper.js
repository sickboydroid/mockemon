import { connect } from "./connectionManager";
import {
  webRTCConfig,
  onLocalIceCandidateUpdate,
  onRemoteIceCandidateUpdate,
  setupVideoIO,
  setupDataChannel,
} from "./signallingHelper";

async function setupWebRTCAsCaller(socket) {
  console.log("SETUP WEBRTC AS CALLER");
  const peerConnection = new RTCPeerConnection(webRTCConfig);
  await setupVideoIO(peerConnection);
  setupDataChannel(peerConnection);
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("sdp", offer);
  socket.emit("hey i am caller");
  socket.on("sdp", async (sdp) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    console.log("caller: remote sdp received and set");
  });

  socket.on("ice-candidate", (iceCandidates) => {
    onRemoteIceCandidateUpdate(peerConnection, iceCandidates);
  });

  peerConnection.addEventListener("icecandidate", async (event) => {
    await onLocalIceCandidateUpdate(event, socket);
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log("caller: connectionState=", peerConnection.connectionState);
    if (peerConnection.connectionState === "connected") {
      // Peers connected!
      // You can start sending/receiving data
      console.log("caller: callee is connected");
    }
  });

  socket.on("reset", () => {
    console.log("Have been asked to reconnect");
    peerConnection.close();
    socket.removeAllListeners();
    socket.once("ready", () => connect(socket));
  });
}

export async function setupConnection(socket) {
  await setupWebRTCAsCaller(socket);
}
