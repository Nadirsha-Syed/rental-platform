import "./Navbar.css";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <header className="nav">
      <div className="brand" onClick={() => navigate("/")}>
        RentHub
      </div>

      <nav className="links">
        <button onClick={() => navigate("/products")}>Explore</button>
        <button onClick={() => navigate("/")}>Dashboard</button>
      </nav>

      <div className="themes">
        <button onClick={() => setTheme("default")}>Default</button>
        <button onClick={() => setTheme("neon")}>Neon</button>
        <button onClick={() => setTheme("corporate")}>Corp</button>
      </div>
    </header>
  );
}