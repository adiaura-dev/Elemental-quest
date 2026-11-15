// api/verity.js — Verity's AI brain on Vercel, using Groq's FREE plan.
// The key comes from Vercel's Environment Variables (GROQ_API_KEY), never from your code.

module.exports = async (req, res) => {
  // Allow the chat to work when index.html is opened from your computer
  if (req.headers.origin === "null") {
    res.setHeader("Access-Control-Allow-Origin", "null");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Please use POST." });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY is not set in Vercel environment variables." });
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
    "Arabic, Chinese, Tamil, German or any other language). If the user asks you to switch language, do so. " +
    "FACTS ABOUT THE ELEMENT QUEST WEBSITE (use only these; never invent features, items, gear, spells, levels or rewards): " +
    "1) Periodic Table: all 118 elements as clickable tiles plus a search box. Clicking a tile shows its symbol, atomic number, " +
    "group, period, family, an overview, properties, real-world uses and a fun fact. " +
    "2) Knowledge Quiz: 5 random multiple-choice questions about elements, symbols and the periodic table; " +
    "you see your score at the end and can try again. " +
    "3) Boss Fight 'The Element Guardian': 5 multiple-choice questions and 3 lives. The boss starts at 100% health and each " +
    "correct answer deals 20% damage. Each wrong answer costs one life. To defeat the boss you must answer all 5 questions " +
    "correctly, which is why it feels hard. Good preparation: practise the Quiz, learn element symbols (Na = sodium, " +
    "K = potassium, Fe = iron, Ag = silver), atomic numbers of the first 20 elements, and the families " +
    "(Group 1 alkali metals, Group 17 halogens, Group 18 noble gases). " +
    "4) Verity (you) is the AI chat button. " +
    "If someone asks about the website and the answer is not in these facts, say you are not sure instead of guessing.";

  const selected = body.selectedElement;
  if (selected && typeof selected.name === "string" && typeof selected.symbol === "string") {
    instructions +=
      ` The student currently has ${selected.name.slice(0, 40)} (${selected.symbol.slice(0, 3)}) selected ` +
      "on the periodic table, so questions like 'this element' refer to it.";
  }

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const request = {
    model,
    messages: [{ role: "system", content: instructions }, ...history, { role: "user", content: message }],
    max_completion_tokens: 1000
  };
  if (model.startsWith("openai/gpt-oss")) request.reasoning_effort = "low"; // keeps replies fast

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Groq error:", data);
      const msg = data?.error?.message || "AI request failed.";
      const friendly = response.status === 429
        ? "I'm getting lots of questions right now! Please wait a minute and try again."
        : msg;
      return res.status(response.status).json({ error: friendly });
    }

    // Remove markdown symbols so the chat bubble shows clean text
    const reply = (data?.choices?.[0]?.message?.content || "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      .replace(/^#{1,6}\s*/gm, "")
      .replace(/^\s*[-*]\s+/gm, "• ")
      .trim();
    return res.status(200).json({ reply: reply || "Hmm, I couldn't think of an answer. Try asking another way!" });
  } catch (error) {
    console.error("Verity function error:", error);
    return res.status(500).json({ error: "Verity's server had a problem. Please try again." });
  }
};
