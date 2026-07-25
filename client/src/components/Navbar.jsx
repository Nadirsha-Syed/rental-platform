import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext"; 
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user, logout, isAuthenticated } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const toggleTheme = () => {
    setTheme(theme === "default" ? "corporate" : "default");
  };

  const handleLogout = () => {
    logout(); 
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`themeSwitch ${
              theme === "corporate" ? "active" : ""
            }`}
          >
            <span className="switchBall"></span>
          </button>

          {/* Notification Bell */ }
          {isAuthenticated && <NotificationBell />}

          {/*Profile */}
          <Link to="/profile" className="profileAvatar" title="Profile & Account">
            {isAuthenticated && user?.name ? user.name[0].toUpperCase() : "👤"}
          </Link>

        </div>

      </div>
    </nav>
  );
}