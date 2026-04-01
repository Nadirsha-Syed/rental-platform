import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./MyRentals.css";

export default function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", title: "", pricePerHour: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchMyRentals = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/rentals/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch rentals");
      const data = await res.json();
      setRentals(data);
    } catch (err) {
      setError("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRentals();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/rentals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRentals((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const openEditModal = (rental) => {
    setEditForm({
      id: rental._id,
      title: rental.title,
      pricePerHour: rental.pricePerHour,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/rentals/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title,
          pricePerHour: editForm.pricePerHour,
        }),
      });

      const updatedData = await res.json();
      if (res.ok) {
        setRentals((prev) =>
          prev.map((r) => (r._id === editForm.id ? updatedData : r))
        );
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  if (loading) return <div className="loader">Loading your listings...</div>;

  return (
    <>
      <Navbar />
      <div className="myRentalsPage">
        <div className="headerSection">
          <h1>Manage Your Rentals</h1>
          <p>Edit or remove your active listings</p>
        </div>

        {rentals.length === 0 ? (
          <div className="emptyState">
            <p>You haven't listed anything yet.</p>
            <button onClick={() => navigate("/add-rental")}>List an Item</button>
          </div>
        ) : (
          <div className="rentalsGrid">
            {rentals.map((item) => (
              <div key={item._id} className="rentalCard">
                <div className="imageWrapper">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="cardContent">
                  <h3>{item.title}</h3>
                  <p className="priceTag">₹{item.pricePerHour} <span>/ hr</span></p>
                  <div className="actionButtons">
                    <button className="editBtn" onClick={() => openEditModal(item)}>Edit</button>
                    <button className="deleteBtn" onClick={() => handleDelete(item._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🪟 EDIT MODAL OVERLAY (Kept outside the loop) */}
        {isModalOpen && (
          <div className="modalOverlay">
            <div className="modalContent">
              <h2>Edit Listing</h2>
              <form onSubmit={handleUpdate}>
                <div className="inputGroup">
                  <label>Item Name</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="inputGroup">
                  <label>Price per Hour (₹)</label>
                  <input
                    type="number"
                    value={editForm.pricePerHour}
                    onChange={(e) => setEditForm({ ...editForm, pricePerHour: e.target.value })}
                    required
                  />
                </div>

                <div className="modalFooter">
                  <button type="button" className="secondaryBtn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="primaryBtn">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}