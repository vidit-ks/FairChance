import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, CreditCard, Gift, Settings, Ticket, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api";

function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [latestDraw, setLatestDraw] = useState(null);
  const [results, setResults] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [stats, setStats] = useState({ users: 0, activeSubs: 0, pool: 0 });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("fairchance_user"));
    if (!userData) {
      navigate("/login");
      return;
    }
    const role = String(userData.role || "").trim().toLowerCase();
    if (role !== 'admin') {
      navigate("/dashboard");
      return;
    }
    setUser(userData);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drawData, resultsData, winnersData, usersData, subsData] = await Promise.all([
        api.get("/draws/latest").catch(() => null),
        api.get("/draws/results/latest").catch(() => []),
        api.get("/winners/all").catch(() => []),
        api.get("/auth/users").catch(() => ({ users: [] })),
        api.get("/subscriptions/all").catch(() => ({ subscriptions: [] }))
      ]);

      setLatestDraw(drawData);
      setResults(Array.isArray(resultsData) ? resultsData : []);
      setVerifications(Array.isArray(winnersData) ? winnersData : []);
      
      const activeSubs = Array.isArray(subsData?.subscriptions) ? subsData.subscriptions.filter(s => s.status === 'active').length : 0;
      setStats({
        users: usersData?.users?.length || 0,
        activeSubs: activeSubs,
        pool: drawData?.jackpot_pool || 0
      });
    } catch (error) {
      console.error("Admin fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraw = async () => {
    try {
      const { draw } = await api.post("/draws/create", { mode: 'random' });
      setLatestDraw(draw);
      toast.success("Draw created successfully. Ready to publish.");
    } catch (error) {
      toast.error(error.message || "Failed to create draw");
    }
  };

  const handlePublishDraw = async (id) => {
    try {
      const data = await api.post(`/draws/${id}/publish`);
      setLatestDraw(data.draw);
      toast.success(`Draw published successfully! ${data.total_winners} potential winners found.`);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to publish draw");
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await api.patch(`/winners/${id}/verify`, { status });
      setVerifications(prev => prev.map(v => v.id === id ? { ...v, verification_status: status } : v));
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error(error.message || `Failed to ${status}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fc-charcoal-dark">
        <div className="w-12 h-12 border-4 border-fc-charcoal-light border-t-fc-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fc-charcoal-dark text-fc-warm-white">
      {/* Top Bar */}
      <header className="bg-fc-charcoal border-b border-fc-charcoal-light py-4 px-8 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-fc-gold" />
          <span className="font-semibold text-white">Admin Command Center</span>
        </div>
        <button onClick={() => { localStorage.clear(); navigate("/"); }} className="text-sm text-gray-500 hover:text-white transition-colors">Sign out</button>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="premium-card p-6 border-l-4 border-l-fc-emerald">
            <h3 className="text-gray-400 text-sm mb-1">Total Users</h3>
            <p className="text-2xl font-bold text-white">{stats.users}</p>
          </div>
          <div className="premium-card p-6 border-l-4 border-l-fc-teal">
            <h3 className="text-gray-400 text-sm mb-1">Active Subs</h3>
            <p className="text-2xl font-bold text-white">{stats.activeSubs}</p>
          </div>
          <div className="premium-card p-6 border-l-4 border-l-fc-gold">
            <h3 className="text-gray-400 text-sm mb-1">Current Pool</h3>
            <p className="text-2xl font-bold text-white">${stats.pool.toLocaleString()}</p>
          </div>
          <div className="premium-card p-6 border-l-4 border-l-blue-500">
            <h3 className="text-gray-400 text-sm mb-1">Pending Checks</h3>
            <p className="text-2xl font-bold text-white">{verifications.filter(v => v.verification_status === 'pending').length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Draw Engine Control */}
          <div className="premium-card p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-fc-charcoal-light">
              <Ticket className="w-6 h-6 text-fc-gold" />
              <h2 className="text-xl font-bold text-white">Draw Engine</h2>
            </div>

            {latestDraw ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status</span>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${latestDraw.published_at ? 'bg-fc-emerald/20 text-fc-emerald' : 'bg-fc-gold/20 text-fc-gold'}`}>
                    {latestDraw.published_at ? 'PUBLISHED' : 'PENDING REVIEW'}
                  </span>
                </div>

                <div>
                  <span className="block text-sm text-gray-400 mb-2">Draw Numbers</span>
                  <div className="flex gap-2 flex-wrap">
                    {Array.isArray(latestDraw.draw_numbers) && latestDraw.draw_numbers.map((num) => (
                      <div key={num} className="w-10 h-10 rounded-full bg-fc-charcoal-light border border-fc-teal flex items-center justify-center font-bold text-fc-warm-white">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {!latestDraw.published_at && (
                  <button onClick={() => handlePublishDraw(latestDraw.id)} className="w-full btn-primary bg-fc-gold hover:bg-yellow-500 text-fc-charcoal shadow-none">
                    Publish Official Results
                  </button>
                )}

                {latestDraw.published_at && (
                   <button onClick={handleCreateDraw} className="w-full btn-secondary py-3 flex items-center justify-center gap-2">
                    Start Next Draw Cycle
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-6">No active draw in the system.</p>
                <button onClick={handleCreateDraw} className="btn-primary">Initialize New Draw</button>
              </div>
            )}
          </div>

          {/* Verification Queue */}
          <div className="premium-card p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-fc-charcoal-light">
              <CheckCircle className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Winner Verification Queue</h2>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {verifications.length === 0 ? (
                <p className="text-gray-500 italic text-center py-10">No pending verifications.</p>
              ) : (
                verifications.map((item) => (
                  <div key={item.id} className="bg-fc-charcoal-dark border border-fc-charcoal-light rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{item.users?.name || "User"} <span className="text-sm font-normal text-gray-400">({item.users?.email})</span></p>
                      <a href={item.proof_url} target="_blank" rel="noreferrer" className="text-sm text-fc-teal hover:underline inline-block mt-1">View Proof Document</a>
                      <p className="text-xs text-gray-500 mt-2">Status: <span className="uppercase text-white">{item.verification_status}</span></p>
                    </div>
                    
                    {item.verification_status === 'pending' && (
                      <div className="flex gap-2 items-start shrink-0">
                        <button onClick={() => handleVerify(item.id, 'approved')} title="Approve" className="p-2 bg-fc-emerald/20 text-fc-emerald hover:bg-fc-emerald/30 rounded-lg transition-colors">
                          <CheckCircle className="w-5 h-5"/>
                        </button>
                        <button onClick={() => handleVerify(item.id, 'rejected')} title="Reject" className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg transition-colors">
                          <XCircle className="w-5 h-5"/>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default Admin;
