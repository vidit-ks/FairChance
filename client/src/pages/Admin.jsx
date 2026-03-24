import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Admin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [latestDraw, setLatestDraw] = useState(null);
  const [results, setResults] = useState([]);

  const fetchLatestDraw = async () => {
    try {
      const res = await fetch("https://fairchance-backend.onrender.com");
      const data = await res.json();
      setLatestDraw(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLatestResults = async () => {
    try {
      const res = await fetch("https://fairchance-backend.onrender.com");
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLatestDraw();
    fetchLatestResults();
  }, []);

  const handleRunDraw = async () => {
    try {
      const res = await fetch("https://fairchance-backend.onrender.com", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to run draw");
        return;
      }

      setLatestDraw(data.draw);
      await fetchLatestResults();
      alert("Draw created successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to run draw");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 mb-8">
          Welcome, {user?.name || "Admin"}
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Users</h2>
            <p className="text-slate-600">Manage all platform users</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Subscriptions</h2>
            <p className="text-slate-600">View subscription activity</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Draw System</h2>
            <p className="text-slate-600">Run and manage monthly draws</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Monthly Draw</h2>

          <button
            onClick={handleRunDraw}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mb-6"
          >
            Run Draw
          </button>

          {latestDraw ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">Latest Draw Numbers</h3>

              <div className="flex gap-3 flex-wrap mb-3">
                {latestDraw.draw_numbers.map((num) => (
                  <div
                    key={num}
                    className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold"
                  >
                    {num}
                  </div>
                ))}
              </div>

              <p className="text-slate-500 text-sm">
                Draw date: {new Date(latestDraw.created_at).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-slate-600">No draw has been run yet.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4">Latest Draw Results</h2>

          {results.length === 0 ? (
            <p className="text-slate-600">No results available yet.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {result.users?.name || "Unknown User"}
                  </p>
                  <p className="text-slate-600 text-sm">
                    {result.users?.email}
                  </p>
                  <p className="text-slate-700 mt-2">
                    Matches: {result.matched_count}
                  </p>
                  <p className="text-slate-500 text-sm">
                    Matched Numbers:{" "}
                    {result.matched_numbers?.length
                      ? result.matched_numbers.join(", ")
                      : "None"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
