import { useContext, useState, useEffect } from "react"; // Added useEffect
import { ThemeContext } from "../context/ThemeContext";
import "./Navbar.css";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Added useLocation

export default function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation(); // Used to trigger check on page change

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null); // Move user to State

  // 🔄 Sync User state with LocalStorage
  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log("Navbar: User detected ->", parsedUser.name);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("User parse error:", err);
        setUser(null);
      }
    };

    checkUser();
  }, [location]); // Re-run this check whenever the URL route changes

  const toggleTheme = () => {
    setTheme(theme === "default" ? "corporate" : "default");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null); // Clear state immediately
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

         {/* 📊 Dashboard Button */}
{user && (
  <Link to="/owner-dashboard" className="navBtn dashboardBtn">
    Dashboard
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