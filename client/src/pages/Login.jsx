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

  // 🔐 Email login
  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert("Please fill all fields");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      console.log("LOGIN API RESPONSE:", result); // Look at this in your browser console!

      if (response.ok) {
        localStorage.setItem("token", result.token);
        
        // Safety check to prevent storing the string "undefined"
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        } else {
          console.warn("User object is missing in backend response!");
        }

        navigate("/products");
      } else {
        alert(result.message || "Login failed");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
    }
  };

  // 🔐 Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const result = await response.json();

      console.log("GOOGLE API RESPONSE:", result); // Look at this in your browser console!

      if (!response.ok) {
        alert(result.message || "Google login failed on server");
        return;
      }

      localStorage.setItem("token", result.token);
      
      // Safety check
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      } else {
        console.warn("User data missing from Google response");
      }

      navigate("/products");
    } catch (err) {
      console.log("GOOGLE LOGIN ERROR:", err);
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter password"
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
              onError={() => console.log("Google login failed")}
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