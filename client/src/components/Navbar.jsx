import { Link, useNavigate } from "react-router-dom";
import { getNormalizedRole } from "../utils/getRole";
import { Heart } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("fairchance_user"));
  const role = getNormalizedRole();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="fixed w-full z-50 top-0 bg-fc-charcoal-dark/80 backdrop-blur-md border-b border-fc-charcoal-light py-4 px-6 md:px-12 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fc-emerald to-fc-teal flex items-center justify-center">
          <Heart className="w-4 h-4 text-white fill-current" />
        </div>
        <span className="text-xl font-bold tracking-tight text-fc-warm-white hover:text-white transition-colors">FairChance</span>
      </Link>

      <div className="flex gap-4 md:gap-6 items-center">
        {!user && (
          <>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
            <Link
              to="/signup"
              className="btn-primary text-sm px-5 py-2"
            >
              Get Started
            </Link>
          </>
        )}

        {user && role === "admin" && (
          <>
            <Link to="/admin" className="text-gray-400 hover:text-fc-gold transition-colors text-sm font-medium">Admin Center</Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
              Logout
            </button>
          </>
        )}

        {user && role !== "admin" && (
          <>
            <Link to="/dashboard" className="text-gray-400 hover:text-fc-emerald transition-colors text-sm font-medium">Dashboard</Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
