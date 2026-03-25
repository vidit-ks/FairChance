const getAllSubscriptions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      subscriptions: data || [],
    });
  } catch (error) {
    console.error("Get all subscriptions error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch subscriptions",
    });
  }
};

module.exports = {
  createSubscription,
  getSubscriptionById,
  getAllSubscriptions,
};
