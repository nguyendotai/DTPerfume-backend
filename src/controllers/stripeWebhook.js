const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Order = require("../models/Orders");

exports.stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const order_id = session.metadata.order_id;

    await Order.update(
      { status: "paid" },
      { where: { id: order_id } }
    );
  }

  res.json({ received: true });
};

