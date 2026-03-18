import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/bookings/my-bookings"
      );

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
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${id}/cancel`,
        {
          method: "PUT",
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page">
          <p>Loading bookings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="page">
        <h2 className="title">My Bookings</h2>

        {bookings.length === 0 ? (
          <p>No bookings yet</p>
        ) : (
          <div className="grid">
            {bookings.map((b) => (
              <div key={b._id} className="bookingCard">

                {/* IMAGE */}
                <img
                  src={
                    b.rentalItem?.image ||
                    "https://via.placeholder.com/300"
                  }
                  alt="rental"
                />

                {/* TITLE */}
                <h3>{b.rentalItem?.title}</h3>

                {/* LOCATION */}
                <p>📍 {b.rentalItem?.location}</p>

                {/* TIME */}
                <p>
                  🕒{" "}
                  {new Date(b.startTime).toLocaleString()} →{" "}
                  {new Date(b.endTime).toLocaleString()}
                </p>

                {/* PRICE */}
                <p>💰 ₹{b.totalPrice}</p>

                {/* STATUS */}
                <p className={`status ${b.status}`}>
                  Status: {b.status}
                </p>

                {/* CANCEL BUTTON */}
                {b.status !== "cancelled" && (
                  <button onClick={() => handleCancel(b._id)}>
                    Cancel Booking
                  </button>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}