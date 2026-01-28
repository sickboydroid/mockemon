import express from "express";
import { addUser } from "../controllers/user.js";
const userRouter = express.Router();

userRouter.post("/add", addUser);

export default userRouter;
