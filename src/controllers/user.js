import UserModel from "../models/userModel.js";

export async function addUser(req, res) {
  // TODO: verify the uid send by user on firebase
  const userUID = req.user.uid;
  if (await UserModel.exists({ user_uid: userUID }))
    return res.json({
      success: true,
      message: "User already exists so not added",
    });
  await UserModel.create({ user_uid: userUID });
  res.json({
    success: true,
  });
}
