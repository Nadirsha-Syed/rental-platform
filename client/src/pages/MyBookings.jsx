import Navbar from "../components/Navbar";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { executeRentalPayment } from "../services/razorpayService";
// 🔥 MODIFIED: Import your dynamic base URL configuration
import API_BASE_URL from "../config/api"; 
import "./MyBookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // 🔥 Fetch bookings
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token"); // 🔥 Added token safety lookup

      // 🔥 MODIFIED: Swapped hardcoded URL for API_BASE_URL and added Authorization headers
      const res = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      setBookings(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 🔥 Cancel booking
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const token = localStorage.getItem("token"); // 🔥 Retrieve authorization state
      
      // 🔥 MODIFIED: Swapped hardcoded URL for API_BASE_URL and attached bearer token
      const res = await fetch(
        `${API_BASE_URL}/api/bookings/${id}/cancel`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Booking cancelled ❌");
        fetchBookings(); // refresh
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 💳 Pay Now Handler
  const handlePay = async (booking) => {
    if (!user) {
      alert("Please sign in to complete the payment transaction.");
      return;
    }

    const phoneStored = localStorage.getItem(`userPhone_${user.email}`) || "";
    const userDetails = {
      name: user.name,
      email: user.email,
      phone: phoneStored,
      bookingId: booking._id,
      itemId: booking.rentalItem?._id || booking.rentalItem, // Include item context for alerts
    };

    // Execute the three-way payment handshake
    await executeRentalPayment(
      booking.totalPrice,
      booking.rentalItem?.title || "Rental Reservation",
      userDetails,
      () => {
        // Verification success callback: instantly refresh bookings status
        fetchBookings();
      }
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="myBookingsPage">
          <p style={{ textAlign: "center", padding: "3rem", color: "rgb(var(--text-muted))" }}>Loading bookings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="myBookingsPage">
        <header className="headerSection">
          <h2 className="title">My Bookings</h2>
          <p style={{ color: "rgb(var(--text-muted))", marginTop: "-10px", marginBottom: "20px" }}>
            Track your rental requests and complete payments for approved bookings.
          </p>
        </header>

        {bookings.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgb(var(--text-muted))", padding: "2rem" }}>No bookings yet</p>
        ) : (
          <div className="bookingsGrid">
            {bookings.map((b) => (
              <div key={b._id} className="bookingCard">

                {/* IMAGE WITH STATUS BADGE */}
                <div className="imageWrapper">
                  <img
                    src={
                      b.rentalItem?.image ||
                      "https://via.placeholder.com/300"
                    }
                    alt="rental"
                  />
                  <span className={`statusBadge ${b.status}`}>
                    {b.status}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="cardContent">
                  <h3>{b.rentalItem?.title || "Deleted Rental Item"}</h3>

                  {/* LOCATION */}
                  <span className="locationInfo">
                    📍 {b.rentalItem?.location || "No Location Specified"}
                  </span>

                  {/* TIME */}
                  <div className="dateTimeInfo">
                    <div>
                      <strong>Start:</strong> {new Date(b.startTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                    <div>
                      <strong>End:</strong> {new Date(b.endTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="priceContainer">
                    <span className="priceLabel">Total Amount</span>
                    <span className="totalPriceValue">₹{b.totalPrice}</span>
                  </div>

                  {/* PAYMENT STATUS BADGE */}
                  <div style={{ marginTop: "4px" }}>
                    <span className={`paymentStatusBadge ${b.paymentStatus || "unpaid"}`}>
                      Payment: {b.paymentStatus || "unpaid"}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="cardActions">
                  {/* Pay button shown only when confirmed and unpaid */}
                  {b.status === "confirmed" && b.paymentStatus !== "paid" && (
                    <button className="btnPayNow" onClick={() => handlePay(b)}>
                      💳 Pay Now
                    </button>
                  )}

                  {/* Cancel button shown for non-cancelled and non-paid bookings */}
                  {b.status !== "cancelled" && b.status !== "expired" && b.paymentStatus !== "paid" && (
                    <button className="btnCancelBooking" onClick={() => handleCancel(b._id)}>
                      Cancel Booking
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}