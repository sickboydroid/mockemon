import { auth, getAuthToken } from "./firebase/firebaseHelper";
import { io } from "socket.io-client";
import { addPairingSubscription, addUser, joinInterview } from "./api/api";
import { showJoiningAlert } from "./views/alerts";

async function onJoinButtonClicked(socket) {
  await joinInterview();
  showJoiningAlert();
  await addPairingSubscription(socket.id);
  socket.once("on_paired", (role) => {
    console.log("Current user is acting as the " + role);
    sessionStorage.setItem("role", role);
    // TODO: delay only for debugging
    setTimeout(() => (window.location.href = "/html/meeting.html"), 1000);
  });
}

async function main() {
  const socket = io({
    auth: {
      token: await getAuthToken(),
      socket_type: "pairing",
    },
  });
  socket.on("connect", async () => {
    console.log("Pairing socket connected");
    document
      .querySelector("button.join-btn")
      .addEventListener("click", () => onJoinButtonClicked(socket));
    await addUser();
  });
}

auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log("User is logged in");
    main();
  } else {
    console.log("User not logged in, going to login page");
    window.location.href = "/html/login.html";
  }
});
