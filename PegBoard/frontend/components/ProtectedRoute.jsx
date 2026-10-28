import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  // Replace this with your actual auth logic (e.g., context, redux, or localStorage)
  const { user } = useAuth();

  // If not authenticated, redirect to the login page
  // 'replace' ensures they can't go back to the protected page via the browser back button
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
