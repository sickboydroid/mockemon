import express from "express";
import mongoose from "mongoose";
import requestLogger from "./middlewares/logger.js";
import interviewRouter from "./routes/interview.js";
import { Server } from "socket.io";
import http from "http";
import userRouter from "./routes/user.js";
import { config } from "dotenv";
import path from "path";
import JoinedUserModel from "./models/joinedUserModel.js";
import { setupSockets } from "./controllers/interview.js";

config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

//TODO: use actual url
mongoose.connect("mongodb://localhost/db_mockemon").catch((reason) => {
  console.log("Failed to connect to database", reason);
  process.exit(-1);
});

// app.use(express.static(path.resolve(import.meta.dirname, "../dist")));
app.use(requestLogger);
app.use(express.json());
app.use("/api/interview", interviewRouter);
app.use("/api/user", userRouter);

io.on("connection", async (socket) => {
  const socketType = socket.handshake.auth.socket_type;
  console.log(`socket.id=${socket.id} was connected for ${socketType}`);
  if (socketType == "pairing") return;
  const userUID = socket.handshake.auth.user_uid;

  const res = await JoinedUserModel.findOne({ user_uid: userUID })
    .select("other role interview_socket_id")
    .populate("other");
  if (res.other.has_joined) {
    let callerSocketId, calleeSocketId;
    if (res.role == "caller") {
      callerSocketId = socket.id;
      calleeSocketId = res.other.interview_socket_id;
    } else {
      callerSocketId = res.other.interview_socket_id;
      calleeSocketId = socket.id;
    }
    console.log("other has joined", callerSocketId, calleeSocketId);
    setupSockets(callerSocketId, calleeSocketId);
  } else {
    console.log("other has not joined yet");
  }
  await JoinedUserModel.updateOne(
    { user_uid: userUID },
    { $set: { interview_socket_id: socket.id, has_joined: true } },
  );
});

io.on("error", (err) => console.log(`${err}`));
server.listen(process.env.PORT, () =>
  console.log(`Server is listening on ${process.env.PORT}`),
);

export { io };
