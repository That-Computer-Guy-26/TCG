// ============================================================
// TCG ENHANCED BACKEND v2.0 - FULL ENTERPRISE SYSTEM
// Express.js with Invoicing, Scheduling, Email, SMS, Webhooks, Reports
// ============================================================

import express from "express";
import fetch from "node-fetch";
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import twilio from "twilio";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS & BODY PARSER ──
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── FIREBASE INIT ──
const firebaseConfig = {
  databaseURL: process.env.FIREBASE_DB_URL || "https://babysitter-b322c-default-rtdb.firebaseio.com",
};

let db = null;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const app_admin = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: firebaseConfig.databaseURL
    });
    db = getDatabase(app_admin);
    console.log("✓ Firebase Admin initialized");
  }
} catch (e) {
  console.warn("⚠ Firebase Admin init failed:", e.message);
}

// ── EMAIL CONFIG (Nodemailer) ──
let emailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// ── SMS CONFIG (Twilio) ──
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// ── HELPER FUNCTIONS ──
async function firebaseGet(path) {
  if (!db) return null;
  try {
    const snapshot = await db.ref(path).get();
    return snapshot.val();
  } catch (e) {
    console.warn(`⚠ Firebase get failed: ${e.message}`);
    return null;
  }
}

async function firebaseSet(path, data) {
  if (!db) throw new Error("Firebase not initialized");
  try {
    await db.ref(path).set(data);
    return true;
  } catch (e) {
    console.warn(`⚠ Firebase set failed: ${e.message}`);
    throw e;
  }
}

async function firebaseUpdate(path, data) {
  if (!db) throw new Error("Firebase not initialized");
  try {
    await db.ref(path).update(data);
    return true;
  } catch (e) {
    console.warn(`⚠ Firebase update failed: ${e.message}`);
    throw e;
  }
}

// ── SEND EMAIL ──
async function sendEmail(to, subject, html) {
  if (!emailTransporter) {
    console.warn("⚠ Email not configured (set EMAIL_USER, EMAIL_PASS)");
    return false;
  }
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log(`✓ Email sent to ${to}`);
    return true;
  } catch (e) {
    console.error(`❌ Email failed: ${e.message}`);
    return false;
  }
}

// ── SEND SMS ──
async function sendSMS(phone, message) {
  if (!twilioClient) {
    console.warn("⚠ SMS not configured (set TWILIO credentials)");
    return false;
  }
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log(`✓ SMS sent to ${phone}`);
    return true;
  } catch (e) {
    console.error(`❌ SMS failed: ${e.message}`);
    return false;
  }
}

// ── WEBHOOK DISPATCH ──
async function dispatchWebhook(event, data) {
  const webhooks = await firebaseGet('webhooks') || {};
  for (const [id, webhook] of Object.entries(webhooks)) {
    if (webhook.events && webhook.events.includes(event) && webhook.url) {
      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': webhook.secret || '' },
          body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
        });
      } catch (e) {
        console.warn(`⚠ Webhook ${id} failed: ${e.message}`);
      }
    }
  }
}

// ── INVOICING ENDPOINTS ──

