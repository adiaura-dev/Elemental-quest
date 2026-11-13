// netlify/functions/verity.js
// Verity's "brain". This runs on Netlify's server, never in the visitor's browser,
// so the OpenAI key stays secret.

// Websites allowed to talk to Verity: your live site, and index.html opened from your computer ("null")
const ALLOWED_ORIGINS = ["https://elementalquest-123.netlify.app", "null"];

exports.handler = async (event) => {
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || "";
  const headers = { "Content-Type": "application/json" };

  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Vary"] = "Origin";
  }

  // The browser asks "am I allowed?" before sending from a local file
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  // Only accept POST requests from the chatbot
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Please use POST." }) };
  }

  // The key comes from Netlify's environment variables, NOT from your code
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "OPENAI_API_KEY is not set in Netlify environment variables." })
    };
  }

  // Read the message and chat history sent by the website
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request." }) };
  }

  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  if (!message) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Message is empty." }) };
  }

  // Keep only the last 12 valid messages so Verity remembers the recent conversation
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
    "You can also answer questions on any other topic (maths, science, history, everyday questions) helpfully and accurately. Keep answers concise unless asked for more detail. " +
    "Write in plain text without markdown symbols like ** or #. " +
    "IMPORTANT: Always reply in the same language the user writes in (for example Hindi, Spanish, French, " +
    "Arabic, Chinese, Tamil, German or any other language). If the user asks you to switch language, do so.";

  // If the student has an element selected on the periodic table, tell Verity about it
  const selected = body.selectedElement;
  if (selected && typeof selected.name === "string" && typeof selected.symbol === "string") {
    instructions +=
      ` The student currently has ${selected.name.slice(0, 40)} (${selected.symbol.slice(0, 3)}) selected ` +
      "on the periodic table, so questions like 'this element' refer to it.";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5",
        instructions,
        input: [...history, { role: "user", content: message }],
        reasoning: { effort: "minimal" }, // keeps replies fast so Netlify doesn't time out
        text: { verbosity: "low" },
        max_output_tokens: 1000
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data?.error?.message || "OpenAI request failed." })
      };
    }

    // Pull the text answer out of OpenAI's response
    const reply =
      data.output_text ||
      (data.output || [])
        .filter(item => item.type === "message")
        .flatMap(item => item.content || [])
        .filter(part => part.type === "output_text")
        .map(part => part.text)
        .join("\n")
        .trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: reply || "Hmm, I couldn't think of an answer. Try asking another way!" })
    };
  } catch (error) {
    console.error("Verity function error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Verity's server had a problem. Please try again." }) };
  }
};