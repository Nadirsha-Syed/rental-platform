import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetails";
import AddRental from "./pages/AddRental";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyRentals from "./pages/MyRentals";
import OwnerDashboard from "./pages/OwnerDashboard";

// 🔥 New Production Architecture Additions
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <GoogleOAuthProvider clientId="987414878648-tnfc7d9fgnbdj0lchkp0osf8u4b9cucr.apps.googleusercontent.com">
      <AuthProvider>
        <Routes>
          {/* 🌐 Open Public Market Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔒 Strict Protected Private Dashboards */}
          <Route element={<ProtectedRoute />}>
            <Route path="/add-rental" element={<AddRental />} />
            <Route path="/my-rentals" element={<MyRentals />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;