// Create Invoice
app.post("/api/invoices", async (req, res) => {
  try {
    const { customer_id, items, tax_rate = 0.1, notes } = req.body;
    
    if (!customer_id || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * tax_rate;
    const total = subtotal + tax;

    const invoice = {
      id: `INV-${Date.now().toString(36)}`,
      customer_id,
      items,
      subtotal,
      tax,
      tax_rate,
      total,
      status: "draft",
      notes,
      created: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    await firebaseSet(`invoices/${invoice.id}`, invoice);
    
    await dispatchWebhook('invoice.created', invoice);
    
    res.json({ success: true, invoice });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Send Invoice (via email)
app.post("/api/invoices/:id/send", async (req, res) => {
  try {
    const invoice = await firebaseGet(`invoices/${req.params.id}`);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const customer = await firebaseGet(`customers/${invoice.customer_id}`);
    if (!customer || !customer.email) return res.status(400).json({ error: "Customer email not found" });

    const html = `
      <h2>Invoice ${invoice.id}</h2>
      <p>Total: $${invoice.total.toFixed(2)}</p>
      <p>Due: ${invoice.due_date}</p>
      <table>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${invoice.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.quantity * item.price).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      <p>Subtotal: $${invoice.subtotal.toFixed(2)}</p>
      <p>Tax (${(invoice.tax_rate * 100).toFixed(1)}%): $${invoice.tax.toFixed(2)}</p>
      <h3>Total: $${invoice.total.toFixed(2)}</h3>
    `;

    const sent = await sendEmail(customer.email, `Invoice ${invoice.id}`, html);
    
    if (sent) {
      await firebaseUpdate(`invoices/${invoice.id}`, { status: "sent", sent_at: new Date().toISOString() });
      await dispatchWebhook('invoice.sent', invoice);
    }

    res.json({ success: sent, email: customer.email });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Invoice
app.get("/api/invoices/:id", async (req, res) => {
  try {
    const invoice = await firebaseGet(`invoices/${req.params.id}`);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List Invoices
app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await firebaseGet('invoices') || {};
    const list = Object.values(invoices).sort((a, b) => new Date(b.created) - new Date(a.created));
    res.json({ invoices: list, total: list.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── SCHEDULING ENDPOINTS ──

// Create Appointment
app.post("/api/appointments", async (req, res) => {
  try {
    const { customer_id, service, date, time, technician_id, duration = 60, notes } = req.body;
    
    if (!customer_id || !service || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const appointment = {
      id: `APT-${Date.now().toString(36)}`,
      customer_id,
      service,
      date,
      time,
      technician_id,
      duration,
      notes,
      status: "scheduled",
      created: new Date().toISOString()
    };

    await firebaseSet(`appointments/${appointment.id}`, appointment);
    
    const customer = await firebaseGet(`customers/${customer_id}`);
    if (customer?.phone) {
      await sendSMS(customer.phone, `Your appointment for ${service} is scheduled on ${date} at ${time}`);
    }
    if (customer?.email) {
      await sendEmail(customer.email, `Appointment Confirmation`, `Your appointment is confirmed for ${date} at ${time}`);
    }

    await dispatchWebhook('appointment.created', appointment);
    
    res.json({ success: true, appointment });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Calendar for Date Range
app.get("/api/calendar", async (req, res) => {
  try {
    const { start_date, end_date, technician_id } = req.query;
    
    const appointments = await firebaseGet('appointments') || {};
    const filtered = Object.values(appointments).filter(apt => {
      if (start_date && apt.date < start_date) return false;
      if (end_date && apt.date > end_date) return false;
      if (technician_id && apt.technician_id !== technician_id) return false;
      return true;
    });

    res.json({ appointments: filtered, total: filtered.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── NOTIFICATION ENDPOINTS ──

// Send Booking Confirmation
app.post("/api/notifications/booking-confirmation", async (req, res) => {
  try {
    const { booking_id } = req.body;
    const booking = await firebaseGet(`bookings/${booking_id}`);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const emailSent = await sendEmail(
      booking.email,
      `Booking Confirmation - ${booking.service}`,
      `Your booking for ${booking.service} on ${booking.date} at ${booking.time} is confirmed!`
    );

    const smsSent = await sendSMS(
      booking.phone,
      `TCG Booking confirmed: ${booking.service} on ${booking.date} at ${booking.time}. Call (812) 373-6023 for changes.`
    );

    await dispatchWebhook('booking.confirmed', booking);

    res.json({ success: emailSent || smsSent, email: emailSent, sms: smsSent });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Send Invoice Reminder
app.post("/api/notifications/invoice-reminder", async (req, res) => {
  try {
    const { invoice_id } = req.body;
    const invoice = await firebaseGet(`invoices/${invoice_id}`);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const customer = await firebaseGet(`customers/${invoice.customer_id}`);
    if (!customer) return res.status(400).json({ error: "Customer not found" });

    const sent = await sendEmail(
      customer.email,
      `Invoice ${invoice.id} Payment Reminder`,
      `This is a reminder that invoice ${invoice.id} for $${invoice.total.toFixed(2)} is due on ${invoice.due_date}`
    );

    res.json({ success: sent });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── WEBHOOK MANAGEMENT ──

// Create Webhook
app.post("/api/webhooks", async (req, res) => {
  try {
    const { url, events, secret } = req.body;
    const webhook = {
      id: `HOOK-${crypto.randomBytes(8).toString('hex')}`,
      url,
      events,
      secret: secret || crypto.randomBytes(32).toString('hex'),
      created: new Date().toISOString(),
      last_triggered: null
    };

    await firebaseSet(`webhooks/${webhook.id}`, webhook);
    res.json({ success: true, webhook });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── REPORTING ENDPOINTS ──

// Generate Sales Report
app.get("/api/reports/sales", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    const invoices = await firebaseGet('invoices') || {};
    const filtered = Object.values(invoices).filter(inv => {
      if (start_date && inv.created < start_date) return false;
      if (end_date && inv.created > end_date) return false;
      return inv.status === 'paid';
    });

    const total_revenue = filtered.reduce((sum, inv) => sum + inv.total, 0);
    const total_invoices = filtered.length;
    const avg_invoice = total_invoices > 0 ? total_revenue / total_invoices : 0;

    res.json({
      period: { start_date, end_date },
      total_revenue: total_revenue.toFixed(2),
      total_invoices,
      average_invoice: avg_invoice.toFixed(2),
      invoices: filtered
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generate Customer Report
app.get("/api/reports/customers", async (req, res) => {
  try {
    const customers = await firebaseGet('customers') || {};
    const bookings = await firebaseGet('bookings') || {};
    
    const invoices = await firebaseGet('invoices') || {};
    const report = Object.values(customers).map(customer => {
      const customer_bookings = Object.values(bookings).filter(b => b.email === customer.email);
      const customer_invoice_list = Object.values(invoices).filter(i => i.customer_id === customer.id);
      
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        total_bookings: customer_bookings.length,
        total_spent: customer_invoice_list.reduce((sum, i) => sum + i.total, 0).toFixed(2),
        created: customer.created
      };
    });

    res.json({ customers: report, total: report.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Generate Performance Report
app.get("/api/reports/performance", async (req, res) => {
  try {
    const appointments = await firebaseGet('appointments') || {};
    const bookings = await firebaseGet('bookings') || {};
    const invoices = await firebaseGet('invoices') || {};
    const customers = await firebaseGet('customers') || {};

    const completed = Object.values(appointments).filter(a => a.status === 'completed').length;
    const total_revenue = Object.values(invoices).reduce((sum, i) => sum + i.total, 0);
    const avg_customer_value = Object.keys(customers).length > 0 
      ? total_revenue / Object.keys(customers).length 
      : 0;

    res.json({
      total_customers: Object.keys(customers).length,
      total_appointments: Object.keys(appointments).length,
      completed_appointments: completed,
      total_revenue: total_revenue.toFixed(2),
      average_customer_value: avg_customer_value.toFixed(2),
      appointment_completion_rate: `${(completed / Object.keys(appointments).length * 100).toFixed(1)}%`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── TIME TRACKING ENDPOINTS ──

// Start Work Session
app.post("/api/timekeeping/start", async (req, res) => {
  try {
    const { technician_id, appointment_id, notes } = req.body;
    
    const session = {
      id: `TS-${Date.now().toString(36)}`,
      technician_id,
      appointment_id,
      start_time: new Date().toISOString(),
      end_time: null,
      duration_minutes: null,
      notes,
      status: "active"
    };

    await firebaseSet(`timekeeping/${session.id}`, session);
    res.json({ success: true, session });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// End Work Session
app.post("/api/timekeeping/:id/end", async (req, res) => {
  try {
    const session = await firebaseGet(`timekeeping/${req.params.id}`);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const end_time = new Date();
    const start_time = new Date(session.start_time);
    const duration_minutes = Math.round((end_time - start_time) / 60000);

    await firebaseUpdate(`timekeeping/${req.params.id}`, {
      end_time: end_time.toISOString(),
      duration_minutes,
      status: "completed"
    });

    res.json({ success: true, duration_minutes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Technician Hours
app.get("/api/timekeeping/technician/:id", async (req, res) => {
  try {
    const sessions = await firebaseGet('timekeeping') || {};
    const technician_sessions = Object.values(sessions)
      .filter(s => s.technician_id === req.params.id && s.status === 'completed');
    
    const total_hours = technician_sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;

    res.json({ 
      technician_id: req.params.id,
      sessions: technician_sessions,
      total_hours: total_hours.toFixed(2),
      total_sessions: technician_sessions.length
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── INVENTORY ENDPOINTS ──

// Add Inventory Item
app.post("/api/inventory", async (req, res) => {
  try {
    const { sku, name, quantity, unit_cost, supplier, reorder_level } = req.body;
    
    const item = {
      id: `INV-${sku || Date.now().toString(36)}`,
      sku,
      name,
      quantity: parseInt(quantity),
      unit_cost: parseFloat(unit_cost),
      supplier,
      reorder_level: parseInt(reorder_level),
      last_updated: new Date().toISOString()
    };

    await firebaseSet(`inventory/${item.id}`, item);
    res.json({ success: true, item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update Inventory Count
app.put("/api/inventory/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    await firebaseUpdate(`inventory/${req.params.id}`, {
      quantity: parseInt(quantity),
      last_updated: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Low Stock Items
app.get("/api/inventory/low-stock", async (req, res) => {
  try {
    const items = await firebaseGet('inventory') || {};
    const lowStock = Object.values(items).filter(i => i.quantity <= i.reorder_level);
    res.json({ low_stock_items: lowStock, total: lowStock.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ORIGINAL ENDPOINTS (Keep existing) ──

// AI Chat (original)
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { message, context = "customer", history = [], agent_id = "ORCH-001" } = req.body;
    const systemPrompt = context === "customer" ? customerPrompt() : adminPrompt(agent_id);
    const messages = history.slice(-20).map(h => ({ role: h.role || "user", content: h.content || "" }));
    messages.push({ role: "user", content: message });

    const { reply, model, provider } = await callAIProvider(systemPrompt, messages);

    if (db) {
      try {
        const timestamp = Date.now();
        await db.ref(`conversations/${timestamp}`).set({
          context, provider, model, user: message.substring(0, 200),
          ai: reply.substring(0, 500), agent_id,
          created: new Date().toISOString()
        });
      } catch (e) {
        console.warn("⚠ Firebase logging failed:", e.message);
      }
    }

    res.json({ reply, model, provider, agent_id });
  } catch (e) {
    console.error("❌ AI chat error:", e);
    res.status(503).json({ error: e.message });
  }
});

// Data Store (original)
app.get("/api/data/:collection", async (req, res) => {
  try {
    const { collection } = req.params;
    const data = await firebaseGet(collection);
    res.json({ items: data ? Object.entries(data).map(([k, v]) => ({ ...v, _key: k })) : [], collection });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/data/:collection", async (req, res) => {
  try {
    const { collection } = req.params;
    const body = req.body;
    const id = body.id || `${collection.substring(0, 3).toUpperCase()}-${Date.now().toString(36)}`;
    const item = { ...body, id, created: new Date().toISOString(), updated: new Date().toISOString() };
    await firebaseSet(`${collection}/${id}`, item);
    res.json({ success: true, id, item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Contact & Booking (original)
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, service, message, type = "contact", date, time, device_type, urgency = "normal", address, service_type = "remote", nonprofit = false, promo_code } = req.body;
    const id = `${type === "booking" ? "BK" : "LD"}-${Date.now().toString(36)}`;
    const entry = {
      id, type, name, email, phone, service, message, nonprofit, promo_code,
      date, time, device_type, urgency, address, service_type,
      status: "new", source: "website", created: new Date().toISOString()
    };
    const collection = type === "booking" ? "bookings" : "leads";
    await firebaseSet(`${collection}/${id}`, entry);
    
    // Send confirmation
    if (email) {
      await sendEmail(email, `Booking Confirmation`, `Thank you! We received your request.`);
    }
    if (phone) {
      await sendSMS(phone, `TCG: We received your request. We'll contact you soon!`);
    }

    await dispatchWebhook('booking.created', entry);

    res.json({
      success: true, id,
      message: type === "booking" ? "Appointment booked! Gary will confirm within 1 hour." : "Message sent! Gary will respond within 2 hours."
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    features: {
      invoicing: true,
      scheduling: true,
      email: !!emailTransporter,
      sms: !!twilioClient,
      webhooks: true,
      reporting: true,
      timekeeping: true,
      inventory: true
    }
  });
});

// ── AI PROVIDER ROTATION ──
const AI_PROVIDERS = [
  { name: "ollama", url: process.env.OLLAMA_URL || "http://localhost:11434", model: "llama3.1:70b", type: "openai" },
  { name: "lmstudio", url: process.env.LMSTUDIO_URL || "http://localhost:1234", model: process.env.LMSTUDIO_MODEL || "qwen2.5-7b-instruct", type: "openai" },
  { name: "groq", url: "https://api.groq.com/openai/v1", model: "mixtral-8x7b-32768", apiKey: process.env.GROQ_API_KEY, type: "openai" },
  { name: "together", url: "https://api.together.xyz/v1", model: "meta-llama/Llama-3-70b-chat-hf", apiKey: process.env.TOGETHER_API_KEY, type: "openai" }
];

let providerIndex = 0;

async function callAIProvider(systemPrompt, messages) {
  const maxAttempts = AI_PROVIDERS.length;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const provider = AI_PROVIDERS[providerIndex % AI_PROVIDERS.length];
    providerIndex++;

    try {
      console.log(`🤖 Trying provider: ${provider.name}`);

      if (provider.name === "groq" || provider.name === "together") {
        if (!provider.apiKey) {
          console.warn(`⚠ ${provider.name} API key not configured`);
          continue;
        }
      }

      const resp = await fetch(`${provider.url}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(provider.apiKey && { "Authorization": `Bearer ${provider.apiKey}` })
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.7,
          max_tokens: 2048,
          stream: false
        }),
        timeout: 30000
      });

      if (!resp.ok) {
        const errData = await resp.text();
        console.warn(`⚠ ${provider.name} error (${resp.status})`);
        continue;
      }

      const data = await resp.json();
      const reply = data.choices?.[0]?.message?.content || "No response";
      return { reply, model: provider.model, provider: provider.name };
    } catch (e) {
      console.warn(`⚠ ${provider.name} failed: ${e.message}`);
    }
  }

  throw new Error("All AI providers failed");
}

function customerPrompt() {
  return `You are the AI assistant for That Computer Guy, an IT support and AI automation business.
Owner: Gary Amick | Phone: (812) 373-6023 | Location: Seymour, Indiana
SERVICES: Computer Repair, Networking, Software, AI & Automation, Development, Security, Data Services, Mobile & Devices, Business Solutions, Cloud Services
PRICING: Remote Basic $35/hr | On-Site Standard $55/hr | Business Pro $75/hr | Emergency 24/7 $95/hr
PROMO: TCG26FREE (first-time customers)
FREE SERVICES: Addiction Recovery, Active Recovery, Emergency Services, Law Enforcement, Mental Health, Suicide Prevention
Be helpful, friendly, professional. Direct to phone for complex needs.`;
}

function adminPrompt(agentId) {
  const agents = {
    "ORCH-001": "Orchestrator Prime",
    "LOGIC-001": "Logic Engine Alpha",
    "SCHED-001": "Scheduler Prime",
    "CRM-001": "Customer Intake Agent",
    "TICK-001": "Triage Agent",
    "INV-001": "Invoice Generator",
    "MKTG-001": "Marketing Agent",
    "SEC-001": "Security Monitor",
    "DATA-001": "Data Analyst",
    "TECH-001": "Tech Support Lead"
  };
  const role = agents[agentId] || agents["ORCH-001"];
  return `You are Agent ${agentId}: ${role}. You are part of TCG Super Brain - 100 agent swarm.
Owner: Gary Amick | Business: That Computer Guy | Location: Seymour, IN
Provide expert, actionable, production-ready responses. No placeholders.`;
}

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║       TCG ENHANCED BACKEND v2.0 — ENTERPRISE SYSTEM           ║
╠════════════════════════════════════════════════════════════════╣
║  Server:    http://localhost:${PORT}                                 ║
║  Invoicing:     /api/invoices/*                               ║
║  Scheduling:    /api/appointments/*                           ║
║  Notifications: /api/notifications/*                          ║
║  Webhooks:      /api/webhooks/*                               ║
║  Reports:       /api/reports/*                                ║
║  Timekeeping:   /api/timekeeping/*                            ║
║  Inventory:     /api/inventory/*                              ║
║  Features:      Email (${emailTransporter ? '✓' : '✗'}), SMS (${twilioClient ? '✓' : '✗'}), Firebase (✓) ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
