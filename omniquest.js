/* =========================================
   OMNIQUEST 🌍 LEARN EVERYTHING
   Turns Element Quest into a multi-subject platform:
   board + class picker, Home dashboard, subject menu,
   Maths / Biology / Physics pages and shared XP.
   ========================================= */

(function () {
  "use strict";
  if (window.__omniQuest) return;
  window.__omniQuest = true;

  const sidebar = document.querySelector(".sidebar");
  const nav = sidebar && sidebar.querySelector("nav");
  const main = document.querySelector(".main-content");
  if (!nav || !main) return;

  /* ---------- shared progress ---------- */
  const KEY = "omniQuest";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } };
  const write = patch => { const d = Object.assign(read(), patch); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (_) { /* ignore */ } return d; };
  const $ = id => document.getElementById(id);

  /* ---------- 1. new name ---------- */
  document.title = "OmniQuest | Learn Everything";
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", "OmniQuest: learn Chemistry, Maths, Biology and Physics with games, labs, quizzes and an AI helper.");
  const brandTitle = sidebar.querySelector(".brand h2");
  const brandSub = sidebar.querySelector(".brand small");
  if (brandTitle) brandTitle.textContent = "OMNIQUEST";
  if (brandSub) brandSub.textContent = "LEARN EVERYTHING";

  /* ---------- 2. styles ---------- */
  const css = document.createElement("style");
  css.textContent = `
    .sidebar .brand { margin-bottom: 20px !important; cursor: pointer; }
    .sidebar nav { overflow-y: auto; min-height: 0; flex: 1 1 auto; align-content: start; padding-right: 2px; scrollbar-width: thin; }
    .oq-head { display: flex; align-items: center; gap: 8px; width: 100%; border: 0; background: transparent; color: #8fb3cf; font: 900 11px "Nunito", system-ui, sans-serif; letter-spacing: 1.6px; text-transform: uppercase; padding: 12px 10px 6px; text-align: left; }
    .oq-head:hover { color: #fff; }
    .oq-head .chev { margin-left: auto; transition: transform .25s; font-size: 10px; }
    .oq-group.open .oq-head .chev { transform: rotate(90deg); }
    .oq-head .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--c); box-shadow: 0 0 10px var(--c); }
    .oq-items { display: none; gap: 5px; padding-left: 6px; border-left: 2px solid #22324a; margin-left: 12px; }
    .oq-group.open .oq-items { display: grid; animation: oqDrop .25s ease-out; }
    @keyframes oqDrop { from { opacity: 0; transform: translateY(-6px); } }
    .oq-items .nav-button { padding: 10px 11px !important; font-size: 13px !important; }
    .oq-xp { margin-top: 12px; padding: 12px; border: 1px solid #263449; border-radius: 12px; background: #0f1828; }
    .oq-xp .r { display: flex; justify-content: space-between; font: 800 11px "Nunito", sans-serif; color: #a7c8df; letter-spacing: 1px; }
    .oq-xp .r b { color: #fff; font-size: 13px; }
    .oq-xp .bar { height: 7px; border-radius: 8px; background: #1e293b; overflow: hidden; margin: 7px 0 6px; }
    .oq-xp .bar div { height: 100%; width: 0; background: linear-gradient(90deg, #55cfff, #a855f7); transition: width .6s; }
    .oq-xp.bump { animation: oqBump .5s; }
    @keyframes oqBump { 40% { transform: scale(1.06); box-shadow: 0 0 20px #55cfff66; } }

    .oq-frame { width: 100%; height: calc(100vh - 56px); min-height: 560px; border: 0; display: block; border-radius: 16px; background: transparent; }

    .oq-hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
    .oq-hero h1 { font-size: clamp(30px, 4vw, 46px); margin: 0 0 6px; color: #fff; }
    .oq-hero h1 span { background: linear-gradient(90deg, #55cfff, #a855f7, #ffb347); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .oq-profile { display: flex; align-items: center; gap: 10px; background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 10px 14px; font-weight: 800; color: #dbe7f3; }
    .oq-profile button { border: 1px solid #3a4b62; background: #263449; color: #fff; border-radius: 9px; padding: 6px 10px; font-weight: 800; cursor: pointer; }
    .oq-profile button:hover { border-color: #55cfff; }
    .oq-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 22px; }
    .oq-stat { background: linear-gradient(145deg, #1e293b, #172337); border: 1px solid #334155; border-radius: 16px; padding: 14px 16px; }
    .oq-stat span { display: block; color: #8195ad; font-size: 11px; font-weight: 900; letter-spacing: 1.2px; }
    .oq-stat b { font: 700 26px "Fredoka", "Nunito", sans-serif; color: #fff; }
    .oq-subjects { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .oq-subject { position: relative; overflow: hidden; background: linear-gradient(160deg, #1e293b, #152033); border: 1px solid #334155; border-radius: 20px; padding: 20px; transition: transform .25s, border-color .25s, box-shadow .25s; }
    .oq-subject::before { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 90% 0%, var(--c), transparent 55%); opacity: .22; pointer-events: none; }
    .oq-subject:hover { transform: translateY(-4px); border-color: var(--c); box-shadow: 0 16px 40px #0006; }
    .oq-subject h2 { position: relative; display: flex; align-items: center; gap: 10px; margin: 0 0 4px; font-size: 24px; color: #fff; cursor: pointer; }
    .oq-subject h2 .ic { font-size: 34px; transition: transform .3s; }
    .oq-subject:hover h2 .ic { transform: rotate(-10deg) scale(1.15); }
    .oq-subject p { position: relative; color: #9aabc0; margin: 0 0 14px; font-size: 14px; }
    .oq-tools { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .oq-tool { text-align: left; border: 1px solid #334155; background: #111a2b; color: #e2ebf6; border-radius: 12px; padding: 10px 12px; font-weight: 800; font-size: 14px; cursor: pointer; transition: border-color .2s, transform .2s; }
    .oq-tool:hover { border-color: var(--c); transform: translateX(3px); }
    .oq-tool small { display: block; font-size: 10px; font-weight: 900; letter-spacing: 1px; color: #6f839b; margin-top: 3px; }
    .oq-tool small.rec { color: #45e2a1; }
    .oq-fact { margin-top: 18px; display: flex; gap: 14px; align-items: center; background: #172337; border: 1px dashed #55cfff66; border-radius: 16px; padding: 14px 16px; color: #c8d5e5; font-size: 14.5px; line-height: 1.55; }
    .oq-fact b { color: #55cfff; }

    .oq-modal { position: fixed; inset: 0; z-index: 3000; background: rgba(5, 9, 18, .82); backdrop-filter: blur(6px); display: grid; place-items: center; padding: 16px; animation: oqFade .3s; }
    @keyframes oqFade { from { opacity: 0; } }
    .oq-dialog { width: min(560px, 100%); background: linear-gradient(160deg, #1e293b, #131c2e); border: 1px solid #55cfff55; border-radius: 22px; padding: 26px; box-shadow: 0 0 60px #55cfff22; text-align: center; animation: oqPop .45s cubic-bezier(.2,1.4,.4,1); }
    @keyframes oqPop { from { transform: scale(.85); opacity: 0; } }
    .oq-dialog h2 { margin: 6px 0 4px; font-size: 28px; color: #fff; }
    .oq-dialog p { color: #9aabc0; margin: 0 0 18px; }
    .oq-choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(92px, 1fr)); gap: 10px; margin-bottom: 18px; }
    .oq-choice { border: 2px solid #334155; background: #111a2b; color: #fff; border-radius: 14px; padding: 14px 8px; font-weight: 900; font-size: 15px; cursor: pointer; transition: all .2s; }
    .oq-choice small { display: block; color: #8195ad; font-size: 10.5px; margin-top: 3px; font-weight: 800; }
    .oq-choice:hover { border-color: #55cfff; transform: translateY(-2px); }
    .oq-choice.on { border-color: #55cfff; background: #20334a; box-shadow: 0 0 18px #55cfff44; }
    .oq-go { border: 0; border-radius: 12px; padding: 13px 26px; font-weight: 900; font-size: 16px; color: #04202e; background: linear-gradient(135deg, #7fe0ff, #55cfff); cursor: pointer; box-shadow: 0 5px 0 #1f7fa3; }
    .oq-go:disabled { opacity: .45; cursor: default; }

    @media (max-width: 1100px) { .oq-subjects { grid-template-columns: 1fr; } }
    @media (max-width: 700px) { .oq-stats { grid-template-columns: repeat(2, 1fr); } .oq-tools { grid-template-columns: 1fr; } }
    @media (max-width: 620px) {
      .sidebar .brand { margin-bottom: 8px !important; }
      .sidebar nav { flex-wrap: nowrap; }
      .oq-group { display: contents; }
      .oq-head { width: auto; white-space: nowrap; padding: 9px 10px; border: 1px solid #2c3d53; border-radius: 10px; font-size: 10px; }
      .oq-head .chev { display: none; }
      .oq-items, .oq-group.open .oq-items { display: none; }
      .oq-group.open .oq-items { display: contents; }
      .oq-group.open .oq-head { border-color: var(--c); color: #fff; }
      .oq-xp { display: none; }
      .oq-frame { height: calc(100vh - 130px); }
    }
  `;
  document.head.appendChild(css);

  /* ---------- 3. subjects + their tools ---------- */
  const SUBJECTS = [
    { id: "chem", name: "Chemistry", icon: "🧪", color: "#55cfff", blurb: "Elements, atoms and molecules.", tools: [] },
    { id: "maths", name: "Maths", icon: "➗", color: "#ffb347", blurb: "Equations, algebra and the X-Beast.", section: "oq-maths", src: "maths.html?embed=1", tools: [
      { tool: "", label: "🏠 All maths", min: 6, max: 10 },
      { tool: "sentence", label: "✍️ Sentence → Equation", min: 6, max: 8 },
      { tool: "solve", label: "⚖️ Solve Equations", min: 7, max: 10 },
      { tool: "quad", label: "📈 Quadratics", min: 9, max: 10 },
      { tool: "boss", label: "👾 Maths Boss", min: 7, max: 10 }] },
    { id: "bio", name: "Biology", icon: "🧬", color: "#3ddc97", blurb: "Cells, the human body and life.", section: "oq-bio", src: "science.html?subject=biology&embed=1", tools: [
      { tool: "", label: "🏠 All biology", min: 6, max: 10 },
      { tool: "cell", label: "🔬 Cell Explorer", min: 6, max: 10 },
      { tool: "body", label: "🫀 Human Body", min: 6, max: 10 },
      { tool: "quiz", label: "🧬 Biology Quiz", min: 6, max: 10 }] },
    { id: "phy", name: "Physics", icon: "⚡", color: "#a855f7", blurb: "Electricity, motion and forces.", section: "oq-phy", src: "science.html?subject=physics&embed=1", tools: [
      { tool: "", label: "🏠 All physics", min: 6, max: 10 },
      { tool: "circuit", label: "⚡ Circuit Lab", min: 6, max: 10 },
      { tool: "motion", label: "🚗 Motion Lab", min: 7, max: 10 },
      { tool: "quiz", label: "🧲 Physics Quiz", min: 6, max: 10 }] }
  ];
  const CHEM_RANGE = { "periodic-section": [6, 10], "quiz-section": [6, 10], "boss-section": [6, 10], "atomlab-section": [8, 10] };

  /* ---------- 4. new page sections ---------- */
  const home = document.createElement("section");
  home.id = "oq-home";
  home.className = "page-section";
  main.prepend(home);
  SUBJECTS.filter(s => s.section).forEach(s => {
    const sec = document.createElement("section");
    sec.id = s.section;
    sec.className = "page-section";
    sec.innerHTML = `<iframe class="oq-frame" title="${s.name}" loading="lazy"></iframe>`;
    main.appendChild(sec);
  });

  /* ---------- 5. rebuild the menu into subject groups ---------- */
  const chemButtons = [...nav.querySelectorAll(".nav-button")];
  nav.innerHTML = "";
  const homeBtn = document.createElement("button");
  homeBtn.type = "button";
  homeBtn.className = "nav-button";
  homeBtn.dataset.section = "oq-home";
  homeBtn.textContent = "🏠 Home";
  nav.appendChild(homeBtn);

  const groups = {};
  SUBJECTS.forEach(s => {
    const g = document.createElement("div");
    g.className = "oq-group";
    g.style.setProperty("--c", s.color);
    g.dataset.subject = s.id;
    g.innerHTML = `<button type="button" class="oq-head"><span class="dot"></span>${s.icon} ${s.name}<span class="chev">▶</span></button><div class="oq-items"></div>`;
    const items = g.querySelector(".oq-items");
    if (s.id === "chem") chemButtons.forEach(b => items.appendChild(b));
    else s.tools.forEach(t => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "nav-button";
      b.dataset.section = s.section;
      b.dataset.tool = t.tool;
      b.textContent = t.label;
      items.appendChild(b);
    });
    g.querySelector(".oq-head").addEventListener("click", () => {
      const first = items.querySelector(".nav-button");
      if (g.classList.contains("open") && !window.matchMedia("(max-width: 620px)").matches) { g.classList.remove("open"); return; }
      if (first) first.click();
    });
    nav.appendChild(g);
    groups[s.id] = items;
  });

  // The Atom Lab adds its own menu button: move it into Chemistry
  const moveAtomLab = () => {
    const b = nav.querySelector(':scope > .nav-button[data-section="atomlab-section"]');
    if (b) groups.chem.appendChild(b);
  };
  new MutationObserver(moveAtomLab).observe(nav, { childList: true });
  moveAtomLab();

  /* ---------- 6. switching pages ---------- */
  function show(sectionId, tool) {
    document.querySelectorAll(".page-section").forEach(s => s.classList.toggle("active", s.id === sectionId));
    let activeBtn = null;
    nav.querySelectorAll(".nav-button").forEach(b => {
      const on = b.dataset.section === sectionId && (b.dataset.tool === undefined || b.dataset.tool === (tool || ""));
      b.classList.toggle("active", on);
      if (on) activeBtn = b;
    });
    nav.querySelectorAll(".oq-group").forEach(g => g.classList.toggle("open", !!activeBtn && g.contains(activeBtn)));
    const subj = SUBJECTS.find(s => s.section === sectionId);
    if (subj) {
      const frame = $(sectionId).querySelector("iframe");
      const want = `${subj.src}#${tool || ""}`;
      if (!frame.getAttribute("src")) frame.setAttribute("src", want);
      else frame.src = want;
    }
    if (sectionId === "oq-home") renderHome();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  nav.addEventListener("click", e => {
    const b = e.target.closest(".nav-button");
    if (b) show(b.dataset.section, b.dataset.tool);
  });
  const brand = sidebar.querySelector(".brand");
  if (brand) brand.addEventListener("click", () => show("oq-home"));

  /* ---------- 7. XP + level box in the sidebar ---------- */
  const bottom = sidebar.querySelector(".sidebar-bottom");
  const xpBox = document.createElement("div");
  xpBox.className = "oq-xp";
  (bottom || nav).insertAdjacentElement(bottom ? "beforebegin" : "afterend", xpBox);
  if (bottom) bottom.innerHTML = '<span class="status-dot"></span> ALL SYSTEMS ONLINE';
  let lastXP = null;
  function refreshXP() {
    const d = read(), xp = d.xp || 0, lvl = Math.floor(xp / 100) + 1;
    xpBox.innerHTML = `<div class="r"><span>LEVEL <b>${lvl}</b></span><span>🔥 ${d.bestStreak || 0}</span></div><div class="bar"><div style="width:${xp % 100}%"></div></div><div class="r"><span>${xp % 100} / 100 XP</span><span>${xp} total</span></div>`;
    if (lastXP !== null && xp > lastXP) { xpBox.classList.remove("bump"); void xpBox.offsetWidth; xpBox.classList.add("bump"); }
    lastXP = xp;
    if ($("oq-home").classList.contains("active")) renderStats();
  }
  window.addEventListener("message", e => { if (e.data && e.data.oq === "xp") refreshXP(); });
  window.addEventListener("storage", e => { if (e.key === KEY) refreshXP(); });

  // Chemistry quiz + boss fight also give XP now
  document.addEventListener("click", e => {
    const b = e.target.closest("#quiz-options .quiz-option, #boss-options .answer-option");
    if (!b || b.dataset.oqDone) return;
    setTimeout(() => {
      if (b.classList.contains("correct")) {
        b.dataset.oqDone = "1";
        const d = read();
        write({ xp: (d.xp || 0) + 10, solved: (d.solved || 0) + 1 });
        refreshXP();
      }
    }, 0);
  });

  /* ---------- 8. home dashboard ---------- */
  const FACTS = [
    "<b>Chemistry:</b> Gold is so soft it can be hammered into sheets thinner than a human hair.",
    "<b>Biology:</b> Your body makes about 2 million new red blood cells every second!",
    "<b>Physics:</b> Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
    "<b>Maths:</b> Zero was used as a number by Indian mathematicians, like Brahmagupta in 628 CE.",
    "<b>Biology:</b> Octopuses have three hearts and blue blood.",
    "<b>Physics:</b> Sound travels about 4 times faster in water than in air.",
    "<b>Chemistry:</b> Water expands when it freezes, which is why ice floats.",
    "<b>Maths:</b> A 'googol' is 1 followed by 100 zeros."
  ];
  function renderStats() {
    const d = read(), xp = d.xp || 0;
    const el = $("oq-stats");
    if (el) el.innerHTML = `<div class="oq-stat"><span>LEVEL</span><b>⭐ ${Math.floor(xp / 100) + 1}</b></div><div class="oq-stat"><span>TOTAL XP</span><b>${xp}</b></div><div class="oq-stat"><span>BEST STREAK</span><b>🔥 ${d.bestStreak || 0}</b></div><div class="oq-stat"><span>QUESTIONS SOLVED</span><b>✅ ${d.solved || 0}</b></div>`;
  }
  function renderHome() {
    const d = read(), grade = Number(d.grade) || 7;
    const word = d.board === "IGCSE" ? "Grade" : "Class";
    const tag = (min, max) => grade >= min && grade <= max ? '<small class="rec">✓ FOR YOUR CLASS</small>' : `<small>${word.toUpperCase()} ${min}${max >= 10 ? "+" : `–${max}`}</small>`;
    const chemTools = chemButtons.concat([...groups.chem.querySelectorAll('.nav-button[data-section="atomlab-section"]')]).filter((b, i, a) => a.indexOf(b) === i);
    home.innerHTML = `
      <div class="oq-hero">
        <div><p class="eyebrow">OMNIQUEST · LEARN EVERYTHING</p><h1>What will you <span>explore</span> today?</h1><p class="subtitle">Pick a subject. Every right answer earns XP across the whole site.</p></div>
        <div class="oq-profile">📘 ${d.board || "Board?"} · ${word} ${grade}<button type="button" id="oq-change">✏️ Change</button></div>
      </div>
      <div class="oq-stats" id="oq-stats"></div>
      <div class="oq-subjects">
        ${SUBJECTS.map(s => `<div class="oq-subject" style="--c:${s.color}">
          <h2 data-go="${s.id}"><span class="ic">${s.icon}</span>${s.name}</h2><p>${s.blurb}</p>
          <div class="oq-tools">${s.id === "chem"
            ? chemTools.map((b, i) => { const r = CHEM_RANGE[b.dataset.section] || [6, 10]; return `<button type="button" class="oq-tool" data-chem="${i}">${b.textContent.trim()}${tag(r[0], r[1])}</button>`; }).join("")
            : s.tools.filter(t => t.tool).map(t => `<button type="button" class="oq-tool" data-sec="${s.section}" data-tool="${t.tool}">${t.label}${tag(t.min, t.max)}</button>`).join("")}
          </div></div>`).join("")}
      </div>
      <div class="oq-fact"><span style="font-size:30px">💡</span><div>${FACTS[Math.floor(Math.random() * FACTS.length)]}</div></div>`;
    renderStats();
    $("oq-change").addEventListener("click", openProfile);
    home.querySelectorAll("[data-chem]").forEach(b => b.addEventListener("click", () => chemTools[b.dataset.chem].click()));
    home.querySelectorAll("[data-sec]").forEach(b => b.addEventListener("click", () => show(b.dataset.sec, b.dataset.tool)));
    home.querySelectorAll("[data-go]").forEach(h => h.addEventListener("click", () => groups[h.dataset.go].querySelector(".nav-button").click()));
  }

  /* ---------- 9. board + class picker ---------- */
  function openProfile() {
    const d = read();
    let board = d.board || null, grade = Number(d.grade) || null;
    const m = document.createElement("div");
    m.className = "oq-modal";
    const draw = () => {
      const word = board === "IGCSE" ? "Grade" : "Class";
      m.innerHTML = `<div class="oq-dialog">
        <div style="font-size:46px">🌍</div><h2>Welcome to OmniQuest!</h2><p>Tell us your board and class so we can pick the right questions for you.</p>
        <div class="label" style="color:#55cfff;font-weight:900;letter-spacing:2px;font-size:12px;margin-bottom:8px">1 · YOUR BOARD</div>
        <div class="oq-choices">${[["CBSE", "NCERT"], ["ICSE", "CISCE"], ["IGCSE", "Cambridge"], ["State", "State board"], ["Other", "Any"]].map(([b, s]) => `<button type="button" class="oq-choice ${board === b ? "on" : ""}" data-b="${b}">${b}<small>${s}</small></button>`).join("")}</div>
        <div class="label" style="color:#55cfff;font-weight:900;letter-spacing:2px;font-size:12px;margin-bottom:8px">2 · YOUR ${word.toUpperCase()}</div>
        <div class="oq-choices">${[6, 7, 8, 9, 10].map(g => `<button type="button" class="oq-choice ${grade === g ? "on" : ""}" data-g="${g}">${word} ${g}</button>`).join("")}</div>
        <button type="button" class="oq-go" id="oq-save" ${board && grade ? "" : "disabled"}>Let's go! 🚀</button></div>`;
      m.querySelectorAll("[data-b]").forEach(b => b.addEventListener("click", () => { board = b.dataset.b; draw(); }));
      m.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => { grade = Number(b.dataset.g); draw(); }));
      m.querySelector("#oq-save").addEventListener("click", () => {
        write({ board, grade });
        m.remove();
        // reload subject pages so they use the new class
        SUBJECTS.filter(s => s.section).forEach(s => { const f = $(s.section).querySelector("iframe"); if (f.getAttribute("src")) { try { f.contentWindow.location.reload(); } catch (_) { f.removeAttribute("src"); } } });
        renderHome();
      });
    };
    draw();
    document.body.appendChild(m);
  }

  /* ---------- 10. start ---------- */
  refreshXP();
  show("oq-home");
  const d = read();
  if (!d.board || !d.grade) setTimeout(openProfile, 300);
  console.log("🌍 OmniQuest loaded: Chemistry, Maths, Biology, Physics.");
})();
