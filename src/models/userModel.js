import mongoose, { Schema } from "mongoose";
const ObjectId = mongoose.SchemaTypes.ObjectId;

const userSchema = new Schema({
  user_uid: {
    type: String,
    unique: true,
    req: true,
  },
  name: {
    type: String,
    req: true,
  },
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
