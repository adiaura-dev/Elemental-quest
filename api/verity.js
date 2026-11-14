// api/verity.js — Verity's AI brain on Vercel.
// The OpenAI key comes from Vercel's Environment Variables, never from your code.

module.exports = async (req, res) => {
  // Allow the chat to work when index.html is opened from your computer
  if (req.headers.origin === "null") {
    res.setHeader("Access-Control-Allow-Origin", "null");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Please use POST." });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not set in Vercel environment variables." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  if (!message) return res.status(400).json({ error: "Message is empty." });

  // Remember the recent conversation
  const history = Array.isArray(body.history)
    ? body.history
        .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-12)
        .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
    : [];

  let instructions =
    "You are Verity, the friendly, upbeat chemistry guide on the Element Quest website. " +
    "You are an expert on chemistry and all 118 elements of the periodic table: their properties, " +
    "groups, periods, electron configurations, history, discovery and real-world uses. " +
    "Explain things clearly and simply for students, using short paragraphs and an occasional emoji. " +
    "You can also answer questions on any other topic helpfully and accurately. " +
    "Keep answers concise unless asked for more detail. Write in plain text without markdown symbols like ** or #. " +
    "IMPORTANT: Always reply in the same language the user writes in (for example Hindi, Spanish, French, " +
    "Arabic, Chinese, Tamil, German or any other language). If the user asks you to switch language, do so.";

  const selected = body.selectedElement;
  if (selected && typeof selected.name === "string" && typeof selected.symbol === "string") {
    instructions +=
      ` The student currently has ${selected.name.slice(0, 40)} (${selected.symbol.slice(0, 3)}) selected ` +
      "on the periodic table, so questions like 'this element' refer to it.";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5",
        instructions,
        input: [...history, { role: "user", content: message }],
        reasoning: { effort: "minimal" },
        text: { verbosity: "low" },
        max_output_tokens: 1000
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(response.status).json({ error: data?.error?.message || "OpenAI request failed." });
    }

    const reply =
      data.output_text ||
      (data.output || [])
        .filter(item => item.type === "message")
        .flatMap(item => item.content || [])
        .filter(part => part.type === "output_text")
        .map(part => part.text)
        .join("\n")
        .trim();

    return res.status(200).json({ reply: reply || "Hmm, I couldn't think of an answer. Try asking another way!" });
  } catch (error) {
    console.error("Verity function error:", error);
    return res.status(500).json({ error: "Verity's server had a problem. Please try again." });
  }
};
