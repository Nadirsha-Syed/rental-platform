import { useNavigate } from "react-router-dom";

export default function ProductCard({ item }) {
  const navigate = useNavigate();

  return (
    <div 
      className="card" 
      onClick={() => navigate(`/products/${item._id}`)}
      style={{ 
        width: "260px",            
        minWidth: "260px",
        maxWidth: "260px",
        height: "360px",           
        display: "flex", 
        flexDirection: "column",
        // 🎨 THEME FIX: Uses your theme's variable fallback properties instead of hardcoded white
        backgroundColor: "var(--bg-card, rgb(var(--bg-surface, 255, 255, 255)))",
        borderRadius: "14px",
        border: "1px solid var(--border-color, #e5e7eb)",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxSizing: "border-box"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
      }}
    >
      
      {/* 🖼️ Fixed Aspect Ratio Thumbnail */}
      <div style={{ width: "100%", height: "180px", overflow: "hidden", position: "relative", backgroundColor: "#f3f4f6" }}>
        <img 
          src={item.image || "https://via.placeholder.com/300"} 
          alt={item.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <span className="badge">Available</span>
      </div>

      {/* 📝 Normalized Metadata Box */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
        <div>
          {/* 🎨 THEME FIX: text uses dynamic main variable mapping */}
          <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600", color: "rgb(var(--text-main, 31, 41, 55))", textTransform: "capitalize", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.title}
          </h3>
          {/* 🎨 THEME FIX: location text uses dynamic muted variable mapping */}
          <p style={{ margin: "0", fontSize: "14px", color: "rgb(var(--text-muted, 107, 114, 128))", textTransform: "capitalize" }}>
            📍 {item.location || "SR University"}
          </p>
        </div>

        {/* 💰 Pricing Frame Anchor Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
          {/* 🎨 THEME FIX: price typography tracks text-main dynamic states */}
          <span style={{ fontSize: "16px", fontWeight: "700", color: "rgb(var(--text-main, 17, 24, 39))" }}>
            ₹{item.pricePerHour}<span style={{ fontSize: "12px", fontWeight: "400", color: "rgb(var(--text-muted, 107, 114, 128))" }}>/hr</span>
          </span>
          <button style={{ backgroundColor: "rgb(var(--color-primary, 37, 99, 235))", color: "#ffffff", padding: "6px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", border: "none" }}>
            View
          </button>
        </div>
      </div>

    </div>
  );
}