import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";


export default function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const toggleTheme = () => {
    setTheme(theme === "default" ? "corporate" : "default");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="nav">
      <div className="navInner">

        {/* LEFT - Logo */}
        <Link to="/products" className="logo">
          RentalHub
        </Link>

        {/* CENTER - Search */}
        <div className="searchWrap">
          <input
            type="text"
            placeholder="Search cameras, drones, tools..."
            className="searchInput"
          />
        </div>

        {/* RIGHT - Actions */}
        <div className="navActions">

          {/* Add Rental only if logged in */}
          {user && (
            <Link to="/add-rental" className="addBtn">
              Add Rental
            </Link>
          )}

          {/* 🔐 Auth Section */}
          {user ? (
            <>
              <span className="userName">
                Hi, {user.name}
              </span>

              <button onClick={handleLogout} className="logoutBtn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="loginBtn">
              Login
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`themeSwitch ${
              theme === "corporate" ? "active" : ""
            }`}
          >
            <span className="switchBall"></span>
          </button>

        </div>

      </div>
    </nav>
  );
}