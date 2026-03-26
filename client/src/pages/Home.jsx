import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Trophy, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

const fadeInOptions = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("fairchance_user"));

  const handleGetStarted = () => {
    if (user) {
      const role = String(user.role || "").trim().toLowerCase();
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-fc-charcoal-dark text-fc-warm-white selection:bg-fc-emerald selection:text-white">
      {/* Navbar Placeholder */}
      <nav className="fixed w-full z-50 top-0 bg-fc-charcoal-dark/80 backdrop-blur-md border-b border-fc-charcoal-light py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fc-emerald to-fc-teal flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight">FairChance</span>
        </div>
        <button onClick={handleGetStarted} className="btn-secondary text-sm px-5 py-2">
          {user ? "Dashboard" : "Sign In"}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center min-h-[90vh] text-center overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-fc-emerald/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fc-teal/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl mx-auto flex flex-col items-center">
          <motion.div variants={fadeInOptions} className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fc-charcoal border border-fc-charcoal-light text-fc-emerald text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fc-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fc-emerald"></span>
            </span>
            Next Draw in 3 Days
          </motion.div>

          <motion.h1 variants={fadeInOptions} className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Play for your dreams. <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fc-emerald to-fc-teal">
              Give for theirs.
            </span>
          </motion.h1>

          <motion.p variants={fadeInOptions} className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
            The premium lottery platform where winning big meets giving back. 
            Select your numbers, enter the monthly draw, and redirect a percentage of every jackpot to a partnered charity.
          </motion.p>

          <motion.div variants={fadeInOptions} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button onClick={handleGetStarted} className="btn-primary flex items-center justify-center gap-2 text-lg">
              Start Playing Now <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => document.getElementById("how-it-works").scrollIntoView({ behavior: 'smooth' })} className="btn-secondary text-lg flex items-center justify-center">
              How it works
            </button>
          </motion.div>
        </motion.div>

        {/* Impact Stats */}
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="mt-24 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-8 flex flex-col items-center text-center">
            <span className="text-4xl font-bold text-fc-warm-white mb-2">$1.2M+</span>
            <span className="text-gray-400">Total Prize Pool</span>
          </div>
          <div className="premium-card p-8 flex flex-col items-center text-center ring-1 ring-fc-emerald/20">
            <span className="text-4xl font-bold text-fc-emerald mb-2">$450k</span>
            <span className="text-gray-400">Given to Charities</span>
          </div>
          <div className="premium-card p-8 flex flex-col items-center text-center">
            <span className="text-4xl font-bold text-fc-warm-white mb-2">12,500</span>
            <span className="text-gray-400">Active Members</span>
          </div>
        </motion.div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-fc-charcoal relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A transparent path to winning</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Designed to be fair, secure, and impactful.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "1. Secure Subscription", desc: "Subscribe securely with $10/month to gain access to all draws." },
              { icon: Trophy, title: "2. Pick Your Numbers", desc: "Choose your lucky 5 numbers (1-45) or let our system randomly select." },
              { icon: Heart, title: "3. Direct Your Impact", desc: "If you win, your pre-selected charity gets a guaranteed percentage of the pool." }
            ].map((step, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }} viewport={{ once: true }} className="premium-card p-8">
                <div className="w-12 h-12 rounded-xl bg-fc-charcoal-light flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-fc-emerald" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="py-24 px-6 md:px-12 border-t border-fc-charcoal-light">
        <div className="max-w-4xl mx-auto my-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="premium-card p-10 md:p-14 text-center border-fc-emerald/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-fc-emerald/10 to-transparent pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Join FairChance Today</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">One subscription. Endless possibilities. Real world impact.</p>
            
            <div className="flex flex-col items-center mb-10">
              <span className="text-5xl font-bold mb-2">$10<span className="text-xl text-gray-400 font-normal">/month</span></span>
              <ul className="text-left mt-6 space-y-3">
                {['Access to weekly verified draws', 'Unlimited number changes', 'Direct charity impact tracking', 'Priority 24/7 support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-fc-emerald" /> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button onClick={handleGetStarted} className="btn-primary w-full md:w-auto text-lg px-12 py-4">
              Create an Account
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-fc-charcoal-light text-center text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-fc-warm-white">
            <Heart className="w-4 h-4 text-fc-emerald fill-current" /> FairChance
          </div>
          <p>© 2026 FairChance Lottery Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-fc-warm-white transition-colors">Terms</a>
            <a href="#" className="hover:text-fc-warm-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;