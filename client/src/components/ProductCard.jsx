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
        height: "360px",          
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        // 🎨 THEME FIX: Uses your custom --surface dynamic var fallback framework
        backgroundColor: "var(--surface)", 
        // 🎨 THEME FIX: Maps border lines to look crisp in light or dark panels
        border: "1px solid rgba(var(--text-muted), 0.2)", 
        borderRadius: "14px",
        overflow: "hidden",
        boxSizing: "border-box",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
      }}
    >
      
      {/* 🖼️ Match with .thumb in index.css */}
      <div 
        className="thumb"
        style={{
          width: "100%",
          height: "180px",        
          minHeight: "180px",
          overflow: "hidden",
          position: "relative",
          margin: 0,
          // 🎨 THEME FIX: Keeps background frame dynamic under loading/lazy states
          backgroundColor: "rgba(var(--text-muted), 0.1)"
        }}
      >
        <img 
          src={item.image || "https://via.placeholder.com/300"} 
          alt={item.title} 
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"    
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
          {/* 🎨 THEME FIX: Forces text colors to dynamically swap to --text-main mappings */}
          <h3 style={{ 
            margin: "0 0 4px 0", 
            fontSize: "16px", 
            fontWeight: "600", 
            whiteSpace: "nowrap", 
            overflow: "hidden", 
            textOverflow: "ellipsis",
            color: "rgb(var(--text-main))" 
          }}>
            {item.title}
          </h3>
          
          {/* Dynamic location - no hardcoding */}
          {/* 🎨 THEME FIX: Swaps location info lines into matching --text-muted values */}
          <p className="loc" style={{ margin: "0", fontSize: "14px", color: "rgb(var(--text-muted))" }}>
            {item.location ? item.location : "No location"}
          </p>
        </div>

        {/* 💰 Match with .row and .price in index.css */}
        <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
          {/* 🎨 THEME FIX: Price aligns natively into light/dark states */}
          <span className="price" style={{ fontSize: "16px", fontWeight: "700", color: "rgb(var(--text-main))" }}>
            ₹{item.pricePerHour}/hr
          </span>
          {/* 🎨 THEME FIX: Button color inherits the primary signature theme dynamically */}
          <button 
            className="btn" 
            style={{ 
              backgroundColor: "rgb(var(--color-primary))", 
              color: "#ffffff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            View
          </button>
        </div>
      </div>

    </div>
  );
}