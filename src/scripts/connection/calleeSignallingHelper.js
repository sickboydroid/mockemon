import {
  database,
  userUID,
  webRTCConfig,
  onLocalIceCandidateUpdate,
  onRemoteIceCandidateUpdate,
  setupVideoIO,
} from "./signallingHelper";

import {
  ref,
  set,
  get,
  onValue,
  push,
  child,
  DataSnapshot,
} from "firebase/database";

async function setupWebRTCAsCallee() {
  const sessionRef = ref(database, "sessions/" + userUID);
  const sdpRef = child(sessionRef, "sdp");
  const callerUID = (await get(child(sessionRef, "caller"))).val();
  const callerSessionRef = ref(database, "sessions/" + callerUID);
  const callerSDPRef = child(callerSessionRef, "sdp");
  const callerIceCandidatesRef = child(callerSessionRef, "iceCandidates");
  const peerConnection = new RTCPeerConnection(webRTCConfig);
  await setupVideoIO(peerConnection);
  onValue(callerSDPRef, async (snapshot) => {
    if (!snapshot.exists()) return;
    const remoteSDP = snapshot.val();
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(remoteSDP)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    await set(sdpRef, answer);
    console.log("callee: Received offer and sent answer");
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log("callee: connectionState=", peerConnection.connectionState);
    if (peerConnection.connectionState === "connected") {
      // Peers connected!
      // You can start sending/receving data
      console.log("callee: callee is connected");
    }
  });

  onValue(callerIceCandidatesRef, (snapshot) =>
    onRemoteIceCandidateUpdate(peerConnection, snapshot)
  );
  peerConnection.addEventListener("icecandidate", async (event) => {
    await onLocalIceCandidateUpdate(event, sessionRef);
  });
}

export async function setupConnection() {
  await setupWebRTCAsCallee();
}
