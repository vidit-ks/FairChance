const supabase = require("../config/supabaseClient");

const requireActiveSubscription = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required to check subscription" });
  }

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("status, renewal_date")
      .eq("user_id", req.user.id)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: "Error verifying subscription status", error: error.message });
    }

    if (!subscription) {
      return res.status(403).json({ message: "Active subscription required for this feature" });
    }

    // Checking if it's strictly lapsed based on renewal_date vs now
    const now = new Date();
    const renewalDate = new Date(subscription.renewal_date);
    
    // If the date passed, the status should technically be updated to 'lapsed',
    // but we can preemptively block here if the cron hasn't run.
    if (renewalDate < now) {
      // Background task: update to lapsed
      await supabase
        .from("subscriptions")
        .update({ status: "lapsed" })
        .eq("user_id", req.user.id);

      return res.status(403).json({ message: "Your subscription has lapsed. Please renew to continue." });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error during subscription check", error: err.message });
  }
};

module.exports = requireActiveSubscription;
