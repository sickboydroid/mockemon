import { Server } from "socket.io";
import JoinedUserModel from "../models/joinedUserModel.js";
import { auth } from "../firebase/firebase.js";
import { isObjectIdOrHexString } from "mongoose";

let io = null;

async function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth.token;
  if (!token) next(new Error("Authentication error: No token provided"));
  try {
    const user = await auth.verifyIdToken(token);
    socket.user = user;
    next();
  } catch (error) {
    console.log(error);
    next(new Error("Authentication error: Invalid token"));
  }
}

export function initIO(httpServer) {
  io = new Server(httpServer);
  io.on("error", onSocketError);
  io.use(socketAuthMiddleware);
  io.on("connection", onSocketConnection);
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not intitialized");
  return io;
}

export async function onSocketConnection(socket) {
  const socketType = socket.handshake.auth.socket_type;
  socket.on("disconnect", async () => await onSocketDisconnected(socket));
  if (socketType == "pairing") return;
  else if (socketType == "interview")
    await handleInterviewJoin(socket.user.uid, socket.id);
}

async function handleInterviewJoin(userUID, userSocketId) {
  const res = await JoinedUserModel.findOne({ user_uid: userUID })
    .select("other role interview_socket_id")
    .populate("other");
  if (res.other.has_joined) {
    console.log(`Both parties joined, setting up interview sockets for webrtc`);
    // assuming other users role is callee
    let callerSocketId = res.other.interview_socket_id;
    let calleeSocketId = userSocketId;
    if (res.role == "caller")
      [callerSocketId, calleeSocketId] = [calleeSocketId, callerSocketId];
    handleInterviewSockets(callerSocketId, calleeSocketId);
  }
  await JoinedUserModel.updateOne(
    { user_uid: userUID },
    { $set: { interview_socket_id: userSocketId, has_joined: true } },
  );
}

// TODO: Make an event which asks other party to resend stuff
export function handleInterviewSockets(callerSocketId, calleeSocketId) {
  const callerIceCandidates = [];
  const calleeIceCandidates = [];
  const caller = io.sockets.sockets.get(callerSocketId);
  const callee = io.sockets.sockets.get(calleeSocketId);
  caller.other = callee;
  callee.other = caller;

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

  io.to(calleeSocketId).emit("ready");
  io.to(callerSocketId).emit("ready");
}

async function onSocketDisconnected(socket) {
  const userUID = socket.user.uid;
  const socketType = socket.handshake.auth.socket_type;
  console.log(`${socket.user.email} disconnected`);
  if (socketType == "pairing") return;
  else if (socketType == "interview") {
    await JoinedUserModel.updateOne(
      { user_uid: userUID },
      { $set: { is_joined: false, interview_socket_id: null } },
    );
    io.to(socket.other.id).emit("reset");
    socket.other.removeAllListeners();
    socket.other.other = null;
  }
}

function onSocketError(err) {
  console.log(err);
}

// TODO: In frontend, apply socket_disconnect when rejected
// is onAuthChanged good or should i use something else which is lighter
// transfer to login page if no auth token??
// Let "other" know (if avail) when his pair disconnected
// if meeting not started, unpair him and recall pairing <<< cannot happen
