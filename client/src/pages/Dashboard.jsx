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
  const [dateInput, setDateInput] = useState("");
  const [editingScoreId, setEditingScoreId] = useState(null);
  
  const [participation, setParticipation] = useState({ entered: 0, upcoming: "Pending active subscription." });
  const [winnings, setWinnings] = useState({ proofs: [], total_won: 0 });
  
  const [loading, setLoading] = useState(true);

  // Offline Payment Request State
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineNote, setOfflineNote] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("monthly");

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
      const [scoresRes, subRes, charRes, allCharRes, partRes, winRes] = await Promise.all([
        api.get("/scores"),
        api.get(`/subscriptions/${userId}`),
        api.get("/charities/selected"),
        api.get("/charities"),
        api.get("/draws/participation"),
        api.get("/winners/mine")
      ]);

      setScores(Array.isArray(scoresRes) ? scoresRes : []);
      setSubscription(subRes?.subscription || null);
      setSelectedCharity(charRes?.charities || null);
      setCharities(Array.isArray(allCharRes) ? allCharRes : []);
      if (partRes) setParticipation(partRes);
      if (winRes) setWinnings(winRes);
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
      if (!dateInput) return toast.error("Please provide the date you played.");
      
      let data;
      if (editingScoreId) {
        data = await api.put(`/scores/${editingScoreId}`, { score: scoreInput, played_at: dateInput });
        toast.success("Score updated!");
        setEditingScoreId(null);
      } else {
        data = await api.post("/scores", { score: scoreInput, played_at: dateInput });
        toast.success("Score added!");
      }
      
      setScores(data.scores);
      setScoreInput("");
      setDateInput("");
    } catch (error) {
      toast.error(error.message || "Failed to add score");
    }
  };

  const handleDeleteScore = async (id) => {
    try {
      await api.delete(`/scores/${id}`);
      setScores((prev) => prev.filter(s => s.id !== id));
      if (editingScoreId === id) {
        setEditingScoreId(null);
        setScoreInput("");
        setDateInput("");
      }
      toast.success("Score deleted");
    } catch (error) {
      toast.error("Failed to delete score");
    }
  };

  const handleEditClick = (item) => {
    setEditingScoreId(item.id);
    setScoreInput(item.score);
    // Convert timestamp to YYYY-MM-DD for input type="date"
    setDateInput(new Date(item.played_at).toISOString().split('T')[0]);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan_id) => {
    const isLoaded = await loadRazorpay();
    if (!isLoaded) return toast.error("Razorpay SDK failed to load. Please check your network.");

    try {
      const data = await api.post("/payments/create-subscription", { plan_id });
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mock", 
        subscription_id: data.subscription_id,
        name: "FairChance",
        description: `${plan_id.toUpperCase()} Subscription`,
        handler: function (response) {
          toast.success("Payment successful! Synchronizing state...");
          setTimeout(() => fetchDashboardData(user.id), 2000); // Give webhook time to fire
        },
        theme: {
          color: "#0F766E", // fc-emerald map
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
      toast.error(error.message || "Failed to initiate Checkout");
    }
  };

  const handleOfflineRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post("/subscriptions/request", { plan_id: selectedPlan, note: offlineNote });
      toast.success("Offline request sent to Administration.");
      setShowOfflineModal(false);
      fetchDashboardData(user.id);
    } catch (error) {
      toast.error(error.message || "Failed to send request.");
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
                    {subscription?.status === 'pending_approval' ? "PENDING ADMIN APPROVAL" : "INACTIVE"}
                  </div>
                  
                  {subscription?.status === 'pending_approval' ? (
                    <p className="text-gray-400 text-sm mb-4">Your offline subscription request is currently being reviewed by administration.</p>
                  ) : (
                    <>
                      <p className="text-gray-400 text-sm mb-4">You cannot participate in draws without an active subscription.</p>
                      
                      <div className="flex flex-col gap-3">
                        <div className="p-3 bg-fc-charcoal-dark border border-fc-emerald/30 rounded flex flex-col gap-2">
                          <p className="text-xs text-fc-emerald font-semibold uppercase tracking-wider">Fast Automated Access</p>
                          <button onClick={() => handleSubscribe('monthly')} className="btn-primary w-full py-2">Pay via Razorpay ($10/mo)</button>
                        </div>
                        
                        <div className="p-3 bg-fc-charcoal-dark border border-fc-charcoal-light rounded flex flex-col gap-2">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Manual Offline Access</p>
                          <button onClick={() => setShowOfflineModal(true)} className="bg-fc-charcoal-light border border-fc-gold text-fc-gold hover:bg-fc-gold/10 w-full py-2 rounded-lg font-medium transition-colors">Request Admin Approval</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {isActive && (
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 pt-4 border-t border-fc-charcoal-light">
                <button 
                  onClick={async () => {
                     try {
                        await api.patch(`/subscriptions/${subscription.id}/cancel`);
                        toast.success("Subscription Cancelled locally");
                        fetchDashboardData(user.id);
                     } catch(err) { toast.error("Cancellation failed"); }
                  }} 
                  className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors w-full sm:w-auto"
                >
                  Cancel Local Plan
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
              <p className="text-sm text-gray-400 mb-2">Supported Charity & Contribution Split</p>
              {selectedCharity ? (
                <div className="bg-fc-charcoal-dark border border-fc-charcoal-light rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-medium">{selectedCharity.name}</h3>
                    <span className="text-xs font-bold text-fc-gold bg-fc-gold/10 px-2 py-1 rounded">
                      {selectedCharity.min_percentage}% Split
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{selectedCharity.description || "Every win contributes directly."}</p>
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
          
          {/* PRD: Participation & Winnings Overview */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="premium-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-fc-emerald" />
              <h2 className="text-lg font-semibold text-white">Winnings & Participation</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-fc-charcoal-dark border border-fc-charcoal-light rounded-lg text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Won</p>
                <p className="text-2xl font-bold text-fc-gold">${winnings.total_won.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-fc-charcoal-dark border border-fc-charcoal-light rounded-lg text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Draws Entered</p>
                <p className="text-2xl font-bold text-white">{participation.entered}</p>
              </div>
            </div>

            <div className="bg-fc-emerald/10 border border-fc-emerald/30 rounded-lg p-4 flex flex-col items-center text-center">
              <span className="text-sm text-fc-emerald">Next Platform Draw Period</span>
              <span className="text-lg font-bold text-white mt-1">{participation.upcoming}</span>
            </div>
            
            {winnings.proofs.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-400 mb-3">Recent Payout Trajectory</p>
                <div className="space-y-2">
                  {winnings.proofs.slice(0, 3).map(proof => (
                    <div key={proof.id} className="flex justify-between items-center text-sm p-2 bg-fc-charcoal-dark/50 rounded">
                      <span className="text-gray-300">Draw Result #{proof.draw_result_id.slice(-4)}</span>
                      {proof.paid_at ? (
                        <span className="text-fc-emerald font-semibold border-b border-fc-emerald">PAID</span>
                      ) : (
                        <span className="text-yellow-400 capitalize">{proof.verification_status}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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

            <form onSubmit={handleAddScore} className="flex flex-col sm:flex-row gap-4 mb-8">
              <input 
                type="number" min="1" max="45" required
                placeholder="Stableford (1-45)" 
                value={scoreInput} onChange={(e) => setScoreInput(e.target.value)}
                className="input-premium flex-1"
                disabled={!isActive}
              />
              <input 
                type="date" required
                value={dateInput} onChange={(e) => setDateInput(e.target.value)}
                className="input-premium sm:w-48"
                disabled={!isActive}
              />
              <button type="submit" disabled={!isActive} className="btn-primary flex items-center justify-center gap-2">
                {editingScoreId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                {editingScoreId ? "Update Slot" : "Add Slot"}
              </button>
            </form>

            <div className="space-y-3">
              {scores.map((item, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                  key={item.id} 
                  className={`group flex items-center justify-between p-4 bg-fc-charcoal-dark border rounded-xl hover:border-fc-emerald/50 transition-colors ${editingScoreId === item.id ? 'border-fc-emerald' : 'border-fc-charcoal-light'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-fc-charcoal flex items-center justify-center border border-fc-charcoal-light">
                      <span className="text-xl font-bold text-fc-white">{item.score}</span>
                    </div>
                    <div>
                      <p className="text-sm text-fc-warm-white">Registered Number</p>
                      <p className="text-xs text-gray-500">Played on {new Date(item.played_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(item)} className="p-2 text-gray-400 hover:text-fc-emerald hover:bg-fc-emerald/10 rounded-lg">
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

      {/* Offline Request Modal Overlay */}
      {showOfflineModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="premium-card p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">Request Offline Access</h2>
            <p className="text-sm text-gray-400 mb-6">If you paid via cash, UPI direct transfer, or another manual method, provide the details below so the Admin can manually unlock your account.</p>
            
            <form onSubmit={handleOfflineRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Requested Plan</label>
                <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="input-premium w-full">
                  <option value="monthly">Monthly Access ($10)</option>
                  <option value="yearly">Yearly Access ($100)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Mandatory Context Note</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="e.g. 'I just sent you ₹800 via Google Pay from number +91...'"
                  value={offlineNote}
                  onChange={(e) => setOfflineNote(e.target.value)}
                  className="input-premium w-full resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowOfflineModal(false)} className="flex-1 py-2 rounded font-medium text-gray-400 hover:text-white border border-gray-600 hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 btn-primary py-2 shadow-lg">Submit Request</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
