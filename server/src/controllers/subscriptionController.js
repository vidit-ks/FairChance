const supabase = require("../config/supabaseClient");

const createSubscription = async (req, res) => {
  try {
    const { userId, planType } = req.body;

    if (!userId || !planType) {
      return res.status(400).json({ message: "userId and planType are required" });
    }

    if (!["monthly", "yearly"].includes(planType)) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    const today = new Date();
    const renewal = new Date(today);

    if (planType === "monthly") {
      renewal.setMonth(renewal.getMonth() + 1);
    } else {
      renewal.setFullYear(renewal.getFullYear() + 1);
    }

    const renewalDate = renewal.toISOString().split("T")[0];

    const { data: existing, error: findError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (findError) {
      return res.status(500).json({ message: findError.message });
    }

    if (existing) {
      const { data, error } = await supabase
        .from("subscriptions")
        .update({
          plan_type: planType,
          status: "active",
          renewal_date: renewalDate,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.json({ message: "Subscription updated", subscription: data });
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: userId,
          plan_type: planType,
          status: "active",
          renewal_date: renewalDate,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.status(201).json({ message: "Subscription created", subscription: data });
  } catch (error) {
    res.status(500).json({ message: "Subscription failed", error: error.message });
  }
};

const getSubscription = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data || null);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscription", error: error.message });
  }
};

module.exports = { createSubscription, getSubscription };