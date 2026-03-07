import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import ProductsPage from "./pages/ProductsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/products" element={<ProductsPage />} />
    </Routes>
  );
}

export default App;