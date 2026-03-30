import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetails";
import AddRental from "./pages/AddRental";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {GoogleOAuthProvider} from "@react-oauth/google";
import MyRentals from "./pages/MyRentals";

function App() {
  return (
    <GoogleOAuthProvider clientId="987414878648-tnfc7d9fgnbdj0lchkp0osf8u4b9cucr.apps.googleusercontent.com">
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/add-rental" element={<AddRental />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/my-rentals" element={<MyRentals />} />
    </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;