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

/**
 *
 * @param {RTCPeerConnection} peerConnection
 */
export async function setupVideoIO(peerConnection) {
  // send local tracks
  const videoOut = document.querySelector(".video-out");
  localStream = await getUserMedia({ video: true, audio: true });
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

/**
 * @param {RTCPeerConnection} peerConnection
 */
export async function setupDataChannel(peerConnection) {
  dataChannel = peerConnection.createDataChannel("data-channel");
  peerConnection.ondatachannel = (event) => {
    event.channel.onmessage = (msgEvent) => {
      const data = JSON.parse(msgEvent.data);
      if ("videoPaused" in data) {
        const videoPaused = data["videoPaused"];
        if (videoPaused) pauseInputVideo();
        else resumeInputVideo();
      }

      if ("audioPaused" in data) {
        const audioPaused = data["audioPaused"];
        if (audioPaused) pauseInputAudio();
        else resumeInputAudio();
      }
    };
  };
}

export async function onLocalIceCandidateUpdate(event, sessionRef) {
  const iceCandidatesRef = child(sessionRef, "iceCandidates");
  if (event.candidate) {
    const newIceCandidateRef = push(iceCandidatesRef);
    await set(newIceCandidateRef, event.candidate.toJSON());
    console.debug("Added newly found iceCandidate");
  }
}

export function onRemoteIceCandidateUpdate(peerConnection, snapshot) {
  const iceCandidates = snapshot.val();
  if (!snapshot.exists()) return;
  Object.entries(iceCandidates).forEach(([key, value]) => {
    if (remoteIceCandidates.has(key)) return;
    peerConnection.addIceCandidate(new RTCIceCandidate(value));
    remoteIceCandidates.add(key);
    console.debug("New ice candidates added from remote", key);
  });
}

export function pauseOutputVideo() {
  localStream.getVideoTracks()[0].enabled = false;
  document
    .querySelector(".video-out-container .no-video-icon")
    .classList.remove("off");
  dataChannel.send(JSON.stringify({ videoPaused: true }));
}

export function resumeOutputVideo() {
  localStream.getVideoTracks()[0].enabled = true;
  document
    .querySelector(".video-out-container .no-video-icon")
    .classList.add("off");
  dataChannel.send(JSON.stringify({ videoPaused: false }));
}

export function pauseInputVideo() {
  document
    .querySelector(".video-in-container .no-video-icon")
    .classList.remove("off");
}

export function resumeInputVideo() {
  document
    .querySelector(".video-in-container .no-video-icon")
    .classList.add("off");
}

export function pauseOutputAudio() {
  localStream.getAudioTracks()[0].enabled = false;
  document
    .querySelector(".video-out-container .no-audio-icon")
    .classList.remove("off");

  dataChannel.send(JSON.stringify({ audioPaused: true }));
}

export function resumeOutputAudio() {
  localStream.getAudioTracks()[0].enabled = true;
  document
    .querySelector(".video-out-container .no-audio-icon")
    .classList.add("off");
  dataChannel.send(JSON.stringify({ audioPaused: false }));
}

export function pauseInputAudio() {
  document
    .querySelector(".video-in-container .no-audio-icon")
    .classList.remove("off");
}

export function resumeInputAudio() {
  document
    .querySelector(".video-in-container .no-audio-icon")
    .classList.add("off");
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
const getUserMedia = navigator.mediaDevices.getUserMedia.bind(
  navigator.mediaDevices
);
/** @type {MediaStream} */
let localStream = null;
/** @type {RTCDataChannel} */
let dataChannel = null;
