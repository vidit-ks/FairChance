import { useState } from "react";
import Navbar from "../components/Navbar";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.log(error);
      alert("Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              name="name"
              type="text"
              placeholder="Full Name"
              className="w-full border px-4 py-3 rounded-lg"
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full border px-4 py-3 rounded-lg"
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full border px-4 py-3 rounded-lg"
              onChange={handleChange}
            />

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
              Sign Up
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;