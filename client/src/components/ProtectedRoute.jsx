import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return <div className="loader">Verifying session security...</div>;

  // If authenticated, render the sub-routes (Outlet); otherwise, bounce to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}