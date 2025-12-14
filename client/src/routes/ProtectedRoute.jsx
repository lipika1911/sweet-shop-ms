import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/login" />;

  if (adminOnly && role !== "ADMIN") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
