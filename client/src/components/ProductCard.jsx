import { useNavigate } from "react-router-dom";

export default function ProductCard({ item }) {
  const navigate = useNavigate();

  return (
    <div className="card" onClick={() => navigate(`/products/${item._id}`)}>
      
      {/* 🖼️ Match with .thumb in index.css */}
      <div className="thumb">
        <img 
          src={item.image || "https://via.placeholder.com/300"} 
          alt={item.title} 
        />
        <span className="badge">Available</span>
      </div>

      {/* 📝 Match with .meta in index.css */}
      <div className="meta">
        <h3>{item.title}</h3>
        
        {/* Dynamic location - no hardcoding */}
        <p className="loc">
          {item.location ? item.location : "No location"}
        </p>

        {/* 💰 Match with .row and .price in index.css */}
        <div className="row">
          <span className="price">
            ₹{item.pricePerHour}/hr
          </span>
          <button className="btn">View</button>
        </div>
      </div>

    </div>
  );
}