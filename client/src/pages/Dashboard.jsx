import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [score, setScore] = useState("");
  const [playedAt, setPlayedAt] = useState("");
  const [scores, setScores] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [charities, setCharities] = useState([]);
const [charityId, setCharityId] = useState("");

const fetchCharities = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/charities");
    const data = await res.json();
    setCharities(Array.isArray(data) ? data : []);
  } catch (error) {
    console.log(error);
  }
};


const handleSelectCharity = async () => {
  if (!charityId) {
    alert("Please select a charity");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/charities/select", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        charityId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to select charity");
      return;
    }

    alert("Charity selected successfully");
    fetchSelectedCharity();
  } catch (error) {
    console.log(error);
    alert("Failed to select charity");
  }
};

  const fetchScores = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/scores/${user.id}`);
      const data = await res.json();
      setScores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSelectedCharity = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/charities/selected/${user.id}`);
    const data = await res.json();
    setSelectedCharity(data?.charities || null);
  } catch (error) {
    console.log(error);
  }
};

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/subscriptions/${user.id}`);
      const data = await res.json();
      setSubscription(data);
    } catch (error) {
      console.log(error);
    }
  };

 
  useEffect(() => {
  if (user?.id) {
    fetchScores();
    fetchSubscription();
    fetchSelectedCharity();
    fetchCharities();

    }
  }, []);

  const handleAddScore = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id,
          score,
          played_at: playedAt
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || data.message || "Failed to add score");
        return;
      }

      setScores(data.scores);
      setScore("");
      setPlayedAt("");
    } catch (error) {
      console.log(error);
      alert("Failed to add score");
    }
  };

  const handleSubscribe = async (planType) => {
    try {
      const res = await fetch("http://localhost:5000/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id,
          planType
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Subscription failed");
        return;
      }

      setSubscription(data.subscription);
      alert("Subscription activated");
    } catch (error) {
      console.log(error);
      alert("Subscription failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome, {user?.name || "User"}
        </h1>
        <p className="text-slate-600 mb-8">
          Here is your FairChance dashboard.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Subscription Status</h2>
            <p className="text-slate-600">
              {subscription?.status || "Inactive"}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {subscription?.renewal_date
                ? `Renews on ${subscription.renewal_date}`
                : "No active plan"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Selected Charity</h2>
            <p className="text-slate-600">
              {selectedCharity?.name || "Not selected"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Recent Scores Count</h2>
            <p className="text-slate-600">{scores.length} / 5 saved</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
  <button
    onClick={() => handleSubscribe("monthly")}
    className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
  >
    Subscribe Monthly
  </button>

  <button
    onClick={() => handleSubscribe("yearly")}
    className="bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800"
  >
    Subscribe Yearly
  </button>
</div>

<div className="bg-white rounded-2xl shadow-md p-6 mb-8">
  <h2 className="text-xl font-semibold mb-4">Choose Your Charity</h2>

  <div className="flex flex-col md:flex-row gap-4">
    <select
      value={charityId}
      onChange={(e) => setCharityId(e.target.value)}
      className="flex-1 border border-slate-300 rounded-lg px-4 py-3"
    >
      <option value="">Select a charity</option>
      {charities.map((charity) => (
        <option key={charity.id} value={charity.id}>
          {charity.name}
        </option>
      ))}
    </select>

    <button
      onClick={handleSelectCharity}
      className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
    >
      Select Charity
    </button>
  </div>

  <p className="text-sm text-slate-500 mt-3">
    Current: {selectedCharity?.name || "Not selected"}
  </p>
</div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Score</h2>

            <form onSubmit={handleAddScore} className="space-y-4">
              <input
                type="number"
                min="1"
                max="45"
                placeholder="Enter score (1-45)"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />

              <input
                type="date"
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-3"
              />

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                Save Score
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Last 5 Scores</h2>

            {scores.length === 0 ? (
              <p className="text-slate-600">No scores added yet.</p>
            ) : (
              <div className="space-y-3">
                {scores.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-slate-900">Score: {item.score}</p>
                      <p className="text-sm text-slate-500">Date: {item.played_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;