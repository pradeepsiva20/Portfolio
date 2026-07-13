// ============================================================
// Pradeep S — Portfolio Backend
// A small Express API that receives contact form submissions,
// stores them, and (optionally) emails them to you via Gmail.
// ============================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
const MESSAGES_FILE = path.join(__dirname, "data", "messages.json");

app.use(cors());
app.use(express.json());

// Ensure the data file exists
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.mkdirSync(path.dirname(MESSAGES_FILE), { recursive: true });
  fs.writeFileSync(MESSAGES_FILE, "[]");
}

// Basic rate limiting per IP (in-memory, resets on restart)
const requestLog = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;
  const timestamps = (requestLog.get(ip) || []).filter(t => now - t < windowMs);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > maxRequests;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "pradeep-portfolio-api" });
});

app.post("/api/contact", async (req, res) => {
  const ip = req.ip;
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please try again in a minute." });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email and message are all required." });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  if (message.length > 3000) {
    return res.status(400).json({ error: "Message is too long." });
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    message: String(message).slice(0, 3000),
    receivedAt: new Date().toISOString(),
  };

  // Persist to local JSON file
  try {
    const existing = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    existing.push(entry);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(existing, null, 2));
  } catch (err) {
    console.error("Failed to save message:", err);
    return res.status(500).json({ error: "Failed to store your message. Please try again." });
  }

  // Reply to the browser immediately — don't make the user wait on Gmail.
  res.status(200).json({ success: true, message: "Message received." });

  // Optionally email it to you in the background, if SMTP credentials are configured in .env
  maybeSendEmail(entry);
});

// GET all messages — protect this with the ADMIN_KEY in your .env before deploying publicly
app.get("/api/messages", (req, res) => {
  const key = req.query.key;
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  const existing = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
  res.json(existing);
});

async function maybeSendEmail(entry) {
  const { RESEND_API_KEY, NOTIFY_EMAIL } = process.env;
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) return; // Email not configured — message is still saved to disk.

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Contact Form <onboarding@resend.dev>",
        to: [NOTIFY_EMAIL],
        reply_to: entry.email,
        subject: `New portfolio message from ${entry.name}`,
        text: `From: ${entry.name} <${entry.email}>\n\n${entry.message}`,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Email send failed (message was still saved):", res.status, body);
    }
  } catch (err) {
    console.error("Email send failed (message was still saved):", err.message);
  }
}
app.listen(PORT, () => {
  console.log(`Portfolio API running on http://localhost:${PORT}`);
});
