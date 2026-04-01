import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "./OwnerDashboard.css"; // Ensure you create this CSS file

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      try {
        const statsRes = await fetch("http://localhost:5000/api/bookings/owner-revenue", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        setStats(statsData);

        const bookingsRes = await fetch("http://localhost:5000/api/bookings/owner-bookings", {
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

    fetchDashboardData();
  }, []);

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
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} className="table-body-row">
                    <td className="item-cell">{booking.rentalItem?.title}</td>
                    <td className="customer-cell">
                      <div className="customer-name">{booking.user?.name}</div>
                      <div className="customer-email">{booking.user?.email}</div>
                    </td>
                    <td className="date-cell">
                      {new Date(booking.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="amount-cell">₹{booking.totalPrice}</td>
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