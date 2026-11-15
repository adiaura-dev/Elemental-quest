// api/speak.js — turns Verity's text into a natural voice using Fish Audio's FREE model.
// Keys live in Vercel Environment Variables: FISH_API_KEY (required) and FISH_VOICE_ID (optional).

module.exports = async (req, res) => {
  if (req.headers.origin === "null") {
    res.setHeader("Access-Control-Allow-Origin", "null");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Please use POST." });

  const apiKey = process.env.FISH_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "FISH_API_KEY is not set in Vercel environment variables." });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 1500) : "";
  if (!text) return res.status(400).json({ error: "No text to speak." });

  const request = { text, format: "mp3", normalize: true, latency: "balanced" };
  if (process.env.FISH_VOICE_ID) request.reference_id = process.env.FISH_VOICE_ID;

  try {
    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "model": process.env.FISH_MODEL || "s2.1-pro-free"
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Fish Audio error:", response.status, detail.slice(0, 300));
      return res.status(response.status).json({ error: "Voice service error " + response.status });
    }

    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(audio);
  } catch (error) {
    console.error("Speak function error:", error);
    return res.status(500).json({ error: "Voice server had a problem." });
  }
};
