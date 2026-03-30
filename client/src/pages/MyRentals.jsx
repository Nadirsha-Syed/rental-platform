import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Fetch ONLY my rentals
  const fetchMyRentals = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);

      const res = await fetch("http://localhost:5000/api/rentals/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 🔥 Handle unauthorized
      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch rentals");

      const data = await res.json();
      setRentals(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRentals();
  }, []);

  // 🗑 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rental?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/rentals/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (res.ok) {
        setRentals((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✏ EDIT START
  const handleEditClick = (rental) => {
    setEditingId(rental._id);
    setEditForm({
      title: rental.title,
      pricePerHour: rental.pricePerHour,
    });
  };

  // ✏ EDIT CHANGE
  const handleChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✏ SAVE UPDATE
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/rentals/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setRentals((prev) =>
          prev.map((r) => (r._id === editingId ? data : r))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔄 UI STATES
  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ textAlign: "center" }}>{error}</p>;

  return (
    <>
      <Navbar />

      <div className="page">
        <h2 className="title">My Rentals</h2>

        {rentals.length === 0 ? (
          <p style={{ textAlign: "center" }}>
            No rentals yet. Start by adding one 🚀
          </p>
        ) : (
          <div className="grid">
            {rentals.map((item) => (
              <div key={item._id} className="card">

                {editingId === item._id ? (
                  <>
                    <input
                      name="title"
                      value={editForm.title}
                      onChange={handleChange}
                    />
                    <input
                      name="pricePerHour"
                      type="number"
                      value={editForm.pricePerHour}
                      onChange={handleChange}
                    />

                    <button onClick={handleUpdate}>Save</button>
                    <button onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <img src={item.image} alt={item.title} />
                    <h3>{item.title}</h3>
                    <p>₹{item.pricePerHour}/hr</p>

                    <button onClick={() => handleEditClick(item)}>
                      Edit
                    </button>

                    <button onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}