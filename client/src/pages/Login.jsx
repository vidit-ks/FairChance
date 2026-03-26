import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";
import Navbar from "../components/Navbar";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
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
    setLoading(true);

    try {
      const data = await api.post("/auth/login", form);

      const role = String(data.user?.role || "").trim().toLowerCase();

      localStorage.setItem("fairchance_token", data.token);
      localStorage.setItem("fairchance_user", JSON.stringify(data.user));

      toast.success("Welcome back!");

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-fc-charcoal-dark text-fc-warm-white selection:bg-fc-emerald selection:text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-fc-emerald/10 rounded-full blur-[100px] -z-10 translate-y--1/2" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md premium-card p-8 md:p-10 relative">
          
          <div className="w-12 h-12 rounded-xl bg-fc-charcoal-light flex items-center justify-center mb-6">
            <LogIn className="w-6 h-6 text-fc-emerald" />
          </div>

          <h2 className="text-3xl font-bold mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-gray-400 mb-8">Sign in to your FairChance account to manage your numbers and subscriptions.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button type="submit" disabled={loading} className="w-full btn-primary mt-4 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link outline="none" to="/signup" className="text-fc-emerald hover:text-fc-teal transition-colors font-medium">Create one now</Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}

export default Login;
