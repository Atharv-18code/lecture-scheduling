import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/instructor" replace />;
  }

  return children;
};

export default ProtectedRoute;