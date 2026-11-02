import { MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import "./ProductDetails.css";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API_BASE_URL from "../config/api";

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  // Fetch product
  useEffect(() => {
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

    if (loadingBooking) return; 
    setLoadingBooking(true); 

    try {
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
        alert("Booking Request Sent Successfully! Awaiting owner approval.");
      } else {
        console.error("Server Error Detail:", data);
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again");
    } finally {
      setLoadingBooking(false);
    }
  };

  const handleChat = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to chat with the owner");
      navigate("/login");
      return;
    }

    if (!product?.owner?._id) {
      alert("Owner details not found");
      return;
    }

    if (loadingChat) return;
    setLoadingChat(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          participantId: product.owner._id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        navigate(`/chat?room=${data._id}`);
      } else {
        alert(data.message || "Failed to initiate chat");
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again");
    } finally {
      setLoadingChat(false);
    }
  };

  if (!product) return <p className="loading">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="productDetailsPage">
        <div className="productContainer">
          
          <div className="imageSection">
            <img src={product.image} alt={product.title} />
          </div>

          <div className="infoSection">
            <h1>{product.title}</h1>
            <p className="location"><MapPin size={16} /> <span>{product.location || "No location"}</span></p>
            <p className="priceTag">₹{product.pricePerHour}<span>/hr</span></p>
            <p className="description">{product.description}</p>

            <div className="bookingBox">
              <div className="inputGroup">
                <label htmlFor="startTime">Start Time</label>
                <input 
                  id="startTime"
                  type="datetime-local" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)} 
                />
              </div>

              <div className="inputGroup">
                <label htmlFor="endTime">End Time</label>
                <input 
                  id="endTime"
                  type="datetime-local" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)} 
                />
              </div>

              <div className="priceSummary">
                <span>Estimated Total:</span>
                <span className="totalAmount">₹{estimatedPrice}</span>
              </div>

              <button 
                className="bookBtn" 
                onClick={handleBooking}
                disabled={loadingBooking}
                style={{ opacity: loadingBooking ? 0.6 : 1, cursor: loadingBooking ? "not-allowed" : "pointer" }}
              >
                {loadingBooking ? "Sending Request..." : "Book Now"}
              </button>

              {(!user || (user._id || user.id) !== product.owner?._id) && (
                <button
                  className="chatBtn"
                  onClick={handleChat}
                  disabled={loadingChat}
                >
                  {loadingChat ? "Initiating Chat..." : "Chat with Owner"}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}