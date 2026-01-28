import express from "express";
import {
  addPairingSubscription,
  addUserToInterview,
  getInterviewStatus,
  removeUserFromInterview,
} from "../controllers/interview.js";

const interviewRouter = express.Router();
interviewRouter.post("/status", getInterviewStatus);
interviewRouter.post("/join", addUserToInterview);
interviewRouter.post("/leave", removeUserFromInterview);
interviewRouter.post("/subscribe", addPairingSubscription);
export default interviewRouter;
