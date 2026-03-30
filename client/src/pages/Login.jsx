import { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import "./Auth.css";

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔐 Standard Email/Password Login
  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert("Please fill all fields");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const authResult = await response.json();

      // Log this to see exactly what your backend is sending
      console.log("LOGIN ATTEMPT RESULT:", authResult);

      if (response.ok) {
        // Double check: does authResult.user actually exist?
        if (authResult.token && authResult.user) {
          localStorage.setItem("token", authResult.token);
          localStorage.setItem("user", JSON.stringify(authResult.user));
          navigate("/products");
        } else {
          console.error("Backend success but missing data keys. Check if it's authResult.data.user");
          alert("Login successful, but user profile was not found.");
        }
      } else {
        alert(authResult.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("NETWORK ERROR:", err);
      alert("Server is not responding. Please try again later.");
    }
  };

  // 🔐 Google Login Logic
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: credentialResponse.credential, // The JWT from Google
        }),
      });

      const authResult = await response.json();

      console.log("GOOGLE AUTH RESULT:", authResult);

      if (response.ok) {
        // Ensure user data exists before storing
        if (authResult.user) {
          localStorage.setItem("token", authResult.token);
          localStorage.setItem("user", JSON.stringify(authResult.user));
          navigate("/products");
        } else {
          alert("Google login worked, but we couldn't create your profile.");
        }
      } else {
        // This triggers if your backend (authController) returns a status like 400 or 500
        alert(authResult.message || "Google authentication failed on our server.");
      }
    } catch (err) {
      console.error("GOOGLE CONNECTION ERROR:", err);
      alert("Failed to connect for Google Login.");
    }
  };

  return (
    <>
      <Navbar />

      <div className={`authPage ${theme}`}>
        <div className="authCard">
          <div className="authHeaderCenter">
            <h1>RentalHub</h1>
            <p>Your go-to rental marketplace</p>
          </div>

          <h2>Welcome Back 👋</h2>
          <p className="subtitle">Login to your account</p>

          <input
            type="email"
            placeholder="Enter email"
            className="authInput" // Added a clear class if you need it
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter password"
            className="authInput"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin} className="authBtn">
            Login
          </button>

          <div className="divider">OR</div>

          <div className="googleWrap">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google login failed. Try again.")}
            />
          </div>

          <p className="bottomText">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </>
  );
}