import Navbar from "../components/Navbar";
import "./ProductDetails.css";

export default function ProductDetails() {
  const product = {
    title: "Sony A7 Camera",
    image: "https://images.unsplash.com/photo-1519183071298-a2962be96b37",
    location: "Chennai",
    price: 500,
    description:
      "Professional mirrorless camera perfect for photography and videography.",
  };

  return (
    <>
      <Navbar />

      <div className="productDetailsPage">
        <div className="productContainer">

          <div className="imageSection">
            <img src={product.image} alt={product.title} />
          </div>

          <div className="infoSection">
            <h1>{product.title}</h1>
            <p className="location">{product.location}</p>

            <p className="price">₹{product.price}/hr</p>

            <p className="description">{product.description}</p>

            <button className="bookBtn">Book Now</button>
          </div>

        </div>
      </div>
    </>
  );
}