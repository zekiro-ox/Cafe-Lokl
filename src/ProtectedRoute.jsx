import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Component {...rest} />;
  }

  // Navigate to different login pages based on userType
  return userType === "admin" ? (
    <Navigate to="/" replace />
  ) : (
    <Navigate to="/employee-login" replace />
  );
};

export default ProtectedRoute;
