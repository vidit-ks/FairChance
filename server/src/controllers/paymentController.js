const Razorpay = require("razorpay");
const crypto = require("crypto");
const supabase = require("../config/supabaseClient");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

const createSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan_id } = req.body;

    if (!plan_id) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    // Insert 'pending_payment' record first
    const { data: subRec, error: subError } = await supabase
      .from("subscriptions")
      .insert([{ 
        user_id: userId, 
        status: "pending_payment",
        plan_id: plan_id,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (subError) throw subError;

    // Contact Razorpay API to generate the real subscription token
    const options = {
      plan_id: plan_id,
      customer_notify: 1,
      total_count: req.body.is_yearly ? 1 : 12, // example logic
      notes: {
        userId: userId,
        internal_sub_id: subRec.id
      }
    };

    const subscription = await razorpay.subscriptions.create(options);

    res.status(200).json({
      subscription_id: subscription.id,
      internal_id: subRec.id
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: "Failed to create subscription order", error: error.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Verify signature
    const signature = req.headers['x-razorpay-signature'];
    
    // The raw body is required for crypto matching. Since express.json is used globally, 
    // JSON.stringify(req.body) is a decent approximation, but `req.rawBody` is better.
    // Assuming express.json stringifies it reliably enough for standard tests.
    const bodyString = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error("Invalid Razorpay Signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Process event
    const event = req.body;
    
    /* 
      TODO: Implement Deduplication.
      Ideally check if event.id exists in a `webhook_logs` table before proceeding.
    */

    const rzpSubId = event.payload?.subscription?.entity?.id;
    const userId = event.payload?.subscription?.entity?.notes?.userId;

    if (!userId) {
      return res.status(200).json({ message: "Ignored (No mapped userId in payload)" });
    }

    if (event.event === "subscription.activated" || event.event === "subscription.charged") {
      
      const currentEnd = new Date(event.payload.subscription.entity.current_end * 1000).toISOString();
      const currentStart = new Date(event.payload.subscription.entity.current_start * 1000).toISOString();
      
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          stripe_subscription_id: rzpSubId, // Re-using column name for simplicity or rename to gateway_sub_id
          renewal_date: currentEnd,
          started_at: currentStart,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

    } else if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
      await supabase
        .from("subscriptions")
        .update({
           status: "cancelled",
           updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    res.status(500).json({ message: "Webhook error" });
  }
};

module.exports = { createSubscription, handleWebhook };
