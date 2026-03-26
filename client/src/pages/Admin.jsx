import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, CreditCard, Gift, Settings, Ticket, CheckCircle, XCircle, Heart, Trash2, Edit2, Plus, ArrowUpRight, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [latestDraw, setLatestDraw] = useState(null);
  const [results, setResults] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [allScores, setAllScores] = useState([]);
  const [allCharities, setAllCharities] = useState([]);
  
  const [stats, setStats] = useState({ users: 0, activeSubs: 0, pool: 0, pendingVerifications: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);

  // Charity Form State
  const [charityForm, setCharityForm] = useState({ id: null, name: "", description: "", is_featured: false, min_percentage: 10 });
  const [isEditingCharity, setIsEditingCharity] = useState(false);
  
  // Draw Engine State
  const [drawMode, setDrawMode] = useState("random");
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("fairchance_user"));
    if (!userData) return navigate("/login");
    const role = String(userData.role || "").trim().toLowerCase();
    if (role !== 'admin') return navigate("/dashboard");
    
    setUser(userData);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drawData, resultsData, winnersData, usersData, subsData, scoresData, charData] = await Promise.all([
        api.get("/draws/latest").catch(() => null),
        api.get("/draws/results/latest").catch(() => []),
        api.get("/winners/all").catch(() => []),
        api.get("/auth/users").catch(() => ({ users: [] })),
        api.get("/subscriptions/all").catch(() => ({ subscriptions: [] })),
        api.get("/scores/all").catch(() => []),
        api.get("/charities").catch(() => [])
      ]);

      setLatestDraw(drawData);
      setResults(Array.isArray(resultsData) ? resultsData : []);
      
      const verifs = Array.isArray(winnersData) ? winnersData : [];
      setVerifications(verifs);
      
      setAllUsers(usersData?.users || []);
      
      const subs = subsData?.subscriptions || [];
      setAllSubscriptions(subs);
      
      setAllScores(Array.isArray(scoresData) ? scoresData : []);
      setAllCharities(Array.isArray(charData) ? charData : []);
      
      const activeSubs = subs.filter(s => s.status === 'active').length;
      const pendingApprovalCount = subs.filter(s => s.status === 'pending_approval').length;
      
      setStats({
        users: usersData?.users?.length || 0,
        activeSubs: activeSubs,
        pool: drawData?.jackpot_pool || 0,
        pendingVerifications: verifs.filter(v => v.verification_status === 'pending').length,
        pendingApprovals: pendingApprovalCount
      });
    } catch (error) {
      console.error("Admin fetch error:", error);
      toast.error("Some data failed to load.");
    } finally {
      setLoading(false);
    }
  };

  // --- DRAW ENGINE ---
  const handleCreateDraw = async () => {
    try {
      const { draw } = await api.post("/draws/create", { mode: drawMode });
      setLatestDraw(draw);
      setSimulationResult(null);
      toast.success(`Draw created successfully in ${drawMode} mode. Ready to publish.`);
    } catch (error) {
      toast.error(error.message || "Failed to create draw");
    }
  };

  const handlePublishDraw = async (id) => {
    try {
      const data = await api.post(`/draws/${id}/publish`);
      setLatestDraw(data.draw);
      toast.success(`Draw published! ${data.total_winners} potential winners found.`);
      fetchData();
    } catch (error) {
      if (error.message?.includes("Jackpot is 0")) {
        toast.error("Draw cannot be published: Jackpot is 0. Subs required.");
      } else {
        toast.error(error.message || "Failed to publish draw");
      }
    }
  };

  const handleSimulateDraw = async () => {
    try {
      setLoading(true);
      const data = await api.post("/draws/simulate", { mode: drawMode });
      setSimulationResult(data);
      toast.success("Simulation Complete!");
    } catch (error) {
      toast.error(error.message || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFICATIONS ---
  const handleVerify = async (id, status) => {
    try {
      await api.patch(`/winners/${id}/verify`, { status });
      setVerifications(prev => prev.map(v => v.id === id ? { ...v, verification_status: status } : v));
      toast.success(`Status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error(error.message || `Failed to ${status}`);
    }
  };

  // --- CHARITIES ---
  const handleSaveCharity = async (e) => {
    e.preventDefault();
    try {
      if (isEditingCharity && charityForm.id) {
        await api.put(`/charities/${charityForm.id}`, charityForm);
        toast.success("Charity updated successfully");
      } else {
        await api.post("/charities", charityForm);
        toast.success("Charity created successfully");
      }
      setCharityForm({ id: null, name: "", description: "", is_featured: false, min_percentage: 10 });
      setIsEditingCharity(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to save charity");
    }
  };

  const handleDeleteCharity = async (id) => {
    if (!window.confirm("Delete this charity? Users tied to it might lose references.")) return;
    try {
      await api.delete(`/charities/${id}`);
      toast.success("Charity deleted");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to delete charity");
    }
  };

  // --- USERS MANAGEMENT ---
  const handleAdminSubscribeUser = async (userId, plan) => {
    try {
      await api.post("/subscriptions", { user_id: userId, plan_id: plan });
      toast.success(`Successfully subscribed user to ${plan} plan`);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed admin subscription override");
    }
  };

  const handleAdminDecideSubscription = async (subId, decision) => {
    try {
      await api.patch(`/subscriptions/${subId}/decide`, { decision });
      toast.success(`Request successfully ${decision}d.`);
      fetchData();
    } catch (error) {
      toast.error(error.message || `Failed to ${decision} request.`);
    }
  };
  
  const handleAdminCancelUser = async (subId) => {
    if (!window.confirm("Cancel this user's subscription?")) return;
    try {
      await api.patch(`/subscriptions/${subId}/cancel`);
      toast.success("Subscription cancelled");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to cancel");
    }
  };
  
  const handleAdminDeleteScore = async (scoreId) => {
    if (!window.confirm("Delete this user's score entry?")) return;
    try {
      await api.delete(`/scores/${scoreId}`);
      toast.success("Score deleted");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to delete score");
    }
  };

  const handleAdminEditUser = async (user) => {
    const newName = window.prompt("Enter new name for user:", user.name);
    if (!newName) return;
    try {
      await api.put(`/auth/users/${user.id}`, { name: newName });
      toast.success("User profile updated");
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to edit user");
    }
  };

  const handleAdminEditScore = async (scoreObj) => {
    const newVal = window.prompt("Enter new stableford score (1-45):", scoreObj.score);
    if (!newVal || isNaN(newVal) || newVal < 1 || newVal > 45) return toast.error("Invalid range.");
    try {
      await api.put(`/scores/${scoreObj.id}`, { score: Number(newVal), played_at: scoreObj.played_at });
      toast.success("Score overridden");
      fetchData();
    } catch (error) {
      toast.error("Failed to edit score");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fc-charcoal-dark">
        <div className="w-12 h-12 border-4 border-fc-charcoal-light border-t-fc-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'draws', label: 'Draw Engine', icon: Ticket },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'charities', label: 'Charities', icon: Heart },
    { id: 'verification', label: 'Winners Registry', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-fc-charcoal-dark text-fc-warm-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-fc-charcoal border-r border-fc-charcoal-light flex-shrink-0">
        <div className="p-6 border-b border-fc-charcoal-light">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-fc-gold" />
            <span className="font-semibold text-white tracking-tight">Admin Center</span>
          </div>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-fc-emerald/10 text-fc-emerald' : 'text-gray-400 hover:text-white hover:bg-fc-charcoal-light'}`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.id === 'overview' && stats.pendingApprovals > 0 && (
                <span className="ml-auto bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">{stats.pendingApprovals}</span>
              )}
              {item.id === 'verification' && stats.pendingVerifications > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">{stats.pendingVerifications}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button onClick={() => { localStorage.clear(); navigate("/"); }} className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            Exit System
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-2xl font-bold text-white mb-6">Platform Overview</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="premium-card p-6 border-l-4 border-l-fc-emerald">
                  <h3 className="text-gray-400 text-sm mb-1">Total Users</h3>
                  <p className="text-3xl font-bold text-white">{stats.users}</p>
                </div>
                <div className="premium-card p-6 border-l-4 border-l-fc-teal">
                  <h3 className="text-gray-400 text-sm mb-1">Active Subs</h3>
                  <p className="text-3xl font-bold text-white">{stats.activeSubs}</p>
                </div>
                <div className="premium-card p-6 border-l-4 border-l-fc-gold">
                  <h3 className="text-gray-400 text-sm mb-1">Current Pool</h3>
                  <p className="text-3xl font-bold text-white">${stats.pool.toLocaleString()}</p>
                </div>
                <div className="premium-card p-6 border-l-4 border-l-blue-500">
                  <h3 className="text-gray-400 text-sm mb-1">Pending Checks</h3>
                  <p className="text-3xl font-bold text-white">{stats.pendingVerifications}</p>
                </div>
                <div className="premium-card p-6 border-l-4 border-l-fc-charcoal-light col-span-1 md:col-span-2 lg:col-span-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Total Charity Capital Raised (Estimated)</h3>
                    <p className="text-4xl font-bold text-fc-gold">${(stats.activeSubs * 1).toLocaleString()}</p>
                  </div>
                  <Heart className="w-12 h-12 text-fc-gold opacity-50"/>
                </div>
              </div>

              {/* Pending Approvals Inbox */}
              {stats.pendingApprovals > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                    <h2 className="text-xl font-bold text-white">Action Required: Pending Approvals</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allSubscriptions.filter(s => s.status === 'pending_approval').map(sub => (
                      <div key={sub.id} className="premium-card p-5 border border-yellow-500/30 bg-fc-charcoal-dark/50">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-white text-lg">{sub.users?.name || "Unknown User"}</p>
                            <p className="text-xs text-gray-400">{sub.users?.email}</p>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 bg-fc-charcoal rounded border border-gray-600 uppercase tracking-wider text-gray-300">
                            {sub.plan_type}
                          </span>
                        </div>
                        <div className="bg-black/30 p-3 rounded text-sm text-gray-300 italic mb-4 border-l-2 border-yellow-500/50">
                          "{sub.notes || "No context provided."}"
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAdminDecideSubscription(sub.id, 'approve')} className="flex-1 bg-fc-emerald/10 text-fc-emerald hover:bg-fc-emerald hover:text-fc-charcoal border border-fc-emerald/30 py-2 rounded font-bold transition-all shadow-sm">
                            Approve Access
                          </button>
                          <button onClick={() => handleAdminDecideSubscription(sub.id, 'deny')} className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 py-2 rounded font-bold transition-all shadow-sm">
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </motion.div>
          )}

          {/* DRAWS TAB */}
          {activeTab === 'draws' && (
            <motion.div key="draws" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-2xl font-bold text-white mb-6">Draw Engine Configuration</h1>
              
              <div className="premium-card p-8 max-w-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-fc-charcoal-light">
                  <Ticket className="w-6 h-6 text-fc-gold" />
                  <h2 className="text-xl font-bold text-white">Active Draw State</h2>
                </div>

                {latestDraw ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-fc-charcoal-dark p-4 rounded-xl border border-fc-charcoal-light">
                      <div>
                        <span className="block text-sm text-gray-400 mb-1">System Status</span>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${latestDraw.published_at ? 'bg-fc-emerald/20 text-fc-emerald' : 'bg-fc-gold/20 text-fc-gold'}`}>
                          {latestDraw.published_at ? 'PUBLISHED' : 'PENDING REVIEW'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm text-gray-400 mb-1">Rollover Amount</span>
                        <span className="text-lg font-bold text-white">${Number(latestDraw.rollover_amount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-sm text-gray-400 mb-3">Generated Numbers (Algorithm: {latestDraw.mode})</span>
                      <div className="flex gap-3 flex-wrap">
                        {Array.isArray(latestDraw.draw_numbers) && latestDraw.draw_numbers.map((num) => (
                          <div key={num} className="w-12 h-12 rounded-full bg-fc-charcoal-light border-2 border-fc-gold flex items-center justify-center text-lg font-bold text-white shadow-[0_0_15px_rgba(182,143,64,0.3)]">
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>

                    {!latestDraw.published_at && (
                      <button onClick={() => handlePublishDraw(latestDraw.id)} className="w-full btn-primary bg-fc-gold hover:bg-yellow-500 text-fc-charcoal shadow-none py-3 font-bold">
                        Publish Official Results & Calculate Winners
                      </button>
                    )}

                    {latestDraw.published_at && (
                       <button onClick={handleCreateDraw} className="w-full btn-secondary py-3 flex items-center justify-center gap-2">
                        Start Next Monthly Draw Sequence
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-6 text-lg">No active draw in the system. Ready to begin cycle.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                      <select className="input-premium sm:w-48 text-center" value={drawMode} onChange={e => setDrawMode(e.target.value)}>
                        <option value="random">Random Generation</option>
                        <option value="algorithm">Algorithmic Weighted</option>
                      </select>
                      <button onClick={handleCreateDraw} className="btn-primary py-3 px-8 text-lg font-medium">Initialize New Monthly Draw</button>
                    </div>
                    
                    <button onClick={handleSimulateDraw} className="text-fc-teal hover:underline text-sm font-medium border border-fc-teal/30 px-4 py-2 rounded-lg bg-fc-teal/10 hover:bg-fc-teal/20 transition-all">
                      Run Dry Simulation First
                    </button>

                    {simulationResult && (
                      <div className="mt-8 text-left bg-fc-charcoal rounded-xl p-6 border-2 border-dashed border-fc-charcoal-light">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">Simulation Output <span className="text-xs bg-gray-700 px-2 rounded">{simulationResult.mode_used}</span></h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="bg-fc-charcoal-dark p-3 rounded text-center border border-fc-charcoal-light">
                            <span className="block text-xs text-gray-400">Total Winners</span>
                            <span className="block text-xl font-bold text-white">{simulationResult.total_winners}</span>
                          </div>
                          <div className="bg-fc-charcoal-dark p-3 rounded text-center border border-fc-emerald/30">
                            <span className="block text-xs text-fc-emerald">5 Match</span>
                            <span className="block text-xl font-bold text-white">{simulationResult.match_distribution["5"]}</span>
                          </div>
                          <div className="bg-fc-charcoal-dark p-3 rounded text-center border border-fc-charcoal-light">
                            <span className="block text-xs text-gray-400">4 Match</span>
                            <span className="block text-xl font-bold text-white">{simulationResult.match_distribution["4"]}</span>
                          </div>
                          <div className="bg-fc-charcoal-dark p-3 rounded text-center border border-fc-charcoal-light">
                            <span className="block text-xs text-gray-400">3 Match</span>
                            <span className="block text-xl font-bold text-white">{simulationResult.match_distribution["3"]}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">Numbers generated: {simulationResult.predicted_numbers.join(", ")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
               
               <div className="space-y-4">
                 {allUsers.map(u => {
                   const uSubs = allSubscriptions.filter(s => s.user_id === u.id);
                   const activeSub = uSubs.find(s => s.status === 'active');
                   const uScores = allScores.filter(s => s.user_id === u.id);
                   
                   return (
                     <div key={u.id} className="premium-card p-6 flex flex-col xl:flex-row gap-6">
                       
                       <div className="xl:w-1/3">
                         <div className="flex justify-between items-start mb-1">
                           <h3 className="text-lg font-bold text-white">{u.name} <span className="text-xs font-normal text-gray-500 ml-2 uppercase border border-gray-600 px-2 rounded">{u.role}</span></h3>
                           <button onClick={() => handleAdminEditUser(u)} className="text-gray-400 hover:text-white"><Edit2 className="w-4 h-4"/></button>
                         </div>
                         <p className="text-sm text-gray-400 mb-4">{u.email}</p>
                         
                         <div className="bg-fc-charcoal-dark rounded-lg p-4 border border-fc-charcoal-light">
                           <p className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wider">Subscription Control</p>
                           {activeSub ? (
                             <div>
                               <div className="text-sm text-fc-emerald flex items-center gap-2 mb-3">
                                 <CheckCircle className="w-4 h-4"/> Active until {new Date(activeSub.renewal_date).toLocaleDateString()}
                               </div>
                               <button onClick={() => handleAdminCancelUser(activeSub.id)} className="text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded transition-colors w-full">Cancel Subscription</button>
                             </div>
                           ) : (
                             <div className="flex gap-2">
                               <button onClick={() => handleAdminSubscribeUser(u.id, 'monthly')} className="text-xs btn-primary py-1.5 px-3 flex-1">Give Mthly</button>
                               <button onClick={() => handleAdminSubscribeUser(u.id, 'yearly')} className="text-xs btn-primary bg-fc-gold text-fc-charcoal py-1.5 px-3 flex-1">Give Yearly</button>
                             </div>
                           )}
                         </div>
                       </div>
                       
                       <div className="xl:flex-1 bg-fc-charcoal-dark rounded-lg p-4 border border-fc-charcoal-light">
                         <p className="text-xs text-gray-400 mb-3 uppercase font-semibold tracking-wider">Golf Scores ({uScores.length}/5 slots)</p>
                         {uScores.length > 0 ? (
                           <div className="flex flex-wrap gap-2">
                             {uScores.map(score => (
                               <div key={score.id} className="group relative w-12 h-12 rounded flex items-center justify-center bg-fc-charcoal border border-fc-charcoal-light hover:border-fc-emerald transition-colors" title="Edit or Delete">
                                 <span className="font-bold text-white group-hover:hidden">{score.score}</span>
                                 <div className="hidden group-hover:flex items-center gap-1">
                                   <button onClick={() => handleAdminEditScore(score)} className="p-1 hover:text-fc-emerald"><Edit2 className="w-3 h-3 text-gray-300" /></button>
                                   <button onClick={() => handleAdminDeleteScore(score.id)} className="p-1 hover:text-red-500"><Trash2 className="w-3 h-3 text-red-400" /></button>
                                 </div>
                               </div>
                             ))}
                           </div>
                         ) : (
                           <p className="text-sm text-gray-500 italic">No scores submitted yet.</p>
                         )}
                       </div>
                     </div>
                   );
                 })}
               </div>
            </motion.div>
          )}

          {/* CHARITIES TAB */}
          {activeTab === 'charities' && (
            <motion.div key="charities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-white">Charity Network Management</h1>
                 {!isEditingCharity && (
                   <button onClick={() => setIsEditingCharity(true)} className="btn-primary py-2 px-4 shadow flex items-center gap-2">
                     <Plus className="w-4 h-4" /> Add Foundation
                   </button>
                 )}
               </div>

               {isEditingCharity && (
                 <div className="premium-card p-6 mb-8 border-t-2 border-t-fc-gold shadow-2xl">
                   <h3 className="text-lg font-bold text-white mb-4">{charityForm.id ? "Edit Foundation" : "Register Foundation"}</h3>
                   <form onSubmit={handleSaveCharity} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="md:col-span-2">
                       <label className="block text-xs text-gray-400 mb-1">Organization Name</label>
                       <input type="text" required className="input-premium w-full" value={charityForm.name} onChange={e => setCharityForm({...charityForm, name: e.target.value})} />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block text-xs text-gray-400 mb-1">Description</label>
                       <textarea rows="3" className="input-premium w-full resize-none" value={charityForm.description} onChange={e => setCharityForm({...charityForm, description: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-xs text-gray-400 mb-1">Image URL Address</label>
                       <input type="text" className="input-premium w-full" value={charityForm.image_url} onChange={e => setCharityForm({...charityForm, image_url: e.target.value})} />
                     </div>
                     <div>
                       <label className="block text-xs text-gray-400 mb-1">Minimum Split %</label>
                       <input type="number" min="0" max="100" className="input-premium w-full" value={charityForm.min_percentage} onChange={e => setCharityForm({...charityForm, min_percentage: e.target.value})} />
                     </div>
                     <div className="md:col-span-2 mt-4 flex gap-3">
                       <button type="submit" className="btn-secondary bg-fc-gold text-fc-charcoal py-2 px-6 flex-1 hover:bg-yellow-500">Save Configuration</button>
                       <button type="button" onClick={() => { setIsEditingCharity(false); setCharityForm({ id: null, name: "", description: "", is_featured: false, min_percentage: 10 }); }} className="bg-transparent border border-gray-600 text-gray-400 hover:text-white py-2 px-6 rounded-lg transition-colors">Cancel</button>
                     </div>
                   </form>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {allCharities.map(c => (
                   <div key={c.id} className="premium-card p-6 flex flex-col h-full">
                     <h3 className="text-lg font-bold text-white mb-2">{c.name}</h3>
                     <p className="text-sm text-gray-400 mb-4 flex-1 line-clamp-3 leading-relaxed">{c.description || "No description provided."}</p>
                     <div className="flex items-center justify-between mt-auto pt-4 border-t border-fc-charcoal-light">
                       <span className="text-xs font-bold text-fc-emerald">{c.min_percentage}% Base Split</span>
                       <div className="flex gap-2">
                         <button onClick={() => { setCharityForm(c); setIsEditingCharity(true); }} className="p-2 text-gray-400 hover:text-white hover:bg-fc-charcoal-light rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                         <button onClick={() => handleDeleteCharity(c.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}

          {/* VERIFICATIONS TAB */}
          {activeTab === 'verification' && (
            <motion.div key="verification" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h1 className="text-2xl font-bold text-white mb-6">Winner Verification Inbox</h1>
              
              <div className="premium-card overflow-hidden">
                {verifications.length === 0 ? (
                  <div className="py-20 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Queue is completely empty.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-fc-charcoal-light">
                    {verifications.map((item) => (
                      <div key={item.id} className="p-6 flex flex-col sm:flex-row justify-between gap-6 hover:bg-fc-charcoal-light/10 transition-colors">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-bold text-lg text-white">{item.users?.name || "Unknown User"}</p>
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${
                              item.verification_status === 'pending' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 
                              item.verification_status === 'approved' ? 'border-fc-emerald/30 text-fc-emerald bg-fc-emerald/10' : 
                              'border-red-500/30 text-red-400 bg-red-500/10'
                            }`}>
                              {item.verification_status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{item.users?.email}</p>
                          <a href={item.proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-fc-teal hover:text-fc-emerald hover:bg-fc-emerald/10 px-3 py-1.5 rounded-lg border border-fc-teal/30 transition-all">
                            View Uploaded Payload <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                        
                        {item.verification_status === 'pending' && (
                          <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-center">
                            <button onClick={() => handleVerify(item.id, 'approved')} className="text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 py-2 px-4 bg-fc-emerald/10 border border-fc-emerald/30 text-fc-emerald hover:bg-fc-emerald hover:text-fc-charcoal-dark rounded transition-all">
                              <CheckCircle className="w-4 h-4"/> Approve Run
                            </button>
                            <button onClick={() => handleVerify(item.id, 'rejected')} className="text-xs font-bold uppercase tracking-wider py-2 px-4 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors border border-transparent">
                              Reject Fraud
                            </button>
                          </div>
                        )}

                        {item.verification_status === 'approved' && !item.paid_at && (
                          <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-center">
                            <button onClick={() => handleVerify(item.id, 'paid')} className="text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 py-2 px-4 bg-blue-500 text-fc-charcoal-dark hover:bg-blue-400 rounded transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                              Mark Payout Processed
                            </button>
                          </div>
                        )}
                        
                        {item.paid_at && (
                          <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-center items-center justify-center text-gray-500 font-bold text-xs uppercase opacity-70">
                            Closed
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Admin;
