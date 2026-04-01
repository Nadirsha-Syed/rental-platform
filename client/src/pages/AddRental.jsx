import { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function AddRental() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    location: "",
    pricePerHour: "",
    description: "",
    image: "",
    category: ""
  });

  const [preview, setPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "rental_upload");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/djq5txr9a/image/upload",
        { method: "POST", body: data }
      );
      const result = await res.json();

      if (result.secure_url) {
        setForm((prev) => ({ ...prev, image: result.secure_url }));
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔑 THE FIX: Try to get token directly, or from the user object
    const token = localStorage.getItem("token") || JSON.parse(localStorage.getItem("user"))?.token;

    if (!token) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Standard Bearer format
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Rental Added 🚀");
        navigate("/products");
      } else {
        // If backend returns "Token failed", this alert triggers
        alert(data.message || "Error adding rental");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 p-6">
        
        {/* LEFT - IMAGE UPLOAD */}
        <div className="border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center h-[350px] relative bg-gray-50 overflow:hidden">
          {preview ? (
            <img src={preview} alt="preview" className="object-cover w-full h-full rounded-xl" />
          ) : (
            <div className="text-center">
              <p className="text-gray-500">📸 Click to upload image</p>
            </div>
          )}
          <input
            type="file"
            onChange={handleImage}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* RIGHT - FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="title"
            required
            placeholder="Rental title (e.g. Sony A7III)"
            className="border p-3 rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={handleChange}
          />

          <input
            name="location"
            required
            placeholder="Location (e.g. Warangal)"
            className="border p-3 rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={handleChange}
          />

          <input
            name="pricePerHour"
            type="number"
            required
            placeholder="Price per hour (₹)"
            className="border p-3 rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={handleChange}
          />

          <textarea
            name="description"
            required
            placeholder="Tell us about the item..."
            rows="3"
            className="border p-3 rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={handleChange}
          />

          <select
            name="category"
            required
            className="border p-3 rounded-lg bg-white text-black outline-none"
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="camera">Camera</option>
            <option value="bike">Bike</option>
            <option value="tools">Tools</option>
            <option value="car">Car</option>
            <option value="agri-tool">Agri-tool</option>
          </select>

          <button
            type="submit"
            disabled={isUploading || !form.image}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading to Cloud..." : "Add Rental Listing"}
          </button>
        </form>
      </div>
    </>
  );
}