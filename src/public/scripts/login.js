import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase/firebaseHelper";

function displayLoginError(error) {
  const errorMessage = document.querySelector(".error-message");
  errorMessage.textContent = error.message;
  errorMessage.classList.add("visible");
  errorMessage.style["visibility"] = "visible";
}

function hideLoginError() {
  const errorMessage = document.querySelector(".error-message");
  errorMessage.style["visibility"] = "hidden";
}

const provider = new GoogleAuthProvider();
const loginButton = document.querySelector(".login-btn");

auth.onAuthStateChanged((user) => {
  if (user) window.location.href = "/home.html";
});

loginButton.addEventListener("click", async () => {
  try {
    hideLoginError();
    const result = await signInWithPopup(auth, provider);
    // Google Access Token which can be used to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    const userName = user.displayName;
    const userUid = user.uid;
    const userEmail = user.email;
    console.log({ userName, userUid, userEmail });
    console.log("Logged in");
  } catch (error) {
    console.log(error);
    displayLoginError(error);
  }
});
