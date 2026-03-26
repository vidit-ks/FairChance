import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Navbar from "../components/Navbar";

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    charity_id: "",
  });
  
  const [charities, setCharities] = useState([]);
  const [loadingCharities, setLoadingCharities] = useState(true);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const data = await api.get("/charities");
        setCharities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load charities", error);
      } finally {
        setLoadingCharities(false);
      }
    };
    fetchCharities();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/signup", form);
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fc-charcoal-dark text-fc-warm-white selection:bg-fc-emerald selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-fc-teal/10 rounded-full blur-[100px] -z-10 translate-y--1/2" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md premium-card p-8 md:p-10 relative">
          
          <div className="w-12 h-12 rounded-xl bg-fc-charcoal-light flex items-center justify-center mb-6">
            <UserPlus className="w-6 h-6 text-fc-teal" />
          </div>

          <h2 className="text-3xl font-bold mb-2 tracking-tight">Create Account</h2>
          <p className="text-gray-400 mb-8">Join FairChance to start playing and supporting great causes today.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder=""
                className="input-premium"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="input-premium"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder=""
                className="input-premium"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Supported Charity <span className="text-fc-emerald">*</span></label>
              <select
                name="charity_id"
                required
                className="input-premium py-3"
                onChange={handleChange}
                value={form.charity_id}
              >
                <option value="" disabled>
                  {loadingCharities ? "Loading charities..." : "Select a charity to support"}
                </option>
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">10% of your subscription will be automatically donated here.</p>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary mt-4 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-fc-emerald hover:text-fc-teal transition-colors font-medium">Log in instead</Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default Signup;
