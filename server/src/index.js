const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const charityRoutes = require("./routes/charityRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const drawRoutes = require("./routes/drawRoutes");
const winnerRoutes = require("./routes/winnerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Secure webhook parser explicitly for Razorpay
// Razorpay signs the payload via a secret string, but it uses the full raw body.
// We must parse it as JSON but keep the raw body available if needed.
// Express native JSON parsing works fine for Razorpay if you use the crypto module on `req.body` directly,
// but to be absolutely safe with signatures, it's best to verify using the stringified version or raw.
// However, unlike Stripe, Razorpay webhook validation simply signs the JSON payload string.
// We'll let `paymentRoutes` handle its own webhook specifically via a route-level body-parser if needed,
// but standard express.json() is actually fine for Razorpay signature validation (we will verify JSON.stringify(req.body)).
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Dynamic matching for any Vercel preview branch, Render domain, or local development ports
    if (
      origin.startsWith("http://localhost:") || 
      origin.endsWith(".vercel.app") || 
      origin.endsWith(".onrender.com")
    ) {
      return callback(null, true);
    }
    
    // Fallback exactly to explicit .env config if present
    if (origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }

    return callback(new Error("CORS Policy Blocked Origin: " + origin), false);
  },
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({ message: "FairChance backend is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});