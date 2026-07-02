import { useEffect, useState, useContext } from "react";
import Navbar from "../components/Navbar";
import "./OwnerDashboard.css";
import API_BASE_URL from "../config/api"; 
import { AuthContext } from "../context/AuthContext"; // 🔌 Import AuthContext to read dynamic wallet states

export default function OwnerDashboard() {
  const { user } = useContext(AuthContext); // 💰 Extract user session object
  
  // 🛠️ FIX: Initialize state with a safe object structure instead of null to prevent runtime layout errors
  const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, activeBookings: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalHandle, setWithdrawalHandle] = useState(""); // State to hold input handle

  // 🔄 Fetch dashboard data using centralized environment mapping
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user"))?.token;
    try {
      const statsRes = await fetch(`${API_BASE_URL}/api/bookings/owner-revenue`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      // Validation safety check
      if (statsRes.ok) {
        setStats(statsData);
      }

      const bookingsRes = await fetch(`${API_BASE_URL}/api/bookings/owner-bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 🟢 Handle Booking Approval
  const handleConfirm = async (bookingId) => {
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user"))?.token;
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/confirm`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Booking Confirmed! Lender wallet credited successfully. 🟢");
        fetchDashboardData(); // 🔄 Instantly refresh stats and list
      } else {
        const data = await res.json();
        alert(data.message || "Failed to confirm booking");
      }
    } catch (err) {
      console.error("Confirm Error:", err);
    }
  };

  // 🔴 Handle Booking Rejection
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to reject this booking request?")) return;

    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user"))?.token;
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Booking Rejected and balance adjusted 🔴");
        fetchDashboardData(); // 🔄 Instantly refresh stats and list
      } else {
        const data = await res.json();
        alert(data.message || "Failed to reject booking");
      }
    } catch (err) {
      console.error("Cancel Error:", err);
    }
  };

  const handleWithdrawalRequest = () => {
    if (!withdrawalHandle.trim()) {
      alert("Please enter a valid FamApp UPI handle before executing settlement.");
      return;
    }
    alert(`Withdrawal request recorded for ${withdrawalHandle}! Your platform admin will process the manual payout settlement to your balance account within 24 hours.`);
    setWithdrawalHandle("");
  };

  if (loading) return <div className="loading-state">Loading Dashboard...</div>;

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Owner Dashboard</h1>
          <p className="dashboard-subtitle">Manage your rentals and track your earnings.</p>
        </header>

        {/* 💰 VIRTUAL EARNINGS WALLET DISPLAY CARD */}
        <div className="wallet-card">
          <span className="wallet-label">
            Withdrawable Wallet Ledger Balance
          </span>
          <h1 className="wallet-value">
            ₹{user?.walletBalance !== undefined ? user.walletBalance : (stats?.totalRevenue || 0)}
          </h1>
          
          <div className="wallet-input-group">
            <input 
              type="text" 
              placeholder="Enter FamApp UPI (e.g., name@fam)" 
              value={withdrawalHandle}
              onChange={(e) => setWithdrawalHandle(e.target.value)}
              className="wallet-input"
            />
            <button 
              onClick={handleWithdrawalRequest}
              className="btn-withdraw"
            >
              Withdraw to FamApp
            </button>
          </div>
        </div>

        {/* 📊 Earnings Overview */}
        <section className="stats-grid">
          <div className="stat-card revenue-card">
            <span className="stat-label">Total Revenue</span>
            <p className="stat-value">₹{stats?.totalRevenue || 0}</p>
          </div>
          <div className="stat-card booking-count-card">
            <span className="stat-label">Total Bookings</span>
            <p className="stat-value">{stats?.totalBookings || 0}</p>
          </div>
          <div className="stat-card active-rentals-card">
            <span className="stat-label">Active Rentals</span>
            <p className="stat-value">{stats?.activeBookings || 0}</p>
          </div>
        </section>

        {/* 📋 Incoming Bookings List */}
        <section className="bookings-section">
          <div className="section-header">
            <h3 className="section-title">Recent Inbound Bookings</h3>
          </div>
          <div className="table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr className="table-header-row">
                  <th>Rental Item</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Total Earned</th>
                  <th style={{ textAlign: "right" }}>Status / Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="table-body-row">
                    <td className="item-cell">{booking.rentalItem?.title}</td>
                    <td className="customer-cell">
                      <div className="customer-name">{booking.user?.name || "Premium Renter"}</div>
                      <div className="customer-email">{booking.user?.email || "renter@email.com"}</div>
                    </td>
                    <td className="date-cell">
                      {new Date(booking.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="amount-cell">₹{booking.totalPrice}</td>
                    
                    <td style={{ textAlign: "right" }}>
                      {booking.status === "pending" ? (
                        <div className="action-buttons-container">
                          <button 
                            onClick={() => handleConfirm(booking._id)}
                            className="btn-confirm"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleCancel(booking._id)}
                            className="btn-cancel"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ 
                          fontWeight: "700", 
                          color: booking.status === "confirmed" ? "#10B981" : "#EF4444",
                          textTransform: "uppercase",
                          fontSize: "0.85rem",
                          letterSpacing: "0.05em"
                        }}>
                          {booking.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <div className="empty-state">
              <p>No one has booked your items yet. Hang tight!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}