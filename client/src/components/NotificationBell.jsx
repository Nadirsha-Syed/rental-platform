import React, { useState, useEffect } from "react";
import { Bell, Search, CheckCircle } from "lucide-react";
import axios from "axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Error fetching notifications:", err.message);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" /> Demand Alerts
            </h3>
            <span className="text-xs bg-indigo-500 px-2 py-1 rounded-full">
              {notifications.length} recent
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No recent demand alerts in your area.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      High Demand for <span className="font-bold text-indigo-600">"{n.searchQuery}"</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      A renter in <span className="font-semibold">{n.location}</span> was searching for this item!
                    </p>
                    <span className="text-[10px] text-gray-400 mt-2 block">
                      {new Date(n.notifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;