import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(
        "https://fairchance-backend.onrender.com/api/subscriptions/all"
      );
      const data = await res.json();

      if (data.success) {
        setSubscriptions(data.subscriptions || []);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.log("Fetch subscriptions error:", error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Subscriptions
        </h1>
        <p className="text-slate-600 mb-8">
          View active and recent subscriptions.
        </p>

        <div className="bg-white rounded-2xl shadow-md p-6">
          {loading ? (
            <p className="text-slate-600">Loading subscriptions...</p>
          ) : subscriptions.length === 0 ? (
            <p className="text-slate-600">No subscriptions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-2">User</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Plan Type</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Renewal Date</th>
                    <th className="py-3 px-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-slate-100">
                      <td className="py-3 px-2 font-medium text-slate-900">
                        {sub.users?.name || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {sub.users?.email || "N/A"}
                      </td>
                      <td className="py-3 px-2 text-slate-600 capitalize">
                        {sub.plan_type || "N/A"}
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-block rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm">
                          {sub.status || "active"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {sub.renewal_date
                          ? new Date(sub.renewal_date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {sub.created_at
                          ? new Date(sub.created_at).toLocaleDateString()
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

export default AdminSubscriptions;
