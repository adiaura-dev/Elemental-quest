// api/verity.js — Verity, the OmniQuest AI tutor, on Vercel using Groq's FREE plan.
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

  // ---- Lesson mode: write a full lesson + quick quiz for any topic ----
  if (body.mode === "lesson") return writeLesson(body, apiKey, res);

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
    "You are Verity, the friendly AI tutor on OmniQuest, a learning website for school students (Class 6 to 10). " +
    "You teach Chemistry, Maths, Biology and Physics, and you can also help with any other school subject or general question. " +
    "Explain clearly and step by step, the way a good teacher would: short paragraphs, simple words, a quick example, " +
    "and check understanding when it helps. For maths, show the working line by line. Use emojis rarely. " +
    "Keep answers concise unless the student asks for more detail. Write in plain text without markdown symbols like ** or #. " +
    "If a student asks you to just give answers to their homework, help them understand and guide them through it rather than only giving the final answer. " +
    "IMPORTANT: Always reply in the same language the student writes in (for example Hindi, Spanish, French, " +
    "Arabic, Chinese, Tamil, German or any other language). If they ask you to switch language, do so. " +
    "FACTS ABOUT THE OMNIQUEST WEBSITE (use only these; never invent features, items, levels or rewards): " +
    "The site has a Dashboard and four subjects in the left menu. Students choose their board (CBSE, ICSE, IGCSE, State or Other) and class (6 to 10), " +
    "and topics marked RECOMMENDED match their class. Every correct answer anywhere earns XP (100 XP per level), and the sidebar shows level, XP and best streak. " +
    "CHEMISTRY: 1) Periodic Table: all 118 elements as clickable tiles with a search box; each shows symbol, atomic number, group, period, family, overview, properties, uses and a fun fact. " +
    "2) Knowledge Quiz: 5 random multiple-choice questions on elements. " +
    "3) Boss Fight 'The Element Guardian': 10 questions, 3 lives, one of three random question sets; each correct answer deals 12.5% damage, so 8 correct answers win. " +
    "4) Atom Lab: build atoms in 3D by adding protons, neutrons and electrons for all 118 elements (it shows ions, isotopes, electron shells and whether an isotope is stable or radioactive), " +
    "plus a molecule builder with 26 molecules (like water, carbon dioxide, methane, ammonia, salt, ethanol and benzene) that snap into real 3D shapes, with missions and a collection. " +
    "MATHS: Sentence to Equation (turn word problems into linear equations, with a keyword hint, then solve them on a balance scale); " +
    "Solving Equations (find x; a balance scale tips if the answer is wrong); Quadratic Equations (find both roots by factorising and see the graph); " +
    "Boss Battle against the X-Beast (10 mixed questions, 3 lives, 8 correct answers win). Rounds have 8 questions and Easy, Medium and Hard levels. " +
    "BIOLOGY: Cell Explorer (tap parts of animal and plant cells to learn their jobs, plus a labelling challenge); Human Body Explorer (organs and body systems, plus an organ challenge); " +
    "Biology Quiz (10 questions picked for the student's class). " +
    "PHYSICS: Circuit Lab (predict which materials conduct electricity, and Ohm's law missions with voltage and resistance sliders); " +
    "Motion Lab (drive a car, see the distance-time graph and predict how far it travels); Physics Quiz (10 questions for the student's class). " +
    "Verity (you) is the AI chat button. If someone asks about the website and the answer is not in these facts, say you are not sure instead of guessing.";

  const profile = body.profile || {};
  const boards = ["CBSE", "ICSE", "IGCSE", "State", "Other"];
  const board = boards.includes(profile.board) ? profile.board : null;
  const grade = Number.isInteger(profile.grade) && profile.grade >= 1 && profile.grade <= 12 ? profile.grade : null;
  if (board || grade) {
    instructions +=
      ` The student is ${grade ? `in ${board === "IGCSE" ? "Grade" : "Class"} ${grade}` : "a school student"}` +
      `${board && board !== "Other" ? ` following the ${board === "State" ? "State board" : board} syllabus` : ""}. ` +
      "Pitch your explanations at that level and use the terms and methods that syllabus uses.";
  }
  if (typeof body.page === "string" && body.page.trim()) {
    instructions += ` The student is currently on this page of the site: ${body.page.slice(0, 80)}.`;
  }

  const selected = body.selectedElement;
  if (selected && typeof selected.name === "string" && typeof selected.symbol === "string") {
    instructions +=
      ` On the periodic table, the student has ${selected.name.slice(0, 40)} (${selected.symbol.slice(0, 3)}) selected, ` +
      "so 'this element' refers to it when they are talking about chemistry.";
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
    return res.status(200).json({ reply: reply || "I couldn't come up with an answer. Could you ask that another way?" });
  } catch (error) {
    console.error("Verity function error:", error);
    return res.status(500).json({ error: "Verity's server had a problem. Please try again." });
  }
};


