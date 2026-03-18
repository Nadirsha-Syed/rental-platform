import Navbar from "../components/Navbar";
import "./ProductDetails.css";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ProductDetails() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  // Fetch product
  useEffect(() => {
    fetch(`http://localhost:5000/api/rentals/${productId}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [productId]);

  // Calculate price
  useEffect(() => {
    if (startTime && endTime && product) {
      const hours =
        (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);

      if (hours > 0) {
        setEstimatedPrice(hours * product.pricePerHour);
      }
    }
  }, [startTime, endTime, product]);

  // Handle booking
  const handleBooking = async () => {
    if (!startTime || !endTime) {
      alert("Please select time");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rentalItem: product._id, // ✅ match backend
          startTime,
          endTime,
          totalPrice: estimatedPrice,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Booking Successful ✅");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <>
      <Navbar />

      <div className="productDetailsPage">
        <div className="productContainer">

          {/* LEFT */}
          <div className="imageSection">
            <img src={product.image} alt={product.title} />
          </div>

          {/* RIGHT */}
          <div className="infoSection">
            <h1>{product.title}</h1>

            <p className="location">📍 {product.location}</p>

            <p className="price">₹{product.pricePerHour}/hr</p>

            <p className="description">{product.description}</p>

            {/* BOOKING UI */}
            <div className="bookingBox">
              <label>Start Time</label>
              <input
                type="datetime-local" 
                onChange={(e) => setStartTime(e.target.value)}
              />

              <label>End Time</label>
              <input
                type="datetime-local"
                onChange={(e) => setEndTime(e.target.value)}
              />

              <p className="estimate">
                Estimated Price: ₹{estimatedPrice}
              </p>

              <button className="bookBtn" onClick={handleBooking}>
                Book Now
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}