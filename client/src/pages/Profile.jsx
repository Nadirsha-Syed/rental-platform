import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { executeRentalPayment } from "../services/razorpayService";
import "./Profile.css";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // View States: "settings" or "bookings"
  const [activeTab, setActiveTab] = useState("settings");
  
  // Account Form States
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Bookings Feed States
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Sync personal metadata fields from localStorage
  useEffect(() => {
    if (user?.email) {
      const storedPhone = localStorage.getItem(`userPhone_${user.email}`);
      const storedAddress = localStorage.getItem(`userAddress_${user.email}`);
      if (storedPhone) setPhone(storedPhone);
      if (storedAddress) setAddress(storedAddress);
    }
  }, [user]);

  // Lazy-load requested bookings when clicking the tab panel
  useEffect(() => {
    if (activeTab === "bookings") {
      const fetchMyBookings = async () => {
        setLoadingBookings(true);
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/my-bookings`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json"
            }
          });
          const result = await res.json();
          if (res.ok && result.success) {
            setBookings(result.data);
          }
        } catch (err) {
          console.error("Failed fetching bookings feed:", err);
        } finally {
          setLoadingBookings(false);
        }
      };
      fetchMyBookings();
    }
  }, [activeTab]);

  const handleSave = (e) => {
    e.preventDefault();
    if (user?.email) {
      localStorage.setItem(`userPhone_${user.email}`, phone);
      localStorage.setItem(`userAddress_${user.email}`, address);
      setSaveSuccess(true);
      setIsEditingPhone(false);
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
              <button 
                className={`navActionBtn ${activeTab === "settings" ? "activeTab" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                ⚙️ Settings
              </button>
              <button 
                className={`navActionBtn ${activeTab === "bookings" ? "activeTab" : ""}`} 
                onClick={() => setActiveTab("bookings")}
              >
                🎟️ My Bookings
              </button>
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

          {/* Conditional Workspaces rendering panel elements */}
          <div className="profileTabContent">
            
            {/* VIEW 1: SETTINGS FORM HUB */}
            {activeTab === "settings" && (
              <div className="profileFormSection">
                <h3>Account Settings</h3>
                <form onSubmit={handleSave} className="profileForm">
                  <div className="formGroup">
                    <label htmlFor="phone">Phone Number</label>
                    {!isEditingPhone ? (
                      <div className="phoneStaticWrap">
                        <span className="staticTextValue">{phone || "No phone number provided"}</span>
                        <button
                          type="button"
                          className="editInlineBtn"
                          onClick={() => setIsEditingPhone(true)}
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    ) : (
                      <input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoFocus
                      />
                    )}
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
            )}

            {/* VIEW 2: MY BOOKINGS LIFECYCLE MANAGEMENT */}
            {activeTab === "bookings" && (
              <div className="bookingsSection">
                <h3>My Requested Bookings</h3>
                {loadingBookings ? (
                  <p className="loadingText">Retrieving registration statements...</p>
                ) : bookings.length === 0 ? (
                  <p className="emptyStateText">You haven't submitted any rental order requests yet.</p>
                ) : (
                  <div className="tableResponsiveWrapper">
                    <table className="bookingsTable">
                      <thead>
                        <tr>
                          <th>Rental Item</th>
                          <th>Lender Info</th>
                          <th>Approval Status</th>
                          <th>Payment Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => {
                          const itemTitle = booking.rentalItem?.title || "Unknown Item";
                          const lenderEmail = booking.rentalItem?.owner?.email || "N/A";
                          const hourlyRate = booking.rentalItem?.pricePerHour || 0;
                          const calculatedPrice = booking.totalPrice || hourlyRate;

                          return (
                            <tr key={booking._id}>
                              <td className="itemTitleCell">{itemTitle}</td>
                              <td className="lenderEmailCell">{lenderEmail}</td>
                              <td>
                                <span className={`statusBadge status-${booking.status}`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td>
                                {booking.paymentStatus === "Paid" ? (
                                  <span className="paymentIndicator paid">🟢 Paid</span>
                                ) : booking.status === "confirmed" ? (
                                  <button
                                    onClick={() => executeRentalPayment(calculatedPrice, itemTitle, {}, () => setActiveTab("bookings"))}
                                    className="checkoutPayBtn"
                                  >
                                    Pay ₹{calculatedPrice}
                                  </button>
                                ) : booking.status === "cancelled" ? (
                                  <span className="paymentIndicator cancelled">❌ Cancelled</span>
                                ) : (
                                  <span className="paymentIndicator pending">Awaiting Approval</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
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