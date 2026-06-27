import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./OwnerDashboard.css";
// 🔥 MODIFIED: Import your dynamic base URL configuration
import API_BASE_URL from "../config/api"; 

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch dashboard data using centralized environment mapping
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user"))?.token;
    try {
      // 🔥 MODIFIED: Replaced hardcoded URL strings with template literals pointing to API_BASE_URL
      const statsRes = await fetch(`${API_BASE_URL}/api/bookings/owner-revenue`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      // 🔥 MODIFIED: Replaced hardcoded URL strings with template literals pointing to API_BASE_URL
      const bookingsRes = await fetch(`${API_BASE_URL}/api/bookings/owner-bookings`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);
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
      // 🔥 MODIFIED: Replaced hardcoded URL strings with template literals pointing to API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/confirm`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Booking Confirmed! 🟢");
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
      // 🔥 MODIFIED: Replaced hardcoded URL strings with template literals pointing to API_BASE_URL
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        alert("Booking Rejected 🔴");
        fetchDashboardData(); // 🔄 Instantly refresh stats and list
      } else {
        const data = await res.json();
        alert(data.message || "Failed to reject booking");
      }
    } catch (err) {
      console.error("Cancel Error:", err);
    }
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
                      <div className="customer-name">{booking.user?.name || "Promptedin"}</div>
                      <div className="customer-email">{booking.user?.email || "promptedin@gmail.com"}</div>
                    </td>
                    <td className="date-cell">
                      {new Date(booking.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="amount-cell">₹{booking.totalPrice}</td>
                    
                    {/* CONDITIONAL INTERACTIVE BUTTONS CELL */}
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