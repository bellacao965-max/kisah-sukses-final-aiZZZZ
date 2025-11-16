import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// security + parsing
app.use(helmet());
app.use(cors());
app.use(express.json());

// rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// serve static files (frontend)
app.use(express.static(path.join(__dirname)));

if (!process.env.GROQ_API_KEY) console.warn('GROQ_API_KEY not set. Add it to .env or Render environment variables.');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Preserve existing routes if present by trying to keep original server logic below
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || "";
const MODEL = process.env.MODEL || "gpt-4o-mini";

if (!OPENAI_KEY) {
  console.warn("Warning: OPENAI_API_KEY (or GROQ_API_KEY) is not set. AI endpoint will return a placeholder response.");
}

async function callOpenAI(prompt, model){
  if (!OPENAI_KEY) {
    return "AI key not configured. Set OPENAI_API_KEY or GROQ_API_KEY to get real responses.";
  }
  // Prefer OpenAI if OPENAI_API_KEY present
  if (process.env.OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: model || MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${txt}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "No reply";
  } else {
    // Simple GROQ fallback using fetch to a hypothetical endpoint (user's Groq SDK may differ)
    // For now assume GROQ_API behaves like OpenAI-compatible. If not, user should replace with Groq SDK calls.
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: model || MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI error: ${res.status} ${txt}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "No reply";
  }
}

app.post("/api/ai", async (req, res) => {
  try {
    const { prompt, model } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });
    const reply = await callOpenAI(prompt, model);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "AI Error", detail: err.message });
  }
});

// Simple quotes endpoint
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

// Social/share helper (returns share URLs)
app.post("/api/social", (req, res) => {
  const { platform, text, url } = req.body;
  if (!platform) return res.status(400).json({ error: "Missing platform" });
  const encodedText = encodeURIComponent(text || "");
  const encodedUrl = encodeURIComponent(url || "");
  let shareUrl = "";
  switch ((platform+"").toLowerCase()) {
    case "facebook":
    case "fb":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      break;
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      break;
    case "instagram":
    case "ig":
      // Instagram web doesn't support direct posts; open Instagram home
      shareUrl = `https://www.instagram.com/`;
      break;
    case "tiktok":
      shareUrl = `https://www.tiktok.com/search?q=${encodedText}`;
      break;
    default:
      shareUrl = url || "";
  }
  res.json({ shareUrl });
});

app.use(express.static("./"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server RUNNING on port " + PORT));


// AUTO-PATCH ADDED: AI endpoints (GROQ/OpenAI)
import fetch from 'node-fetch';
const GROQ_KEY = process.env.GROQ_API_KEY || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = process.env.MODEL || 'gemma2-9b-it';
async function _callAI(prompt, model){
  if(OPENAI_KEY){
    const res = await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+OPENAI_KEY},body:JSON.stringify({model: model||MODEL, messages:[{role:'user',content:prompt}], max_tokens:500})});
    const j = await res.json(); return j.choices?.[0]?.message?.content || 'No reply';
  }
  if(GROQ_KEY){
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+GROQ_KEY},body:JSON.stringify({model: model||MODEL, messages:[{role:'user',content:prompt}], max_tokens:500})});
    const j = await res.json(); return j.choices?.[0]?.message?.content || 'No reply';
  }
  return 'AI key not configured.';
}

if(typeof app !== 'undefined'){
  if(!app._ai_added){
    app.post('/api/ai', async (req,res)=>{ try{ const { prompt, model } = req.body || {}; if(!prompt) return res.status(400).json({ error:'Missing prompt' }); const reply = await _callAI(prompt, model); res.json({ reply }); }catch(e){ res.status(500).json({ error:'AI Error', detail: e.message }); } });
    app._ai_added = true;
  }
}


// Ensure /healthz exists
app.get('/healthz', (req,res) => res.json({status: 'ok'}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));