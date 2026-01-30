import { auth } from "../firebase/firebase.js";

export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = await auth.verifyIdToken(token);
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Unauthorized" });
  }
}
