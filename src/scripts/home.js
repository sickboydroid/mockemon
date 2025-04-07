// import { onAuthStateChanged } from "firebase/auth";
import {
  getFirebaseApp,
  getFirebaseFirestore,
  getFirebaseAuth,
  getFirebaseRealtimeDB,
} from "./firebase/firebaseHelper";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { ref, set, get, onValue, off, child } from "firebase/database";
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
    didClose: () => {},
  });
}

async function createAndListenUserSession() {
  const userSessionRef = ref(database, "sessions/" + user.uid + "/role");
  // TODO: only for debugging
  await set(userSessionRef, {});
  const unsubscribe = onValue(userSessionRef, (snapshot) => {
    const data = snapshot.val();
    if (data === "caller") {
      console.log("Current user is acting as the caller");
      unsubscribe();
      sessionStorage.setItem("role", "caller");
      window.location.href = "/meeting.html";
    } else if (data === "callee") {
      console.log("Current user is acting as the callee");
      unsubscribe();
      sessionStorage.setItem("role", "callee");
      window.location.href = "/meeting.html";
    }
  });
}

async function addUserToMeeting() {
  if (!user) {
    console.log("User is null, cancelling");
    return;
  }
  const docRef = doc(firestore, "joined_users", user.uid);
  const userRef = await getDoc(docRef);
  createAndListenUserSession();
  if (!userRef.exists()) {
    await setDoc(docRef, {});
    console.log("User has been added to meeting");
  } else {
    console.log("User is already present in meeting");
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
let user = null;

joinInterviewBtn.addEventListener("click", (event) => {
  showJoiningAlert();
  addUserToMeeting();
});

onAuthStateChanged(auth, (curUser) => {
  if (curUser) {
    console.log("User UID:", curUser.uid);
    sessionStorage.setItem("user_uid", curUser.uid);
    user = curUser;
  } else {
    window.location.href = "/login.html";
    console.log("No user is logged in");
  }
});
