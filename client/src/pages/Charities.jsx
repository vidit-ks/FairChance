import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function Charities() {
  const [charities, setCharities] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:5000/api/charities")
      .then(res => res.json())
      .then(data => setCharities(data));
  }, []);

  const selectCharity = async (id) => {
    await fetch("http://localhost:5000/api/charities/select", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        charityId: id,
      }),
    });

    alert("Charity selected!");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Select a Charity</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {charities.map((charity) => (
            <div key={charity.id} className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold">{charity.name}</h2>
              <p className="text-slate-600">{charity.description}</p>

              <button
                onClick={() => selectCharity(charity.id)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Charities;