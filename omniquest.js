/* =========================================
   OMNIQUEST · LEARN EVERYTHING
   - asks board + class every time the site opens
   - top bar with search for ANY topic
   - full topic catalogue for Classes 6-10
   - interactive labs where we have them, AI lessons for everything else
   - the only side button is Verity, the AI tutor
   ========================================= */

(function () {
  "use strict";
  if (window.__omniQuest) return;
  window.__omniQuest = true;

  const sidebar = document.querySelector(".sidebar");
  const main = document.querySelector(".main-content");
  if (!main) return;

  /* ---------- shared progress ---------- */
  const KEY = "omniQuest";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } };
  const write = patch => { const d = Object.assign(read(), patch); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (_) { /* ignore */ } return d; };
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const API = location.protocol === "file:" ? "https://elemental-quest-one.vercel.app/api/verity" : "/api/verity";

  document.title = "OmniQuest | Learn Everything";

  /* ---------- 1. subjects + full topic catalogue ---------- */
  const SUBJECTS = {
    maths: { name: "Maths", color: "#ffb347", blurb: "Numbers, algebra, geometry" },
    phy: { name: "Physics", color: "#a78bfa", blurb: "Forces, energy, electricity" },
    chem: { name: "Chemistry", color: "#55cfff", blurb: "Elements, atoms, reactions" },
    bio: { name: "Biology", color: "#3ddc97", blurb: "Cells, body, living things" }
  };
  // [name, subject, fromClass, toClass, open (an interactive page) or null, extra search words]
  const T = (name, s, a, b, open, kw = "") => ({ name, s, a, b, open, kw: kw.toLowerCase() });
  const CATALOG = [
    T("Periodic Table", "chem", 6, 10, { sec: "periodic-section" }, "elements groups periods mendeleev symbols atomic number families"),
    T("Atomic Structure", "chem", 8, 10, { sec: "atomlab-section" }, "atom proton neutron electron shells isotopes ions bohr atom lab"),
    T("Molecules and Chemical Bonding", "chem", 9, 10, { sec: "atomlab-section" }, "covalent ionic bond molecule water methane atom lab"),
    T("Chemistry Quiz", "chem", 6, 10, { sec: "quiz-section" }, "test practice questions"),
    T("Element Boss Fight", "chem", 6, 10, { sec: "boss-section" }, "game battle guardian"),
    T("Matter and its States", "chem", 6, 9, null, "solid liquid gas particles melting boiling"),
    T("Elements, Compounds and Mixtures", "chem", 6, 9, null, "pure substance"),
    T("Separation of Substances", "chem", 6, 7, null, "filtration evaporation distillation sieving decantation"),
    T("Physical and Chemical Changes", "chem", 6, 8, null, "reversible irreversible rusting"),
    T("Acids, Bases and Salts", "chem", 7, 10, null, "ph indicator litmus neutralisation"),
    T("Water", "chem", 6, 8, null, "water cycle hard soft"),
    T("Air and the Atmosphere", "chem", 6, 8, null, "oxygen nitrogen pollution"),
    T("Combustion and Flame", "chem", 7, 8, null, "fire fuel burning"),
    T("Synthetic Fibres and Plastics", "chem", 8, 8, null, "nylon polyester polymer"),
    T("Coal and Petroleum", "chem", 8, 8, null, "fossil fuels"),
    T("Metals and Non-metals", "chem", 8, 10, null, "reactivity series"),
    T("Chemical Reactions and Equations", "chem", 8, 10, null, "balancing equations reaction types"),
    T("Mole Concept", "chem", 9, 10, null, "avogadro molar mass"),
    T("Carbon and its Compounds", "chem", 9, 10, null, "organic hydrocarbons alkanes"),

    T("Sentence to Equation", "maths", 6, 8, { frame: "oq-maths", tool: "sentence" }, "forming linear equations word problems"),
    T("Solving Linear Equations", "maths", 7, 10, { frame: "oq-maths", tool: "solve" }, "find x balance"),
    T("Quadratic Equations", "maths", 9, 10, { frame: "oq-maths", tool: "quad" }, "roots factorisation graph parabola"),
    T("Maths Boss Battle", "maths", 7, 10, { frame: "oq-maths", tool: "boss" }, "game x-beast"),
    T("Number System", "maths", 6, 9, null, "natural whole rational irrational"),
    T("Integers", "maths", 6, 7, null, "negative numbers"),
    T("Fractions and Decimals", "maths", 6, 7, null, ""),
    T("Ratio and Proportion", "maths", 6, 8, null, "unitary method"),
    T("Percentage", "maths", 7, 8, null, "profit loss discount"),
    T("Algebraic Expressions", "maths", 6, 8, null, "terms like terms variables"),
    T("Exponents and Powers", "maths", 7, 8, null, "indices laws"),
    T("Squares and Square Roots", "maths", 8, 8, null, ""),
    T("Cubes and Cube Roots", "maths", 8, 8, null, ""),
    T("Factorisation", "maths", 8, 9, null, "identities"),
    T("Polynomials", "maths", 9, 10, null, "zeroes degree"),
    T("Linear Equations in Two Variables", "maths", 9, 10, null, "simultaneous equations pair of lines"),
    T("Coordinate Geometry", "maths", 9, 10, null, "x axis y axis distance formula"),
    T("Lines and Angles", "maths", 6, 9, null, "parallel lines transversal"),
    T("Triangles", "maths", 7, 10, null, "congruence similarity"),
    T("Pythagoras Theorem", "maths", 7, 9, null, "right triangle hypotenuse"),
    T("Quadrilaterals", "maths", 8, 9, null, "parallelogram"),
    T("Circles", "maths", 9, 10, null, "chord tangent arc"),
    T("Area and Perimeter", "maths", 6, 8, null, "mensuration"),
    T("Surface Area and Volume", "maths", 8, 10, null, "cube cuboid cylinder cone sphere mensuration"),
    T("Data Handling and Statistics", "maths", 6, 10, null, "mean median mode bar graph"),
    T("Probability", "maths", 8, 10, null, "chance"),
    T("Simple and Compound Interest", "maths", 7, 9, null, "interest"),
    T("Arithmetic Progressions", "maths", 10, 10, null, "ap sequence nth term"),
    T("Trigonometry", "maths", 10, 10, null, "sin cos tan"),

    T("The Cell", "bio", 6, 10, { frame: "oq-bio", tool: "cell" }, "cell structure organelles nucleus plant animal"),
    T("Human Body and Organ Systems", "bio", 6, 10, { frame: "oq-bio", tool: "body" }, "organs heart lungs brain"),
    T("Biology Quiz", "bio", 6, 10, { frame: "oq-bio", tool: "quiz" }, "test practice questions"),
    T("Components of Food", "bio", 6, 7, null, "nutrients vitamins balanced diet deficiency"),
    T("Classification of Living Things", "bio", 6, 9, null, "kingdoms diversity"),
    T("Nutrition in Plants (Photosynthesis)", "bio", 6, 10, null, "chlorophyll"),
    T("Nutrition and Digestion in Animals", "bio", 7, 10, null, "digestive system"),
    T("Respiration", "bio", 7, 10, null, "breathing aerobic anaerobic"),
    T("Transportation in Plants and Animals", "bio", 7, 10, null, "blood circulation xylem phloem heart"),
    T("Excretion", "bio", 7, 10, null, "kidney nephron"),
    T("Reproduction in Plants", "bio", 7, 10, null, "pollination seeds"),
    T("Reproduction in Animals", "bio", 8, 10, null, "fertilisation"),
    T("Microorganisms", "bio", 8, 8, null, "bacteria virus fungi"),
    T("Adolescence", "bio", 8, 8, null, "puberty hormones"),
    T("Tissues", "bio", 9, 9, null, "meristematic epithelial"),
    T("Diseases and Health", "bio", 8, 9, null, "immunity vaccines"),
    T("Control and Coordination", "bio", 9, 10, null, "nervous system brain hormones"),
    T("Heredity and Evolution", "bio", 10, 10, null, "mendel genetics dna"),
    T("Ecosystems and Food Chains", "bio", 6, 10, null, "environment food web"),

    T("Electricity and Circuits", "phy", 6, 10, { frame: "oq-phy", tool: "circuit" }, "current ohm's law resistance conductors insulators"),
    T("Motion and Speed", "phy", 7, 9, { frame: "oq-phy", tool: "motion" }, "distance time graph velocity acceleration"),
    T("Physics Quiz", "phy", 6, 10, { frame: "oq-phy", tool: "quiz" }, "test practice questions"),
    T("Measurement and Units", "phy", 6, 9, null, "si units length"),
    T("Magnets", "phy", 6, 6, null, "poles compass"),
    T("Light: Shadows and Reflection", "phy", 6, 10, null, "mirror"),
    T("Light: Refraction and Lenses", "phy", 10, 10, null, "lens refraction"),
    T("Heat and Temperature", "phy", 7, 9, null, "conduction convection radiation"),
    T("Force and Pressure", "phy", 8, 9, null, ""),
    T("Friction", "phy", 8, 8, null, ""),
    T("Sound", "phy", 8, 9, null, "frequency echo vibration"),
    T("Laws of Motion", "phy", 9, 9, null, "newton inertia momentum"),
    T("Gravitation", "phy", 9, 9, null, "gravity weight mass"),
    T("Work, Energy and Power", "phy", 9, 10, null, "kinetic potential"),
    T("Magnetic Effects of Current", "phy", 10, 10, null, "electromagnet motor"),
    T("The Human Eye", "phy", 10, 10, null, "vision defects"),
    T("Sources of Energy", "phy", 9, 10, null, "renewable solar"),
    T("Stars and the Solar System", "phy", 8, 8, null, "planets moon space")
  ];

  /* ---------- 2. styles ---------- */
  const css = document.createElement("style");
  css.textContent = `
    body .sidebar { display: none !important; }
    body .main-content { margin: 0 auto !important; width: 100% !important; max-width: 1320px; padding: 0 28px 70px !important; }
    .oq-top { position: sticky; top: 0; z-index: 1500; display: flex; align-items: center; gap: 16px; padding: 14px 0; margin-bottom: 18px; background: rgba(15, 23, 38, .9); backdrop-filter: blur(10px); border-bottom: 1px solid #22324a; }
    .oq-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; flex: none; }
    .oq-brand b { font: 700 21px "Fredoka", "Nunito", sans-serif; color: #fff; letter-spacing: .5px; }
    .oq-brand b span { color: #55cfff; }
    .oq-logo { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: linear-gradient(135deg, #55cfff, #a855f7); color: #fff; font-size: 18px; box-shadow: 0 0 18px #55cfff55; }
    .oq-search { position: relative; flex: 1; max-width: 620px; }
    .oq-search input { width: 100%; background: #111a2b; border: 1px solid #334155; border-radius: 12px; padding: 12px 14px 12px 40px; color: #fff; font: 700 15px "Nunito", sans-serif; outline: none; transition: border-color .2s, box-shadow .2s; }
    .oq-search input:focus { border-color: #55cfff; box-shadow: 0 0 0 4px #55cfff22; }
    .oq-search svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); }
    .oq-results { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #131d2f; border: 1px solid #334155; border-radius: 14px; box-shadow: 0 24px 60px #000a; padding: 6px; display: none; max-height: 420px; overflow-y: auto; }
    .oq-results.show { display: block; animation: oqDrop .18s ease-out; }
    @keyframes oqDrop { from { opacity: 0; transform: translateY(-4px); } }
    .oq-res { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: transparent; color: #e2ebf6; text-align: left; padding: 10px 12px; border-radius: 10px; cursor: pointer; font: 700 14.5px "Nunito", sans-serif; }
    .oq-res:hover, .oq-res.on { background: #1f2d45; }
    .oq-res .d { width: 9px; height: 9px; border-radius: 50%; background: var(--c); flex: none; }
    .oq-res .m { margin-left: auto; color: #7d8fa8; font-size: 11.5px; font-weight: 800; white-space: nowrap; }
    .oq-res.ai { border-top: 1px solid #263449; margin-top: 4px; color: #9fdcff; }
    .oq-right { display: flex; align-items: center; gap: 10px; margin-left: auto; flex: none; }
    .oq-pill { display: flex; align-items: center; gap: 8px; background: #111a2b; border: 1px solid #334155; border-radius: 12px; padding: 8px 12px; color: #dbe7f3; font: 800 13px "Nunito", sans-serif; cursor: pointer; }
    .oq-pill:hover { border-color: #55cfff; }
    .oq-xpbar { width: 70px; height: 6px; background: #1e293b; border-radius: 6px; overflow: hidden; }
    .oq-xpbar div { height: 100%; background: linear-gradient(90deg, #55cfff, #a855f7); transition: width .6s; }
    .oq-pill.bump { animation: oqBump .5s; }
    @keyframes oqBump { 40% { transform: scale(1.08); box-shadow: 0 0 18px #55cfff66; } }
    .oq-crumb { display: none; align-items: center; gap: 10px; margin: -4px 0 16px; color: #8195ad; font-weight: 800; font-size: 14px; flex-wrap: wrap; }
    .oq-crumb.show { display: flex; }
    .oq-crumb button { border: 1px solid #334155; background: #1e293b; color: #fff; border-radius: 10px; padding: 7px 12px; font-weight: 800; cursor: pointer; }
    .oq-crumb button:hover { border-color: #55cfff; }
    .oq-crumb .sep { opacity: .5; }
    .oq-crumb .cur { color: #fff; }
    .oq-crumb .lessonbtn { margin-left: auto; }

    .oq-frame { width: 100%; height: calc(100vh - 150px); min-height: 560px; border: 0; display: block; border-radius: 16px; background: transparent; }

    .oq-hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
    .oq-hero h1 { font-size: clamp(26px, 3.2vw, 38px); margin: 0 0 6px; color: #f1f5f9; font-weight: 700; }
    .oq-hero h1 span { color: #55cfff; }
    .oq-label { display: block; color: #8195ad; font-size: 11px; font-weight: 900; letter-spacing: 1.4px; margin-bottom: 6px; }
    .oq-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 22px; }
    .oq-stat { background: linear-gradient(145deg, #1e293b, #172337); border: 1px solid #334155; border-radius: 14px; padding: 13px 16px; }
    .oq-stat span { display: block; color: #8195ad; font-size: 11px; font-weight: 900; letter-spacing: 1.2px; }
    .oq-stat b { font: 700 24px "Fredoka", "Nunito", sans-serif; color: #fff; }
    .oq-tabs { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
    .oq-tab { border: 1px solid #334155; background: #111a2b; color: #b8c6d8; border-radius: 30px; padding: 8px 15px; font: 800 13.5px "Nunito", sans-serif; cursor: pointer; display: flex; align-items: center; gap: 7px; }
    .oq-tab .d { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
    .oq-tab.on { border-color: var(--c, #55cfff); color: #fff; background: #1b2840; }
    .oq-tab:hover { color: #fff; }
    .oq-toggle { margin-left: auto; color: #8195ad; font: 800 13px "Nunito", sans-serif; display: flex; align-items: center; gap: 7px; cursor: pointer; }
    .oq-toggle input { accent-color: #55cfff; }
    .oq-block { margin-bottom: 22px; }
    .oq-block h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 10px; font-size: 20px; color: #fff; }
    .oq-block h2 .bar { width: 4px; height: 20px; border-radius: 4px; background: var(--c); }
    .oq-block h2 small { color: #7d8fa8; font: 800 12px "Nunito", sans-serif; }
    .oq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
    .oq-card { position: relative; text-align: left; border: 1px solid #2c3d53; background: linear-gradient(160deg, #1b2639, #141e30); color: #e2ebf6; border-radius: 13px; padding: 13px 14px; cursor: pointer; transition: border-color .2s, transform .2s, box-shadow .2s; font: 800 14.5px "Nunito", sans-serif; }
    .oq-card:hover { border-color: var(--c); transform: translateY(-2px); box-shadow: 0 10px 24px #0005; }
    .oq-card small { display: flex; gap: 8px; margin-top: 6px; font-size: 10.5px; letter-spacing: 1px; color: #7d8fa8; }
    .oq-card .lab { color: var(--c); }
    .oq-card .rec { color: #45e2a1; }
    .oq-empty { color: #8195ad; font-weight: 700; }

    .oq-lesson { max-width: 900px; }
    .oq-lesson h1 { font-size: clamp(26px, 3.4vw, 40px); margin: 4px 0 8px; color: #fff; }
    .oq-lesson .lead { font-size: 17px; color: #c8d5e5; line-height: 1.65; margin: 0 0 18px; }
    .oq-sec { background: linear-gradient(160deg, #1b2639, #141e30); border: 1px solid #2c3d53; border-radius: 16px; padding: 18px 20px; margin-bottom: 12px; animation: oqUp .45s ease-out both; }
    @keyframes oqUp { from { opacity: 0; transform: translateY(10px); } }
    .oq-sec h3 { margin: 0 0 8px; color: #fff; font-size: 18px; }
    .oq-sec p { margin: 0; color: #c8d5e5; line-height: 1.7; font-size: 15px; white-space: pre-line; }
    .oq-keys { list-style: none; padding: 0; margin: 0; display: grid; gap: 7px; }
    .oq-keys li { padding-left: 18px; position: relative; color: #dbe7f3; line-height: 1.55; }
    .oq-keys li::before { content: ""; position: absolute; left: 2px; top: 8px; width: 7px; height: 7px; border-radius: 2px; background: var(--c, #55cfff); }
    .oq-q { margin-bottom: 14px; }
    .oq-q p { font-weight: 800; color: #fff; margin: 0 0 8px; }
    .oq-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .oq-opt { text-align: left; border: 1px solid #334155; background: #111a2b; color: #e2ebf6; border-radius: 10px; padding: 10px 12px; font: 700 14px "Nunito", sans-serif; cursor: pointer; }
    .oq-opt:hover:not(:disabled) { border-color: #55cfff; }
    .oq-opt.right { border-color: #25c58a; background: #10392e; }
    .oq-opt.wrong { border-color: #f07883; background: #3d1c25; }
    .oq-opt:disabled { cursor: default; }
    .oq-exp { margin-top: 8px; color: #b8c6d8; font-size: 13.5px; line-height: 1.55; display: none; }
    .oq-exp.show { display: block; }
    .oq-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
    .oq-btn { border: 1px solid #334155; background: #1e293b; color: #fff; border-radius: 11px; padding: 10px 16px; font: 800 14px "Nunito", sans-serif; cursor: pointer; }
    .oq-btn:hover { border-color: #55cfff; }
    .oq-btn.primary { background: #55cfff; color: #04202e; border-color: #55cfff; }
    .oq-loading { display: flex; align-items: center; gap: 14px; padding: 26px; color: #c8d5e5; font-weight: 800; background: #172337; border: 1px solid #2c3d53; border-radius: 16px; }
    .oq-dots span { display: inline-block; width: 9px; height: 9px; margin-right: 4px; border-radius: 50%; background: #55cfff; animation: oqDot 1s infinite ease-in-out; }
    .oq-dots span:nth-child(2) { animation-delay: .15s; } .oq-dots span:nth-child(3) { animation-delay: .3s; }
    @keyframes oqDot { 50% { transform: translateY(-7px); opacity: .5; } }

    .oq-modal { position: fixed; inset: 0; z-index: 3000; background: rgba(5, 9, 18, .84); backdrop-filter: blur(6px); display: grid; place-items: center; padding: 16px; animation: oqFade .25s; }
    @keyframes oqFade { from { opacity: 0; } }
    .oq-dialog { width: min(560px, 100%); background: linear-gradient(160deg, #1e293b, #131c2e); border: 1px solid #334155; border-radius: 18px; padding: 28px; box-shadow: 0 30px 80px #000a; animation: oqPop .3s ease-out; }
    @keyframes oqPop { from { transform: scale(.94); opacity: 0; } }
    .oq-dialog h2 { margin: 4px 0 4px; font-size: 26px; color: #fff; }
    .oq-dialog p { color: #9aabc0; margin: 0 0 18px; }
    .oq-choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(92px, 1fr)); gap: 9px; margin-bottom: 18px; }
    .oq-choice { border: 1.5px solid #334155; background: #111a2b; color: #fff; border-radius: 12px; padding: 13px 8px; font: 900 15px "Nunito", sans-serif; cursor: pointer; transition: all .2s; }
    .oq-choice small { display: block; color: #8195ad; font-size: 10.5px; margin-top: 3px; font-weight: 800; }
    .oq-choice:hover { border-color: #55cfff; }
    .oq-choice.on { border-color: #55cfff; background: #20334a; box-shadow: 0 0 16px #55cfff33; }
    .oq-go { border: 0; border-radius: 12px; padding: 12px 26px; font: 900 15px "Nunito", sans-serif; color: #04202e; background: #55cfff; cursor: pointer; }
    .oq-go:disabled { opacity: .4; cursor: default; }

    .oq-center { min-height: calc(100vh - 160px); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4px; padding-bottom: 30px; }
    .oq-center h1 { font-size: clamp(30px, 4.4vw, 52px); margin: 6px 0 22px; color: #f1f5f9; font-weight: 700; }
    .oq-center h1 span { color: #55cfff; }
    .oq-slot { width: min(720px, 100%); }
    .oq-slot .oq-search { max-width: none; }
    .oq-slot .oq-search input { padding: 18px 18px 18px 50px; font-size: 18px; border-radius: 16px; box-shadow: 0 18px 50px #0006; }
    .oq-slot .oq-search svg { left: 18px; width: 21px; height: 21px; }
    .oq-try { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 16px 0 34px; color: #7d8fa8; font: 800 13px "Nunito", sans-serif; align-items: center; }
    .oq-try button { border: 1px solid #334155; background: #131d2f; color: #c8d5e5; border-radius: 30px; padding: 7px 14px; font: 700 13px "Nunito", sans-serif; cursor: pointer; }
    .oq-try button:hover { border-color: #55cfff; color: #fff; }
    .oq-subjects4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; width: min(980px, 100%); }
    .oq-subj { position: relative; text-align: left; border: 1px solid #2c3d53; background: linear-gradient(160deg, #1b2639, #141e30); color: #fff; border-radius: 16px; padding: 18px 18px 16px; cursor: pointer; overflow: hidden; transition: transform .2s, border-color .2s, box-shadow .2s; }
    .oq-subj::before { content: ""; position: absolute; left: 0; top: 0; right: 0; height: 3px; background: var(--c); }
    .oq-subj:hover { transform: translateY(-3px); border-color: var(--c); box-shadow: 0 14px 34px #0006; }
    .oq-subj b { display: block; font: 700 21px "Fredoka", "Nunito", sans-serif; margin-bottom: 4px; }
    .oq-subj span { color: #8aa0b8; font: 700 12.5px "Nunito", sans-serif; }
    .oq-subj i { position: absolute; right: 16px; top: 18px; font-style: normal; color: var(--c); font-weight: 900; transition: transform .2s; }
    .oq-subj:hover i { transform: translateX(4px); }
    .oq-subhead { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
    .oq-subhead h1 { margin: 2px 0 4px; font-size: clamp(28px, 3.4vw, 40px); color: #fff; }
    .oq-subhead p { margin: 0; color: #8aa0b8; font-weight: 700; font-size: 14px; }
    .oq-subhead p .ok { color: #45e2a1; }
    .oq-filter { background: #111a2b; border: 1px solid #334155; border-radius: 12px; padding: 11px 14px; color: #fff; font: 700 14px "Nunito", sans-serif; outline: none; min-width: 260px; }
    .oq-filter:focus { border-color: var(--c, #55cfff); }
    .oq-labs { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
    .oq-labs .oq-label { margin: 0 6px 0 0; }
    .oq-labbtn { border: 1px solid var(--c); background: color-mix(in srgb, var(--c) 12%, #111a2b); color: #fff; border-radius: 10px; padding: 8px 13px; font: 800 13px "Nunito", sans-serif; cursor: pointer; }
    .oq-labbtn:hover { background: color-mix(in srgb, var(--c) 25%, #111a2b); }
    .oq-chapters { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .oq-ch { background: linear-gradient(160deg, #1b2639, #141e30); border: 1px solid #2c3d53; border-radius: 14px; padding: 14px 16px; animation: oqUp .35s ease-out both; }
    .oq-ch-top { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .oq-ch-top:hover b { color: var(--c); }
    .oq-ch-top .n { width: 28px; height: 28px; flex: none; border-radius: 8px; display: grid; place-items: center; background: color-mix(in srgb, var(--c) 18%, #0f1828); color: var(--c); font: 800 13px "Nunito", sans-serif; }
    .oq-ch-top b { font: 800 15.5px "Nunito", sans-serif; color: #fff; transition: color .2s; }
    .oq-ch-top .lab { margin-left: auto; border: 1px solid var(--c); color: var(--c); background: transparent; border-radius: 8px; padding: 3px 8px; font: 900 10.5px "Nunito", sans-serif; letter-spacing: 1px; cursor: pointer; }
    .oq-subs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .oq-subs button { border: 1px solid #2c3d53; background: #111a2b; color: #c8d5e5; border-radius: 20px; padding: 5px 11px; font: 700 12.5px "Nunito", sans-serif; cursor: pointer; }
    .oq-subs button:hover { border-color: var(--c); color: #fff; }
    .oq-note { color: #7d8fa8; font-size: 12.5px; font-weight: 700; margin-top: 14px; }
    .oq-hook { font-size: 18px; color: #fff; font-weight: 700; margin: 0 0 6px; }
    .oq-funfact { border-left: 3px solid #ffb347; }
    @media (max-width: 900px) { .oq-subjects4 { grid-template-columns: repeat(2, 1fr); } .oq-chapters { grid-template-columns: 1fr; } }
    @media (max-width: 900px) { .oq-stats { grid-template-columns: repeat(2, 1fr); } .oq-opts { grid-template-columns: 1fr; } }
    @media (max-width: 680px) {
      body .main-content { padding: 0 12px 60px !important; }
      .oq-top { flex-wrap: wrap; gap: 10px; }
      .oq-search { order: 3; flex-basis: 100%; max-width: none; }
      .oq-xpbar { display: none; }
      .oq-frame { height: calc(100vh - 190px); }
    }
  `;
  document.head.appendChild(css);

  /* ---------- 3. top bar + breadcrumb ---------- */
  const top = document.createElement("div");
  top.className = "oq-top";
  top.innerHTML = `
    <div class="oq-brand" id="oq-brand"><span class="oq-logo">✦</span><b>Omni<span>Quest</span></b></div>
    <div class="oq-search">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7d8fa8" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input id="oq-q" type="search" placeholder="Search any topic: periodic table, photosynthesis, Ohm's law…" autocomplete="off" aria-label="Search topics">
      <div class="oq-results" id="oq-results"></div>
    </div>
    <div class="oq-right">
      <div class="oq-pill" id="oq-xp" title="Your level and XP"></div>
      <button type="button" class="oq-pill" id="oq-prof" title="Change board or class"></button>
    </div>`;
  const crumb = document.createElement("div");
  crumb.className = "oq-crumb";
  crumb.id = "oq-crumb";
  main.prepend(crumb);
  main.prepend(top);

  /* ---------- 4. page sections ---------- */
  const home = document.createElement("section");
  home.id = "oq-home";
  home.className = "page-section";
  crumb.insertAdjacentElement("afterend", home);
  const FRAMES = { "oq-maths": "maths.html?embed=1", "oq-bio": "science.html?subject=biology&embed=1", "oq-phy": "science.html?subject=physics&embed=1" };
  Object.keys(FRAMES).forEach(id => {
    const sec = document.createElement("section");
    sec.id = id;
    sec.className = "page-section";
    sec.innerHTML = `<iframe class="oq-frame" title="${id}" loading="lazy"></iframe>`;
    main.appendChild(sec);
  });
  const subjPage = document.createElement("section");
  subjPage.id = "oq-subject";
  subjPage.className = "page-section";
  main.appendChild(subjPage);
  const lesson = document.createElement("section");
  lesson.id = "oq-lesson";
  lesson.className = "page-section";
  main.appendChild(lesson);

  /* ---------- 5. navigation ---------- */
  let current = { page: "Dashboard" };
  function activate(id) {
    if (id !== "oq-home" && typeof placeSearch === "function") placeSearch(false);
    document.querySelectorAll(".page-section").forEach(s => s.classList.toggle("active", s.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function setCrumb(topic) {
    if (!topic) { crumb.classList.remove("show"); return; }
    const subj = SUBJECTS[topic.s] || { name: "Topic" };
    crumb.innerHTML = `<button type="button" id="oq-back">← Dashboard</button>${topic.s && SUBJECTS[topic.s] && topic.name !== subj.name ? `<a href="#" id="oq-crumb-subj" style="color:#8aa0b8">${esc(subj.name)}</a><span class="sep">/</span>` : ""}<span class="cur">${esc(topic.name)}</span>
      ${topic.open ? `<button type="button" class="lessonbtn" id="oq-readlesson">Read the lesson</button>` : (topic.lab ? `<button type="button" class="lessonbtn" id="oq-openlab">Open the interactive lab</button>` : "")}`;
    crumb.classList.add("show");
    $("oq-back").addEventListener("click", goHome);
    if ($("oq-crumb-subj")) $("oq-crumb-subj").addEventListener("click", e => { e.preventDefault(); openSubject(topic.s); });
    if ($("oq-readlesson")) $("oq-readlesson").addEventListener("click", () => openLesson(topic, true));
    if ($("oq-openlab")) $("oq-openlab").addEventListener("click", () => openTopic(topic.lab));
  }
  const searchBox = top.querySelector(".oq-search");
  function placeSearch(onHome) {
    const slot = $("oq-slot");
    if (onHome && slot) slot.appendChild(searchBox);
    else if (searchBox.parentElement !== top) top.insertBefore(searchBox, top.querySelector(".oq-right"));
  }
  function goHome() {
    current = { page: "Dashboard" };
    setCrumb(null);
    renderHome();
    activate("oq-home");
    placeSearch(true);
  }
  function openTopic(t) {
    if (!t.open) return openLesson(t);
    current = { page: `${SUBJECTS[t.s].name} > ${t.name}` };
    setCrumb(t);
    if (t.open.sec) {
      activate(t.open.sec);
      if (t.open.sec === "atomlab-section") document.querySelector('.nav-button[data-section="atomlab-section"]')?.click();
      activate(t.open.sec);
      return;
    }
    const frame = $(t.open.frame).querySelector("iframe");
    const want = `${FRAMES[t.open.frame]}#${t.open.tool || ""}`;
    if (!frame.getAttribute("src")) frame.setAttribute("src", want); else frame.src = want;
    activate(t.open.frame);
  }
  top.querySelector("#oq-brand").addEventListener("click", goHome);

  /* ---------- 6. search ---------- */
  const q = $("oq-q"), box = $("oq-results");
  let hits = [], sel = -1;
  function search(text) {
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const g = Number(read().grade) || 7;
    const pool = CATALOG.filter(t => t.open || (g >= t.a && g <= t.b) || true).map(t => ({ name: t.name, s: t.s, kw: t.kw, cat: t, a: t.a, b: t.b }));
    Object.keys(SUBJECTS).forEach(sk => {
      const syl = sylCached(sk);
      if (!syl) return;
      syl.chapters.forEach((c, i) => {
        pool.push({ name: c.name, s: sk, kw: c.subtopics.join(" ").toLowerCase(), chapterNo: i + 1, syl: true });
        c.subtopics.forEach(t => pool.push({ name: t, s: sk, kw: c.name.toLowerCase(), inChapter: c.name, syl: true }));
      });
    });
    const seen = new Set();
    return pool.map(t => {
      const name = t.name.toLowerCase(), all = `${name} ${t.kw} ${SUBJECTS[t.s].name.toLowerCase()}`;
      if (!words.every(w => all.includes(w))) return null;
      let score = name.startsWith(words[0]) ? 3 : name.includes(words.join(" ")) ? 2 : words.some(w => name.includes(w)) ? 1 : 0;
      if (t.syl) score += .6;
      if (t.cat && t.cat.open) score += .4;
      if (t.cat && !(g >= t.a && g <= t.b)) score -= .5;
      return { t, score };
    }).filter(Boolean).sort((x, y) => y.score - x.score).filter(x => { const k = x.t.name.toLowerCase() + x.t.s; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 9).map(x => x.t);
  }
  function drawResults() {
    const text = q.value.trim();
    if (!text) { box.classList.remove("show"); return; }
    hits = search(text);
    const word = read().board === "IGCSE" ? "Grade" : "Class";
    const meta = t => t.cat ? `${t.cat.open ? "Interactive" : "Lesson"} · ${word} ${t.a}${t.b > t.a ? `–${t.b}` : ""}` : t.chapterNo ? `Chapter ${t.chapterNo}` : `in ${esc(t.inChapter)}`;
    box.innerHTML = hits.map((t, i) => `<button type="button" class="oq-res ${i === sel ? "on" : ""}" style="--c:${SUBJECTS[t.s].color}" data-i="${i}"><span class="d"></span>${esc(t.name)}<span class="m">${SUBJECTS[t.s].name} · ${meta(t)}</span></button>`).join("") +
      `<button type="button" class="oq-res ai ${sel === hits.length ? "on" : ""}" data-i="ai">✦ Ask Verity to teach me: "${esc(text)}"</button>`;
    box.classList.add("show");
    box.querySelectorAll(".oq-res").forEach(b => b.addEventListener("mousedown", e => { e.preventDefault(); choose(b.dataset.i); }));
  }
  function choose(i) {
    const text = q.value.trim();
    box.classList.remove("show");
    q.blur();
    if (i === "ai" || i === undefined || i === null) { if (text) openLesson({ name: text, s: guessSubject(text), custom: true }); }
    else {
      const h = hits[Number(i)];
      if (h.cat) openTopic(h.cat);
      else openLesson({ name: h.name, s: h.s, inChapter: h.inChapter, chapter: !!h.chapterNo });
    }
    q.value = ""; sel = -1;
  }
  function guessSubject(text) {
    const t = text.toLowerCase();
    if (/(equation|algebra|fraction|angle|triangle|geometry|number|percent|ratio|area|volume|graph|probab|trig|integer|decimal|maths?|calcul)/.test(t)) return "maths";
    if (/(cell|plant|animal|body|organ|blood|heart|digest|gene|dna|photosynth|disease|bacteria|virus|ecosystem|evolution|biolog)/.test(t)) return "bio";
    if (/(force|motion|speed|energy|light|sound|electric|current|magnet|gravity|heat|wave|lens|mirror|physic|newton)/.test(t)) return "phy";
    if (/(atom|element|acid|base|salt|reaction|compound|metal|chemi|molecule|bond|mole|carbon)/.test(t)) return "chem";
    return null;
  }
  q.addEventListener("input", () => { sel = -1; drawResults(); });
  q.addEventListener("focus", drawResults);
  q.addEventListener("blur", () => setTimeout(() => box.classList.remove("show"), 120));
  q.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { sel = Math.min(hits.length, sel + 1); drawResults(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = Math.max(0, sel - 1); drawResults(); e.preventDefault(); }
    else if (e.key === "Enter") { e.preventDefault(); choose(sel === -1 ? (hits.length ? 0 : "ai") : sel === hits.length ? "ai" : sel); }
    else if (e.key === "Escape") { box.classList.remove("show"); q.blur(); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") { e.preventDefault(); q.focus(); }
  });

  /* ---------- 7. XP + profile pills ---------- */
  let lastXP = null;
  function refreshTop() {
    const d = read(), xp = d.xp || 0;
    $("oq-xp").innerHTML = `<span>Lv ${Math.floor(xp / 100) + 1}</span><span class="oq-xpbar"><div style="width:${xp % 100}%"></div></span><span>${xp} XP</span>`;
    $("oq-prof").textContent = `${d.board || "Board"} · ${d.board === "IGCSE" ? "Grade" : "Class"} ${d.grade || "?"}`;
    if (lastXP !== null && xp > lastXP) { const p = $("oq-xp"); p.classList.remove("bump"); void p.offsetWidth; p.classList.add("bump"); }
    lastXP = xp;
    if ($("oq-stats")) renderStats();
  }
  function giveXP(n) { const d = read(); write({ xp: (d.xp || 0) + n, solved: (d.solved || 0) + 1 }); refreshTop(); }
  $("oq-prof").addEventListener("click", openProfile);
  window.addEventListener("message", e => { if (e.data && e.data.oq === "xp") refreshTop(); });
  window.addEventListener("storage", e => { if (e.key === KEY) refreshTop(); });
  document.addEventListener("click", e => {
    const b = e.target.closest("#quiz-options .quiz-option, #boss-options .answer-option");
    if (!b || b.dataset.oqDone) return;
    setTimeout(() => { if (b.classList.contains("correct")) { b.dataset.oqDone = "1"; giveXP(10); } }, 0);
  });

  /* ---------- 8. dashboard ---------- */
  let filter = "all", showAll = false;
  const FACTS = [
    "Gold is so soft it can be hammered into sheets thinner than a human hair.",
    "Your body makes about 2 million new red blood cells every second.",
    "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
    "Indian mathematicians such as Brahmagupta used zero as a number in 628 CE.",
    "Octopuses have three hearts and blue blood.",
    "Sound travels about four times faster in water than in air.",
    "Water expands when it freezes, which is why ice floats.",
    "A googol is 1 followed by 100 zeros."
  ];

  const EXAMPLES = ["Photosynthesis", "Periodic table", "Ohm's law", "Linear equations", "Human heart", "Acids and bases", "Fractions", "Newton's laws", "Quadratic equations", "Food chains", "Magnets", "Pythagoras theorem"];
  function renderHome() {
    const d = read(), g = Number(d.grade) || 7, word = d.board === "IGCSE" ? "Grade" : "Class";
    const tries = EXAMPLES.slice().sort(() => Math.random() - .5).slice(0, 4);
    home.innerHTML = `<div class="oq-center">
      <span class="oq-label">${esc(d.board || "")} · ${word.toUpperCase()} ${g}</span>
      <h1>What do you want to <span>learn</span> today?</h1>
      <div class="oq-slot" id="oq-slot"></div>
      <div class="oq-try">Try: ${tries.map(t => `<button type="button" data-try="${esc(t)}">${esc(t)}</button>`).join("")}</div>
      <div class="oq-subjects4">${Object.entries(SUBJECTS).map(([k, s]) => `<button type="button" class="oq-subj" style="--c:${s.color}" data-subj="${k}"><i>→</i><b>${s.name}</b><span>${s.blurb}</span></button>`).join("")}</div>
    </div>`;
    if (home.classList.contains("active") || !document.querySelector(".page-section.active")) placeSearch(true);
    home.querySelectorAll("[data-try]").forEach(b => b.addEventListener("click", () => { q.value = b.dataset.try; q.focus(); drawResults(); }));
    home.querySelectorAll("[data-subj]").forEach(b => b.addEventListener("click", () => openSubject(b.dataset.subj)));
  }
  function renderStats() { /* stats now live in the top bar */ }

  /* ---------- 8b. syllabus: chapters + subtopics for your board and class ---------- */
  const SKEY = "omniQuestSyllabus";
  const pending = {};
  const sylKey = sk => { const d = read(); return `${d.board || "CBSE"}|${Number(d.grade) || 7}|${SUBJECTS[sk].name}`; };
  const sylCached = sk => { try { return (JSON.parse(localStorage.getItem(SKEY)) || {})[sylKey(sk)] || null; } catch (_) { return null; } };
  function getSyllabus(sk) {
    const cached = sylCached(sk);
    if (cached) return Promise.resolve(cached);
    const key = sylKey(sk);
    if (pending[key]) return pending[key];
    pending[key] = fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "syllabus", subject: SUBJECTS[sk].name, message: "syllabus" }) })
      .then(r => r.json().then(j => ({ ok: r.ok, j })).catch(() => ({ ok: false, j: {} })))
      .then(({ ok, j }) => {
        delete pending[key];
        if (!ok || !j.syllabus) throw new Error(j.error || "Couldn't load the chapters right now.");
        try { const all = JSON.parse(localStorage.getItem(SKEY)) || {}; all[key] = j.syllabus; localStorage.setItem(SKEY, JSON.stringify(all)); } catch (_) { /* ignore */ }
        return j.syllabus;
      }, err => { delete pending[key]; throw err; });
    return pending[key];
  }
  function prefetchAll() {
    Object.keys(SUBJECTS).forEach((sk, i) => setTimeout(() => { if (!sylCached(sk)) getSyllabus(sk).catch(() => {}); }, 400 + i * 1500));
  }
  // Which interactive lab fits a chapter or subtopic?
  function labFor(text, sk) {
    const t = text.toLowerCase(), g = Number(read().grade) || 7, find = n => CATALOG.find(x => x.name === n);
    if (sk === "maths") {
      if (/quadratic/.test(t)) return find("Quadratic Equations");
      if (/(linear equation|finding the unknown|simple (linear )?equation|equations? in one variable|algebra play|forming equations)/.test(t)) return find(g <= 8 ? "Sentence to Equation" : "Solving Linear Equations");
    }
    if (sk === "chem") {
      if (/periodic/.test(t)) return find("Periodic Table");
      if (/(atom|isotope|electron configuration)/.test(t)) return find("Atomic Structure");
      if (/(bond|molecule)/.test(t)) return find("Molecules and Chemical Bonding");
    }
    if (sk === "bio") {
      if (/\bcells?\b|cell structure|unit of life/.test(t)) return find("The Cell");
      if (/(human body|organ system|digest|circulat|respirat|excret|nervous|heart|lungs)/.test(t)) return find("Human Body and Organ Systems");
    }
    if (sk === "phy") {
      if (/(electric|current|circuit|ohm)/.test(t)) return find("Electricity and Circuits");
      if (/(motion|speed|velocity)/.test(t)) return find("Motion and Speed");
    }
    return null;
  }
  async function openSubject(sk) {
    const s = SUBJECTS[sk], d = read(), g = Number(d.grade) || 7, word = d.board === "IGCSE" ? "Grade" : "Class";
    current = { page: `${s.name} (chapters)` };
    setCrumb({ name: s.name, s: sk });
    activate("oq-subject");
    subjPage.style.setProperty("--c", s.color);
    const labs = CATALOG.filter(t => t.s === sk && t.open && g >= t.a && g <= t.b);
    const head = book => `<div class="oq-subhead"><div><span class="oq-label">${esc(d.board || "")} · ${word.toUpperCase()} ${g}</span><h1>${s.name}</h1><p>${book}</p></div><input class="oq-filter" id="oq-filter" type="search" placeholder="Filter chapters and subtopics…"></div>
      ${labs.length ? `<div class="oq-labs" style="--c:${s.color}"><span class="oq-label">INTERACTIVE</span>${labs.map(t => `<button type="button" class="oq-labbtn" data-lab="${CATALOG.indexOf(t)}">${esc(t.name)}</button>`).join("")}</div>` : ""}`;
    const bindLabs = () => subjPage.querySelectorAll("[data-lab]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); openTopic(CATALOG[b.dataset.lab]); }));
    subjPage.innerHTML = head("Loading your chapters…") + `<div class="oq-loading"><span class="oq-dots"><span></span><span></span><span></span></span>Verity is fetching your ${s.name} chapters…</div>`;
    bindLabs();
    let syl;
    try { syl = await getSyllabus(sk); } catch (err) {
      if (current.page !== `${s.name} (chapters)`) return;
      subjPage.querySelector(".oq-loading").outerHTML = `<div class="oq-sec"><h3>Chapters not available</h3><p>${esc(err.message)}</p><div class="oq-actions"><button type="button" class="oq-btn primary" id="oq-sretry">Try again</button></div></div>`;
      $("oq-sretry").addEventListener("click", () => openSubject(sk));
      return;
    }
    if (current.page !== `${s.name} (chapters)`) return;
    subjPage.innerHTML = head(`${esc(syl.book || "")} · ${syl.chapters.length} chapters ${syl.verified ? '<span class="ok">● checked against the official book</span>' : ""}`) +
      `<div class="oq-chapters" id="oq-chs">${syl.chapters.map((c, i) => {
        const lab = labFor(c.name + " " + c.subtopics.join(" "), sk);
        return `<div class="oq-ch" style="animation-delay:${Math.min(i, 12) * .03}s" data-text="${esc((c.name + " " + c.subtopics.join(" ")).toLowerCase())}">
          <div class="oq-ch-top" data-ch="${i}"><span class="n">${i + 1}</span><b>${esc(c.name)}</b>${lab ? `<button type="button" class="lab" data-lab="${CATALOG.indexOf(lab)}">LAB</button>` : ""}</div>
          <div class="oq-subs">${c.subtopics.map((t, k) => `<button type="button" data-ch="${i}" data-sub="${k}">${esc(t)}</button>`).join("")}</div></div>`;
      }).join("")}</div>
      ${syl.verified ? "" : `<p class="oq-note">This chapter list was put together by Verity for your board and class. Your school's textbook may name or order chapters a little differently.</p>`}`;
    bindLabs();
    subjPage.querySelectorAll(".oq-ch-top").forEach(el => el.addEventListener("click", () => {
      const c = syl.chapters[el.dataset.ch];
      openLesson({ name: c.name, s: sk, chapter: true });
    }));
    subjPage.querySelectorAll(".oq-subs button").forEach(b => b.addEventListener("click", () => {
      const c = syl.chapters[b.dataset.ch];
      openLesson({ name: c.subtopics[b.dataset.sub], s: sk, inChapter: c.name });
    }));
    $("oq-filter").addEventListener("input", e => {
      const v = e.target.value.trim().toLowerCase();
      subjPage.querySelectorAll(".oq-ch").forEach(ch => { ch.style.display = !v || ch.dataset.text.includes(v) ? "" : "none"; });
    });
  }

  /* ---------- 9. AI lessons (written by Verity for your board + class) ---------- */
  const LKEY = "omniQuestLessons";
  const cacheGet = k => { try { return (JSON.parse(localStorage.getItem(LKEY)) || {})[k]; } catch (_) { return null; } };
  const cachePut = (k, v) => {
    try {
      const all = JSON.parse(localStorage.getItem(LKEY)) || {};
      all[k] = v;
      const keys = Object.keys(all);
      if (keys.length > 40) delete all[keys[0]];
      localStorage.setItem(LKEY, JSON.stringify(all));
    } catch (_) { /* ignore */ }
  };
  async function openLesson(t, fromLab, refresh) {
    const d = read(), g = Number(d.grade) || 7, word = d.board === "IGCSE" ? "Grade" : "Class";
    const subj = SUBJECTS[t.s] || { name: "General", color: "#55cfff" };
    const lab = t.open ? t : (CATALOG.find(x => x.open && x.s === t.s && x.name.toLowerCase() === t.name.toLowerCase()) || (t.s ? labFor(`${t.name} ${t.inChapter || ""}`, t.s) : null));
    current = { page: `${subj.name} > ${t.name} (lesson)` };
    setCrumb({ name: t.name, s: t.s, lab: lab && lab.open ? lab : null });
    activate("oq-lesson");
    lesson.style.setProperty("--c", subj.color);
    lesson.innerHTML = `<div class="oq-lesson"><span class="oq-label">${subj.name.toUpperCase()} · ${esc(d.board || "")} ${word.toUpperCase()} ${g}</span><h1>${esc(t.name)}</h1>
      <div class="oq-loading"><span class="oq-dots"><span></span><span></span><span></span></span>Verity is writing your lesson…</div></div>`;
    const fullTopic = t.inChapter ? `${t.name} (from the chapter "${t.inChapter}")` : t.name;
    const key = `${fullTopic.toLowerCase()}|${g}|${d.board || ""}`;
    let data = refresh ? null : cacheGet(key);
    if (!data) {
      try {
        const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "lesson", topic: fullTopic, subject: subj.name, message: t.name }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.lesson) throw new Error(j.error || "Verity couldn't write this lesson right now.");
        data = j.lesson;
        cachePut(key, data);
      } catch (err) {
        lesson.querySelector(".oq-loading").outerHTML = `<div class="oq-sec"><h3>Lesson not available</h3><p>${esc(err.message)}</p><div class="oq-actions"><button type="button" class="oq-btn primary" id="oq-retry">Try again</button></div></div>`;
        $("oq-retry").addEventListener("click", () => openLesson(t, fromLab, true));
        return;
      }
    }
    if (current.page !== `${subj.name} > ${t.name} (lesson)`) return;
    const related = CATALOG.filter(x => x.s === t.s && x.open && x.name !== t.name && g >= x.a && g <= x.b).slice(0, 4);
    lesson.innerHTML = `<div class="oq-lesson">
      <span class="oq-label">${subj.name.toUpperCase()} · ${esc(d.board || "")} ${word.toUpperCase()} ${g}</span>
      <h1>${esc(data.title || t.name)}</h1>
      ${t.inChapter ? `<span class="oq-label">CHAPTER: ${esc(t.inChapter).toUpperCase()}</span>` : ""}
      ${data.hook ? `<p class="oq-hook">${esc(data.hook)}</p>` : ""}
      <p class="lead">${esc(data.summary || "")}</p>
      ${(data.sections || []).map((s, i) => `<div class="oq-sec" style="animation-delay:${i * .08}s"><h3>${esc(s.heading)}</h3><p>${esc(s.text)}</p></div>`).join("")}
      ${data.keyPoints && data.keyPoints.length ? `<div class="oq-sec"><span class="oq-label">KEY POINTS</span><ul class="oq-keys">${data.keyPoints.map(k => `<li>${esc(k)}</li>`).join("")}</ul></div>` : ""}
      ${data.funFact ? `<div class="oq-sec oq-funfact"><span class="oq-label">FUN FACT</span><p>${esc(data.funFact)}</p></div>` : ""}
      ${data.quiz && data.quiz.length ? `<div class="oq-sec"><span class="oq-label">QUICK CHECK · +10 XP EACH</span>${data.quiz.map((qq, i) => `<div class="oq-q" data-q="${i}"><p>${i + 1}. ${esc(qq.q)}</p><div class="oq-opts">${qq.options.map((o, k) => `<button type="button" class="oq-opt" data-k="${k}">${esc(o)}</button>`).join("")}</div><div class="oq-exp">${esc(qq.explain || "")}</div></div>`).join("")}</div>` : ""}
      <div class="oq-actions">
        <button type="button" class="oq-btn primary" id="oq-ask">Ask Verity a question about this</button>
        ${lab && lab.open ? `<button type="button" class="oq-btn" id="oq-lab">Open the interactive lab</button>` : ""}
        <button type="button" class="oq-btn" id="oq-new">Write it again</button>
      </div>
      ${t.s ? `<div class="oq-actions"><button type="button" class="oq-btn" id="oq-allch">See all ${subj.name} chapters</button></div>` : ""}
      ${related.length ? `<div class="oq-block" style="margin-top:22px"><span class="oq-label">INTERACTIVE LABS</span><div class="oq-grid">${related.map(x => `<button type="button" class="oq-card" style="--c:${subj.color}" data-t="${CATALOG.indexOf(x)}">${esc(x.name)}<small><span class="${x.open ? "lab" : ""}">${x.open ? "INTERACTIVE" : "LESSON"}</span></small></button>`).join("")}</div></div>` : ""}
    </div>`;
    lesson.querySelectorAll(".oq-q").forEach(box => {
      const qq = data.quiz[box.dataset.q];
      box.querySelectorAll(".oq-opt").forEach(b => b.addEventListener("click", () => {
        const k = Number(b.dataset.k);
        box.querySelectorAll(".oq-opt").forEach(x => { x.disabled = true; if (Number(x.dataset.k) === qq.answer) x.classList.add("right"); });
        if (k === qq.answer) giveXP(10); else b.classList.add("wrong");
        box.querySelector(".oq-exp").classList.add("show");
      }));
    });
    $("oq-ask").addEventListener("click", () => {
      const win = $("chatbot-window"), input = $("chatbot-input");
      if (win && !win.classList.contains("open")) $("chatbot-toggle")?.click();
      if (input) { input.value = `Can you explain more about ${t.name}?`; input.focus(); }
    });
    if ($("oq-lab")) $("oq-lab").addEventListener("click", () => openTopic(lab));
    if ($("oq-allch")) $("oq-allch").addEventListener("click", () => openSubject(t.s));
    $("oq-new").addEventListener("click", () => openLesson(t, fromLab, true));
    lesson.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => openTopic(CATALOG[b.dataset.t])));
  }

  /* ---------- 10. board + class: asked every time the site opens ---------- */
  function openProfile() {
    const d = read();
    let board = d.board || null, grade = Number(d.grade) || null;
    const m = document.createElement("div");
    m.className = "oq-modal";
    const draw = () => {
      const word = board === "IGCSE" ? "Grade" : "Class";
      m.innerHTML = `<div class="oq-dialog">
        <span class="oq-label" style="color:#55cfff">WELCOME TO OMNIQUEST</span><h2>Which board and class?</h2><p>We'll show topics and questions that match your syllabus.</p>
        <span class="oq-label">BOARD</span>
        <div class="oq-choices">${[["CBSE", "NCERT"], ["ICSE", "CISCE"], ["IGCSE", "Cambridge"], ["State", "State board"], ["Other", "Any"]].map(([b, s]) => `<button type="button" class="oq-choice ${board === b ? "on" : ""}" data-b="${b}">${b}<small>${s}</small></button>`).join("")}</div>
        <span class="oq-label">${word.toUpperCase()}</span>
        <div class="oq-choices">${[6, 7, 8, 9, 10].map(g => `<button type="button" class="oq-choice ${grade === g ? "on" : ""}" data-g="${g}">${word} ${g}</button>`).join("")}</div>
        <div style="text-align:right"><button type="button" class="oq-go" id="oq-save" ${board && grade ? "" : "disabled"}>Continue</button></div></div>`;
      m.querySelectorAll("[data-b]").forEach(b => b.addEventListener("click", () => { board = b.dataset.b; draw(); }));
      m.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => { grade = Number(b.dataset.g); draw(); }));
      m.querySelector("#oq-save").addEventListener("click", () => {
        const changed = board !== d.board || grade !== Number(d.grade);
        write({ board, grade });
        m.remove();
        if (changed) Object.keys(FRAMES).forEach(id => { const f = $(id).querySelector("iframe"); if (f.getAttribute("src")) { try { f.contentWindow.location.reload(); } catch (_) { f.removeAttribute("src"); } } });
        refreshTop();
        prefetchAll();
        if ($("oq-home").classList.contains("active")) renderHome();
        else if ($("oq-subject").classList.contains("active")) { const sk = Object.keys(SUBJECTS).find(k => current.page.startsWith(SUBJECTS[k].name)); if (sk) openSubject(sk); }
      });
      setTimeout(() => m.querySelector("#oq-save").focus(), 30);
    };
    draw();
    document.body.appendChild(m);
  }

  /* ---------- 11. Verity knows your board, class and page ---------- */
  const realFetch = window.fetch.bind(window);
  window.fetch = (url, opts) => {
    try {
      if (typeof url === "string" && url.includes("verity") && opts && typeof opts.body === "string") {
        const body = JSON.parse(opts.body), p = read();
        body.profile = { board: p.board || null, grade: Number(p.grade) || null };
        body.page = current.page;
        opts = Object.assign({}, opts, { body: JSON.stringify(body) });
      }
    } catch (_) { /* send as normal */ }
    return realFetch(url, opts);
  };
  const welcome = document.querySelector("#chatbot-messages .bot-message");
  if (welcome) welcome.textContent = "Hi, I'm Verity, your OmniQuest AI tutor. Ask me anything about Chemistry, Maths, Biology or Physics, in any language. I can explain topics, check your working or quiz you.";
  document.querySelectorAll("#chatbot-window small").forEach(el => { if (/helper/i.test(el.textContent)) el.textContent = "YOUR AI TUTOR"; });

  /* ---------- 12. start ---------- */
  if (sidebar) sidebar.setAttribute("aria-hidden", "true");
  refreshTop();
  goHome();
  setTimeout(openProfile, 250);
  if (read().board) prefetchAll();
  console.log(`OmniQuest loaded: ${CATALOG.length} topics.`);
})();
