import express from "express";
const router = express.Router();
import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});


router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
