import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 Fetch function (reusable)
  const fetchRentals = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/rentals");
      const data = await res.json();
      console.log("Fetched rentals:", data);

      setRentals(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rentals:", err);
      setError("Failed to load rentals");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  return (
    <>
      <Navbar />

      <div className="page">
        <h2 className="title">Available Rentals</h2>

        {/* 🔄 Loading */}
        {loading && <p>Loading rentals...</p>}

        {/* ❌ Error */}
        {error && <p className="text-red-500">{error}</p>}

        {/* 📦 Empty State */}
        {!loading && rentals.length === 0 && (
          <p>No rentals available yet</p>
        )}

        {/* 🧾 Products Grid */}
        <div className="grid">
          {rentals.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}