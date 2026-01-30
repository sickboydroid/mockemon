import JoinedUserModel from "../models/joinedUserModel.js";
import { getIO } from "../sockets/sockets.js";

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

async function pairUsers() {
  const joinedUsers = await JoinedUserModel.find({ is_paired: false }).sort({
    join_time: -1,
  });
  console.log(`Pairing ${joinedUsers.length} users`);
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
  const userUID = req.user.uid;
  // TODO: May be don't delete??
  await JoinedUserModel.deleteOne({ user_uid: userUID });
  await JoinedUserModel.create({ user_uid: userUID });
  if (isInterviewOngoing()) await pairUsers();
  res.json({ success: true });
}

export async function removeUserFromInterview(req, res) {
  const userUID = req.user.uid;
  const deleteRes = await JoinedUserModel.deleteOne({
    user_uid: userUID,
    is_paired: false,
  });
  res.json({ success: deleteRes.deletedCount == 1 });
}

export async function addPairingSubscription(req, res) {
  const pairingSocketId = req.body.socket_id;
  const userUID = req.user.uid;
  const socket = getIO().sockets.sockets.get(pairingSocketId);
  try {
    if (!socket) throw new Error("No socket found with provided id");
    if (!socket.connected) throw new Error("Provided socket was disconnected");
    await JoinedUserModel.updateOne(
      { user_uid: userUID },
      { $set: { pairing_socket_id: pairingSocketId } },
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
}
