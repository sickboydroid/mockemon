// Cloud function sdk for creating the triggers and cloud functions
import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { onDocumentCreated } from "firebase-functions/firestore";
import { onSchedule } from "firebase-functions/scheduler";

// Admin sdk for accessing firebase
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";
import { initializeApp } from "firebase-admin/app";
import { Database } from "firebase/database";

initializeApp();
const firestore = getFirestore();
const db = getDatabase();

export const documentWatcher = onDocumentCreated(
  "joined_users/{userUID}",
  event => {
    // document: full path
    logger.log(`${event.params.userUID} was created`, event.data.data());
  }
);

export const sayHello = onRequest((req, res) => {
  logger.log("request received", req);
  res.json({ hello: "I am here to create diplomatic relationships" });
});

export const generateUserPairs = onSchedule("* * * * *", async event => {
  logger.log("Starting to pair users....");
  const joinedUsersRef = firestore.collection("joined_users");
  const snapshot = await joinedUsersRef.select().get();
  const userUIDs = snapshot.docs.map(doc => doc.id);
  for (let i = 0; i < userUIDs.length - 1; i += 2) {
    // TODO: check online status of users
    await pairUsers(db, userUIDs[i], userUIDs[i + 1]);
    await joinedUsersRef.doc(userUIDs[i]).delete();
    await joinedUsersRef.doc(userUIDs[i + 1]).delete();
    logger.log(`${userUIDs[i]} paired with ${userUIDs[i + 1]}`);
  }
  logger.log("All users paired");
  await scheduleNextMeeting();
});

function scheduleNextMeeting() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const nextHourEpoch = now.getTime();
  return firestore.collection("meeting").doc("upcoming_meeting").set({
    startTime: nextHourEpoch,
    userCount: 0,
    remainingJoins: 3,
  });
}

/**
 *
 * @param {Database} db
 * @param {String} userUID1
 * @param {String} userUID2
 */
async function pairUsers(db, userUID1, userUID2) {
  console.log(userUID1, userUID2);
  await db
    .ref("sessions/" + userUID1)
    .set({ role: "caller", callee: userUID2 });
  await db
    .ref("sessions/" + userUID2)
    .set({ role: "callee", caller: userUID1 });
}
