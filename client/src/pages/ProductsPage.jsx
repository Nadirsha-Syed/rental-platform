import { useState, useEffect, useContext } from "react"; 
import { useSearchParams } from "react-router-dom"; 
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import API_BASE_URL from "../config/api"; 
import { ThemeContext } from "../context/ThemeContext"; 
import { AuthContext } from "../context/AuthContext"; // 🔌 Import AuthContext to know who is logged in

export default function ProductsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext); // ⭐ Get the logged-in user information

  // 🧭 Hook to extract live URL parameters
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const categoryQuery = searchParams.get("category") || "All";
  const locationQuery = searchParams.get("location") || "All";

  // 🔥 Fetch function
  const fetchRentals = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/rentals?search=${searchQuery}&category=${categoryQuery}&location=${locationQuery}`
      );
      const data = await res.json();
      console.log("Fetched filtered rentals:", data);

      setRentals(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rentals:", err);
      setError("Failed to load rentals");
      setLoading(false);
    }
  };

  // 🔄 Re-run fetch whenever any query parameters change
  useEffect(() => {
    fetchRentals();
  }, [searchQuery, categoryQuery, locationQuery]);

  // 🎛️ Inline UI filter state handlers
  const handleFilterChange = (key, value) => {
    const currentParams = Object.fromEntries([...searchParams]);
    
    if (value === "All") {
      delete currentParams[key]; 
    } else {
      currentParams[key] = value;
    }
    
    setSearchParams(currentParams);
  };

  // 🛑 FILTER LOGIC: Exclude listings owned by the logged-in user
  const visibleRentals = rentals.filter((item) => {
    const itemOwnerId = item.owner?._id || item.owner;
    const currentUserId = user?._id || user?.id;

    // If both IDs exist and match, exclude this item from the main screen array
    if (itemOwnerId && currentUserId && itemOwnerId.toString() === currentUserId.toString()) {
      return false;
    }
    return true;
  });

  return (
    <>
      <Navbar />

      <div className="page">
        <div className="products-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          <h2 className="title" style={{ margin: 0 }}>Available Rentals</h2>
          
          {/* 📍 Dropdown Filters Layout */}
          <div className="filters-container" style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            
            <select 
              value={locationQuery} 
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="filter-select"
            >
              <option value="All">All Locations</option>
              <option value="Hanamkonda">Hanamkonda</option>
              <option value="Warangal">Warangal</option>
              <option value="Siddipet">Siddipet</option>
            </select>

            <select 
              value={categoryQuery} 
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="filter-select"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Bikes">Bikes</option>
              <option value="Books">Books</option>
              <option value="Tools">Tools</option>
            </select>

          </div>
        </div>

        {/* 🔄 Loading */}
        {loading && <p>Loading rentals...</p>}

        {/* ❌ Error */}
        {error && <p className="text-red-500">{error}</p>}

        {/* 📦 Empty State (Checked against visibleRentals instead of raw rentals) */}
        {!loading && visibleRentals.length === 0 && (
          <p className="empty-message" style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            No rentals match your search criteria. Try adjusting your filters!
          </p>
        )}

        {/* 🧾 Products Grid (Mapping visibleRentals safely filtered) */}
        <div className="grid">
          {visibleRentals.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}