import express from "express";
import mongoose from "mongoose";
import requestLogger from "./middlewares/logger.js";
import interviewRouter from "./routes/interview.js";
import http from "http";
import userRouter from "./routes/user.js";
import { config } from "dotenv";
import path from "path";
import { initIO } from "./sockets/sockets.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import JoinedUserModel from "./models/joinedUserModel.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const server = http.createServer(app);
config();
initIO(server);

//TODO: use actual url
mongoose
  .connect("mongodb://localhost/db_mockemon")
  .then(async () => {
    console.log("Database connected");
    // TODO: Only for debugging, find a more reliable way to manage disconnected users
    // await JoinedUserModel.deleteMany({});
  })
  .catch((reason) => {
    console.log("Failed to connect to database", reason);
    process.exit(-1);
  });

// app.use(express.static(path.resolve(import.meta.dirname, "../dist")));
app.use(requestLogger);
app.use(express.json());
app.use("/api", authMiddleware);
app.use("/api/interview", interviewRouter);
app.use("/api/user", userRouter);
app.use(errorHandler);

server.listen(process.env.PORT, () =>
  console.log(`Server is listening on ${process.env.PORT}`),
);
