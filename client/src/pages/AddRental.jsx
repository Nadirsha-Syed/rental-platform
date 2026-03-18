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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  console.log("File selected:", file);

  setPreview(URL.createObjectURL(file));

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "rental_upload");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/djq5txr9a/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    console.log("Response status:", res.status);

    const result = await res.json();
    console.log("Cloudinary FULL response:", result);

    if (result.secure_url) {
      setForm((prev) => ({
        ...prev,
        image: result.secure_url,
      }));
    } else {
      console.error("No URL returned!");
    }

  } catch (err) {
    console.error("Upload error:", err);
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem("user")); // 🔥 GET USER

  console.log("USER FROM STORAGE:", user);

  try {
    console.log("token being sent:", user?.token); // Debugging log
    const res = await fetch("http://localhost:5000/api/rentals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`, // 🔥 THIS IS THE FIX
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    console.log("Response:", data);

    if (res.ok) {
      alert("Rental Added 🚀");
      navigate("/products");
    } else {
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
    <div className="max-w-5xl mx-auto mt-10 grid grid-cols-2 gap-10">

      {/* LEFT - IMAGE */}
      <div className="border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center h-[350px] relative">

        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="object-cover w-full h-full rounded-xl"
          />
        ) : (
          <p className="text-gray-500">Click to upload image</p>
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
          placeholder="Rental title"
          className="border p-3 rounded-lg bg-white text-black"
          onChange={handleChange}
        />

        <input
          name="location"
          placeholder="Location"
          className="border p-3 rounded-lg bg-white text-black"
          onChange={handleChange}
        />

        <input
          name="pricePerHour"
          placeholder="Price per hour"
          className="border p-3 rounded-lg bg-white text-black"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="border p-3 rounded-lg bg-white text-black"
          onChange={handleChange}
        />

        <select
      name="category"
      className="border p-3 rounded-lg bg-white text-black"
      onChange={handleChange}>
      <option value="">Select Category</option>
      {/* car", "bike", "agri-tool", "camera","tools */}
      <option value="camera">Camera</option>
      <option value="bike">Bike</option>
      <option value="tools">Tools</option>
      </select>

        <button
  type="submit"
  disabled={!form.image}
  className="bg-primary text-white py-3 rounded-lg disabled:opacity-50"
>
  {form.image ? "Add Rental" : "Uploading image..."}
</button>

      </form>

    </div>
  </>
  );
}