import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// 🔐 Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// ==========================
// 🟢 REGISTER
// ==========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // Token
    const token = generateToken(user);

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ==========================
// 🔵 LOGIN (EMAIL)
// ==========================
export const loginUser = async (req, res) => {
  
  try {
    const { email, password } = req.body;
    
    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    console.log("token payload userid :",user._id); // Debugging log
    
    // Token
    const token = generateToken(user);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ==========================
// 🔴 GOOGLE LOGIN
// ==========================
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    // If not → create
    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google-auth", // dummy password
        role: "user",
      });
    }

    // Generate JWT
    const jwtToken = generateToken(user);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: jwtToken,
    });

  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    res.status(500).json({ message: "Google login failed" });
  }
};


// ==========================
// 🟡 GET PROFILE
// ==========================
export const getProfile = async (req, res) => {
  res.json(req.user);
};