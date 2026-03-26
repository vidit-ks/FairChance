import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Activity, Target, Shield, Trophy, LayoutDashboard, Plus, Trash2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [charities, setCharities] = useState([]);
  const [charityId, setCharityId] = useState("");
  
  const [scoreInput, setScoreInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("fairchance_user"));
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(userData);
    fetchDashboardData(userData.id);
  }, [navigate]);

  const fetchDashboardData = async (userId) => {
    try {
      setLoading(true);
      const [scoresRes, subRes, charRes, allCharRes] = await Promise.all([
        api.get("/scores"),
        api.get(`/subscriptions/${userId}`),
        api.get("/charities/selected"),
        api.get("/charities"),
      ]);

      setScores(Array.isArray(scoresRes) ? scoresRes : []);
      setSubscription(subRes?.subscription || null);
      setSelectedCharity(charRes?.charities || null);
      setCharities(Array.isArray(allCharRes) ? allCharRes : []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharity = async () => {
    if (!charityId) return toast.error("Please select a charity");
    try {
      await api.post("/charities/select", { charityId });
      toast.success("Charity preferences updated!");
      fetchDashboardData(user.id);
    } catch (error) {
      toast.error(error.message || "Failed to select charity");
    }
  };

  const handleAddScore = async (e) => {
    e.preventDefault();
    if (!subscription || subscription.status !== "active") {
      return toast.error("You need an active subscription to add scores.");
    }

    try {
      const data = await api.post("/scores", { score: scoreInput });
      setScores(data.scores);
      setScoreInput("");
      toast.success("Score added!");
    } catch (error) {
      toast.error(error.message || "Failed to add score");
    }
  };

  const handleDeleteScore = async (id) => {
    try {
      await api.delete(`/scores/${id}`);
      setScores((prev) => prev.filter(s => s.id !== id));
      toast.success("Score deleted");
    } catch (error) {
      toast.error("Failed to delete score");
    }
  };

  const handleSubscribe = async (plan_id) => {
    try {
      const data = await api.post("/subscriptions", { plan_id });
      setSubscription(data.subscription);
      toast.success(`Subscription activated (${plan_id})!`);
    } catch (error) {
      toast.error(error.message || "Subscription failed");
    }
  };

  const handleChangePlan = async (plan_id) => {
    if (!subscription || !subscription.id) return;
    try {
      const data = await api.patch(`/subscriptions/${subscription.id}/modify`, { plan_id });
      setSubscription(data.subscription);
      toast.success(`Plan updated to ${plan_id} successfully.`);
    } catch (error) {
      toast.error(error.message || "Failed to modify subscription");
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription || !subscription.id) return;
    try {
      await api.patch(`/subscriptions/${subscription.id}/cancel`);
      setSubscription({ ...subscription, status: 'cancelled' });
      toast.success("Subscription cancelled successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to cancel subscription");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fc-charcoal-dark">
        <div className="w-12 h-12 border-4 border-fc-charcoal-light border-t-fc-emerald rounded-full animate-spin"></div>
      </div>
    );
  }

  const isActive = subscription?.status === "active";

  return (
    <div className="min-h-screen bg-fc-charcoal-dark">
      {/* Top Bar */}
      <header className="bg-fc-charcoal border-b border-fc-charcoal-light py-4 px-8 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-fc-emerald" />
          <span className="font-semibold text-fc-warm-white">Dashboard</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-bold text-white mt-1">{user?.name}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-fc-emerald/20 border border-fc-emerald flex items-center justify-center text-fc-emerald font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button onClick={() => { localStorage.clear(); navigate("/"); }} className="ml-2 text-sm text-gray-400 hover:text-red-400 transition-colors">Sign out</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (State Cards) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Subscription State */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="premium-card p-6 border-t-2 border-t-fc-emerald">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-fc-emerald" />
              <h2 className="text-lg font-semibold text-white">Subscription</h2>
            </div>
            
            <div className="mb-4">
              {isActive ? (
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fc-emerald/10 text-fc-emerald text-sm font-medium mb-3">
                    <span className="w-2 h-2 rounded-full bg-fc-emerald animate-pulse"></span>
                    ACTIVE
                  </div>
                  <p className="text-gray-400 text-sm">Renews automatically on <br/><strong className="text-white">{new Date(subscription.renewal_date).toLocaleDateString()}</strong></p>
                </div>
              ) : (
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm font-medium mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    INACTIVE
                  </div>
                  <p className="text-gray-400 text-sm mb-4">You cannot participate in draws without an active subscription.</p>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleSubscribe('monthly')} className="btn-primary w-full py-2">Activate Monthly ($10)</button>
                    <button onClick={() => handleSubscribe('yearly')} className="bg-fc-charcoal-light border border-fc-gold text-fc-gold hover:bg-fc-gold/10 w-full py-2 rounded-lg font-medium transition-colors">Activate Yearly ($100)</button>
                  </div>
                </div>
              )}
            </div>
            
            {isActive && (
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 pt-4 border-t border-fc-charcoal-light">
                <button 
                  onClick={() => handleChangePlan('monthly')} 
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Switch Monthly
                </button>
                <button 
                  onClick={() => handleChangePlan('yearly')} 
                  className="text-sm font-medium text-fc-gold hover:text-yellow-400 transition-colors"
                >
                  Switch Yearly
                </button>
                <div className="hidden sm:block w-px h-4 bg-fc-charcoal-light"></div>
                <button 
                  onClick={handleCancelSubscription} 
                  className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>

          {/* Charity Impact Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="premium-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-5 h-5 text-fc-gold" />
              <h2 className="text-lg font-semibold text-white">Your Impact</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">Supported Charity</p>
              {selectedCharity ? (
                <div className="bg-fc-charcoal-dark border border-fc-charcoal-light rounded-lg p-4">
                  <h3 className="text-white font-medium">{selectedCharity.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedCharity.description || "Every win contributes directly."}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No charity selected yet.</p>
              )}
            </div>

            <div className="flex gap-2">
              <select value={charityId} onChange={(e) => setCharityId(e.target.value)} className="input-premium py-2 text-sm flex-1">
                <option value="">Change charity...</option>
                {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={handleSelectCharity} className="btn-secondary py-2 px-4 shadow">Set</button>
            </div>
          </motion.div>
          
        </div>

        {/* Right Column (Timeline & Scores) */}
        <div className="lg:col-span-8 space-y-6">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6">
            <div className="flex justify-between items-center mb-6 border-b border-fc-charcoal-light pb-4">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-fc-teal-light" />
                <h2 className="text-xl font-semibold text-white">Your Score Timeline</h2>
              </div>
              <div className="text-sm text-gray-400">
                <span className="text-white font-medium">{scores.length}</span> / 5 Slots Used
              </div>
            </div>

            <form onSubmit={handleAddScore} className="flex gap-4 mb-8">
              <input 
                type="number" min="1" max="45" required
                placeholder="Enter a number (1-45)" 
                value={scoreInput} onChange={(e) => setScoreInput(e.target.value)}
                className="input-premium flex-1"
                disabled={!isActive}
              />
              <button type="submit" disabled={!isActive} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Slot
              </button>
            </form>

            <div className="space-y-3">
              {scores.map((item, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                  key={item.id} 
                  className="group flex items-center justify-between p-4 bg-fc-charcoal-dark border border-fc-charcoal-light rounded-xl hover:border-fc-emerald/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-fc-charcoal flex items-center justify-center border border-fc-charcoal-light">
                      <span className="text-xl font-bold text-fc-white">{item.score}</span>
                    </div>
                    <div>
                      <p className="text-sm text-fc-warm-white">Registered Number</p>
                      <p className="text-xs text-gray-500">Added on {new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-fc-emerald hover:bg-fc-emerald/10 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteScore(item.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {scores.length === 0 && (
                <div className="text-center py-12 px-4 border border-dashed border-fc-charcoal-light rounded-xl">
                  <Activity className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">You haven't added any numbers yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Add a number above to participate in the next draw.</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
