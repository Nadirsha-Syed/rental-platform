import Navbar from "../components/Navbar";
import "./ProductPage.css";
import ProductCard from "../components/ProductCard";


const data = [
  {
    id: 1,
    title: "Canon EOS R6",
    location: "Mumbai",
    price: 1200,
    image: "https://images.unsplash.com/photo-1519183071298-a2962be96a6c"
  },
  {
    id: 2,
    title: "MacBook Pro",
    location: "Delhi",
    price: 2500,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
  },
  {
    id: 3,
    title: "GoPro Hero 11",
    location: "Bangalore",
    price: 900,
    image: "https://images.unsplash.com/photo-1508898578281-774ac4893e7c"
  }
];

export default function ProductsPage() {
  return (
    <>
    <Navbar/>
    <div className="products">

      <div className="topbar">
        <h1>Explore Rentals</h1>
      </div>

      <div className="grid">
        {data.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>

    </div>
    </>
  );
}