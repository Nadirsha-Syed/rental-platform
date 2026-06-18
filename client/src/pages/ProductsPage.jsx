import { useState, useEffect, useContext } from "react"; 
import { useSearchParams } from "react-router-dom"; 
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import API_BASE_URL from "../config/api"; 
import { ThemeContext } from "../context/ThemeContext"; 

export default function ProductsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { theme } = useContext(ThemeContext);

  // 🧭 Hook to extract live URL parameters (e.g., ?search=pulsar&location=Warangal)
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const categoryQuery = searchParams.get("category") || "All";
  const locationQuery = searchParams.get("location") || "All";

  // 🔥 Fetch function (reusable, now dynamically builds query string)
  const fetchRentals = async () => {
    try {
      setLoading(true);

      // 🔗 Dynamically inject filters using the centralized API_BASE_URL template literal
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

  // 🔄 Re-run fetch whenever any query parameters in the URL change
  useEffect(() => {
    fetchRentals();
  }, [searchQuery, categoryQuery, locationQuery]);

  // 🎛️ Inline UI filter state handlers
  const handleFilterChange = (key, value) => {
    const currentParams = Object.fromEntries([...searchParams]);
    
    if (value === "All") {
      delete currentParams[key]; // Keep URL neat if 'All' is picked
    } else {
      currentParams[key] = value;
    }
    
    setSearchParams(currentParams);
  };

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

        {/* 📦 Empty State */}
        {!loading && rentals.length === 0 && (
          <p className="empty-message" style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            No rentals match your search criteria. Try adjusting your filters!
          </p>
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