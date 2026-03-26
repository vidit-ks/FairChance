import { Navigate } from "react-router-dom";
import { getNormalizedRole } from "../utils/getRole";

function AdminRoute({ children }) {
  const token = localStorage.getItem("fairchance_token");
  const role = getNormalizedRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;
