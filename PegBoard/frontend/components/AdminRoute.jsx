import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  
  const { user } = useAuth();

  // If not authenticated, redirect to the login page
  // 'replace' ensures they can't go back to the protected page via the browser back button
  if ( !user|| user.username !== "Admin") {
    return <Navigate to="/home" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default AdminRoute;
