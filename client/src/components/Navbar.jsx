import { Link } from "react-router-dom";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">FairChance</h1>

      <div className="flex gap-6 items-center">
        <Link to="/" className="hover:text-blue-600">Home</Link>

        {/* If NOT logged in */}
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

        {/* If logged in */}
        {user && (
          <>
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>

            {user.role === "admin" && (
              <Link to="/admin" className="hover:text-blue-600">Admin</Link>
            )}

            <button
              onClick={handleLogout}
              className="text-red-600 font-medium"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;