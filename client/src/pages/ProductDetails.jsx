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
      const hours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
      if (hours > 0) {
        setEstimatedPrice(Math.round(hours * product.pricePerHour));
      }
    }
  }, [startTime, endTime, product]);

  // Handle booking with AUTHORIZATION
  const handleBooking = async () => {
    const token = localStorage.getItem("token"); // 🔑 Get your saved token

    if (!token) {
      alert("Please login to book this item");
      return;
    }

    // 🔍 DEBUG: See exactly what we are about to send
    const bookingData = {
      rentalItemId: product._id, // Ensure your backend expects "rentalItem"
      startTime: startTime,
      endTime: endTime,
      totalPrice: Number(estimatedPrice), // Ensure it's a number
    };

    console.log("Payload being sent:", bookingData);

    if (!startTime || !endTime || estimatedPrice <= 0) {
      alert("Please select a valid time range");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Fixed: Sends token to backend
        },
        body: JSON.stringify({
          rentalItemId: product._id,
          startTime,
          endTime,
          totalPrice: estimatedPrice,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Booking Successful ✅");
      } else {
        console.error("Server Error Detail:", data);
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again");
    }
  };

  if (!product) return <p className="loading">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="productDetailsPage">
        <div className="productContainer">
          
          {/* 🖼️ Fixed Image Section */}
          <div className="imageSection">
            <img src={product.image} alt={product.title} />
          </div>

          {/* 📝 Aligned Info Section */}
          <div className="infoSection">
            <h1>{product.title}</h1>
            <p className="location">📍 {product.location || "No location"}</p>
            <p className="priceTag">₹{product.pricePerHour}<span>/hr</span></p>
            <p className="description">{product.description}</p>

            <div className="bookingBox">
              <div className="inputGroup">
                <label>Start Time</label>
                <input type="datetime-local" onChange={(e) => setStartTime(e.target.value)} />
              </div>

              <div className="inputGroup">
                <label>End Time</label>
                <input type="datetime-local" onChange={(e) => setEndTime(e.target.value)} />
              </div>

              <div className="priceSummary">
                <span>Estimated Total:</span>
                <span className="totalAmount">₹{estimatedPrice}</span>
              </div>

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