// import { onAuthStateChanged } from "firebase/auth";
import {
  getFirebaseApp,
  getFirebaseFirestore,
  getFirebaseAuth,
  getFirebaseRealtimeDB,
} from "./firebase/firebase-state";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { ref, set, get, onValue, off } from "firebase/database";
import "../styles/reset.css";
import "../styles/header.css";
import "../styles/color.css";
import "../styles/elements.css";
import "../styles/main.css";
import "../styles/home.css";
import Swal from "sweetalert2";
import "animate.css";

function showJoiningAlert() {
  Swal.fire({
    title: "<strong>Hold Tight! Connecting Now</strong>",
    html: `
      <div class="join-meeting-alert">
        <p class="active-users">Active users: <span class="count">10</span></p>
        <p class="connection-status">Connecting with <span class="name">Ayush</span></p>
        <p class="join-countdown">
          Meeting will begin in <span class="remaining-time">10 secs</span>
        </p>
      </div>
    `,
    heightAuto: false,
    showConfirmButton: false,
    showCancelButton: true,
    focusConfirm: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    cancelButtonText: "Cancel",
    cancelButtonAriaLabel: "Cancel Meeting",
    showClass: {
      popup: "animate__animated animate__fadeIn animate-very-fast",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOut animate-very-fast",
    },
    didClose: () => {
      console.log("closed");
    },
  });
}

function onLocalIceCandidateUpdate(event, sessionRef) {
  const iceCandidatesRef = child(sessionRef, iceCandidatesRef);
  if (event.candidate) {
    console.log("Added newly found iceCandidate", event.candidate);
    set(child(iceCandidatesRef, event.candidate), true);
  }
}

function onRemoteIceCandidateUpdate(snapshot) {
  const iceCandidates = snapshot.val();
  if (!snapshot.exists()) return;
  console.log(typeof iceCandidates);
  Object.entries(iceCandidates).forEach((key, value) => {
    if (remoteIceCandidates.has(key)) return;
    peerConnection.addIceCandidate(key);
    remoteIceCandidates.add(key);
    console.log("New ice candidates added from remote", key);
  });
  peerConnection.addIceCandidate();
}

async function setupWebRTCAsCaller() {
  const sessionRef = ref(database, "sessions/" + user.uid);
  const calleeUID = get(child(sessionRef, "callee"));
  const calleeSessionRef = ref(database, "sessions/" + calleeUID);
  const peerConnection = new RTCPeerConnection(webRTCConfig);
  peerConnection.addEventListener("icecandidate", event =>
    onLocalIceCandidateUpdate(event, sessionRef)
  );

  peerConnection.addEventListener("connectionstatechange", () => {
    console.log("caller: connectionState=", peerConnection.connectionState);
    if (peerConnection.connectionState === "connected") {
      // Peers connected!
      // You can start sending/receving data
      console.log("caller: callee is connected");
    }
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  set(child(sessionRef, "sdp"), offer);
  const calleeIceCandidatesRef = child(calleeSessionRef, "iceCandidates");
  const calleeSDPRef = child(calleeSessionRef, "sdp");
  onValue(calleeSDPRef, async snapshot => {
    if (!snapshot.exists()) return;
    const sdp = snapshot.val();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    console.log("caller: remote sdp received and set");
  });
  onValue(calleeIceCandidatesRef, onRemoteIceCandidateUpdate);
}

function setupWebRTCAsCallee() {
  const sessionRef = ref(database, "sessions/" + user.uid);
  const sdpRef = child(sessionRef, "sdp");
  const iceCandidatesRef = child(sessionRef, "iceCandidates");
  const callerUID = get(child(sessionRef, "caller"));
  const callerSessionRef = ref(database, "sessions/" + callerUID);
  const callerSDP = get(child(callerSessionRef, "sdp"));
  const callerIceCandidates = get(child(callerSessionRef, "iceCandidates"));
  const peerConnection = new RTCPeerConnection(webRTCConfig);
  onValue(callerSDP, async snapshot => {
    if (!snapshot.exists()) return;
    const remoteSDP = snapshot.val();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(remoteSDP));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    set(sdpRef, answer);
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

  onValue(callerIceCandidates, onRemoteIceCandidateUpdate);
  onValue(iceCandidatesRef, onLocalIceCandidateUpdate);
}

function createAndListenUserSession() {
  const userSessionRef = ref(database, "sessions/" + user.uid + "/role");
  // set(userSessionRef, "offer");
  const unsubscribe = onValue(userSessionRef, snapshot => {
    const data = snapshot.val();
    if (!snapshot.exists()) {
      console.log("No data exists yet");
    } else if (data === "caller") {
      console.log("C  urrent user is acting as the caller");
      setupWebRTCAsCaller();
      unsubscribe();
    } else if (data === "calle") {
      console.log("Current user is acting as the callee");
      setupWebRTCAsCallee();
      unsubscribe();
    }
  });
}

async function addUserToMeeting() {
  console.log("Adding user to meeting");
  if (!user) {
    console.log("User is null, cancelling");
    return;
  }
  const docRef = doc(firestore, "joined_users", user.uid);
  const userRef = await getDoc(docRef);
  createAndListenUserSession();
  console.log(userRef);
  if (!userRef.exists()) {
    await setDoc(docRef, {});
    console.log("User added!");
  } else {
    console.log("User already exists!");
    // TODO: Delete the already added user and create new one
  }
}

const joinInterviewBtn = document.querySelector("button.join-btn");
const donateNavItem = document.querySelector("li#donate");
const githubNavItem = document.querySelector("li#github");
const logoutNavItem = document.querySelector("li#logout");
const firebase = getFirebaseApp();
const auth = getFirebaseAuth();
const firestore = getFirebaseFirestore();
const database = getFirebaseRealtimeDB();
const remoteIceCandidates = new Set();
const webRTCConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stunserver.org" },
  ],
};
let user = null;

joinInterviewBtn.addEventListener("click", event => {
  console.log("Joining Interview");
  showJoiningAlert();
  addUserToMeeting();
});

onAuthStateChanged(auth, curUser => {
  if (curUser) {
    console.log("User UID:", curUser.uid);
    user = curUser;
  } else {
    window.location.href = "/login.html";
    console.log("No user is logged in");
  }
});
