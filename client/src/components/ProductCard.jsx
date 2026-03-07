export default function ProductCard({ item }) {
  return (
    <div className="rounded-2xl bg-glass border border-glassBorder shadow-md hover:shadow-xl transition overflow-hidden">

      <div className="relative h-[180px] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
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
            ₹{item.price}/hr
          </span>

          <button className="bg-primary text-white px-3 py-1 rounded-lg text-sm hover:opacity-90">
            View
          </button>
        </div>
      </div>

    </div>
  );
}