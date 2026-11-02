import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import API_BASE_URL from "../config/api";
import "./Dashboard.css"; 

export default function Dashboard() {
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const fetchMyBookings = async () => {
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user"))?.token;
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMyBookings(data.data || []);
      } else {
        console.error("Failed to fetch user bookings payload:", data.message);
      }
    } catch (err) {
      console.error("Error connecting to bookings infrastructure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleUserCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;

    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user"))?.token;
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Booking request cancelled successfully.");
        fetchMyBookings();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to cancel request");
      }
    } catch (err) {
      console.error("Cancellation routing error:", err);
    }
  };

  if (loading) return <div className="loading-state">Loading Your Bookings...</div>;

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">My Rental Hub</h1>
          <p className="dashboard-subtitle">Track your booking orders, validation tokens, and rental history.</p>
        </header>

        {/* Borrower Activity List Matrix */}
        <section className="bookings-section">
          <div className="section-header">
            <h3 className="section-title">Your Rental Orders</h3>
          </div>
          <div className="table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr className="table-header-row">
                  <th>Item Image</th>
                  <th>Rental Item</th>
                  <th>Location</th>
                  <th>Date & Time Window</th>
                  <th>Total Price</th>
                  <th style={{ textAlign: "right" }}>Status / Actions</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map((booking) => (
                  <tr key={booking._id} className="table-body-row">
                    <td className="image-cell">
                      <img 
                        src={booking.rentalItem?.image || "https://placehold.co/60x40"} 
                        alt={booking.rentalItem?.title} 
                        style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    </td>
                    <td className="item-cell">
                      <span style={{ fontWeight: "600" }}>{booking.rentalItem?.title || "Item Unavailable"}</span>
                    </td>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><MapPin size={14} />{booking.rentalItem?.location || "N/A"}</span></td>
                    <td className="date-cell">
                      {new Date(booking.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="amount-cell">₹{booking.totalPrice}</td>
                    
                    <td style={{ textAlign: "right" }}>
                      {booking.status === "pending" ? (
                        <button 
                          onClick={() => handleUserCancel(booking._id)}
                          className="btn-cancel"
                          style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                        >
                          Cancel Request
                        </button>
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
          {myBookings.length === 0 && (
            <div className="empty-state">
              <p>You haven't requested any rental items yet. Head to the marketplace to get started!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}