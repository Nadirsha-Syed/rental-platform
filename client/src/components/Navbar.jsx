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

          {/* 🎨 Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`themeSwitch ${
              theme === "corporate" ? "active" : ""
            }`}
          >
            <span className="switchBall"></span>
          </button>

          {/* 👤 Circular Profile Avatar */}
          <Link to="/profile" className="profileAvatar" title="Profile & Account">
            {isAuthenticated && user?.name ? user.name[0].toUpperCase() : "👤"}
          </Link>

        </div>

      </div>
    </nav>
  );
}