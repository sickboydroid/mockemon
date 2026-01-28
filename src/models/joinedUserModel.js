import mongoose, { Schema } from "mongoose";
import { io } from "../server.js";
const ObjectId = mongoose.SchemaTypes.ObjectId;

const joinedUserModel = new Schema({
  user_uid: {
    type: String,
    ref: "User",
    req: true,
    unique: true,
  },
  pairing_socket_id: String,
  interview_socket_id: String,
  role: {
    type: String,
    enum: ["pending", "callee", "caller"],
    default: "pending",
    req: true,
  },
  other: {
    type: ObjectId,
    ref: "JoinedUser",
  },
  has_joined: {
    type: Boolean,
    default: false,
  },
  is_paired: {
    type: Boolean,
    default: false,
  },
  join_time: {
    type: Date,
    default: () => new Date(),
  },
});

joinedUserModel.pre("save", async function () {
  this.modifiedPaths().forEach((field) => {
    if (field == "is_paired" && this.get(field)) {
      const socketId = this.get("pairing_socket_id");
      if (socketId) io.to(socketId).emit("on_paired", this.get("role"));
    }
  });
});

const JoinedUserModel = mongoose.model("JoinedUser", joinedUserModel);
export default JoinedUserModel;
