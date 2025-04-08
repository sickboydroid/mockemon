import {
  database,
  userUID,
  webRTCConfig,
  onLocalIceCandidateUpdate,
  onRemoteIceCandidateUpdate,
  setupVideoIO,
  setupDataChannel,
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

async function setupWebRTCAsCaller() {
  const sessionRef = ref(database, "sessions/" + userUID);
  const calleeUID = (await get(child(sessionRef, "callee"))).val();
  const calleeSessionRef = ref(database, "sessions/" + calleeUID);
  const calleeIceCandidatesRef = child(calleeSessionRef, "iceCandidates");
  const calleeSDPRef = child(calleeSessionRef, "sdp");
  const peerConnection = new RTCPeerConnection(webRTCConfig);
  await setupVideoIO(peerConnection);
  setupDataChannel(peerConnection);
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  await set(child(sessionRef, "sdp"), offer);
  onValue(calleeSDPRef, async (snapshot) => {
    if (!snapshot.exists()) return;
    const sdp = snapshot.val();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    console.log("caller: remote sdp received and set");
  });
  onValue(calleeIceCandidatesRef, (snapshot) =>
    onRemoteIceCandidateUpdate(peerConnection, snapshot)
  );
  peerConnection.addEventListener("icecandidate", async (event) => {
    await onLocalIceCandidateUpdate(event, sessionRef);
  });

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log("caller: connectionState=", peerConnection.connectionState);
    if (peerConnection.connectionState === "connected") {
      // Peers connected!
      // You can start sending/receiving data
      console.log("caller: callee is connected");
    }
  });
}

export async function setupConnection() {
  await setupWebRTCAsCaller();
}
