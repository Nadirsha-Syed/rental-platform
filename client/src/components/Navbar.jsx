import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext"; 
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { MessageSquare } from "lucide-react";
import API_BASE_URL from "../config/api";

export default function Navbar() {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user, logout, isAuthenticated } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUnreadCount = () => {
      fetch(`${API_BASE_URL}/api/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const totalUnread = data.reduce((acc, room) => acc + (room.unreadCount || 0), 0);
            setUnreadMessages(totalUnread);
          }
        })
        .catch(err => console.error("Error fetching unread count:", err));
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

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

        <Link to="/products" className="logo">
          RentalHub
        </Link>

        <form className="searchWrap" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search rentals..."
            className="searchInput"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="navActions">


          <button
            onClick={toggleTheme}
            className={`themeSwitch ${
              theme === "corporate" ? "active" : ""
            }`}
          >
            <span className="switchBall"></span>
          </button>


          {isAuthenticated && <NotificationBell />}


          {isAuthenticated && (
            <Link to="/chat" className="chatLink relative" title="Messages">
              <MessageSquare size={20} />
              {unreadMessages > 0 && (
                <span className="absolute top-[-5px] right-[-5px] bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </Link>
          )}


          <Link to="/profile" className="profileAvatar" title="Profile & Account">
            {isAuthenticated && user?.name ? user.name[0].toUpperCase() : "👤"}
          </Link>

        </div>

      </div>
    </nav>
  );
}