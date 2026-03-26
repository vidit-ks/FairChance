import { Link, useNavigate } from "react-router-dom";
import { getNormalizedRole } from "../utils/getRole";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = getNormalizedRole();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">FairChance</h1>

      <div className="flex gap-6 items-center">
        <Link to="/" className="hover:text-blue-600">Home</Link>

        {!user && (
          <>
            <Link to="/login" className="hover:text-blue-600">Login</Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </>
        )}

        {user && role === "admin" && (
          <>
            <Link to="/admin" className="hover:text-blue-600">Admin</Link>
            <button onClick={handleLogout} className="text-red-600 font-medium">
              Logout
            </button>
          </>
        )}

        {user && role !== "admin" && (
          <>
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <button onClick={handleLogout} className="text-red-600 font-medium">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
