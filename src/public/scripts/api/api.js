import { getAuthToken } from "../firebase/firebaseHelper";

export async function addUser() {
  try {
    const resp = await fetch("/api/user/add", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await getAuthToken()}`,
      },
    });
    const res = await resp.json();
    if (res.error) throw new Error("Server responded with error: " + res.error);
  } catch (err) {
    console.log(err);
  }
}

export async function joinInterview() {
  try {
    const resp = await fetch("/api/interview/join", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await getAuthToken()}`,
      },
    });
    const res = await resp.json();
    if (res.error) throw new Error("Server responded with error: " + res.error);
    else console.log("Successfully joined the meeting");
  } catch (err) {
    console.log(err);
  }
}

export async function getInterviewStatus() {
  const resp = await fetch("/api/interview/status", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${await getAuthToken()}`,
    },
  });
  return await resp.json();
}

export async function addPairingSubscription(socketId) {
  const resp = await fetch("/api/interview/subscribe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${await getAuthToken()}`,
    },
    body: JSON.stringify({ socket_id: socketId }),
  });
  const res = await resp.json();
  if (res.error) throw new Error("Server responeded with error: " + res.error);
  else console.log("Subscribed to pairing alert");
}

export async function leaveInterview() {
  try {
    const resp = await fetch("/api/interview/leave", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${await getAuthToken()}`,
      },
    });
    const res = await resp.json();
    if (res.error) throw new Error("Server responded with error: " + res.error);
    else if (res.success) console.log("Successfully left the meeting");
  } catch (err) {
    console.log(err);
  }
}
