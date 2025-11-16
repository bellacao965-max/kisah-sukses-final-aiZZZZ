// ===============================
// IMPORT MODULE
// ===============================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ===============================
// PATH FIX (ESM)
// ===============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// APP INIT
// ===============================
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ===============================
// RATE LIMIT
// ===============================
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// ===============================
// STATIC FILES
// ===============================
app.use(express.static(path.join(__dirname)));

console.log("Static path:", path.join(__dirname));

// ===============================
// AI KEYS
// ===============================
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GROQ_KEY = process.env.GROQ_API_KEY || "";

if (!OPENAI_KEY && !GROQ_KEY) {
  console.warn("⚠️ WARNING: No AI key set. AI will return placeholder response.");
}

// ===============================
// AI CORE FUNCTION
// ===============================
async function callAI(prompt, model) {
  // 1. Prefer OpenAI
  if (OPENAI_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });
    const j = await res.json();
    return j.choices?.[0]?.message?.content ?? "No reply";
  }

  // 2. Groq fallback
  if (GROQ_KEY) {
    const groq = new Groq({ apiKey: GROQ_KEY });

    const chat = await groq.chat.completions.create({
      model: model || "gemma2-9b-it",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    });

    return chat.choices?.[0]?.message?.content ?? "No reply";
  }

  return "AI key not configured.";
}

// ===============================
// ROUTES
// ===============================

// AI ENDPOINT
app.post("/api/ai", async (req, res) => {
  try {
    const { prompt, model } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const reply = await callAI(prompt, model);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: "AI Error", detail: e.message });
  }
});

// QUOTES
const QUOTES = [
  "Jangan menyerah — langkah kecil hari ini adalah kemenangan besar esok.",
  "Kesuksesan datang kepada mereka yang tak takut mencoba lagi.",
  "Dream big. Work hard. Stay humble.",
  "Belajar dari kemarin, hidup untuk hari ini, berharap untuk besok.",
  "Kerja keras + konsistensi = hasil."
];

app.get("/api/quote", (req, res) => {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  res.json({ quote: q });
});

// SOCIAL SHARE
app.post("/api/social", (req, res) => {
  const { platform, text, url } = req.body;

  if (!platform)
    return res.status(400).json({ error: "Missing platform" });

  const t = encodeURIComponent(text || "");
  const u = encodeURIComponent(url || "");

  let shareUrl = "";

  switch (platform.toLowerCase()) {
    case "facebook":
    case "fb":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`;
      break;
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
      break;
    case "ig":
    case "instagram":
      shareUrl = "https://www.instagram.com/";
      break;
    case "tiktok":
      shareUrl = `https://www.tiktok.com/search?q=${t}`;
      break;
    default:
      shareUrl = url || "";
  }

  res.json({ shareUrl });
});

// HEALTH CHECK
