const supabase = require("../config/supabaseClient");

const createSubscription = async (req, res) => {
  try {
    const userId = req.body.user_id && req.user.role === 'admin' ? req.body.user_id : req.user.id;
    const { plan_id = "monthly" } = req.body; 

    const { data: existing, error: checkError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
      return res.status(400).json({ message: "User already has an active subscription." });
    }

    const renewalDate = new Date();
    if (plan_id === "yearly") {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const { data: sub, error: insertError } = await supabase
      .from("subscriptions")
      .insert([{
        user_id: userId,
        status: "active",
        plan_type: plan_id,
        renewal_date: renewalDate,
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: "Subscription created successfully", subscription: sub });
  } catch (error) {
    res.status(500).json({ message: "Failed to create subscription", error: error.message });
  }
};

const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    res.status(200).json({ subscription: subscription || null });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscription", error: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership or admin
    const { data: sub } = await supabase.from("subscriptions").select("user_id").eq("id", id).single();
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    if (req.user.id !== sub.user_id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { data: updatedSub, error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: "Subscription cancelled successfully", subscription: updatedSub });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel subscription", error: error.message });
  }
};

const modifySubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_id = "monthly" } = req.body;

    const { data: sub } = await supabase.from("subscriptions").select("*").eq("id", id).single();
    if (!sub) return res.status(404).json({ message: "Subscription not found" });
    if (req.user.id !== sub.user_id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const oldDate = new Date(sub.renewal_date);
    const newDate = new Date();
    if (plan_id === "yearly") {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }

    const { data: updatedSub, error } = await supabase
      .from("subscriptions")
      .update({ renewal_date: newDate })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: "Subscription modified successfully", subscription: updatedSub });
  } catch (error) {
    res.status(500).json({ message: "Failed to modify subscription", error: error.message });
  }
};

const getAllSubscriptions = async (req, res) => {
  try {
    const { data: subs, error: subsError } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (subsError) throw subsError;

    // Fetch users manually to avoid foreign key/embedding errors in Supabase
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email");

    if (usersError) throw usersError;

    const userMap = {};
    users?.forEach(u => { userMap[u.id] = u; });

    const subscriptionsWithUsers = subs?.map(sub => ({
      ...sub,
      users: userMap[sub.user_id] || { name: 'Unknown User' }
    })) || [];

    return res.status(200).json({
      success: true,
      subscriptions: subscriptionsWithUsers,
    });
  } catch (error) {
    console.error("Get all subscriptions error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subscriptions",
    });
  }
};

const requestOfflineSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { note, plan_id = 'monthly' } = req.body;

    if (!note) {
      return res.status(400).json({ message: "A note detailing offline payment context is technically required." });
    }

    const { data: existing, error: checkError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["active", "pending_approval", "pending_payment"])
      .limit(1)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: "You already have a subscription or pending request." });
    }

    const { data: sub, error } = await supabase
      .from("subscriptions")
      .insert([{
        user_id: userId,
        status: "pending_approval",
        plan_type: plan_id,
        notes: note,
        renewal_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
       console.error("Insert subscription request schema error:", error);
       throw error;
    }
    res.status(201).json({ message: "Offline access request sent successfully.", subscription: sub });
  } catch (error) {
    res.status(500).json({ message: "Failed to request offline subscription", error: error.message });
  }
};

const decideOfflineSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'approve' or 'deny'

    const { data: sub } = await supabase.from("subscriptions").select("*").eq("id", id).single();
    if (!sub || sub.status !== 'pending_approval') {
      return res.status(400).json({ message: "Valid pending subscription not found" });
    }

    let updates = {};
    if (decision === 'approve') {
      const isYearly = sub.plan_type === 'yearly';
      const renewalDate = new Date();
      if (isYearly) renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      else renewalDate.setMonth(renewalDate.getMonth() + 1);

      updates = { status: 'active', renewal_date: renewalDate, started_at: new Date() };
    } else if (decision === 'deny') {
      updates = { status: 'denied' };
    } else {
      return res.status(400).json({ message: "Invalid admin decision state." });
    }

    const { data: updatedSub, error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: `Subscription request ${decision}d.`, subscription: updatedSub });
  } catch (error) {
    res.status(500).json({ message: "Decision engine failure", error: error.message });
  }
};

module.exports = {
  createSubscription,
  getUserSubscription,
  cancelSubscription,
  modifySubscription,
  getAllSubscriptions,
  requestOfflineSubscription,
  decideOfflineSubscription
};
