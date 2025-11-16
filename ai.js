async function sendToAI(prompt, model='') {
  try {
    const r = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt, model }) });
    return await r.json();
  } catch(e) { return { error: e.message }; }
}
