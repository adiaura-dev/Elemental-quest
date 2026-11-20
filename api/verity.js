// api/verity.js — Verity, the OmniQuest AI tutor, on Vercel using Groq's FREE plan.
// The key comes from Vercel's Environment Variables (GROQ_API_KEY), never from your code.

const LANGS = ["English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "French", "German", "Spanish", "Arabic", "Chinese", "Japanese"];
const langOf = body => (body && body.profile && LANGS.includes(body.profile.lang) ? body.profile.lang : "English");
const levelOf = body => {
  const p = (body && body.profile) || {};
  const board = ["CBSE", "ICSE", "IGCSE", "State", "Other"].includes(p.board) ? p.board : "CBSE";
  const grade = Number.isInteger(p.grade) && p.grade >= 1 && p.grade <= 12 ? p.grade : 7;
  return { board, grade, word: board === "IGCSE" ? "Grade" : "Class" };
};
async function askGroq(apiKey, messages, maxTokens, model) {
  const m = model || process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const request = { model: m, messages, max_completion_tokens: maxTokens };
  if (m.startsWith("openai/gpt-oss")) request.reasoning_effort = "low";
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` }, body: JSON.stringify(request) });
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(response.status === 429 ? "Lots of students are learning right now! Please wait a minute and try again." : (data?.error?.message || "AI request failed."));
    err.status = response.status;
    throw err;
  }
  const text = data?.choices?.[0]?.message?.content || "";
  try { return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); } catch { return null; }
}
const clip = (v, n) => (typeof v === "string" ? v.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#{1,6}\s*/gm, "").trim().slice(0, n) : "");

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
  // ---- Syllabus mode: chapters + subtopics for a board, class and subject ----
  if (body.mode === "syllabus") return writeSyllabus(body, apiKey, res);
  // ---- Exam mode and homework checking ----
  if (body.mode === "exam") return writeExam(body, apiKey, res);
  if (body.mode === "check") return checkHomework(body, apiKey, res);
  // ---- Translate the website's own buttons and headings into the student's language ----
  if (body.mode === "translate") return translateUI(body, apiKey, res);

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
    "You are Verity, the fun, upbeat AI tutor on OmniQuest, a learning website for school students (Class 6 to 10). " +
    "Your personality: enthusiastic, warm and a little bit funny, like a favourite teacher who loves science and maths. " +
    "Use vivid everyday analogies (cricket, food, games, superheroes, phones), the occasional light joke or pun, and 1 to 3 emojis per answer. " +
    "Celebrate effort and curiosity, and when it fits, end with a quick challenge question or a 'mind-blown' fun fact. " +
    "Being fun must never make you less accurate. " +
    "You teach Chemistry, Maths, Biology and Physics, and you can also help with any other school subject or general question. " +
    "Explain clearly and step by step, the way a good teacher would: short paragraphs, simple words, a quick example, " +
    "and check understanding when it helps. For maths, show the working line by line. " +
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
  const lang = langOf(body);
  if (lang !== "English") instructions += ` The student chose ${lang} as their language, so reply in ${lang} unless they write to you in a different language.`;
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
  const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 160) : "";
  if (!topic) return res.status(400).json({ error: "No topic given." });
  const subject = typeof body.subject === "string" ? body.subject.slice(0, 30) : "General";
  const profile = body.profile || {};
  const board = ["CBSE", "ICSE", "IGCSE", "State", "Other"].includes(profile.board) ? profile.board : "CBSE";
  const grade = Number.isInteger(profile.grade) && profile.grade >= 1 && profile.grade <= 12 ? profile.grade : 7;
  const syllabus = board === "Other" ? "a general school" : board === "State" ? "an Indian State board" : `the ${board}`;

  const system =
    `You are Verity, an expert and fun school teacher. Write an accurate, engaging lesson (friendly tone, everyday analogies, a little humour, no more than 3 emojis in total) for a ${board === "IGCSE" ? "Grade" : "Class"} ${grade} student following ${syllabus} syllabus. ` +
    `Subject: ${subject}. Pitch it exactly at that level and use that syllabus's terms and methods. ` +
    "If the topic is not a real school topic, or it is unsafe or inappropriate for a child, write a short lesson on the closest suitable school topic instead. " +
    "Reply with ONLY a JSON object (no markdown, no code fences, no extra text) in exactly this shape: " +
    '{"title": string, "hook": string (one fun, curious opening line), "summary": string (2 sentences), "sections": [{"heading": string, "text": string}], "keyPoints": [string], "funFact": string, ' +
    '"quiz": [{"q": string, "options": [string, string, string, string], "answer": number (index 0-3 of the correct option), "explain": string}]}. ' +
    "Use 3 to 5 sections of 60 to 120 words each in plain text; include a worked example or real-life example where helpful (for maths, show the steps on separate lines). " +
    "Give 4 to 6 short key points and exactly 3 quiz questions with one clearly correct answer each. " +
    `Write the whole lesson (all text values) in ${langOf(body)}. Keep standard scientific symbols and formulas as they are.`;

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
      hook: str(lesson.hook, 300),
      funFact: str(lesson.funFact, 400),
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


/* ---------------- SYLLABUS ----------------
   Verified chapter lists (checked online, November 2026). Everything else is generated. */
const VERIFIED = {
  "CBSE|6|Maths": { book: "NCERT Ganita Prakash", chapters: ["Patterns in Mathematics", "Lines and Angles", "Number Play", "Data Handling and Presentation", "Prime Time", "Perimeter and Area", "Fractions", "Playing with Constructions", "Symmetry", "The Other Side of Zero"] },
  "CBSE|7|Maths": { book: "NCERT Ganita Prakash Part I and Part II", chapters: ["Large Numbers Around Us", "Arithmetic Expressions", "A Peek Beyond the Point", "Expressions using Letter-Numbers", "Parallel and Intersecting Lines", "Number Play", "A Tale of Three Intersecting Lines", "Working with Fractions", "Geometric Twins", "Operations with Integers", "Finding Common Ground", "Another Peek Beyond the Point", "Connecting the Dots...", "Constructions and Tilings", "Finding the Unknown"] },
  "CBSE|8|Maths": { book: "NCERT Ganita Prakash Part I and Part II", chapters: ["A Square and A Cube", "Power Play", "A Story of Numbers", "Quadrilaterals", "Number Play", "We Distribute, Yet Things Multiply", "Proportional Reasoning-1", "Fractions in Disguise", "The Baudhayana-Pythagoras Theorem", "Proportional Reasoning-2", "Exploring Some Geometric Themes", "Tales by Dots and Lines", "Algebra Play", "Area"] },
  "CBSE|10|Maths": { book: "NCERT Mathematics", chapters: ["Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Some Applications of Trigonometry", "Circles", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"] },
  "ICSE|10|Maths": { book: "Selina Concise Mathematics", chapters: ["Goods and Services Tax (GST)", "Banking", "Shares and Dividends", "Linear Inequations", "Quadratic Equations", "Problems Based on Quadratic Equations", "Ratio and Proportion", "Factorisation of Polynomials", "Matrices", "Arithmetic Progression", "Geometric Progression", "Reflection", "Section and Mid-Point Formula", "Equation of a Line", "Similarity", "Loci", "Circles", "Tangents and Intersecting Chords", "Constructions (Circles)", "Cylinder, Cone and Sphere", "Trigonometrical Identities", "Heights and Distances", "Graphical Representation (Histograms and Ogives)", "Measures of Central Tendency", "Probability"] }
};
const HINTS =
  "Important recent changes you must respect: from 2024 to 2026 NCERT (used by CBSE) replaced its books. Classes 6 to 8 Maths use 'Ganita Prakash', " +
  "Class 9 Maths uses 'Ganita Manjari' (Part I covers coordinates, linear polynomials, the world of numbers, algebraic identities, circles, perimeter and area, probability, and sequences and progressions), " +
  "Classes 6 to 8 Science use 'Curiosity', and Class 9 Science uses 'Exploration'. If you are not certain of the exact new chapter titles, give clear topic-based chapter names instead of inventing titles. " +
  "ICSE schools commonly use Selina Concise books for Classes 6 to 10 (Physics, Chemistry and Biology are separate subjects). IGCSE students in Grades 6 to 8 usually follow Cambridge Lower Secondary, and Grades 9 to 10 follow Cambridge IGCSE syllabuses (Maths 0580, Physics 0625, Chemistry 0620, Biology 0610). " +
  "For CBSE and State boards, Physics, Chemistry and Biology chapters come from the combined Science book, so list only the chapters (or chapter parts) that belong to the requested subject.";

async function writeSyllabus(body, apiKey, res) {
  const subjects = ["Maths", "Physics", "Chemistry", "Biology"];
  const subject = subjects.includes(body.subject) ? body.subject : null;
  if (!subject) return res.status(400).json({ error: "Unknown subject." });
  const profile = body.profile || {};
  const board = ["CBSE", "ICSE", "IGCSE", "State", "Other"].includes(profile.board) ? profile.board : "CBSE";
  const grade = Number.isInteger(profile.grade) && profile.grade >= 6 && profile.grade <= 10 ? profile.grade : 7;
  const verified = VERIFIED[`${board === "State" || board === "Other" ? "CBSE" : board}|${grade}|${subject}`];
  const syllabus = board === "Other" ? "a typical Indian school (follow CBSE/NCERT)" : board === "State" ? "an Indian State board (follow CBSE/NCERT, which most State boards now adopt)" : board;

  const system =
    `You are an expert on Indian and international school syllabuses. ${HINTS} ` +
    (verified
      ? `The chapters of ${board} ${grade === 6 || grade === 7 || grade === 8 ? "Class" : "Class"} ${grade} ${subject} (${verified.book}) are exactly, in order: ${verified.chapters.map((c, i) => `${i + 1}. ${c}`).join("; ")}. Keep these names exactly and add the subtopics each chapter covers. `
      : `List the chapters of ${subject} for ${board === "IGCSE" ? "Grade" : "Class"} ${grade} following ${syllabus}, in the usual teaching order. `) +
    "Reply with ONLY a JSON object, no markdown or extra text, in exactly this shape: " +
    '{"book": string (the textbook or syllabus name), "chapters": [{"name": string, "subtopics": [string]}]}. ' +
    "Give 3 to 7 short subtopics per chapter (each 2 to 6 words). Use at most 30 chapters.";

  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const request = { model, messages: [{ role: "system", content: system }, { role: "user", content: `${board} ${grade} ${subject}` }], max_completion_tokens: 4500 };
  if (model.startsWith("openai/gpt-oss")) request.reasoning_effort = "low";
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` }, body: JSON.stringify(request) });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: response.status === 429 ? "Lots of students are learning right now! Please wait a minute and try again." : (data?.error?.message || "AI request failed.") });
    const text = data?.choices?.[0]?.message?.content || "";
    let out; try { out = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); } catch { out = null; }
    const str = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
    let chapters = out && Array.isArray(out.chapters) ? out.chapters.slice(0, 30).map(c => ({ name: str(c && c.name, 90), subtopics: (Array.isArray(c && c.subtopics) ? c.subtopics : []).slice(0, 8).map(t => str(String(t), 70)).filter(Boolean) })).filter(c => c.name) : [];
    if (verified) {
      // always trust the verified chapter names; only take subtopics from the AI
      chapters = verified.chapters.map((name, i) => ({ name, subtopics: (chapters.find(c => c.name.toLowerCase() === name.toLowerCase()) || chapters[i] || { subtopics: [] }).subtopics }));
    }
    if (!chapters.length) return res.status(502).json({ error: "Verity couldn't build the chapter list. Please try again." });
    return res.status(200).json({ syllabus: { book: verified ? verified.book : str(out.book, 120), verified: !!verified, chapters } });
  } catch (error) {
    console.error("Syllabus error:", error);
    return res.status(500).json({ error: "Verity's server had a problem. Please try again." });
  }
}


/* ---------------- EXAM MODE ---------------- */
async function writeExam(body, apiKey, res) {
  const subject = ["Maths", "Physics", "Chemistry", "Biology"].includes(body.subject) ? body.subject : null;
  if (!subject) return res.status(400).json({ error: "Unknown subject." });
  const chapters = (Array.isArray(body.chapters) ? body.chapters : []).filter(c => typeof c === "string").slice(0, 30).map(c => c.slice(0, 90));
  if (!chapters.length) return res.status(400).json({ error: "Pick at least one chapter." });
  const count = [10, 15, 20].includes(body.count) ? body.count : 10;
  const { board, grade, word } = levelOf(body);
  const system =
    `You are an experienced ${board} examiner. Write a ${count}-question multiple-choice test for a ${word} ${grade} ${subject} student, in the style and difficulty of real ${board} school exams. ` +
    `Spread the questions fairly across these chapters: ${chapters.join("; ")}. Mix easy, medium and hard questions, including some application and numerical questions. ` +
    "Every question must have exactly one correct option and three believable wrong options. Double-check every answer and calculation. " +
    `Write all text in ${langOf(body)} (keep scientific symbols and formulas as they are). ` +
    'Reply with ONLY a JSON object: {"questions": [{"q": string, "options": [string, string, string, string], "answer": number (0-3), "explain": string (1-2 sentences), "chapter": string (one of the given chapter names)}]}.';
  try {
    const out = await askGroq(apiKey, [{ role: "system", content: system }, { role: "user", content: `${subject} test` }], 6000);
    const qs = (out && Array.isArray(out.questions) ? out.questions : [])
      .filter(q => q && typeof q.q === "string" && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3)
      .slice(0, count)
      .map(q => ({ q: clip(q.q, 400), options: q.options.map(o => clip(String(o), 200)), answer: q.answer, explain: clip(q.explain, 400), chapter: chapters.includes(q.chapter) ? q.chapter : chapters[0] }));
    if (qs.length < Math.min(5, count)) return res.status(502).json({ error: "Verity couldn't build the test. Please try again." });
    return res.status(200).json({ exam: { questions: qs } });
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.status ? e.message : "Verity's server had a problem. Please try again." });
  }
}

/* ---------------- HOMEWORK CHECK ---------------- */
async function checkHomework(body, apiKey, res) {
  const question = typeof body.question === "string" ? body.question.trim().slice(0, 2000) : "";
  const working = typeof body.working === "string" ? body.working.trim().slice(0, 4000) : "";
  const image = typeof body.image === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(body.image) && body.image.length < 4000000 ? body.image : null;
  if (!question && !working && !image) return res.status(400).json({ error: "Type your question and working, or add a photo." });
  const subject = ["Maths", "Physics", "Chemistry", "Biology"].includes(body.subject) ? body.subject : "General";
  const { board, grade, word } = levelOf(body);
  const lang = langOf(body);
  const system =
    `You are Verity, a kind and encouraging ${subject} teacher checking homework for a ${board} ${word} ${grade} student. ` +
    "Check the student's answer and working carefully, step by step. Find the FIRST step that is wrong (if any) and explain why in simple words. " +
    "Do not just hand over the answer in the main feedback: give a hint that helps them fix it themselves. Put the complete correct solution only in the 'solution' field. " +
    "If the photo or text is not school work, say so politely in 'summary' and set verdict to 'unclear'. " +
    `Write all text in ${lang}. Reply with ONLY a JSON object: ` +
    '{"verdict": "correct" | "partly" | "incorrect" | "unclear", "summary": string (1-2 friendly sentences), "steps": [{"text": string (the student\'s step, short), "ok": boolean, "comment": string}], "hint": string, "solution": string (full worked solution, steps on separate lines)}.';
  const userText = `Question: ${question || "(see photo)"}\nStudent's answer and working:\n${working || "(see photo)"}`;
  const userContent = image ? [{ type: "text", text: userText }, { type: "image_url", image_url: { url: image } }] : userText;
  try {
    const out = await askGroq(apiKey, [{ role: "system", content: system }, { role: "user", content: userContent }], 3000,
      image ? (process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct") : undefined);
    if (!out) return res.status(502).json({ error: "Verity couldn't read that properly. Please try again." });
    const verdict = ["correct", "partly", "incorrect", "unclear"].includes(out.verdict) ? out.verdict : "unclear";
    return res.status(200).json({ check: {
      verdict,
      summary: clip(out.summary, 600),
      steps: (Array.isArray(out.steps) ? out.steps : []).slice(0, 12).map(st => ({ text: clip(st && st.text, 300), ok: !!(st && st.ok), comment: clip(st && st.comment, 400) })).filter(st => st.text),
      hint: clip(out.hint, 600),
      solution: clip(out.solution, 3000)
    } });
  } catch (e) {
    const msg = image && e.status && e.status !== 429 ? "Photo checking isn't working right now. Please type your question and working instead." : (e.status ? e.message : "Verity's server had a problem. Please try again.");
    return res.status(e.status || 500).json({ error: msg });
  }
}

// Translates short pieces of the website (buttons, headings, hints) into the chosen language
async function translateUI(body, apiKey, res) {
  const lang = LANGS.includes(body.lang) ? body.lang : "English";
  const texts = Array.isArray(body.texts) ? body.texts.filter(t => typeof t === "string").slice(0, 80).map(t => t.slice(0, 500)) : [];
  if (!texts.length || lang === "English") return res.status(200).json({ texts });
  const system =
    `You translate the user interface of OmniQuest, a learning website for school students, from English into ${lang}. ` +
    "Translate every string in the list. Use simple, natural words a school student would use, and keep each translation about as short as the original. " +
    "Keep these exactly as they are: numbers, maths, chemical formulas and symbols, units (V, A, Ω, km/h, XP), the names OmniQuest, Verity, PhET and Sketchfab, and board names (CBSE, ICSE, IGCSE). " +
    "Keep any leading or trailing punctuation such as ':', '…', '?', '→'. " +
    "Some strings contain simple HTML tags such as <b>…</b> or <span class=\"x\">…</span>: keep every tag and its attributes exactly, translate only the words, and move the tags with the words they wrap. " +
    'Reply with ONLY a JSON object in exactly this shape: {"t": [string, ...]} with the same number of items, in the same order.';
  try {
    const out = await askGroq(apiKey, [{ role: "system", content: system }, { role: "user", content: JSON.stringify(texts) }], 4000);
    const t = out && Array.isArray(out.t) && out.t.length === texts.length ? out.t.map((x, i) => (typeof x === "string" && x.trim() ? x : texts[i])) : null;
    if (!t) return res.status(502).json({ error: "Translation failed. Please try again." });
    return res.status(200).json({ texts: t });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Translation failed." });
  }
}
