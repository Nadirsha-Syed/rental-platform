import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  // ✅ SAFE USER PARSE (FIXED)
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    console.log(" user :", user); // 🔥 debug
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error("User parse error:", err);
    user = null;
  }

  const toggleTheme = () => {
    setTheme(theme === "default" ? "corporate" : "default");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 🔎 Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${search}`);
      setSearch(""); // 🔥 clear input
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
          {user && (
            <Link to="/my-rentals" className="navBtn">
              My Rentals
            </Link>
          )}

          {/* ➕ Add Rental */}
          {user && (
            <Link to="/add-rental" className="addBtn">
              + Add Rental
            </Link>
          )}

          {/* 🔐 Auth Section */}
          {user ? (
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