import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
  googleLogin,
  getProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google",googleLogin);
router.get("/profile",protect,getProfile);

export default router;
