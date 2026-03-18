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

  // Email login
  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/products");
    } else {
      alert(data.message);
    }
  };

  // Google login


const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: credentialResponse.credential,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    // ✅ Save user
    localStorage.setItem("user", JSON.stringify(data));

    // ✅ Redirect
    window.location.href = "/products";

  } catch (err) {
    console.log("GOOGLE LOGIN ERROR:", err);
  }
};

  return (
    <>
      
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
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter password"
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