// Writes a structured lesson for the student's board and class, returned as JSON
async function writeLesson(body, apiKey, res) {
  const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 100) : "";
  if (!topic) return res.status(400).json({ error: "No topic given." });
  const subject = typeof body.subject === "string" ? body.subject.slice(0, 30) : "General";
  const profile = body.profile || {};
  const board = ["CBSE", "ICSE", "IGCSE", "State", "Other"].includes(profile.board) ? profile.board : "CBSE";
  const grade = Number.isInteger(profile.grade) && profile.grade >= 1 && profile.grade <= 12 ? profile.grade : 7;
  const syllabus = board === "Other" ? "a general school" : board === "State" ? "an Indian State board" : `the ${board}`;

  const system =
    `You are an expert, friendly school teacher. Write an accurate lesson for a ${board === "IGCSE" ? "Grade" : "Class"} ${grade} student following ${syllabus} syllabus. ` +
    `Subject: ${subject}. Pitch it exactly at that level and use that syllabus's terms and methods. ` +
    "If the topic is not a real school topic, or it is unsafe or inappropriate for a child, write a short lesson on the closest suitable school topic instead. " +
    "Reply with ONLY a JSON object (no markdown, no code fences, no extra text) in exactly this shape: " +
    '{"title": string, "summary": string (2 sentences), "sections": [{"heading": string, "text": string}], "keyPoints": [string], ' +
    '"quiz": [{"q": string, "options": [string, string, string, string], "answer": number (index 0-3 of the correct option), "explain": string}]}. ' +
    "Use 3 to 5 sections of 60 to 120 words each in plain text; include a worked example or real-life example where helpful (for maths, show the steps on separate lines). " +
    "Give 4 to 6 short key points and exactly 3 quiz questions with one clearly correct answer each. " +
    "Write in the same language as the topic text (English if unsure).";

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const request = {
    model,
    messages: [{ role: "system", content: system }, { role: "user", content: `Topic: ${topic}` }],
    max_completion_tokens: 3000
  };
  if (model.startsWith("openai/gpt-oss")) request.reasoning_effort = "low";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(request)
    });
    const data = await response.json();
    if (!response.ok) {
      const friendly = response.status === 429 ? "Lots of students are learning right now! Please wait a minute and try again." : (data?.error?.message || "AI request failed.");
      return res.status(response.status).json({ error: friendly });
    }
    const text = data?.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{"), end = text.lastIndexOf("}");
    let lesson;
    try { lesson = JSON.parse(text.slice(start, end + 1)); } catch { lesson = null; }
    if (!lesson || !Array.isArray(lesson.sections)) return res.status(502).json({ error: "Verity's lesson came out jumbled. Please try again." });

    const str = (v, n) => (typeof v === "string" ? v.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#{1,6}\s*/gm, "").trim().slice(0, n) : "");
    const clean = {
      title: str(lesson.title, 120) || topic,
      summary: str(lesson.summary, 600),
      sections: lesson.sections.slice(0, 6).map(s => ({ heading: str(s && s.heading, 120), text: str(s && s.text, 1600) })).filter(s => s.heading && s.text),
      keyPoints: (Array.isArray(lesson.keyPoints) ? lesson.keyPoints : []).slice(0, 8).map(k => str(k, 240)).filter(Boolean),
      quiz: (Array.isArray(lesson.quiz) ? lesson.quiz : []).slice(0, 5).filter(q => q && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)
        .map(q => ({ q: str(q.q, 300), options: q.options.map(o => str(String(o), 160)), answer: q.answer, explain: str(q.explain, 400) }))
    };
    if (!clean.sections.length) return res.status(502).json({ error: "Verity's lesson came out empty. Please try again." });
    return res.status(200).json({ lesson: clean });
  } catch (error) {
    console.error("Lesson error:", error);
    return res.status(500).json({ error: "Verity's server had a problem. Please try again." });
  }
}
