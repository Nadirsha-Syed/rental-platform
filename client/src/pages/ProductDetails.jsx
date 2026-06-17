import Navbar from "../components/Navbar";
import "./ProductDetails.css";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import API_BASE_URL from "../config/api"; // Adjust path to config/api.js

export default function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [loadingBooking, setLoadingBooking] = useState(false); // 🔥 Added to track submission states

  // Fetch product
  useEffect(() => {
    // 🔥 MODIFIED: Swapped hardcoded URL for your central configuration pointer variable
    fetch(`${API_BASE_URL}/api/rentals/${productId}`)
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

  // Handle booking with AUTHORIZATION & DOUBLE-SUBMIT PROTECTION
  const handleBooking = async () => {
    const token = localStorage.getItem("token"); 

    if (!token) {
      alert("Please login to book this item");
      return;
    }

    if (!startTime || !endTime || estimatedPrice <= 0) {
      alert("Please select a valid time range");
      return;
    }

    // 🔒 THE FIX: Prevent execution if a request is already processing
    if (loadingBooking) return; 
    setLoadingBooking(true); 

    try {
      // 🔥 MODIFIED: Swapped hardcoded URL for your central configuration pointer variable
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
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
        // Updated text alert to properly fit the P2P approval update style
        alert("Booking Request Sent Successfully! 🚀 Awaiting owner approval.");
      } else {
        console.error("Server Error Detail:", data);
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again");
    } finally {
      setLoadingBooking(false); // 🔓 Unfreeze the button once the process resolves
    }
  };

  if (!product) return <p className="loading">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="productDetailsPage">
        <div className="productContainer">
          
          {/* 🖼️ Image Section */}
          <div className="imageSection">
            <img src={product.image} alt={product.title} />
          </div>

          {/* 📝 Info Section */}
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

              {/* 🚫 Disabled attribute dynamically binds to state to prevent clicking spam */}
              <button 
                className="bookBtn" 
                onClick={handleBooking}
                disabled={loadingBooking}
                style={{ opacity: loadingBooking ? 0.6 : 1, cursor: loadingBooking ? "not-allowed" : "pointer" }}
              >
                {loadingBooking ? "Sending Request..." : "Book Now"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}