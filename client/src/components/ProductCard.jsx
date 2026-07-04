import { useNavigate } from "react-router-dom";

export default function ProductCard({ item }) {
  const navigate = useNavigate();

  return (
    <div 
      className="card" 
      onClick={() => navigate(`/products/${item._id}`)}
      style={{
        width: "260px",
        maxWidth: "260px",
        minWidth: "260px",
        height: "360px",          // 🔐 Fixes vertical height so short/long descriptions don't cause mismatch
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        boxSizing: "border-box"
      }}
    >
      
      {/* 🖼️ Match with .thumb in index.css */}
      <div 
        className="thumb"
        style={{
          width: "100%",
          height: "180px",        // 🔐 Forces all card images to share the exact same height boundary
          minHeight: "180px",
          overflow: "hidden",
          position: "relative",
          margin: 0
        }}
      >
        <img 
          src={item.image || "https://via.placeholder.com/300"} 
          alt={item.title} 
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"    // 📐 Keeps images from stretching abnormally
          }}
        />
        <span className="badge">Available</span>
      </div>

      {/* 📝 Match with .meta in index.css */}
      <div 
        className="meta"
        style={{
          padding: "12px 16px 16px 16px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between"
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.title}
          </h3>
          
          {/* Dynamic location - no hardcoding */}
          <p className="loc" style={{ margin: "0", fontSize: "14px" }}>
            {item.location ? item.location : "No location"}
          </p>
        </div>

        {/* 💰 Match with .row and .price in index.css */}
        <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
          <span className="price" style={{ fontSize: "16px", fontWeight: "700" }}>
            ₹{item.pricePerHour}/hr
          </span>
          <button className="btn">View</button>
        </div>
      </div>

    </div>
  );
}