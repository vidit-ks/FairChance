import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("https://fairchance-backend.onrender.com/api/auth/users");
      const data = await res.json();

      if (data.success) {
        setUsers(data.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.log("Fetch users error:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Users Management
        </h1>
        <p className="text-slate-600 mb-8">
          View and manage all registered users.
        </p>

        <div className="bg-white rounded-2xl shadow-md p-6">
          {loading ? (
            <p className="text-slate-600">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-slate-600">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100">
                      <td className="py-3 px-2 font-medium text-slate-900">
                        {user.name || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {user.email || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {user.role || "user"}
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
