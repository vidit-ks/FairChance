const stripe = require('../utils/stripe');
const supabase = require('../config/supabaseClient');

const STRIPE_PRICES = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "price_dummy_monthly",
  yearly: process.env.STRIPE_YEARLY_PRICE_ID || "price_dummy_yearly"
};

const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan_id } = req.body; 

    const priceId = STRIPE_PRICES[plan_id];
    if (!priceId) return res.status(400).json({ message: "Invalid plan selection" });

    // Ensure we don't have an active sub first
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (existing) {
      return res.status(400).json({ message: "You already have an active subscription." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`,
      client_reference_id: userId,
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_id: plan_id,
        }
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ message: "Failed to generate checkout session", error: error.message });
  }
};

const createPortalSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (!sub || !sub.stripe_customer_id) {
      return res.status(400).json({ message: "No active Stripe customer found to proxy." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Portal Error:", error);
    res.status(500).json({ message: "Failed to load billing portal", error: error.message });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Fetch subscription to get plan metadata
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
        const planId = stripeSub.metadata.plan_id || 'monthly';
        const renewalDate = new Date(stripeSub.current_period_end * 1000).toISOString();

        // Expire older subs for user
        await supabase.from("subscriptions").update({ status: 'cancelled' }).eq("user_id", userId);

        // Insert new sub
        await supabase.from("subscriptions").insert([{
          user_id: userId,
          plan_id: planId,
          status: 'active',
          renewal_date: renewalDate,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId
        }]);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.billing_reason === 'subscription_cycle') {
          const subscriptionId = invoice.subscription;
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          await supabase
            .from("subscriptions")
            .update({ 
              status: 'active', 
              renewal_date: new Date(stripeSub.current_period_end * 1000).toISOString() 
            })
            .eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        await supabase
          .from("subscriptions")
          .update({ status: 'lapsed' })
          .eq("stripe_subscription_id", subscriptionId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await supabase
          .from("subscriptions")
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        if (subscription.cancel_at_period_end) {
          await supabase
            .from("subscriptions")
            .update({ cancelled_at: new Date(subscription.cancel_at * 1000).toISOString() })
            .eq("stripe_subscription_id", subscription.id);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Webhook processor failed");
  }
};

module.exports = { createCheckoutSession, createPortalSession, handleWebhook };
