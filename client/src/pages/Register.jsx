import { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Auth.css";

export default function Register() {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/products");
    } else {
      alert(data.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className={`authPage ${theme}`}>
        <div className="authCard">

          <h2>Create Account 🚀</h2>
          <p className="subtitle">Start renting & earning</p>

          <input
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleRegister} className="authBtn">
            Register
          </button>

          <p className="bottomText">
            Already have an account? <Link to="/login">Login</Link>
          </p>

        </div>
      </div>
    </>
  );
}