import {
  getFirebaseApp,
  getFirebaseFirestore,
  getFirebaseRealtimeDB,
} from "../firebase/firebaseHelper";

import {
  ref,
  set,
  get,
  onValue,
  push,
  child,
  DataSnapshot,
} from "firebase/database";

import { setupConnection as setupConnectionAsCaller } from "./callerSignallingHelper";
import { setupConnection as setupConnectionAsCallee } from "./calleeSignallingHelper";

export async function setupVideoIO(peerConnection) {
  // send local tracks
  const mediaConstraints = {
    video: true,
    audio: true,
  };
  const videoOut = document.querySelector(".video-out");
  const localStream = await navigator.mediaDevices.getUserMedia(
    mediaConstraints
  );
  videoOut.srcObject = localStream;
  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));
  console.log("Added audio/video tracks to remote");

  // receive remote tracks
  peerConnection.addEventListener("track", async (event) => {
    const [remoteStream] = event.streams;
    const videoIn = document.querySelector(".video-in");
    videoIn.srcObject = remoteStream;
    console.log("Received audio/video tracks from remote");
  });
}

export async function onLocalIceCandidateUpdate(event, sessionRef) {
  const iceCandidatesRef = child(sessionRef, "iceCandidates");
  if (event.candidate) {
    const newIceCandidateRef = push(iceCandidatesRef);
    await set(newIceCandidateRef, event.candidate.toJSON());
    console.log("Added newly found iceCandidate");
  }
}

export function onRemoteIceCandidateUpdate(peerConnection, snapshot) {
  const iceCandidates = snapshot.val();
  if (!snapshot.exists()) return;
  Object.entries(iceCandidates).forEach(([key, value]) => {
    if (remoteIceCandidates.has(key)) return;
    peerConnection.addIceCandidate(new RTCIceCandidate(value));
    remoteIceCandidates.add(key);
    console.log("New ice candidates added from remote", key);
  });
}

export async function setup() {
  const role = sessionStorage.getItem("role");
  if (role === "caller") {
    await setupConnectionAsCaller();
  } else if (role === "callee") {
    await setupConnectionAsCallee();
  } else {
    console.error("Started meeting without valid role");
  }
}

const firebase = getFirebaseApp();
const firestore = getFirebaseFirestore();
export const database = getFirebaseRealtimeDB();
const remoteIceCandidates = new Set();
export const userUID = sessionStorage.getItem("user_uid");
export const webRTCConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ],
};
