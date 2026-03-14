// ============================================================
// STRIPE PAYMENT INTEGRATION
// Handles payments, subscriptions, and invoices
// Add to server-enhanced.mjs or create as separate module
// ============================================================

import stripe from 'stripe';

// Initialize Stripe
const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

// ── PAYMENT INTENT CREATION ──
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, customer_email, invoice_id, description } = req.body;

    if (!amount || !customer_email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      receipt_email: customer_email,
      description: description || `Invoice ${invoice_id}`,
      metadata: {
        invoice_id,
        customer_email
      }
    });

    // Log payment attempt
    await firebaseSet(`payments/${paymentIntent.id}`, {
      id: paymentIntent.id,
      amount,
      customer_email,
      invoice_id,
      status: 'pending',
      created: new Date().toISOString(),
      stripe_id: paymentIntent.id
    });

    res.json({
      success: true,
      client_secret: paymentIntent.client_secret,
      payment_id: paymentIntent.id
    });
  } catch (e) {
    console.error('Payment intent error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── CONFIRM PAYMENT ──
app.post('/api/payments/:id/confirm', async (req, res) => {
  try {
    const { payment_method_id } = req.body;
    const paymentIntent = await stripeClient.paymentIntents.confirm(
      req.params.id,
      { payment_method: payment_method_id }
    );

    const status = paymentIntent.status;

    // Update payment status
    await firebaseUpdate(`payments/${req.params.id}`, {
      status,
      confirmed_at: new Date().toISOString(),
      payment_method_id
    });

    // If successful, mark invoice as paid
    if (status === 'succeeded') {
      const payment = await firebaseGet(`payments/${req.params.id}`);
      if (payment?.invoice_id) {
        await firebaseUpdate(`invoices/${payment.invoice_id}`, {
          status: 'paid',
          paid_at: new Date().toISOString()
        });

        // Dispatch webhook
        await dispatchWebhook('payment.succeeded', {
          payment_id: req.params.id,
          invoice_id: payment.invoice_id,
          amount: payment.amount
        });

        // Send confirmation email
        if (payment.customer_email) {
          await sendEmail(
            payment.customer_email,
            'Payment Received',
            `Payment of $${payment.amount.toFixed(2)} received. Thank you!`
          );
        }
      }
    }

    res.json({ success: status === 'succeeded', status });
  } catch (e) {
    console.error('Payment confirmation error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── GET PAYMENT STATUS ──
app.get('/api/payments/:id', async (req, res) => {
  try {
    const payment = await firebaseGet(`payments/${req.params.id}`);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Get latest status from Stripe
    const paymentIntent = await stripeClient.paymentIntents.retrieve(req.params.id);

    res.json({
      id: payment.id,
      amount: payment.amount,
      status: paymentIntent.status,
      invoice_id: payment.invoice_id,
      created: payment.created,
      confirmed: payment.confirmed_at ? true : false
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── STRIPE WEBHOOK ──
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (e) {
      console.error('Webhook signature verification failed:', e.message);
      return res.status(400).send(`Webhook Error: ${e.message}`);
    }

    // Handle events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;
        await firebaseUpdate(`payments/${paymentIntentSucceeded.id}`, {
          status: 'succeeded',
          webhook_received: new Date().toISOString()
        });
        console.log('Payment succeeded:', paymentIntentSucceeded.id);
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object;
        await firebaseUpdate(`payments/${paymentIntentFailed.id}`, {
          status: 'failed',
          error: paymentIntentFailed.last_payment_error?.message,
          webhook_received: new Date().toISOString()
        });
        console.log('Payment failed:', paymentIntentFailed.id);
        break;

      case 'charge.refunded':
        const chargeRefunded = event.data.object;
        const payment = await firebaseGet(`payments`);
        const paymentRecord = Object.values(payment || {}).find(p => p.stripe_id === chargeRefunded.payment_intent);
        if (paymentRecord) {
          await firebaseUpdate(`payments/${paymentRecord.id}`, {
            status: 'refunded',
            refund_amount: chargeRefunded.amount_refunded / 100
          });
        }
        console.log('Charge refunded:', chargeRefunded.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── CREATE CUSTOMER ──
app.post('/api/stripe/customers', async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    const customer = await stripeClient.customers.create({
      email,
      name,
      phone
    });

    // Store in Firebase
    await firebaseSet(`stripe_customers/${customer.id}`, {
      stripe_id: customer.id,
      email,
      name,
      phone,
      created: new Date().toISOString()
    });

    res.json({ success: true, customer_id: customer.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── CREATE SUBSCRIPTION ──
app.post('/api/stripe/subscriptions', async (req, res) => {
  try {
    const { customer_id, price_id, billing_cycle_anchor } = req.body;

    const subscription = await stripeClient.subscriptions.create({
      customer: customer_id,
      items: [{ price: price_id }],
      billing_cycle_anchor,
      metadata: {
        business: 'That Computer Guy'
      }
    });

    // Store in Firebase
    await firebaseSet(`subscriptions/${subscription.id}`, {
      stripe_id: subscription.id,
      customer_id,
      price_id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    });

    res.json({ success: true, subscription_id: subscription.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── CREATE INVOICE ──
app.post('/api/stripe/invoices', async (req, res) => {
  try {
    const { customer_id, amount, description, due_date } = req.body;

    const invoice = await stripeClient.invoices.create({
      customer: customer_id,
      description,
      custom_fields: [
        {
          name: 'Business',
          value: 'That Computer Guy'
        }
      ]
    });

    // Add line item
    await stripeClient.invoiceItems.create({
      customer: customer_id,
      amount: Math.round(amount * 100),
      currency: 'usd',
      description,
      invoice: invoice.id
    });

    // Finalize invoice
    const finalInvoice = await stripeClient.invoices.finalizeInvoice(invoice.id);

    res.json({
      success: true,
      invoice_id: finalInvoice.id,
      pdf_url: finalInvoice.pdf
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── LIST TRANSACTIONS ──
app.get('/api/stripe/transactions', async (req, res) => {
  try {
    const charges = await stripeClient.charges.list({ limit: 50 });

    const transactions = charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      status: charge.status,
      customer: charge.customer,
      description: charge.description,
      created: new Date(charge.created * 1000).toISOString()
    }));

    res.json({ transactions, total: transactions.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── REFUND PAYMENT ──
app.post('/api/stripe/refunds/:charge_id', async (req, res) => {
  try {
    const { reason, amount } = req.body;

    const refund = await stripeClient.refunds.create({
      charge: req.params.charge_id,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
      metadata: {
        business: 'That Computer Guy'
      }
    });

    res.json({
      success: true,
      refund_id: refund.id,
      amount: refund.amount / 100
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Export for use
export { stripeClient };
