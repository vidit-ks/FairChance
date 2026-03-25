import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Charities from "../pages/Charities";
import Admin from "../pages/Admin";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminSubscriptions from "./pages/AdminSubscriptions";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/admin" element={<Admin />} />
<Route path="/admin/users" element={<AdminUsers />} />
<Route path="/admin/subscriptions" element={<AdminSubscriptions />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
