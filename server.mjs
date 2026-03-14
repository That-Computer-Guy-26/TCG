// ============================================================
// TCG FIREBASE BACKEND - AI Model Rotation + Firebase DB
// Express.js server with Ollama, LM Studio, Groq, Together.ai
// Runs locally OR on Cloud Run free tier
// ============================================================

import express from "express";
import fetch from "node-fetch";
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS & BODY PARSER ──
app.use(cors());
app.use(express.json());

// ── FIREBASE INIT ──
// Use Firebase credentials from env or service account file
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  databaseURL: process.env.FIREBASE_DB_URL || "https://babysitter-b322c-default-rtdb.firebaseio.com",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase Admin (for real-time writes)
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
  } else {
    console.warn("⚠ GOOGLE_APPLICATION_CREDENTIALS not set - read-only mode for non-authenticated writes");
  }
} catch (e) {
  console.warn("⚠ Firebase Admin init failed:", e.message);
}

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
          console.warn(`⚠ ${provider.name} API key not configured, skipping`);
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
        console.warn(`⚠ ${provider.name} error (${resp.status}): ${errData}`);
        continue;
      }

      const data = await resp.json();
      const reply = data.choices?.[0]?.message?.content || "No response";
      return { reply, model: provider.model, provider: provider.name };
    } catch (e) {
      console.warn(`⚠ ${provider.name} failed: ${e.message}`);
    }
  }

  throw new Error("All AI providers failed. Check OLLAMA_URL, LMSTUDIO_URL, GROQ_API_KEY, or TOGETHER_API_KEY");
}

// ── AI CHAT ENDPOINT ──
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { message, context = "customer", history = [], agent_id = "ORCH-001" } = req.body;

    const systemPrompt = context === "customer" ? customerPrompt() : adminPrompt(agent_id);
    const messages = history.slice(-20).map(h => ({ role: h.role || "user", content: h.content || "" }));
    messages.push({ role: "user", content: message });

    const { reply, model, provider } = await callAIProvider(systemPrompt, messages);

    // Log to Firebase
    if (db) {
      try {
        const timestamp = Date.now();
        await db.ref(`conversations/${timestamp}`).set({
          context, provider, model,
          user: message.substring(0, 200),
          ai: reply.substring(0, 500),
          agent_id,
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

// ── DATA STORE ENDPOINTS (Firebase Realtime DB) ──
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

async function firebaseDelete(path) {
  if (!db) throw new Error("Firebase not initialized");
  try {
    await db.ref(path).remove();
    return true;
  } catch (e) {
    console.warn(`⚠ Firebase delete failed: ${e.message}`);
    throw e;
  }
}

// GET all from collection
app.get("/api/data/:collection", async (req, res) => {
  try {
    const { collection } = req.params;
    const data = await firebaseGet(collection);
    res.json({ items: data ? Object.entries(data).map(([k, v]) => ({ ...v, _key: k })) : [], collection });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET single item
app.get("/api/data/:collection/:id", async (req, res) => {
  try {
    const { collection, id } = req.params;
    const data = await firebaseGet(`${collection}/${id}`);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST (create)
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

// PUT (update)
app.put("/api/data/:collection/:id", async (req, res) => {
  try {
    const { collection, id } = req.params;
    const existing = await firebaseGet(`${collection}/${id}`);
    const updated = { ...(existing || {}), ...req.body, id, updated: new Date().toISOString() };
    await firebaseSet(`${collection}/${id}`, updated);
    res.json({ success: true, item: updated });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE
app.delete("/api/data/:collection/:id", async (req, res) => {
  try {
    const { collection, id } = req.params;
    await firebaseDelete(`${collection}/${id}`);
    res.json({ success: true, deleted: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── CONTACT & BOOKING ──
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

    res.json({
      success: true,
      id,
      message: type === "booking" ? "Appointment booked! Gary will confirm within 1 hour." : "Message sent! Gary will respond within 2 hours."
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── TOOLS (WEATHER, TRAFFIC, CAMERAS) ──
app.get("/api/tools", async (req, res) => {
  try {
    const { action = "weather", lat = "38.9592", lon = "-85.8903" } = req.query;

    if (action === "weather") {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/Chicago`;
      const resp = await fetch(url);
      return res.json(await resp.json());
    }

    if (action === "cameras") {
      const cameras = [
        { id: "CAM-001", name: "I-65 @ SR 11 (Columbus)", lat: 39.2014, lon: -85.9214, url: "https://511in.org/map/Ede/images/CCTV-1065-091450-1--2.jpg", source: "INDOT" },
        { id: "CAM-002", name: "I-65 @ SR 58 (Seymour)", lat: 38.9592, lon: -85.8903, url: "https://511in.org/map/Ede/images/CCTV-1065-082350-1--2.jpg", source: "INDOT" },
        // ... additional cameras
      ];
      return res.json({ cameras, total: cameras.length, source: "INDOT 511in.org" });
    }

    res.status(400).json({ error: "Use: weather, cameras" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── HEALTH CHECK ──
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    providers: AI_PROVIDERS.map(p => ({ name: p.name, configured: p.apiKey ? true : p.url ? true : false }))
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          TCG FIREBASE BACKEND — ONLINE                         ║
╠════════════════════════════════════════════════════════════════╣
║  Server:  http://localhost:${PORT}                                 ║
║  API:     POST /api/ai-chat (rotation-enabled)                ║
║  Data:    /api/data/* (Firebase Realtime DB)                  ║
║  DB URL:  ${firebaseConfig.databaseURL}        ║
║  Providers: Ollama → LM Studio → Groq → Together.ai           ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// ── SYSTEM PROMPTS ──
function customerPrompt() {
  return `You are the AI assistant for That Computer Guy, an IT support and AI automation business in Seymour, Indiana owned by Gary Amick.

BUSINESS INFO:
- Owner: Gary Amick — 20+ years IT experience
- Phone: +1 (812) 373-6023
- Email: gary.amick0614@gmail.com
- Location: Seymour, Indiana
- Hours: Always Open
- Promo Code: TCG26FREE (first-time customers)

PRICING:
- Remote Basic: $35/hr | On-Site Standard: $55/hr | Business Pro: $75/hr | Emergency 24/7: $95/hr

FREE SERVICES FOR: Addiction Recovery Foundations, Emergency Services (Fire, EMS), Law Enforcement, Mental Health Organizations

200+ SERVICES: Computer Repair, Networking, Software, AI & Automation, Development, Security, Data Services, Mobile & Devices, Business Solutions, Cloud Services

Be helpful, friendly, professional. Answer questions about services. Help customers schedule appointments. Mention promo code TCG26FREE for first-time customers.`;
}

function adminPrompt(agentId) {
  const agents = {
    "ORCH-001": "Orchestrator Prime — coordinate all agents",
    "LOGIC-001": "Logic Engine Alpha — deductive reasoning",
    "SCHED-001": "Scheduler Prime — job scheduling",
    "CRM-001": "Customer Intake Agent — process customers",
    "TICK-001": "Triage Agent — classify tickets",
    "INV-001": "Invoice Generator — create invoices",
    "DATA-001": "Data Analyst — analyze metrics"
  };
  const role = agents[agentId] || agents["ORCH-001"];
  return `You are Agent ${agentId}: ${role}

You are part of the TCG Super Brain enterprise swarm. Administrator Mode is ACTIVE.

Owner: Gary Amick | Phone: +1 (812) 373-6023 | Seymour, IN | Business: That Computer Guy

Provide expert, actionable, production-ready responses. No placeholders. Real commands, real solutions.`;
}
