import { useNavigate } from "react-router-dom";

export default function ProductCard({ item }) {

  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/products/${item._id || item.id}`);
  };

  return (
    <div
      onClick={handleViewDetails}
      className="rounded-2xl bg-glass border border-glassBorder shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
    >
      <div className="relative h-[180px] overflow-hidden">
        
        <img
  src={item.image || "https://via.placeholder.com/300"}
  alt={item.title}
  className="w-full h-48 object-cover rounded-lg"
/>

        <span className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1 rounded-full">
          Available
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-lg text-textMain font-semibold">
          {item.title}
        </h3>

        <p className="text-sm text-textMuted mt-1">
          {item.location}
        </p>

        <div className="flex justify-between items-center mt-3">
          <span className="text-primary font-semibold">
            ₹{item.pricePerHour}/hr
          </span>
        </div>
      </div>

    </div>
  );
}