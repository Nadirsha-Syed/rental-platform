import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import "./Profile.css";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Load from localStorage or use defaults
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.email) {
      const storedPhone = localStorage.getItem(`userPhone_${user.email}`);
      const storedAddress = localStorage.getItem(`userAddress_${user.email}`);
      if (storedPhone) setPhone(storedPhone);
      if (storedAddress) setAddress(storedAddress);
    }
  }, [user]);

  const handleSave = (e) => {
    e.preventDefault();
    if (user?.email) {
      localStorage.setItem(`userPhone_${user.email}`, phone);
      localStorage.setItem(`userAddress_${user.email}`, address);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <div className="profilePage">
        <div className="profileContainer">
          
          {/* Header section */}
          <div className="profileHeader">
            <div className="avatarLarge">
              {user?.name ? user.name[0].toUpperCase() : "👤"}
            </div>
            <div className="headerMeta">
              <h2>{user?.name || "User Account"}</h2>
              <p className="emailText">{user?.email || "No email provided"}</p>
              <span className="badgeRole">
                {user?.role ? user.role.toUpperCase() : "USER"}
              </span>
            </div>
          </div>

          {/* Quick Sub-Navigation / Dashboard Redirections */}
          <div className="profileNavSection">
            <h3>Quick Actions</h3>
            <div className="profileNavButtons">
              <button className="navActionBtn" onClick={() => navigate("/my-rentals")}>
                📂 My Rentals
              </button>
              <button className="navActionBtn" onClick={() => navigate("/owner-dashboard")}>
                📊 Owner Dashboard
              </button>
              <button className="navActionBtn addStyle" onClick={() => navigate("/add-rental")}>
                ➕ List an Item
              </button>
            </div>
          </div>

          {/* Settings Form */}
          <div className="profileFormSection">
            <h3>Account Settings</h3>
            <form onSubmit={handleSave} className="profileForm">
              <div className="formGroup">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="formGroup">
                <label htmlFor="address">Campus / Pickup Address</label>
                <textarea
                  id="address"
                  placeholder="Enter your default address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="3"
                />
              </div>

              <button type="submit" className="saveBtn">
                Save Changes
              </button>

              {saveSuccess && (
                <div className="successMsg">
                  ✓ Profile settings saved successfully!
                </div>
              )}
            </form>
          </div>

          {/* Destructive Logout Zone */}
          <div className="destructiveSection">
            <h3>Account Actions</h3>
            <p>Sign out of your active session on this device.</p>
            <button onClick={handleLogoutClick} className="logoutBtnDestructive">
              Logout
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
