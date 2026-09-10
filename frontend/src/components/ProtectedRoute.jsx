import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem(ACCESS_TOKEN);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);

  if (!token || !refreshToken) {
    return <Navigate to="/login" />;
  }

  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(decoded.role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

export default ProtectedRoute;
