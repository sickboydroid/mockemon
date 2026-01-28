import InterviewModel from "../models/interviewModel.js";
import JoinedUserModel from "../models/joinedUserModel.js";
import { io } from "../server.js";

const upcomingInterview = {
  startTime: new Date(2000, 0),
  userCount: 0,
  endTime: new Date(2000, 0),
};

function setupNextInterview() {
  const curTime = new Date();
  const startTime = new Date();
  // TODO: Schedule next interview on time
  // startTime.setHours(startTime.getHours() + 1);
  // startTime.setMinutes(0, 0, 0);
  startTime.setSeconds(curTime.getSeconds() + 5);
  const endTime = new Date(startTime);
  endTime.setMinutes(30);
  upcomingInterview.startTime = startTime;
  upcomingInterview.endTime = endTime;
  setTimeout(pairUsers, startTime - curTime);
}

// TODO: Keep watch in /onpair route and let user know he has been paried
async function pairUsers() {
  console.log("Pairing users");
  const joinedUsers = await JoinedUserModel.find({ is_paired: false }).sort({
    join_time: -1,
  });
  console.log(joinedUsers);

  for (let i = 0; i < joinedUsers.length - 1; i += 2) {
    joinedUsers[i].role = "caller";
    joinedUsers[i].other = joinedUsers[i + 1].id;
    joinedUsers[i].is_paired = true;
    joinedUsers[i + 1].role = "callee";
    joinedUsers[i + 1].other = joinedUsers[i].id;
    joinedUsers[i + 1].is_paired = true;
    await joinedUsers[i].save();
    await joinedUsers[i + 1].save();
  }
}

// TODO: Make an event which asks other party to resend stuff
export function setupSockets(callerSocketId, calleeSocketId) {
  const callerIceCandidates = [];
  const calleeIceCandidates = [];
  const caller = io.sockets.sockets.get(callerSocketId);
  const callee = io.sockets.sockets.get(calleeSocketId);
  // TODO: For debuggings
  // caller.onAny((eventName, ...args) => {
  //   console.log("caller: ", eventName, args);
  // });

  // callee.onAny((eventName, ...args) => {
  //   console.log("callee: ", eventName, args);
  // });
  caller.on("sdp", (sdp) => io.to(calleeSocketId).emit("sdp", sdp));
  callee.on("sdp", (sdp) => io.to(callerSocketId).emit("sdp", sdp));
  caller.on("ice-candidate", (iceCandidate) => {
    callerIceCandidates.push(iceCandidate);
    io.to(calleeSocketId).emit("ice-candidate", callerIceCandidates);
  });
  callee.on("ice-candidate", (iceCandidate) => {
    calleeIceCandidates.push(iceCandidate);
    io.to(callerSocketId).emit("ice-candidate", calleeIceCandidates);
  });
}

export async function getInterviewStatus(req, res) {
  const curTime = new Date();
  if (curTime < upcomingInterview.startTime) {
    // interview hasn't started
    return res.json({
      start_time: upcomingInterview.startTime.getTime(),
      is_ongoing: false,
    });
  } else if (isInterviewOngoing()) {
    // interview is ongoing
    return res.json({
      is_ongoing: true,
    });
  } else {
    // interview has ended, setup a new meeting
    setupNextInterview();
    return getInterviewStatus(req, res);
  }
}
function isInterviewOngoing() {
  const curTime = new Date();
  return (
    upcomingInterview.startTime <= curTime &&
    curTime <= upcomingInterview.endTime
  );
}

export async function addUserToInterview(req, res) {
  const userUID = req.body.user_uid;
  // TODO: May be don't delete??
  await JoinedUserModel.deleteOne({ user_uid: userUID });
  await JoinedUserModel.create({ user_uid: userUID });
  if (isInterviewOngoing()) await pairUsers();
  res.json({ success: true });
}

export async function removeUserFromInterview(req, res) {
  const userUID = req.body.user_uid;
  const deleteRes = await JoinedUserModel.deleteOne({
    user_uid: userUID,
    is_paired: false,
  });
  res.json({ success: deleteRes.deletedCount == 1 });
}

export async function addPairingSubscription(req, res) {
  const pairingSocketId = req.body.socket_id;
  const userUID = req.body.user_uid;
  const socket = io.sockets.sockets.get(pairingSocketId);
  try {
    if (!socket || !socket.connected) throw new Error("Invalid Socket ID");
    await JoinedUserModel.updateOne(
      { user_uid: userUID },
      { $set: { pairing_socket_id: pairingSocketId } },
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
}
