import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext"; // 🔥 MODIFIED: Import global AuthContext
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  // 🔥 MODIFIED: Extract live, reactive values from centralized AuthContext pipeline
  const { user, logout, isAuthenticated } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const toggleTheme = () => {
    setTheme(theme === "default" ? "corporate" : "default");
  };

  const handleLogout = () => {
    logout(); // 🔥 MODIFIED: Dispatches global context wipe out-of-the-box
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${search}`);
      setSearch(""); 
    }
  };

  return (
    <nav className="nav">
      <div className="navInner">

        {/* LEFT - Logo */}
        <Link to="/products" className="logo">
          RentalHub
        </Link>

        {/* CENTER - Search */}
        <form className="searchWrap" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search rentals..."
            className="searchInput"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* RIGHT - Actions */}
        <div className="navActions">

          {/* 📂 My Rentals */}
          {isAuthenticated && (
            <Link to="/my-rentals" className="navBtn">
              My Rentals
            </Link>
          )}

          {/* ➕ Add Rental */}
          {isAuthenticated && (
            <Link to="/add-rental" className="addBtn">
              + Add Rental
            </Link>
          )}

          {/* 📊 Dashboard Button */}
          {isAuthenticated && (
            <Link to="/owner-dashboard" className="navBtn dashboardBtn">
              Dashboard
            </Link>
          )}

          {/* 🔐 Auth Section */}
          {isAuthenticated ? (
            <div className="authBlock">
              <span className="userName">
                Hi, {user?.name || "User"}
              </span>

              <button onClick={handleLogout} className="logoutBtn">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="loginBtn">
              Login
            </Link>
          )}

          {/* 🎨 Theme Toggle */}
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