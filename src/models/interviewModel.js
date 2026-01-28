import mongoose, { Schema } from "mongoose";
const ObjectId = mongoose.SchemaTypes.ObjectId;

const interviewSchema = new Schema({
  meeting_id: {
    type: String,
    unique: true,
    req: true,
  },
  start_time: {
    type: Date,
  },
  end_time: {
    type: Date,
  },
  cleanup_time: {
    type: Date,
  },
  has_ended: {
    type: Boolean,
    default: false,
    req: true,
  },
  user_count: {
    type: Number,
    default: 0,
    req: true,
  },
});

const InterviewModel = mongoose.model("Interview", interviewSchema);
export default InterviewModel;
