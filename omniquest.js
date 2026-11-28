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
    T("Atom Lab (3D builder)", "chem", 8, 10, { sec: "atomlab-section" }, "atom proton neutron electron shells isotopes ions bohr molecule bond"),
    T("Build an Atom", "chem", 8, 10, { lab: "atom" }, "atomic structure proton neutron electron charge mass number"),
    T("Isotopes and Atomic Mass", "chem", 9, 10, { lab: "isotopes" }, "isotope atomic mass"),
    T("States of Matter", "chem", 6, 9, { lab: "states" }, "solid liquid gas particles melting boiling matter"),
    T("Balancing Chemical Equations", "chem", 8, 10, { lab: "equations" }, "chemical reactions equations balance"),
    T("pH Scale: Acids and Bases", "chem", 7, 10, { lab: "ph" }, "acids bases salts ph indicator neutral"),
    T("Molecule Shapes", "chem", 9, 10, { lab: "shapes" }, "covalent bond molecule shape geometry lone pair chemical bonding"),
    T("Build a Molecule", "chem", 8, 10, { lab: "molecule" }, "molecules compounds formula water carbon dioxide"),
    T("Reactants, Products and Leftovers", "chem", 9, 10, { lab: "reactions" }, "limiting reactant reaction"),
    T("Concentration of Solutions", "chem", 9, 10, { lab: "concentration" }, "solution solute solvent dissolve saturated"),
    T("Chemistry Quiz", "chem", 6, 10, { sec: "quiz-section" }, "test practice questions"),
    T("Element Boss Fight", "chem", 6, 10, { sec: "boss-section" }, "game battle guardian"),
    T("Elements, Compounds and Mixtures", "chem", 6, 9, null, "pure substance"),
    T("Separation of Substances", "chem", 6, 7, null, "filtration evaporation distillation sieving decantation"),
    T("Physical and Chemical Changes", "chem", 6, 8, null, "reversible irreversible rusting"),
    T("Water", "chem", 6, 8, null, "water cycle hard soft"),
    T("Air and the Atmosphere", "chem", 6, 8, null, "oxygen nitrogen pollution"),
    T("Combustion and Flame", "chem", 7, 8, null, "fire fuel burning"),
    T("Synthetic Fibres and Plastics", "chem", 8, 8, null, "nylon polyester polymer"),
    T("Coal and Petroleum", "chem", 8, 8, null, "fossil fuels"),
    T("Metals and Non-metals", "chem", 8, 10, null, "reactivity series"),
    T("Mole Concept", "chem", 9, 10, null, "avogadro molar mass"),
    T("Carbon and its Compounds", "chem", 9, 10, null, "organic hydrocarbons alkanes"),

    T("Equation Balance", "maths", 6, 9, { lab: "balance" }, "solving linear equations find x balance scale algebra"),
    T("Sentence to Equation", "maths", 6, 8, { frame: "oq-maths", tool: "sentence" }, "forming linear equations word problems"),
    T("Solving Linear Equations", "maths", 7, 10, { frame: "oq-maths", tool: "solve" }, "find x balance practice"),
    T("Quadratic Equations Practice", "maths", 9, 10, { frame: "oq-maths", tool: "quad" }, "roots factorisation"),
    T("Graphing Quadratics", "maths", 9, 10, { lab: "quadgraph" }, "quadratic equations parabola vertex roots graph"),
    T("Straight-Line Graphs", "maths", 8, 10, { lab: "lines" }, "linear equations in two variables coordinate geometry slope gradient intercept"),
    T("Fractions", "maths", 6, 7, { lab: "fractions" }, "fractions decimals numerator denominator"),
    T("Area and Perimeter", "maths", 6, 8, { lab: "area" }, "mensuration area perimeter"),
    T("Integers on a Number Line", "maths", 6, 7, { lab: "integers" }, "integers negative numbers number line"),
    T("Ratio and Unit Rates", "maths", 6, 8, { lab: "ratios" }, "ratio proportion unitary method rate"),
    T("Trigonometry", "maths", 10, 10, { lab: "trig" }, "sin cos tan unit circle"),
    T("Probability", "maths", 8, 10, { lab: "probability" }, "chance probability"),
    T("Mean, Median and Mode", "maths", 6, 10, { lab: "stats" }, "data handling statistics mean median mode range"),
    T("Maths Boss Battle", "maths", 7, 10, { frame: "oq-maths", tool: "boss" }, "game x-beast"),
    T("Number System", "maths", 6, 9, null, "natural whole rational irrational"),
    T("Percentage", "maths", 7, 8, null, "profit loss discount"),
    T("Algebraic Expressions", "maths", 6, 8, null, "terms like terms variables"),
    T("Exponents and Powers", "maths", 7, 8, null, "indices laws"),
    T("Squares and Square Roots", "maths", 8, 8, null, ""),
    T("Cubes and Cube Roots", "maths", 8, 8, null, ""),
    T("Factorisation", "maths", 8, 9, null, "identities"),
    T("Polynomials", "maths", 9, 10, null, "zeroes degree"),
    T("Lines and Angles", "maths", 6, 9, null, "parallel lines transversal"),
    T("Triangles", "maths", 7, 10, null, "congruence similarity"),
    T("Pythagoras Theorem", "maths", 7, 9, null, "right triangle hypotenuse"),
    T("Quadrilaterals", "maths", 8, 9, null, "parallelogram"),
    T("Circles", "maths", 9, 10, null, "chord tangent arc"),
    T("Surface Area and Volume", "maths", 8, 10, null, "cube cuboid cylinder cone sphere mensuration"),
    T("Simple and Compound Interest", "maths", 7, 9, null, "interest"),
    T("Arithmetic Progressions", "maths", 10, 10, null, "ap sequence nth term"),

    T("Human Body Explorer", "bio", 6, 10, { frame: "oq-bio", tool: "body" }, "human body organ systems organs heart lungs liver stomach intestines anatomy parts diagram labelled"),
    T("Human Organs in 3D", "bio", 6, 10, { lab: "organs" }, "3d model organs anatomy"),
    T("The Human Heart in 3D", "bio", 7, 10, { lab: "heart" }, "heart circulation blood transportation circulatory"),
    T("The Human Brain in 3D", "bio", 8, 10, { lab: "brain" }, "brain nervous system control coordination"),
    T("Animal Cell in 3D", "bio", 6, 10, { lab: "animalcell" }, "cell structure organelles nucleus mitochondria the cell unit of life"),
    T("Plant Cell in 3D", "bio", 6, 10, { lab: "plantcell" }, "plant cell wall chloroplast vacuole the cell"),
    T("Digestive System in 3D", "bio", 7, 10, { lab: "digestive" }, "digestion nutrition stomach intestine liver food"),
    T("The Skeleton in 3D", "bio", 6, 8, { lab: "skeleton" }, "bones skeleton body movement joints"),
    T("DNA in 3D", "bio", 9, 10, { lab: "dna" }, "dna genes heredity chromosomes"),
    T("Natural Selection", "bio", 9, 10, { lab: "selection" }, "heredity evolution natural selection adaptation"),
    T("Biology Quiz", "bio", 6, 10, { frame: "oq-bio", tool: "quiz" }, "test practice questions"),
    T("Components of Food", "bio", 6, 7, null, "nutrients vitamins balanced diet deficiency"),
    T("Classification of Living Things", "bio", 6, 9, null, "kingdoms diversity"),
    T("Nutrition in Plants (Photosynthesis)", "bio", 6, 10, null, "chlorophyll"),
    T("Respiration", "bio", 7, 10, null, "breathing aerobic anaerobic"),
    T("Excretion", "bio", 7, 10, null, "kidney nephron"),
    T("Reproduction in Plants", "bio", 7, 10, null, "pollination seeds"),
    T("Reproduction in Animals", "bio", 8, 10, null, "fertilisation"),
    T("Microorganisms", "bio", 8, 8, null, "bacteria virus fungi"),
    T("Adolescence", "bio", 8, 8, null, "puberty hormones"),
    T("Tissues", "bio", 9, 9, null, "meristematic epithelial"),
    T("Diseases and Health", "bio", 8, 9, null, "immunity vaccines"),
    T("Ecosystems and Food Chains", "bio", 6, 10, null, "environment food web"),

    T("Electric Circuits", "phy", 6, 10, { frame: "oq-phy", tool: "circuit" }, "circuit lab electricity current circuit cell battery bulb switch conductors insulators"),
    T("Circuit Construction Kit", "phy", 7, 10, { lab: "circuits" }, "build your own electric circuits electricity current series parallel simulation"),
    T("Motion Lab", "phy", 7, 10, { frame: "oq-phy", tool: "motion" }, "motion speed distance time graph car"),
    T("Ohm's Law", "phy", 9, 10, { lab: "ohm" }, "ohms law voltage current resistance electricity"),
    T("Forces and Motion", "phy", 7, 9, { lab: "forces" }, "force motion speed laws of motion newton push pull"),
    T("Friction", "phy", 8, 8, { lab: "friction" }, "friction heat"),
    T("Energy: Skate Park", "phy", 9, 10, { lab: "energy" }, "work energy power kinetic potential conservation"),
    T("Refraction of Light", "phy", 8, 10, { lab: "refraction" }, "light refraction prism bending"),
    T("Mirrors and Lenses", "phy", 7, 10, { lab: "optics" }, "light reflection mirror lens image"),
    T("Gravity and Orbits", "phy", 8, 9, { lab: "gravity" }, "gravitation gravity weight orbit moon"),
    T("Waves", "phy", 9, 9, { lab: "waves" }, "wave amplitude frequency wavelength"),
    T("Sound", "phy", 8, 9, { lab: "sound" }, "sound frequency pitch vibration echo"),
    T("Pressure in Liquids", "phy", 8, 9, { lab: "pressure" }, "force and pressure liquid air"),
    T("Density: Float or Sink", "phy", 8, 9, { lab: "density" }, "density float sink buoyancy mass volume"),
    T("Magnets", "phy", 6, 8, { lab: "magnets" }, "magnet poles compass field"),
    T("Electromagnetic Induction", "phy", 10, 10, { lab: "induction" }, "magnetic effects of current electromagnet generator faraday"),
    T("Pendulum", "phy", 7, 9, { lab: "pendulum" }, "time period oscillation motion"),
    T("Build a Solar System", "phy", 6, 8, { lab: "solar" }, "stars and the solar system planets orbit"),
    T("Physics Quiz", "phy", 6, 10, { frame: "oq-phy", tool: "quiz" }, "test practice questions"),
    T("Measurement and Units", "phy", 6, 9, null, "si units length"),
    T("Heat and Temperature", "phy", 7, 9, null, "conduction convection radiation"),
    T("Light: Shadows and Reflection", "phy", 6, 7, null, "shadow"),
    T("The Human Eye", "phy", 10, 10, null, "vision defects"),
    T("Sources of Energy", "phy", 9, 10, null, "renewable solar")
  ];

  /* ---------- 2. styles ---------- */
  const css = document.createElement("style");
  css.textContent = `
    body .sidebar { display: none !important; }
    body .main-content { margin: 0 auto !important; width: 100% !important; max-width: 1320px; padding: 0 28px 70px !important; }
    .oq-top { position: sticky; top: 0; z-index: 1500; display: flex; align-items: center; gap: 16px; padding: 14px 0; margin-bottom: 18px; background: rgba(15, 23, 38, .9); backdrop-filter: blur(10px); border-bottom: 1px solid #22324a; }
    .oq-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; flex: none; }
    .oq-brand b { font: 700 21px "Inter", system-ui, sans-serif; color: #fff; letter-spacing: .5px; }
    .oq-brand b span { color: #55cfff; }
    .oq-logo { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: linear-gradient(135deg, #55cfff, #a855f7); color: #fff; font-size: 18px; box-shadow: 0 0 18px #55cfff55; }
    .oq-search { position: relative; flex: 1; max-width: 620px; }
    .oq-search input { width: 100%; background: #111a2b; border: 1px solid #334155; border-radius: 12px; padding: 12px 14px 12px 40px; color: #fff; font: 700 15px "Inter", system-ui, sans-serif; outline: none; transition: border-color .2s, box-shadow .2s; }
    .oq-search input:focus { border-color: #55cfff; box-shadow: 0 0 0 4px #55cfff22; }
    .oq-search svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); }
    .oq-results { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #131d2f; border: 1px solid #334155; border-radius: 14px; box-shadow: 0 24px 60px #000a; padding: 6px; display: none; max-height: 420px; overflow-y: auto; }
    .oq-results.show { display: block; animation: oqDrop .18s ease-out; }
    @keyframes oqDrop { from { opacity: 0; transform: translateY(-4px); } }
    .oq-res { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: transparent; color: #e2ebf6; text-align: left; padding: 10px 12px; border-radius: 10px; cursor: pointer; font: 700 14.5px "Inter", system-ui, sans-serif; }
    .oq-res:hover, .oq-res.on { background: #1f2d45; }
    .oq-res .d { width: 9px; height: 9px; border-radius: 50%; background: var(--c); flex: none; }
    .oq-res .m { margin-left: auto; color: #7d8fa8; font-size: 11.5px; font-weight: 800; white-space: nowrap; }
    .oq-res.ai { border-top: 1px solid #263449; margin-top: 4px; color: #9fdcff; }
    .oq-right { display: flex; align-items: center; gap: 10px; margin-left: auto; flex: none; }
    .oq-pill { display: flex; align-items: center; gap: 8px; background: #111a2b; border: 1px solid #334155; border-radius: 12px; padding: 8px 12px; color: #dbe7f3; font: 800 13px "Inter", system-ui, sans-serif; cursor: pointer; }
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
    .oq-stat b { font: 700 24px "Inter", system-ui, sans-serif; color: #fff; }
    .oq-tabs { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
    .oq-tab { border: 1px solid #334155; background: #111a2b; color: #b8c6d8; border-radius: 30px; padding: 8px 15px; font: 800 13.5px "Inter", system-ui, sans-serif; cursor: pointer; display: flex; align-items: center; gap: 7px; }
    .oq-tab .d { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
    .oq-tab.on { border-color: var(--c, #55cfff); color: #fff; background: #1b2840; }
    .oq-tab:hover { color: #fff; }
    .oq-toggle { margin-left: auto; color: #8195ad; font: 800 13px "Inter", system-ui, sans-serif; display: flex; align-items: center; gap: 7px; cursor: pointer; }
    .oq-toggle input { accent-color: #55cfff; }
    .oq-block { margin-bottom: 22px; }
    .oq-block h2 { display: flex; align-items: center; gap: 10px; margin: 0 0 10px; font-size: 20px; color: #fff; }
    .oq-block h2 .bar { width: 4px; height: 20px; border-radius: 4px; background: var(--c); }
    .oq-block h2 small { color: #7d8fa8; font: 800 12px "Inter", system-ui, sans-serif; }
    .oq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
    .oq-card { position: relative; text-align: left; border: 1px solid #2c3d53; background: linear-gradient(160deg, #1b2639, #141e30); color: #e2ebf6; border-radius: 13px; padding: 13px 14px; cursor: pointer; transition: border-color .2s, transform .2s, box-shadow .2s; font: 800 14.5px "Inter", system-ui, sans-serif; }
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
    .oq-opt { text-align: left; border: 1px solid #334155; background: #111a2b; color: #e2ebf6; border-radius: 10px; padding: 10px 12px; font: 700 14px "Inter", system-ui, sans-serif; cursor: pointer; }
    .oq-opt:hover:not(:disabled) { border-color: #55cfff; }
    .oq-opt.right { border-color: #25c58a; background: #10392e; }
    .oq-opt.wrong { border-color: #f07883; background: #3d1c25; }
    .oq-opt:disabled { cursor: default; }
    .oq-exp { margin-top: 8px; color: #b8c6d8; font-size: 13.5px; line-height: 1.55; display: none; }
    .oq-exp.show { display: block; }
    .oq-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
    .oq-btn { border: 1px solid #334155; background: #1e293b; color: #fff; border-radius: 11px; padding: 10px 16px; font: 800 14px "Inter", system-ui, sans-serif; cursor: pointer; }
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
    .oq-choice { border: 1.5px solid #334155; background: #111a2b; color: #fff; border-radius: 12px; padding: 13px 8px; font: 900 15px "Inter", system-ui, sans-serif; cursor: pointer; transition: all .2s; }
    .oq-choice small { display: block; color: #8195ad; font-size: 10.5px; margin-top: 3px; font-weight: 800; }
    .oq-choice:hover { border-color: #55cfff; }
    .oq-choice.on { border-color: #55cfff; background: #20334a; box-shadow: 0 0 16px #55cfff33; }
    .oq-go { border: 0; border-radius: 12px; padding: 12px 26px; font: 900 15px "Inter", system-ui, sans-serif; color: #04202e; background: #55cfff; cursor: pointer; }
    .oq-go:disabled { opacity: .4; cursor: default; }

    .oq-center { min-height: calc(100vh - 160px); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4px; padding-bottom: 30px; }
    .oq-center h1 { font-size: clamp(30px, 4.4vw, 52px); margin: 6px 0 22px; color: #f1f5f9; font-weight: 700; }
    .oq-center h1 span { color: #55cfff; }
    .oq-slot { width: min(720px, 100%); }
    .oq-slot .oq-search { max-width: none; }
    .oq-slot .oq-search input { padding: 18px 18px 18px 50px; font-size: 18px; border-radius: 16px; box-shadow: 0 18px 50px #0006; }
    .oq-slot .oq-search svg { left: 18px; width: 21px; height: 21px; }
    .oq-try { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 16px 0 34px; color: #7d8fa8; font: 800 13px "Inter", system-ui, sans-serif; align-items: center; }
    .oq-try button { border: 1px solid #334155; background: #131d2f; color: #c8d5e5; border-radius: 30px; padding: 7px 14px; font: 700 13px "Inter", system-ui, sans-serif; cursor: pointer; }
    .oq-try button:hover { border-color: #55cfff; color: #fff; }
    .oq-subjects4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; width: min(980px, 100%); }
    .oq-subj { position: relative; text-align: left; border: 1px solid #2c3d53; background: linear-gradient(160deg, #1b2639, #141e30); color: #fff; border-radius: 16px; padding: 18px 18px 16px; cursor: pointer; overflow: hidden; transition: transform .2s, border-color .2s, box-shadow .2s; }
    .oq-subj::before { content: ""; position: absolute; left: 0; top: 0; right: 0; height: 3px; background: var(--c); }
    .oq-subj:hover { transform: translateY(-3px); border-color: var(--c); box-shadow: 0 14px 34px #0006; }
    .oq-subj b { display: block; font: 700 21px "Inter", system-ui, sans-serif; margin-bottom: 4px; }
    .oq-subj span { color: #8aa0b8; font: 700 12.5px "Inter", system-ui, sans-serif; }
    .oq-subj i { position: absolute; right: 16px; top: 18px; font-style: normal; color: var(--c); font-weight: 900; transition: transform .2s; }
    .oq-subj:hover i { transform: translateX(4px); }
    .oq-subhead { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
    .oq-subhead h1 { margin: 2px 0 4px; font-size: clamp(28px, 3.4vw, 40px); color: #fff; }
    .oq-subhead p { margin: 0; color: #8aa0b8; font-weight: 700; font-size: 14px; }
    .oq-subhead p .ok { color: #45e2a1; }
    .oq-filter { background: #111a2b; border: 1px solid #334155; border-radius: 12px; padding: 11px 14px; color: #fff; font: 700 14px "Inter", system-ui, sans-serif; outline: none; min-width: 260px; }
    .oq-filter:focus { border-color: var(--c, #55cfff); }
    .oq-labs { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
    .oq-labs .oq-label { margin: 0 6px 0 0; }
    .oq-labbtn { border: 1px solid var(--c); background: color-mix(in srgb, var(--c) 12%, #111a2b); color: #fff; border-radius: 10px; padding: 8px 13px; font: 800 13px "Inter", system-ui, sans-serif; cursor: pointer; }
    .oq-labbtn:hover { background: color-mix(in srgb, var(--c) 25%, #111a2b); }
    .oq-chapters { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .oq-ch { background: linear-gradient(160deg, #1b2639, #141e30); border: 1px solid #2c3d53; border-radius: 14px; padding: 14px 16px; animation: oqUp .35s ease-out both; }
    .oq-ch-top { display: flex; align-items: center; gap: 10px; cursor: pointer; }
    .oq-ch-top:hover b { color: var(--c); }
    .oq-ch-top .n { width: 28px; height: 28px; flex: none; border-radius: 8px; display: grid; place-items: center; background: color-mix(in srgb, var(--c) 18%, #0f1828); color: var(--c); font: 800 13px "Inter", system-ui, sans-serif; }
    .oq-ch-top b { font: 800 15.5px "Inter", system-ui, sans-serif; color: #fff; transition: color .2s; }
    .oq-ch-top .lab { margin-left: auto; border: 1px solid var(--c); color: var(--c); background: transparent; border-radius: 8px; padding: 3px 8px; font: 900 10.5px "Inter", system-ui, sans-serif; letter-spacing: 1px; cursor: pointer; }
    .oq-subs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .oq-subs button { border: 1px solid #2c3d53; background: #111a2b; color: #c8d5e5; border-radius: 20px; padding: 5px 11px; font: 700 12.5px "Inter", system-ui, sans-serif; cursor: pointer; }
    .oq-subs button:hover { border-color: var(--c); color: #fff; }
    .oq-note { color: #7d8fa8; font-size: 12.5px; font-weight: 700; margin-top: 14px; }
    .oq-hook { font-size: 18px; color: #fff; font-weight: 700; margin: 0 0 6px; }
    .oq-funfact { border-left: 3px solid #ffb347; }
    .oq-extra { margin-top: 22px; display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; color: #4b5d76; }
    .oq-extra button { border: 0; background: transparent; color: #8aa0b8; font: 800 14px "Inter", system-ui, sans-serif; cursor: pointer; padding: 4px 6px; border-bottom: 1px dashed #3a4b62; }
    .oq-extra button:hover { color: #fff; border-color: #55cfff; }
    .oq-steps { display: flex; gap: 6px; margin-bottom: 14px; }
    .oq-steps i { flex: 1; height: 4px; border-radius: 4px; background: #263449; }
    .oq-steps i.on { background: #55cfff; }
    .oq-langs { max-height: 300px; overflow-y: auto; grid-template-columns: repeat(3, 1fr); }
    .oq-langs .oq-choice small { font-size: 11px; }
    .oq-foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
    .oq-backbtn { border: 1px solid #334155; background: transparent; color: #c8d5e5; border-radius: 12px; padding: 11px 18px; font: 800 14px "Inter", system-ui, sans-serif; cursor: pointer; }
    .oq-page { max-width: 860px; }
    .oq-page h1 { font-size: clamp(26px, 3.2vw, 38px); margin: 2px 0 6px; color: #fff; }
    .oq-page > p { color: #9aabc0; margin: 0 0 18px; }
    .oq-field { margin-bottom: 14px; }
    .oq-field textarea { width: 100%; background: #111a2b; border: 1px solid #334155; border-radius: 12px; padding: 12px 14px; color: #fff; font: 600 15px "Inter", system-ui, sans-serif; resize: vertical; outline: none; }
    .oq-field textarea:focus { border-color: #55cfff; }
    .oq-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .oq-chip { border: 1px solid #334155; background: #111a2b; color: #c8d5e5; border-radius: 30px; padding: 7px 14px; font: 800 13px "Inter", system-ui, sans-serif; cursor: pointer; }
    .oq-chip.on { border-color: var(--c, #55cfff); color: #fff; background: #1b2840; }
    .oq-photo img { max-height: 150px; border-radius: 10px; border: 1px solid #334155; display: block; margin-top: 8px; }
    .oq-verdict { border-radius: 14px; padding: 14px 18px; font-weight: 800; margin-bottom: 12px; border: 1px solid; }
    .oq-verdict.correct { background: #10392e; border-color: #25c58a; color: #b8f5dc; }
    .oq-verdict.partly { background: #3a2f0e; border-color: #d4a017; color: #fde68a; }
    .oq-verdict.incorrect { background: #3d1c25; border-color: #f07883; color: #ffc7cf; }
    .oq-verdict.unclear { background: #1d2a4a; border-color: #55cfff; color: #c7ecff; }
    .oq-step { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid #22324a; }
    .oq-step:last-child { border-bottom: 0; }
    .oq-step .ic { width: 22px; height: 22px; flex: none; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 900; }
    .oq-step .ic.y { background: #25c58a; color: #062218; } .oq-step .ic.n { background: #f07883; color: #fff; }
    .oq-step b { display: block; color: #fff; font-family: "Inter", system-ui, sans-serif; font-weight: 600; }
    .oq-step span { color: #b8c6d8; font-size: 14px; }
    .oq-checks { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; max-height: 300px; overflow-y: auto; padding: 2px; }
    .oq-checks label { display: flex; gap: 8px; align-items: center; background: #111a2b; border: 1px solid #2c3d53; border-radius: 10px; padding: 8px 10px; color: #dbe7f3; font: 700 13.5px "Inter", system-ui, sans-serif; cursor: pointer; }
    .oq-checks input { accent-color: #55cfff; }
    .oq-timer { position: sticky; top: 74px; z-index: 5; display: flex; justify-content: space-between; align-items: center; background: #131d2f; border: 1px solid #334155; border-radius: 12px; padding: 10px 16px; margin-bottom: 14px; font-weight: 800; color: #dbe7f3; }
    .oq-timer b { font: 700 20px "Inter", system-ui, sans-serif; color: #55cfff; }
    .oq-timer b.low { color: #ff8c9c; }
    .oq-opt.picked { border-color: #55cfff; background: #1b2840; }
    .oq-score { text-align: center; padding: 10px 0 6px; }
    .oq-score b { display: block; font: 700 54px "Inter", system-ui, sans-serif; color: #fff; }
    .oq-bars { display: grid; gap: 8px; }
    .oq-bar { display: grid; grid-template-columns: minmax(0, 1fr) 140px 50px; gap: 10px; align-items: center; color: #dbe7f3; font-weight: 700; font-size: 14px; }
    .oq-bar .t { height: 8px; background: #1e293b; border-radius: 8px; overflow: hidden; }
    .oq-bar .t div { height: 100%; border-radius: 8px; }
    .oq-offline { display: none; border: 1px solid #d4a017; color: #fde68a; background: #3a2f0e; border-radius: 10px; padding: 6px 10px; font: 800 12px "Inter", system-ui, sans-serif; }
    .oq-offline.show { display: inline-block; }
    @media (max-width: 900px) { .oq-subjects4 { grid-template-columns: repeat(2, 1fr); } .oq-chapters { grid-template-columns: 1fr; } }
    @media (max-width: 900px) { .oq-stats { grid-template-columns: repeat(2, 1fr); } .oq-opts { grid-template-columns: 1fr; } }
    @media (max-width: 680px) {
      .oq-langs { grid-template-columns: repeat(2, 1fr); }
      .oq-checks { grid-template-columns: 1fr; }
      .oq-bar { grid-template-columns: minmax(0, 1fr) 80px 44px; }
      body .main-content { padding: 0 12px 60px !important; }
      .oq-top { flex-wrap: wrap; gap: 10px; }
      .oq-search { order: 3; flex-basis: 100%; max-width: none; }
      .oq-xpbar { display: none; }
      .oq-frame { height: calc(100vh - 190px); }
    }
  `;
  css.textContent += `
    body, body button, body input, body select, body textarea, body h1, body h2, body h3, body h4, body p, body span, body b, body a, body li, body label, body div { font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif !important; }
    body h1, body h2, body h3 { letter-spacing: -.02em; }
    .oq-labview { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }
    .oq-stage { position: relative; border-radius: 16px; overflow: hidden; border: 1px solid #2c3d53; background: #0b1220; height: calc(100vh - 170px); min-height: 520px; }
    .oq-stage:fullscreen { border-radius: 0; height: 100vh; }
    .oq-stage iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; }
    .oq-stage-load { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: #0b1220; color: #e2ebf6; text-align: center; padding: 20px; transition: opacity .4s; }
    .oq-stage-load b { font-size: 16px; }
    .oq-stage-load small { color: #7d8fa8; font-weight: 600; }
    .oq-stage-load.done { opacity: 0; pointer-events: none; }
    .oq-spin { width: 34px; height: 34px; border-radius: 50%; border: 3px solid #22324a; border-top-color: var(--c, #55cfff); animation: oqSpin .8s linear infinite; }
    @keyframes oqSpin { to { transform: rotate(360deg); } }
    .oq-labside { background: linear-gradient(160deg, #1b2639, #141e30); border: 1px solid #2c3d53; border-radius: 16px; padding: 20px; position: sticky; top: 90px; }
    .oq-labside .oq-label { color: var(--c); }
    .oq-labside h2 { margin: 2px 0 8px; font-size: 22px; color: #fff; }
    .oq-labside p { color: #c8d5e5; line-height: 1.6; font-size: 14.5px; margin: 0; }
    .oq-tasks { margin: 0; padding-left: 20px; display: grid; gap: 8px; color: #dbe7f3; font-size: 14px; line-height: 1.5; }
    .oq-tasks li::marker { color: var(--c); font-weight: 800; }
    .oq-credit { margin-top: 16px !important; font-size: 11.5px !important; color: #7d8fa8 !important; line-height: 1.5 !important; }
    .oq-credit a { color: #9fb3cc; }
    @media (max-width: 900px) { .oq-labview { grid-template-columns: 1fr; } .oq-labside { position: static; } .oq-stage { height: 70vh; min-height: 420px; } }
  `;
  css.textContent += `
    .oq-numin { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #334155; background: #111a2b; border-radius: 30px; padding: 4px 12px 4px 6px; transition: border-color .2s; }
    .oq-numin.on, .oq-numin:focus-within { border-color: var(--c, #55cfff); }
    .oq-numin input { width: 64px; border: 0; background: transparent; color: #fff; font: 700 14px "Inter", system-ui, sans-serif; text-align: center; outline: none; padding: 4px 0; -moz-appearance: textfield; }
    .oq-numin input::-webkit-outer-spin-button, .oq-numin input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .oq-numin span { color: #8195ad; font: 700 13px "Inter", system-ui, sans-serif; }
    .oq-hint { color: #5f7290; font: 600 12px "Inter", system-ui, sans-serif; }
    .oq-bookrow { display: flex; gap: 8px; margin: 10px 0 4px; flex-wrap: wrap; }
    .oq-bookrow input { flex: 1; min-width: 220px; background: #0f1726; border: 1px solid #334155; border-radius: 10px; padding: 9px 12px; color: #fff; font: 600 14px "Inter", system-ui, sans-serif; outline: none; }
    .oq-bookrow input:focus { border-color: #55cfff; }
  `;
  if (!document.querySelector('link[href*="family=Inter"]')) {
    const font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(font);
  }
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
      <span class="oq-offline" id="oq-offline">Offline</span>
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
    sec.innerHTML = `<iframe class="oq-frame" title="${{ "oq-phy": "Physics", "oq-bio": "Biology", "oq-maths": "Maths" }[id] || "Lab"}"></iframe>`;
    main.appendChild(sec);
  });
  const subjPage = document.createElement("section");
  subjPage.id = "oq-subject";
  subjPage.className = "page-section";
  main.appendChild(subjPage);
  const hwPage = document.createElement("section");
  hwPage.id = "oq-hw";
  hwPage.className = "page-section";
  main.appendChild(hwPage);
  const examPage = document.createElement("section");
  examPage.id = "oq-exam";
  examPage.className = "page-section";
  main.appendChild(examPage);
  const lesson = document.createElement("section");
  lesson.id = "oq-lesson";
  lesson.className = "page-section";
  main.appendChild(lesson);

  /* ---------- 5. navigation ---------- */
  let current = { page: "Dashboard" };
  function activate(id) {
    if (id !== "oq-home" && typeof placeSearch === "function") placeSearch(false);
    if (id !== "oq-lab") { const lf = document.getElementById("oq-labframe"); if (lf) lf.remove(); }
    document.querySelectorAll(".page-section").forEach(s => s.classList.toggle("active", s.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function setCrumb(topic) {
    if (!topic) { crumb.classList.remove("show"); return; }
    const subj = SUBJECTS[topic.s] || { name: "Topic" };
    crumb.innerHTML = `<button type="button" id="oq-back">← Dashboard</button>${topic.s && SUBJECTS[topic.s] && topic.name !== subj.name ? `<a href="#" id="oq-crumb-subj" style="color:#8aa0b8">${esc(subj.name)}</a><span class="sep">/</span>` : ""}<span class="cur">${esc(topic.name)}</span>
      ${topic.open && !topic.open.lab ? `<button type="button" class="lessonbtn" id="oq-readlesson">Read the lesson</button>` : (topic.lab ? `<button type="button" class="lessonbtn" id="oq-openlab">Open the interactive lab</button>` : "")}`;
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
    if (t.open.lab) return openLab(t);
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
  /* ---------- REAL LABS: PhET simulations + 3D models ---------- */
  // PhET Interactive Simulations, University of Colorado Boulder (CC BY 4.0) and 3D models on Sketchfab
  const PHET_CREDIT = 'Simulation by <a href="https://phet.colorado.edu" target="_blank" rel="noopener">PhET Interactive Simulations</a>, University of Colorado Boulder, licensed under CC BY 4.0.';
  const P = (slug, about, tasks, q = "") => ({ kind: "phet", src: slug, about, tasks, q });
  const M = (uid, author, license, about, tasks) => ({ kind: "3d", src: uid, author, license, about, tasks });
  const LABS = {
    // biology (3D)
    organs: M("5cfafb312f504815aa3fec55735607a6", "Z-Anatomy", "CC BY-SA 4.0", "An anatomy-atlas model of the body's internal organs inside the skeleton. Drag to rotate, scroll or pinch to zoom, double-click to zoom in on an organ.", ["Zoom in on the chest. Find the heart and the two lungs.", "Below the lungs, find the liver and the stomach.", "Follow the intestines down. Which bones protect the organs in the chest?"]),
    heart: M("3f8072336ce94d18b3d0d055a1ece089", "neshallads", "CC BY 4.0", "A realistic model of the human heart, the muscular pump of the circulatory system.", ["Find the aorta, the biggest artery leaving the top of the heart.", "Find the coronary arteries on the surface. What do they supply blood to?", "Count the large blood vessels joined to the heart."]),
    brain: M("7a27c17fd6c0488bb31ab093236a47fb", "3DRT STUDIOS", "CC BY 4.0", "The human brain, the control centre of the nervous system.", ["Find the cerebrum, the large wrinkled top part.", "Find the cerebellum at the back. It controls balance.", "Why do you think the brain is folded into ridges?"]),
    animalcell: M("0d9f7f4257224975b2ef83a283709b2f", "montanna", "CC BY 4.0", "A labelled 3D animal cell. Click the numbered dots to read about each organelle.", ["Find the nucleus and the nucleolus inside it.", "Find a mitochondrion. What does it do?", "Which structures does a plant cell have that this cell does not?"]),
    plantcell: M("1c5ce80d03d149208d30cc5aeb6e42fb", "Vida Systems", "CC BY-NC-ND 4.0", "A 3D plant cell with its cell wall, chloroplasts and large central vacuole.", ["Find the chloroplasts. What do they make?", "How big is the vacuole compared with the rest of the cell?", "Find the cell wall outside the cell membrane."]),
    digestive: M("f78ce703805f49d3b732e37be5b93188", "7D production", "CC BY 4.0", "The digestive system, from the food pipe to the large intestine.", ["Trace the path food takes, starting at the oesophagus.", "Find the liver. Which digestive juice does it make?", "Which is longer, the small or the large intestine?"]),
    skeleton: M("4de7b96a351a4a35b1b6e5415277ff07", "Diego Luján García", "CC BY 4.0", "The human skeleton, with all its major bones.", ["Find the skull, ribcage and backbone.", "Which bones protect the heart and lungs?", "Find a ball-and-socket joint at the shoulder or hip."]),
    dna: M("60e95170b37549e3b45ee490b74bb112", "Holoxica", "CC BY 4.0", "A model of DNA, the double helix that carries genetic information.", ["Count how many strands twist around each other.", "The rungs of the ladder are base pairs. Which bases pair together?", "Where in a cell is DNA found?"]),
    selection: P("natural-selection", "Watch a population of bunnies change over generations as their environment changes.", ["Add wolves. Which fur colour survives best in the snow?", "Add a mutation and watch how it spreads.", "What happens when you change the environment to an equator?"]),
    // physics
    circuits: P("circuit-construction-kit-dc", "Build real circuits with cells, bulbs, switches and wires. The arrows show the current flowing from the + end of the cell, round the circuit, back to the − end. The gold end of each cell is +, the black end is −.", ["Make a bulb light with one battery.", "Put two bulbs in series, then in parallel. Which is brighter?", "Test a coin, an eraser and a paper clip. Which ones conduct?"], "currentType=conventional"),
    ohm: P("ohms-law", "See how voltage, current and resistance are linked by V = I × R.", ["Raise the voltage. What happens to the current?", "Raise the resistance. What happens to the current?", "Find a voltage and resistance that give exactly 0.5 A."]),
    forces: P("forces-and-motion-basics", "Push objects, add friction and watch forces change motion.", ["In the Net Force screen, make the cart stay still with people pulling on both sides.", "In the Motion screen, push a box and watch the speed change.", "Turn on friction. How much harder do you have to push?"]),
    friction: P("friction", "Rub two surfaces together and see what friction does to atoms and temperature.", ["Rub the book on the surface. What happens to the thermometer?", "Keep rubbing. What happens to the atoms at the top?", "Why do your hands get warm when you rub them together?"]),
    energy: P("energy-skate-park-basics", "Ride a skater along a track and watch kinetic and potential energy swap.", ["Turn on the pie chart. Where is potential energy highest?", "Where on the track is the skater fastest?", "Add friction. Where does the energy go?"]),
    refraction: P("bending-light", "Shine a laser through water and glass and see light bend.", ["Measure the angle when light goes from air into water.", "Find total internal reflection.", "Use a prism to split white light."]),
    optics: P("geometric-optics-basics", "Form images with lenses and mirrors and see the rays.", ["Move the object closer to the lens. What happens to the image?", "Find where the image is upside down.", "Switch to a mirror and compare."]),
    gravity: P("gravity-and-orbits", "Explore how gravity keeps the Moon and planets in orbit.", ["Turn gravity off. What happens to the Earth?", "Make the Sun heavier. How does the orbit change?", "Compare the Earth–Moon system with the Sun–Earth system."]),
    waves: P("wave-on-a-string", "Wiggle a string and explore amplitude, frequency and wavelength.", ["Make a wave with a high frequency. What happens to the wavelength?", "Increase the amplitude. What changes?", "Turn on damping and see the wave die away."]),
    sound: P("sound-waves", "See and hear sound waves, and change their frequency and amplitude.", ["Raise the frequency. How does the pitch change?", "Raise the amplitude. How does the loudness change?", "Remove the air from the box. Can sound travel?"]),
    pressure: P("under-pressure", "Measure air and water pressure at different depths and in different liquids.", ["How does pressure change as you go deeper?", "Compare pressure in water and in honey.", "Does the shape of the container change the pressure at the bottom?"]),
    density: P("density", "Find out why some objects float and others sink.", ["Compare blocks with the same mass but different volumes.", "Which material is densest?", "Predict which blocks will float before you drop them."]),
    magnets: P("magnet-and-compass", "Move a bar magnet and see its magnetic field with a compass.", ["Where does the compass needle point near the north pole?", "Show the field lines. Where are they closest together?", "Flip the magnet and watch the compass."]),
    induction: P("faradays-electromagnetic-lab", "Move a magnet through a coil to make electricity.", ["Move the magnet quickly through the coil. What does the bulb do?", "Hold it still. Is any current produced?", "Add more loops to the coil. What changes?"]),
    pendulum: P("pendulum-lab", "Time a swinging pendulum and find what changes its period.", ["Does a heavier bob swing faster?", "Make the string longer. What happens to the period?", "Try it on the Moon."]),
    solar: P("my-solar-system", "Build your own solar system and watch the orbits.", ["Make a moon orbit a planet.", "What happens if two bodies have the same mass?", "Make an orbit that is a perfect circle."]),
    // chemistry
    atom: P("build-an-atom", "Build atoms from protons, neutrons and electrons, and see the element, charge and mass.", ["Build a helium atom.", "Make an ion with a charge of +1.", "Which particle changes the element when you add it?"]),
    isotopes: P("isotopes-and-atomic-mass", "Make isotopes and see how average atomic mass is worked out.", ["Make carbon-12 and carbon-14. What is different?", "Which isotopes are stable?", "Mix isotopes and watch the average mass change."]),
    states: P("states-of-matter-basics", "Heat and cool solids, liquids and gases and watch the particles move.", ["Heat ice. What happens to the particles when it melts?", "Compare neon, argon, oxygen and water.", "Cool a gas down until it turns into a liquid."]),
    equations: P("balancing-chemical-equations", "Balance chemical equations by adding molecules on each side.", ["Balance the equation for making ammonia.", "Use the balance view to check your answer.", "Try the game on level 2."]),
    ph: P("ph-scale-basics", "Test the pH of everyday liquids like milk, coffee and soap.", ["Which liquid is the most acidic?", "Add water to an acid. What happens to the pH?", "Which liquids are bases?"]),
    shapes: P("molecule-shapes-basics", "Build molecules in 3D and see their shapes and bond angles.", ["Build a molecule with 4 bonds. What shape is it?", "Add a lone pair. How does the shape change?", "Look at the real water molecule. What is its bond angle?"]),
    molecule: P("build-a-molecule", "Build molecules from atoms and collect them.", ["Build a water molecule.", "Build carbon dioxide.", "Fill all the collection boxes."]),
    reactions: P("reactants-products-and-leftovers", "Make sandwiches and molecules and see what is used up and what is left over.", ["Make 3 sandwiches. What is left over?", "Make water from hydrogen and oxygen.", "Find the limiting reactant."]),
    concentration: P("concentration", "Dissolve a solute and measure the concentration of the solution.", ["Add more solute. What happens to the colour?", "Add water. What happens to the concentration?", "Make a saturated solution."]),
    // maths
    balance: P("equality-explorer", "Solve equations on a balance scale, keeping both sides equal.", ["Make both sides of the scale balance.", "Solve for x by doing the same thing to both sides.", "Try the Solve It! game."]),
    quadgraph: P("graphing-quadratics", "Change a, b and c and watch the parabola move.", ["Make a parabola that opens downwards.", "Find the vertex and the roots.", "What does c change?"]),
    lines: P("graphing-lines", "Explore straight-line graphs, slope and intercept.", ["Make a line with slope 2.", "Change the y-intercept. What moves?", "Draw two parallel lines."]),
    fractions: P("fractions-intro", "Build and compare fractions with shapes and number lines.", ["Show 3/4 in two different ways.", "Which is bigger, 2/3 or 3/5?", "Make a fraction greater than 1."]),
    area: P("area-builder", "Build shapes on a grid and find their area and perimeter.", ["Make a shape with area 12.", "Make two shapes with the same area but different perimeters.", "Try the game."]),
    integers: P("number-line-integers", "Explore positive and negative numbers on a number line.", ["Put -3 and 2 on the number line. Which is greater?", "In the Explore screen, compare temperatures on the thermometer.", "What is the distance between -4 and 3?"]),
    ratios: P("unit-rates", "Shop for fruit and candy and discover unit rates.", ["Find the cost of one apple.", "Which is the better deal?", "Race the cars and compare their speeds."]),
    trig: P("trig-tour", "Take a tour of sine, cosine and tangent on the unit circle.", ["Move the point. When is sin θ largest?", "Find an angle where cos θ = 0.", "Watch the graph draw as you move the angle."]),
    probability: P("plinko-probability", "Drop balls through a Plinko board and see probability in action.", ["Drop 100 balls. Where do most land?", "Change the probability. What happens to the pattern?", "Compare the result with the ideal histogram."]),
    stats: P("center-and-variability", "Kick footballs and explore mean, median, mode and range.", ["Find the median of the kicks.", "Where is the mean compared with the median?", "Make the range larger."])
  };
  const LANG_LOCALE = { English: "en", Hindi: "hi", Bengali: "bn", Marathi: "mr", Telugu: "te", Tamil: "ta", Gujarati: "gu", Urdu: "ur", Kannada: "kn", Odia: "or", Malayalam: "ml", Punjabi: "pa", French: "fr", German: "de", Spanish: "es", Arabic: "ar", Chinese: "zh_CN", Japanese: "ja" };
  function labURL(L) {
    if (L.kind === "phet") return `https://phet.colorado.edu/sims/html/${L.src}/latest/${L.src}_all.html?locale=${LANG_LOCALE[read().lang] || "en"}${L.q ? "&" + L.q : ""}`;
    return `https://sketchfab.com/models/${L.src}/embed?autostart=1&ui_theme=dark&ui_infos=0&dnt=1`;
  }
  const labPage = document.createElement("section");
  labPage.id = "oq-lab";
  labPage.className = "page-section";
  main.appendChild(labPage);
  function openLab(t) {
    const L = LABS[t.open.lab], subj = SUBJECTS[t.s];
    const credit = L.kind === "phet" ? PHET_CREDIT : `3D model by ${esc(L.author)} on <a href="https://sketchfab.com/3d-models/${L.src}" target="_blank" rel="noopener">Sketchfab</a> (${esc(L.license)}).`;
    labPage.style.setProperty("--c", subj.color);
    labPage.innerHTML = `<div class="oq-labview">
      <div class="oq-stage"><div class="oq-stage-load" id="oq-stage-load"><span class="oq-spin"></span><b>Loading ${L.kind === "phet" ? "simulation" : "3D model"}…</b><small>This can take a few seconds the first time.</small></div>
        <iframe id="oq-labframe" title="${esc(t.name)}" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen></iframe></div>
      <aside class="oq-labside">
        <span class="oq-label">${subj.name.toUpperCase()} · ${L.kind === "phet" ? "SIMULATION" : "3D MODEL"}</span>
        <h2>${esc(t.name)}</h2><p>${esc(L.about)}</p>
        <span class="oq-label" style="margin-top:16px">TRY THIS</span>
        <ol class="oq-tasks">${L.tasks.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
        <div class="oq-actions"><button type="button" class="oq-btn primary" id="oq-lab-lesson">Read the lesson</button><button type="button" class="oq-btn" id="oq-lab-full">Full screen</button></div>
        <p class="oq-credit">${credit}</p>
      </aside></div>`;
    const frame = $("oq-labframe"), load = $("oq-stage-load");
    if (!navigator.onLine) { load.innerHTML = `<b>You're offline</b><small>This ${L.kind === "phet" ? "simulation" : "3D model"} needs the internet. Lessons you've opened before still work offline.</small>`; }
    else {
      frame.addEventListener("load", () => setTimeout(() => load.classList.add("done"), L.kind === "phet" ? 4500 : 1500), { once: true });
      frame.src = labURL(L);
    }
    $("oq-lab-lesson").addEventListener("click", () => openLesson(t, true));
    bump("labsOpened");
    $("oq-lab-full").addEventListener("click", () => { const el = labPage.querySelector(".oq-stage"); (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el); });
    activate("oq-lab");
  }

  top.querySelector("#oq-brand").addEventListener("click", goHome);

  /* ---------- 6. search ---------- */
  const q = $("oq-q"), box = $("oq-results");
  let hits = [], sel = -1;
  function search(text) {
    const words = text.toLowerCase().replace(/['’]/g, "").split(/\s+/).filter(Boolean);
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
      const name = t.name.toLowerCase(), all = `${name} ${t.kw} ${SUBJECTS[t.s].name.toLowerCase()}`.replace(/['’]/g, "");
      const found = words.filter(w => all.includes(w)).length;
      if (found < words.length && !(words.length >= 3 && found >= words.length - 1)) return null;
      // a word in the title that starts with what was typed counts as a strong match ("circuit" -> "Electric Circuits")
      let score = name.startsWith(words[0]) || name.split(/[\s(),\-–]+/).some(nw => nw.startsWith(words[0])) ? 3 : name.includes(words.join(" ")) ? 2 : words.some(w => name.includes(w)) ? 1 : 0;
      if (t.syl) score += .6;
      if (t.cat && t.cat.open) score += 1;
      if (found < words.length) score -= 1;
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

  function renderHome() {
    const d = read(), g = Number(d.grade) || 7, word = d.board === "IGCSE" ? "Grade" : "Class";
    // one suggestion per subject, picked from topics in this class's syllabus
    const shuffle = a => a.slice().sort(() => Math.random() - .5);
    const tries = Object.keys(SUBJECTS).map(sk => shuffle(CATALOG.filter(t => t.s === sk && g >= t.a && g <= t.b && !/quiz|boss|practice/i.test(t.name)))[0]).filter(Boolean).map(t => t.name.replace(/ in 3D$/, ""));
    home.innerHTML = `<div class="oq-center">
      <span class="oq-label">${esc(d.board || "")} · ${word.toUpperCase()} ${g}${d.lang && d.lang !== "English" ? ` · ${esc(LANG_NATIVE[d.lang] || d.lang).toUpperCase()}` : ""}</span>
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
  const sylKey = sk => { const d = read(); return `v2|${d.board || "CBSE"}|${Number(d.grade) || 7}|${SUBJECTS[sk].name}|${bookFor(sk, d)}`; };
  const sylCached = sk => { try { return (JSON.parse(localStorage.getItem(SKEY)) || {})[sylKey(sk)] || null; } catch (_) { return null; } };
  function getSyllabus(sk) {
    const cached = sylCached(sk);
    if (cached) return Promise.resolve(cached);
    const key = sylKey(sk);
    if (pending[key]) return pending[key];
    pending[key] = fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "syllabus", subject: SUBJECTS[sk].name, message: "syllabus", book: bookFor(sk) }) })
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
  const LAB_RULES = {
    maths: [[/quadratic/, "Graphing Quadratics"], [/(linear equations? in two|coordinate|straight line|graph)/, "Straight-Line Graphs"], [/(linear equation|finding the unknown|simple (linear )?equation|equations? in one variable|algebra play|forming equations|balance)/, "Equation Balance"], [/fraction/, "Fractions"], [/(integer|negative number|number line)/, "Integers on a Number Line"], [/(area|perimeter|mensuration)/, "Area and Perimeter"], [/(ratio|proportion|unit rate|unitary)/, "Ratio and Unit Rates"], [/(trigonometr|sine|cosine)/, "Trigonometry"], [/probabilit/, "Probability"], [/(statistic|data handling|mean|median|mode)/, "Mean, Median and Mode"]],
    chem: [[/periodic/, "Periodic Table"], [/isotope/, "Isotopes and Atomic Mass"], [/(atom|electron configuration|structure of the atom)/, "Build an Atom"], [/(state|solid|liquid|matter)/, "States of Matter"], [/(acid|base|salt|\bph\b)/, "pH Scale: Acids and Bases"], [/(equation|chemical reaction)/, "Balancing Chemical Equations"], [/(bond|molecule|covalent)/, "Molecule Shapes"], [/(solution|concentration|dissolv)/, "Concentration of Solutions"]],
    bio: [[/(heredity|evolution|natural selection)/, "Natural Selection"], [/(dna|gene|chromosome)/, "DNA in 3D"], [/plant cell/, "Plant Cell in 3D"], [/\bcells?\b|cell structure|unit of life|organelle/, "Animal Cell in 3D"], [/(digest|nutrition in animals|alimentary)/, "Digestive System in 3D"], [/(heart|circulat|transportation|blood)/, "The Human Heart in 3D"], [/(brain|nervous|control and coordination)/, "The Human Brain in 3D"], [/(skeleton|bone|movement)/, "The Skeleton in 3D"], [/(human body|organ system|respirat|excret|organs)/, "Human Body Explorer"]],
    phy: [[/ohm/, "Ohm's Law"], [/(electric|current|circuit)/, "Electric Circuits"], [/(magnetic effect|electromagnet|induction)/, "Electromagnetic Induction"], [/magnet/, "Magnets"], [/friction/, "Friction"], [/(force|motion|newton|speed|velocity)/, "Forces and Motion"], [/(work|energy|power)/, "Energy: Skate Park"], [/(refraction|prism)/, "Refraction of Light"], [/(light|mirror|lens|reflection)/, "Mirrors and Lenses"], [/(gravit|orbit)/, "Gravity and Orbits"], [/sound/, "Sound"], [/wave/, "Waves"], [/pressure/, "Pressure in Liquids"], [/(density|float|sink|buoyan)/, "Density: Float or Sink"], [/(pendulum|oscillat|time period)/, "Pendulum"], [/(solar system|planet|stars)/, "Build a Solar System"]]
  };
  function labFor(text, sk) {
    const t = text.toLowerCase(), g = Number(read().grade) || 7;
    for (const [re, name] of LAB_RULES[sk] || []) {
      if (!re.test(t)) continue;
      const hit = CATALOG.find(x => x.name === name);
      if (hit && g >= hit.a - 1 && g <= hit.b + 1) return hit;
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
    const head = book => `<div class="oq-subhead"><div><span class="oq-label">${esc(d.board || "")} · ${word.toUpperCase()} ${g}</span><h1>${s.name}</h1><p>${book} <button type="button" class="oq-linkbtn" id="oq-bookbtn">${bookFor(sk, d) ? "Change book" : "Set your textbook"}</button></p><div id="oq-bookedit"></div></div><div class="oq-row"><button type="button" class="oq-btn" id="oq-subj-form">${sk === "bio" ? "Key terms" : "Formula sheet"}</button><button type="button" class="oq-btn" id="oq-subj-exam">Take a test</button><input class="oq-filter" id="oq-filter" type="search" placeholder="Filter chapters and subtopics…"></div></div>
      ${labs.length ? `<div class="oq-labs" style="--c:${s.color}"><span class="oq-label">INTERACTIVE</span>${labs.map(t => `<button type="button" class="oq-labbtn" data-lab="${CATALOG.indexOf(t)}">${esc(t.name)}</button>`).join("")}</div>` : ""}`;
    const bindLabs = () => subjPage.querySelectorAll("[data-lab]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); openTopic(CATALOG[b.dataset.lab]); }));
    const bindExam = () => {
      $("oq-subj-exam").addEventListener("click", () => openExam(sk)); $("oq-subj-form").addEventListener("click", () => openFormulas(sk));
      $("oq-bookbtn").addEventListener("click", () => {
        const box = $("oq-bookedit"), cur = bookFor(sk);
        box.innerHTML = `<div class="oq-bookrow"><input id="oq-bookin" type="text" maxlength="120" placeholder="Your ${esc(s.name)} textbook, e.g. ${esc(defaultBook(d.board === "IGCSE" ? "IGCSE" : "ICSE", g, s.name) || "Selina Concise Mathematics")}" value="${esc(cur)}"><button type="button" class="oq-btn primary sm" id="oq-booksave">Use this book</button>${cur ? `<button type="button" class="oq-btn sm" id="oq-bookreset">Reset</button>` : ""}</div><small class="oq-muted">Your chapters and subtopics will follow this book.</small>`;
        $("oq-bookin").focus();
        const save = val => { const dd = read(), books = Object.assign({}, dd.books); const k = `${dd.board}|${dd.grade}|${s.name}`; if (val) books[k] = val; else delete books[k]; write({ books }); openSubject(sk); };
        $("oq-booksave").addEventListener("click", () => save($("oq-bookin").value.trim().slice(0, 120)));
        $("oq-bookin").addEventListener("keydown", e => { if (e.key === "Enter") save(e.target.value.trim().slice(0, 120)); });
        if ($("oq-bookreset")) $("oq-bookreset").addEventListener("click", () => save(""));
      });
    };
    subjPage.innerHTML = head("Loading your chapters…") + `<div class="oq-loading"><span class="oq-dots"><span></span><span></span><span></span></span>Verity is fetching your ${s.name} chapters…</div>`;
    bindLabs(); bindExam();
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
      ${syl.verified ? "" : `<p class="oq-note">${bookFor(sk) ? `This chapter list was put together by Verity from your textbook. If anything doesn't match your book, use "Change book" above.` : `This chapter list was put together by Verity for your board and class. Set your textbook above to match your school's book exactly.`}</p>`}`;
    bindLabs(); bindExam();
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
    const key = `${fullTopic.toLowerCase()}|${g}|${d.board || ""}|${d.lang || "English"}`;
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
      <h1 translate="no">${esc(data.title || t.name)}</h1>
      ${t.inChapter ? `<span class="oq-label">CHAPTER: ${esc(t.inChapter).toUpperCase()}</span>` : ""}
      ${data.hook ? `<p class="oq-hook" translate="no">${esc(data.hook)}</p>` : ""}
      <p class="lead" translate="no">${esc(data.summary || "")}</p>
      ${(data.sections || []).map((s, i) => `<div class="oq-sec" translate="no" style="animation-delay:${i * .08}s"><h3>${esc(s.heading)}</h3><p>${esc(s.text)}</p></div>`).join("")}
      ${data.keyPoints && data.keyPoints.length ? `<div class="oq-sec"><span class="oq-label">KEY POINTS</span><ul class="oq-keys" translate="no">${data.keyPoints.map(k => `<li>${esc(k)}</li>`).join("")}</ul></div>` : ""}
      ${data.funFact ? `<div class="oq-sec oq-funfact"><span class="oq-label">FUN FACT</span><p translate="no">${esc(data.funFact)}</p></div>` : ""}
      ${data.quiz && data.quiz.length ? `<div class="oq-sec oq-quizsec"><span class="oq-label">QUICK CHECK · +10 XP EACH</span>${data.quiz.map((qq, i) => `<div class="oq-q" translate="no" data-q="${i}"><p>${i + 1}. ${esc(qq.q)}</p><div class="oq-opts">${qq.options.map((o, k) => `<button type="button" class="oq-opt" data-k="${k}">${esc(o)}</button>`).join("")}</div><div class="oq-exp">${esc(qq.explain || "")}</div></div>`).join("")}</div>` : ""}
      <div class="oq-actions">
        <button type="button" class="oq-btn primary" id="oq-ask">Ask Verity a question about this</button>
        ${lab && lab.open ? `<button type="button" class="oq-btn" id="oq-lab">Open the interactive lab</button>` : ""}
        ${t.s ? `<button type="button" class="oq-btn" id="oq-map">Concept map</button><button type="button" class="oq-btn" id="oq-cards">Flashcards</button>` : ""}
        <button type="button" class="oq-btn" id="oq-notes">Notes (PDF)</button>
        <button type="button" class="oq-linkbtn" id="oq-new">Write it again</button>
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
        if (t.s) record({ s: t.s, topic: t.inChapter || t.name, q: qq.q, options: qq.options, answer: qq.answer, picked: k, explain: qq.explain });
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
    $("oq-notes").addEventListener("click", () => printNotes(data.title || t.name));
    if ($("oq-map")) $("oq-map").addEventListener("click", () => openMap({ s: t.s, topic: t.inChapter || t.name, auto: true }));
    if ($("oq-cards")) $("oq-cards").addEventListener("click", () => openCards({ s: t.s, topic: t.inChapter ? `${t.name} (${t.inChapter})` : t.name, auto: true }));
    bump("lessonsRead");
    lesson.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => openTopic(CATALOG[b.dataset.t])));
  }

  /* ---------- 10. board + class: asked every time the site opens ---------- */
  const LANGUAGES = [
    ["English", "English"], ["Hindi", "हिन्दी"], ["Bengali", "বাংলা"], ["Marathi", "मराठी"], ["Telugu", "తెలుగు"], ["Tamil", "தமிழ்"],
    ["Gujarati", "ગુજરાતી"], ["Urdu", "اردو"], ["Kannada", "ಕನ್ನಡ"], ["Odia", "ଓଡ଼ିଆ"], ["Malayalam", "മലയാളം"], ["Punjabi", "ਪੰਜਾਬੀ"],
    ["French", "Français"], ["German", "Deutsch"], ["Spanish", "Español"], ["Arabic", "العربية"], ["Chinese", "中文"], ["Japanese", "日本語"]
  ];
  /* --- textbooks: chapters follow the Vidyashilp syllabus (Selina Concise for ICSE, Cambridge for IGCSE) --- */
  function defaultBook(board, grade, subject) {
    if (board === "ICSE") return `Selina Concise ${subject === "Maths" ? "Mathematics" : subject}`;
    if (board === "IGCSE") {
      if (grade <= 8) return subject === "Maths" ? "Cambridge Lower Secondary Mathematics" : `Cambridge Lower Secondary Science (${subject})`;
      return { Maths: "Cambridge IGCSE Mathematics (0580)", Physics: "Cambridge IGCSE Physics (0625)", Chemistry: "Cambridge IGCSE Chemistry (0620)", Biology: "Cambridge IGCSE Biology (0610)" }[subject];
    }
    return "";
  }
  // the textbook for a subject: one the student set, else the usual book for their board
  function bookFor(sk, d = read()) {
    const name = SUBJECTS[sk].name, own = d.books && d.books[`${d.board}|${d.grade}|${name}`];
    return own || defaultBook(d.board, Number(d.grade) || 7, name);
  }

  function openProfile() {
    const d = read();
    let board = d.board || null, grade = Number(d.grade) || null, lang = d.lang || "English", step = 0;
    const m = document.createElement("div");
    m.className = "oq-modal";
    const draw = () => {
      const word = board === "IGCSE" ? "Grade" : "Class";
      const ready = [board, grade, lang][step];
      const body = step === 0
        ? `<h2>Which board are you in?</h2><p>We'll match chapters and questions to your syllabus.</p><div class="oq-choices">${[["CBSE", "NCERT"], ["ICSE", "CISCE"], ["IGCSE", "Cambridge"], ["State", "State board"], ["Other", "Any"]].map(([b, s]) => `<button type="button" class="oq-choice ${board === b ? "on" : ""}" data-v="${b}">${b}<small>${s}</small></button>`).join("")}</div>`
        : step === 1
        ? `<h2>Which ${word.toLowerCase()} are you in?</h2><p>Topics and difficulty will fit your ${word.toLowerCase()}.</p><div class="oq-choices">${[6, 7, 8, 9, 10].map(g => `<button type="button" class="oq-choice ${grade === g ? "on" : ""}" data-v="${g}">${word} ${g}</button>`).join("")}</div>`
        : `<h2>Which language?</h2><p>The website, lessons, tests and Verity will all use this language.</p><div class="oq-choices oq-langs">${LANGUAGES.map(([en, nat]) => `<button type="button" class="oq-choice ${lang === en ? "on" : ""}" data-v="${en}">${nat}${nat !== en ? `<small>${en}</small>` : ""}</button>`).join("")}</div>`;
      m.innerHTML = `<div class="oq-dialog"><div class="oq-steps">${[0, 1, 2].map(i => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>
        <span class="oq-label">STEP ${step + 1} OF 3</span>${body}
        <div class="oq-foot">${step ? `<button type="button" class="oq-backbtn" id="oq-prev">Back</button>` : "<span></span>"}<button type="button" class="oq-go" id="oq-next" ${ready ? "" : "disabled"}>${step === 2 ? "Start learning" : "Next"}</button></div></div>`;
      m.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
        if (step === 0) board = b.dataset.v; else if (step === 1) grade = Number(b.dataset.v); else lang = b.dataset.v;
        draw();
      }));
      if (m.querySelector("#oq-prev")) m.querySelector("#oq-prev").addEventListener("click", () => { step--; draw(); });
      m.querySelector("#oq-next").addEventListener("click", () => {
        if (step < 2) { step++; draw(); return; }
        const changed = board !== d.board || grade !== Number(d.grade);
        write({ board, grade, lang }); trSoon();
        m.remove();
        if (changed) Object.keys(FRAMES).forEach(id => { const f = $(id).querySelector("iframe"); if (f.getAttribute("src")) { try { f.contentWindow.location.reload(); } catch (_) { f.removeAttribute("src"); } } });
        refreshTop();
        prefetchAll();
        if ($("oq-home").classList.contains("active")) renderHome();
        else if ($("oq-subject").classList.contains("active")) { const sk = Object.keys(SUBJECTS).find(k => current.page.startsWith(SUBJECTS[k].name)); if (sk) openSubject(sk); }
      });
      setTimeout(() => { const nx = m.querySelector("#oq-next"); if (nx) nx.focus(); }, 30);
    };
    draw();
    document.body.appendChild(m);
  }
  const LANG_NATIVE = Object.fromEntries(LANGUAGES);

  /* ---------- 10b. helper for AI calls ---------- */
  async function askAI(payload) {
    if (!navigator.onLine) throw new Error("You're offline. Labs and saved lessons still work, but Verity needs the internet for this.");
    const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.assign({ message: payload.mode }, payload)) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "Verity couldn't do that right now.");
    return j;
  }
  const loadingHTML = text => `<div class="oq-loading"><span class="oq-dots"><span></span><span></span><span></span></span>${text}</div>`;
  const errorHTML = (msg, id) => `<div class="oq-sec"><h3>Something went wrong</h3><p>${esc(msg)}</p><div class="oq-actions"><button type="button" class="oq-btn primary" id="${id}">Try again</button></div></div>`;

  /* ---------- 10c. Check my homework ---------- */
  let hwState = { s: "maths", image: null };
  function openHomework() {
    current = { page: "Check my homework" };
    setCrumb({ name: "Check my homework" });
    activate("oq-hw");
    const st = hwState;
    hwPage.innerHTML = `<div class="oq-page"><span class="oq-label">VERITY · HOMEWORK CHECK</span><h1>Check my homework</h1>
      <p>Type the question and your working (or add a photo). Verity finds the step that went wrong and gives you a hint to fix it.</p>
      <div class="oq-field"><span class="oq-label">SUBJECT</span><div class="oq-row">${Object.entries(SUBJECTS).map(([k, s]) => `<button type="button" class="oq-chip ${st.s === k ? "on" : ""}" style="--c:${s.color}" data-hs="${k}">${s.name}</button>`).join("")}</div></div>
      <div class="oq-field"><span class="oq-label">QUESTION</span><textarea id="hw-q" rows="2"></textarea></div>
      <div class="oq-field"><span class="oq-label">YOUR ANSWER AND WORKING</span><textarea id="hw-w" rows="5"></textarea></div>
      <div class="oq-field oq-photo"><div class="oq-row"><label class="oq-btn" for="hw-file">Add a photo</label><input id="hw-file" type="file" accept="image/*" capture="environment" hidden><button type="button" class="oq-btn" id="hw-clear" ${st.image ? "" : "hidden"}>Remove photo</button></div><div id="hw-prev">${st.image ? `<img src="${st.image}" alt="Your homework photo">` : ""}</div></div>
      <div class="oq-actions" style="margin-top:4px"><button type="button" class="oq-btn primary" id="hw-go">Check it</button></div>
      <div id="hw-out" style="margin-top:18px"></div></div>`;
    const setExample = () => {
      const g = Number(read().grade) || 7, hi = g >= 9;
      const EX = {
        maths: hi ? ["Solve x² − 5x + 6 = 0", "x² − 5x + 6 = 0\n(x − 2)(x + 3) = 0\nx = 2 or x = −3"] : ["Solve 3x + 5 = 20", "3x = 20 + 5\n3x = 25\nx = 8.33"],
        phy: hi ? ["A bulb draws 0.5 A from a 6 V battery. Find its resistance.", "R = I ÷ V\nR = 0.5 ÷ 6\nR = 0.083 Ω"] : ["A car travels 120 km in 2 hours. What is its speed?", "Speed = time ÷ distance\n= 2 ÷ 120\n= 0.017 km/h"],
        chem: hi ? ["Balance the equation: H₂ + O₂ → H₂O", "H₂ + O₂ → 2H₂O"] : ["Is rusting of iron a physical or a chemical change?", "It is a physical change because the iron is still iron."],
        bio: hi ? ["Why do plants need sunlight?", "Plants use sunlight to breathe. They take in oxygen in the day and give out carbon dioxide."] : ["What is the function of the heart?", "The heart cleans the blood and removes waste from it."]
      }[st.s] || ["Type the question here", "Type your answer and working here"];
      $("hw-q").placeholder = "e.g. " + EX[0];
      $("hw-w").placeholder = "e.g.\n" + EX[1];
    };
    setExample();
    hwPage.querySelectorAll("[data-hs]").forEach(b => b.addEventListener("click", () => { st.s = b.dataset.hs; hwPage.querySelectorAll("[data-hs]").forEach(x => x.classList.toggle("on", x === b)); setExample(); }));
    $("hw-file").addEventListener("change", e => {
      const f = e.target.files[0]; if (!f) return;
      const img = new Image(), url = URL.createObjectURL(f);
      img.onload = () => {
        const k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        st.image = c.toDataURL("image/jpeg", .82);
        URL.revokeObjectURL(url);
        $("hw-prev").innerHTML = `<img src="${st.image}" alt="Your homework photo">`; $("hw-clear").hidden = false;
      };
      img.src = url;
    });
    $("hw-clear").addEventListener("click", () => { st.image = null; $("hw-prev").innerHTML = ""; $("hw-clear").hidden = true; $("hw-file").value = ""; });
    $("hw-go").addEventListener("click", runCheck);
  }
  // scrolls so the element sits just below the top bar (works even while the page is still changing)
  function reveal(el) {
    if (!el) return;
    const go = () => { const y = el.getBoundingClientRect().top + window.scrollY - 96; window.scrollTo({ top: Math.max(0, y), behavior: "instant" }); };
    requestAnimationFrame(go);
    setTimeout(go, 350);
  }
  async function runCheck() {
    const st = hwState, out = $("hw-out"), question = $("hw-q").value.trim(), working = $("hw-w").value.trim();
    if (!question && !working && !st.image) { out.innerHTML = `<p class="oq-note">Type your question and working, or add a photo first.</p>`; return; }
    out.innerHTML = loadingHTML("Verity is checking your work…");
    const btn = $("hw-go"), label = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = `<span class="oq-spin oq-btnspin"></span>${esc(label.replace(/<[^>]+>/g, ""))}`;
    reveal(out);
    try {
      const { check: c } = await askAI({ mode: "check", subject: SUBJECTS[st.s].name, question, working, image: st.image });
      const label = { correct: "All correct! Great work.", partly: "Nearly there!", incorrect: "Not quite yet.", unclear: "Verity couldn't fully check this." }[c.verdict];
      out.innerHTML = `<div class="oq-verdict ${c.verdict}">${label} ${esc(c.summary)}</div>
        ${c.steps.length ? `<div class="oq-sec"><span class="oq-label">YOUR STEPS</span>${c.steps.map(x => `<div class="oq-step"><span class="ic ${x.ok ? "y" : "n"}">${x.ok ? "✓" : "✗"}</span><div><b>${esc(x.text)}</b><span>${esc(x.comment)}</span></div></div>`).join("")}</div>` : ""}
        ${c.hint ? `<div class="oq-sec oq-funfact"><span class="oq-label">HINT</span><p>${esc(c.hint)}</p></div>` : ""}
        <div class="oq-actions">${c.solution ? `<button type="button" class="oq-btn" id="hw-sol">Show full solution</button>` : ""}<button type="button" class="oq-btn" id="hw-again">Check another</button></div>
        <div class="oq-sec" id="hw-solbox" hidden><span class="oq-label">FULL SOLUTION</span><p>${esc(c.solution)}</p></div>`;
      if (c.verdict === "correct") giveXP(10);
      reveal(out);
      if ($("hw-sol")) $("hw-sol").addEventListener("click", e => { $("hw-solbox").hidden = false; e.target.remove(); });
      $("hw-again").addEventListener("click", () => { st.image = null; openHomework(); });
    } catch (err) {
      out.innerHTML = errorHTML(err.message, "hw-retry");
      $("hw-retry").addEventListener("click", runCheck);
      reveal(out);
    } finally {
      if (btn.isConnected) { btn.disabled = false; btn.innerHTML = label; }
    }
  }

  /* ---------- 10d. Exam mode ---------- */
  async function openExam(sk) {
    sk = sk || "maths";
    const s = SUBJECTS[sk], d = read(), g = Number(d.grade) || 7, word = d.board === "IGCSE" ? "Grade" : "Class";
    current = { page: `${s.name} exam` };
    setCrumb({ name: "Exam mode", s: sk });
    activate("oq-exam");
    examPage.style.setProperty("--c", s.color);
    examPage.innerHTML = `<div class="oq-page"><span class="oq-label">${esc(d.board || "")} · ${word.toUpperCase()} ${g}</span><h1>Exam mode</h1><p>Pick the chapters, and Verity writes a test in your board's style, marks it and shows what to revise.</p>
      <div class="oq-field"><span class="oq-label">SUBJECT</span><div class="oq-row">${Object.entries(SUBJECTS).map(([k, x]) => `<button type="button" class="oq-chip ${k === sk ? "on" : ""}" style="--c:${x.color}" data-es="${k}">${x.name}</button>`).join("")}</div></div>
      <div class="oq-field"><div class="oq-row" style="justify-content:space-between"><span class="oq-label">CHAPTERS</span><button type="button" class="oq-chip" id="ex-all">Select all</button></div><div id="ex-ch">${loadingHTML("Loading chapters…")}</div></div>
      <div class="oq-field"><span class="oq-label">QUESTIONS</span><div class="oq-row" id="ex-n">${[10, 15, 20].map(n => `<button type="button" class="oq-chip ${n === 10 ? "on" : ""}" data-n="${n}">${n}</button>`).join("")}<label class="oq-numin"><input id="ex-nc" type="number" min="5" max="40" step="1" inputmode="numeric" placeholder="Other"><span>questions</span></label><small class="oq-hint">5 to 40</small></div></div>
      <div class="oq-field"><span class="oq-label">TIME</span><div class="oq-row" id="ex-t">${[[15, "15 min"], [30, "30 min"], [0, "No timer"]].map(([t, l], i) => `<button type="button" class="oq-chip ${i === 0 ? "on" : ""}" data-t="${t}">${l}</button>`).join("")}<label class="oq-numin"><input id="ex-tc" type="number" min="5" max="180" step="1" inputmode="numeric" placeholder="Other"><span>minutes</span></label><small class="oq-hint">5 to 180</small></div></div>
      <div class="oq-actions"><button type="button" class="oq-btn primary" id="ex-go" disabled>Start test</button></div></div>`;
    examPage.querySelectorAll("[data-es]").forEach(b => b.addEventListener("click", () => openExam(b.dataset.es)));
    [["ex-n", "ex-nc"], ["ex-t", "ex-tc"]].forEach(([id, inp]) => {
      const chips = $(id).querySelectorAll(".oq-chip"), box = $(inp);
      chips.forEach(b => b.addEventListener("click", () => { chips.forEach(x => x.classList.toggle("on", x === b)); box.value = ""; box.parentElement.classList.remove("on"); }));
      box.addEventListener("input", () => { const typed = box.value !== ""; box.parentElement.classList.toggle("on", typed); if (typed) chips.forEach(x => x.classList.remove("on")); else chips[0].classList.add("on"); });
      box.addEventListener("blur", () => { if (box.value === "") return; const v = Math.round(Number(box.value)), lo = Number(box.min), hi = Number(box.max); box.value = Math.min(hi, Math.max(lo, isNaN(v) ? lo : v)); });
    });
    let syl;
    try { syl = await getSyllabus(sk); } catch (err) { if ($("ex-ch")) $("ex-ch").innerHTML = `<p class="oq-note">${esc(err.message)}</p>`; return; }
    if (current.page !== `${s.name} exam`) return;
    $("ex-ch").innerHTML = `<div class="oq-checks">${syl.chapters.map((c, i) => `<label><input type="checkbox" value="${i}">${esc(c.name)}</label>`).join("")}</div>`;
    const boxes = [...examPage.querySelectorAll("#ex-ch input")];
    const sync = () => { $("ex-go").disabled = !boxes.some(b => b.checked); };
    boxes.forEach(b => b.addEventListener("change", sync));
    $("ex-all").addEventListener("click", () => { const all = boxes.every(b => b.checked); boxes.forEach(b => { b.checked = !all; }); sync(); });
    $("ex-go").addEventListener("click", () => {
      const chapters = boxes.filter(b => b.checked).map(b => syl.chapters[b.value].name);
      const pickNum = (id, inp, attr) => { const box = $(inp); if (box.value !== "") { const v = Math.round(Number(box.value)); return Math.min(Number(box.max), Math.max(Number(box.min), isNaN(v) ? Number(box.min) : v)); } const on = $(id).querySelector(".oq-chip.on"); return on ? Number(on.dataset[attr]) : (attr === "n" ? 10 : 15); };
      const count = pickNum("ex-n", "ex-nc", "n"), mins = pickNum("ex-t", "ex-tc", "t");
      runExam(sk, chapters, count, mins);
    });
  }
  let examTimer = null;
  async function runExam(sk, chapters, count, mins) {
    const s = SUBJECTS[sk];
    examPage.innerHTML = `<div class="oq-page"><h1>${s.name} test</h1>${loadingHTML("Verity is writing your test…")}</div>`;
    let exam;
    try { exam = (await askAI({ mode: "exam", subject: s.name, chapters, count })).exam; }
    catch (err) { examPage.querySelector(".oq-loading").outerHTML = errorHTML(err.message, "ex-retry"); $("ex-retry").addEventListener("click", () => runExam(sk, chapters, count, mins)); return; }
    if (current.page !== `${s.name} exam`) return;
    const qs = exam.questions, picks = new Array(qs.length).fill(null);
    let left = mins * 60;
    examPage.innerHTML = `<div class="oq-page">
      <div class="oq-timer"><span>${s.name} test · <span id="ex-done">0</span> / ${qs.length} answered</span>${mins ? `<b id="ex-clock"></b>` : ""}</div>
      ${qs.map((q, i) => `<div class="oq-sec oq-q" translate="no" data-q="${i}"><p>${i + 1}. ${esc(q.q)}</p><div class="oq-opts">${q.options.map((o, k) => `<button type="button" class="oq-opt" data-k="${k}">${esc(o)}</button>`).join("")}</div></div>`).join("")}
      <div class="oq-actions"><button type="button" class="oq-btn primary" id="ex-submit">Submit test</button></div></div>`;
    examPage.querySelectorAll(".oq-q").forEach(box => box.querySelectorAll(".oq-opt").forEach(b => b.addEventListener("click", () => {
      picks[box.dataset.q] = Number(b.dataset.k);
      box.querySelectorAll(".oq-opt").forEach(x => x.classList.toggle("picked", x === b));
      $("ex-done").textContent = picks.filter(p => p !== null).length;
    })));
    const finish = () => { clearInterval(examTimer); showResult(sk, qs, picks); };
    $("ex-submit").addEventListener("click", () => {
      const blank = picks.filter(p => p === null).length;
      if (blank && !confirmBlank(blank)) return;
      finish();
    });
    clearInterval(examTimer);
    if (mins) {
      const tick = () => {
        const el = $("ex-clock"); if (!el) { clearInterval(examTimer); return; }
        el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
        el.classList.toggle("low", left <= 60);
        if (left-- <= 0) finish();
      };
      tick(); examTimer = setInterval(tick, 1000);
    }
  }
  let blankWarned = false;
  function confirmBlank(n) {
    if (blankWarned) return true;
    blankWarned = true;
    const b = $("ex-submit"); b.textContent = `${n} unanswered. Submit anyway?`;
    setTimeout(() => { blankWarned = false; if ($("ex-submit")) $("ex-submit").textContent = "Submit test"; }, 4000);
    return false;
  }
  function showResult(sk, qs, picks) {
    const s = SUBJECTS[sk], right = qs.filter((q, i) => picks[i] === q.answer).length, pct = Math.round(right / qs.length * 100);
    const by = {};
    qs.forEach((q, i) => { const c = by[q.chapter] || (by[q.chapter] = { r: 0, n: 0 }); c.n++; if (picks[i] === q.answer) c.r++; });
    const weak = Object.entries(by).filter(([, v]) => v.r / v.n < .6).map(([k]) => k);
    if (right) giveXP(right * 5);
    qs.forEach((q, i) => record({ s: sk, topic: q.chapter, q: q.q, options: q.options, answer: q.answer, picked: picks[i], explain: q.explain }));
    window.scrollTo({ top: 0, behavior: "smooth" });
    examPage.innerHTML = `<div class="oq-page">
      <div class="oq-sec oq-score"><span class="oq-label">${s.name.toUpperCase()} TEST RESULT</span><b>${right} / ${qs.length}</b><p>${pct}% · ${pct >= 85 ? "Excellent! " : pct >= 60 ? "Good work! " : "Keep practising, you'll get there! "} · +${right * 5} XP</p></div>
      <div class="oq-sec"><span class="oq-label">BY CHAPTER</span><div class="oq-bars">${Object.entries(by).map(([k, v]) => { const p = v.r / v.n; return `<div class="oq-bar"><span>${esc(k)}</span><span class="t"><div style="width:${p * 100}%;background:${p >= .6 ? "#25c58a" : "#f07883"}"></div></span><span>${v.r}/${v.n}</span></div>`; }).join("")}</div></div>
      ${weak.length ? `<div class="oq-sec oq-funfact"><span class="oq-label">REVISE THESE</span><div class="oq-row">${weak.map(w => `<button type="button" class="oq-chip" data-rev="${esc(w)}">${esc(w)}</button>`).join("")}</div></div>` : ""}
      <div class="oq-sec"><span class="oq-label">REVIEW YOUR ANSWERS</span>${qs.map((q, i) => `<div class="oq-q"><p translate="no">${i + 1}. ${esc(q.q)}</p><div class="oq-opts" translate="no">${q.options.map((o, k) => `<button type="button" class="oq-opt ${k === q.answer ? "right" : k === picks[i] ? "wrong" : ""}" disabled>${esc(o)}</button>`).join("")}</div><div class="oq-exp show">${picks[i] === null ? "Not answered. " : ""}<span translate="no">${esc(q.explain)}</span></div></div>`).join("")}</div>
      <div class="oq-actions"><button type="button" class="oq-btn primary" id="ex-new">New test</button><button type="button" class="oq-btn" id="ex-ch2">${s.name} chapters</button></div></div>`;
    examPage.querySelectorAll("[data-rev]").forEach(b => b.addEventListener("click", () => openLesson({ name: b.dataset.rev, s: sk, chapter: true })));
    $("ex-new").addEventListener("click", () => openExam(sk));
    $("ex-ch2").addEventListener("click", () => openSubject(sk));
  }

  /* ---------- 11. Verity knows your board, class and page ---------- */
  const realFetch = window.fetch.bind(window);
  window.fetch = (url, opts) => {
    try {
      if (typeof url === "string" && url.includes("verity") && opts && typeof opts.body === "string") {
        const body = JSON.parse(opts.body), p = read();
        body.profile = { board: p.board || null, grade: Number(p.grade) || null, lang: p.lang || "English" };
        body.page = current.page;
        opts = Object.assign({}, opts, { body: JSON.stringify(body) });
      }
    } catch (_) { /* send as normal */ }
    return realFetch(url, opts);
  };
  const welcome = document.querySelector("#chatbot-messages .bot-message");
  if (welcome) welcome.textContent = "Hi, I'm Verity, your OmniQuest AI tutor. Ask me anything about Chemistry, Maths, Biology or Physics, in any language. I can explain topics, check your working or quiz you.";
  document.querySelectorAll("#chatbot-window small").forEach(el => { if (/helper/i.test(el.textContent)) el.textContent = "YOUR AI TUTOR"; });

  /* ---------- 11b. works offline + installable ---------- */
  const manifest = document.createElement("link");
  manifest.rel = "manifest"; manifest.href = "manifest.json";
  document.head.appendChild(manifest);
  if (!document.querySelector('meta[name="theme-color"]')) { const tc = document.createElement("meta"); tc.name = "theme-color"; tc.content = "#0f1726"; document.head.appendChild(tc); }
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => { /* offline mode not available */ });
  const netState = () => $("oq-offline").classList.toggle("show", !navigator.onLine);
  window.addEventListener("online", netState); window.addEventListener("offline", netState);

  /* ---------- 11c. site language: translates every button, heading and hint ---------- */
  // Each piece of text is translated once by Verity, saved in this browser, and reused (also offline).
  const TKEY = "omniQuestTr";
  const trStore = (() => { try { return JSON.parse(localStorage.getItem(TKEY)) || {}; } catch (_) { return {}; } })();
  const trSave = () => { try { localStorage.setItem(TKEY, JSON.stringify(trStore)); } catch (_) { /* storage full */ } };
  const TR_SKIP = '[translate="no"], .eqn, .ans, .chatbot-messages > :not(:first-child), .oq-langs, .oq-brand, .oq-credit, .al-symbol, textarea, script, style, code, pre, svg:not(.oq-tr)';
  const TR_UNIT_TAGS = new Set(["B", "STRONG", "I", "EM", "SPAN", "SMALL", "SUP", "SUB", "BR", "MARK", "U"]);
  const unitRec = new WeakMap();
  // a sentence with <b>highlighted</b> words is translated as one piece, so the word order stays right
  function isUnit(el) {
    if (el.hasAttribute("data-oqt")) return true;
    if (!el.children.length || el.closest(TR_SKIP) || el.querySelector(TR_SKIP) || (el.parentElement && el.parentElement.closest("[data-oqt]"))) return false;
    for (const k of el.querySelectorAll("*")) if (!TR_UNIT_TAGS.has(k.tagName) || k.id || Object.keys(k.dataset).length) return false;
    if (![...el.childNodes].some(n => n.nodeType === 3 && /[A-Za-z]{3,}/.test(n.nodeValue))) return false;
    el.setAttribute("data-oqt", "1");
    return true;
  }
  const tagCount = h => (h.match(/<[a-z]/gi) || []).length;
  const trTpl = document.createElement("template");
  const normHTML = h => { trTpl.innerHTML = h; return trTpl.innerHTML; };
  const TR_KEEP = /^(CBSE|ICSE|IGCSE|OmniQuest|Verity|PhET|Sketchfab|XP|Lv \d+)$/i;
  const textRec = new WeakMap(), attrRec = new WeakMap(), trDocs = new WeakSet();
  const trWait = new Set(), trFail = new Map();
  let trBusy = 0, trTimer = null;
  const siteLang = () => (read().lang || "English");
  const trKey = s => s.replace(/\s+/g, " ").trim();
  const worth = s => s.length >= 2 && s.length <= 280 && /[A-Za-z]{3,}/.test(s) && !TR_KEEP.test(s);
  const shownNow = el => { try { return !!(el && el.getClientRects().length); } catch (_) { return true; } };
  function trText(orig, lang) {
    const key = trKey(orig), dict = trStore[lang] || {};
    if (!worth(key)) return orig;
    if (dict[key] !== undefined) return orig.match(/^\s*/)[0] + dict[key] + orig.match(/\s*$/)[0];
    return null;
  }
  function trScanDoc(doc, lang, want) {
    if (!doc || !doc.body) return;
    doc.body.querySelectorAll("h1, h2, h3, h4, p, li, label, span, div, b, small, td, th, button, a").forEach(el => {
      if (!isUnit(el)) return;
      let rec = unitRec.get(el);
      if (!rec || el.innerHTML !== rec.shown) { rec = { orig: el.innerHTML, shown: el.innerHTML }; unitRec.set(el, rec); }
      let next = rec.orig;
      if (lang !== "English") {
        const key = trKey(rec.orig), dict = trStore[lang] || {};
        if (key.length <= 400) {
          if (dict[key] === undefined) { if (shownNow(el)) want.add(key); }
          else if (tagCount(dict[key]) === tagCount(key)) next = normHTML(dict[key]);
        }
      }
      if (el.innerHTML !== next) el.innerHTML = next;
      rec.shown = el.innerHTML;
    });
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || el.closest(TR_SKIP) || el.closest("[data-oqt]")) continue;
      let rec = textRec.get(n);
      if (!rec || n.nodeValue !== rec.shown) { rec = { orig: n.nodeValue, shown: n.nodeValue }; textRec.set(n, rec); }
      let next = rec.orig;
      if (lang !== "English") {
        const t = trText(rec.orig, lang);
        if (t === null) { if (shownNow(el)) want.add(trKey(rec.orig)); }
        else next = t;
      }
      if (n.nodeValue !== next) { n.nodeValue = next; }
      rec.shown = next;
    }
    doc.body.querySelectorAll("[placeholder], [title], [aria-label]").forEach(el => {
      if (el.closest('[translate="no"], .chatbot-messages, .oq-langs')) return;
      let recs = attrRec.get(el); if (!recs) { recs = {}; attrRec.set(el, recs); }
      ["placeholder", "title", "aria-label"].forEach(a => {
        const v = el.getAttribute(a); if (v === null) return;
        let r = recs[a];
        if (!r || v !== r.shown) r = recs[a] = { orig: v, shown: v };
        let next = r.orig;
        if (lang !== "English") { const t = trText(r.orig, lang); if (t === null) { if (shownNow(el)) want.add(trKey(r.orig)); } else next = t; }
        if (v !== next) el.setAttribute(a, next);
        r.shown = next;
      });
    });
  }
  function trDocsAll() {
    const docs = [document];
    document.querySelectorAll("iframe").forEach(f => { try { if (f.contentDocument && f.contentDocument.body && f.contentWindow.location.origin === location.origin) docs.push(f.contentDocument); } catch (_) { /* other website */ } });
    return docs;
  }
  function trWatch(doc) {
    if (trDocs.has(doc) || !doc.body) return;
    trDocs.add(doc);
    // ignore changes inside drawings (labs animate their SVGs many times a second)
    new MutationObserver(list => { if (list.some(m => !(m.target.closest ? m.target.closest("svg, canvas") : m.target.parentElement && m.target.parentElement.closest("svg")))) trSoon(); }).observe(doc.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "class", "hidden", "style"] });
  }
  // runs at most every 150 ms, even while a page keeps changing
  function trSoon() { if (trTimer) return; trTimer = setTimeout(() => { trTimer = null; trScan(); }, 150); }
  function trScan() {
    const lang = siteLang(), want = new Set();
    document.documentElement.lang = ({ English: "en", Hindi: "hi", Bengali: "bn", Marathi: "mr", Telugu: "te", Tamil: "ta", Gujarati: "gu", Urdu: "ur", Kannada: "kn", Odia: "or", Malayalam: "ml", Punjabi: "pa", French: "fr", German: "de", Spanish: "es", Arabic: "ar", Chinese: "zh", Japanese: "ja" })[lang] || "en";
    trDocsAll().forEach(d => { trWatch(d); trScanDoc(d, lang, want); });
    if (lang === "English") return;
    const now = Date.now();
    want.forEach(k => { if (!trWait.has(k) && !(trFail.get(k) > now)) trWait.add(k); });
    trPump(lang);
  }
  async function trPump(lang) {
    if (trBusy >= 2 || !trWait.size || !navigator.onLine) return;
    const batch = [...trWait].slice(0, 60);
    batch.forEach(k => trWait.delete(k));
    trBusy++;
    trProgress(lang, batch.length);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "translate", lang, texts: batch }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !Array.isArray(j.texts) || j.texts.length !== batch.length) throw new Error(j.error || "translate failed");
      const dict = trStore[lang] = trStore[lang] || {};
      batch.forEach((k, i) => { dict[k] = String(j.texts[i]).trim() || k; });
      trSave();
    } catch (_) {
      const later = Date.now() + 30000;
      batch.forEach(k => trFail.set(k, later));
      setTimeout(trSoon, 31000);
    } finally {
      trBusy--;
      trDoneN += batch.length;
      if (siteLang() === lang) trScan();
      trProgress(lang, 0);
    }
  }
  // Shows that the language is loading, so nobody thinks it is broken:
  // a big card with a spinner when a whole page is being translated (after choosing a language),
  // and a small "Translating…" bar at the bottom for a few new words.
  let trAllN = 0, trDoneN = 0, trBigOn = false, trHideT = null, trBigT = null;
  const trUI = document.createElement("div");
  trUI.setAttribute("translate", "no");
  trUI.innerHTML = `<div class="oq-trbig" id="oq-trbig" hidden><div class="oq-trcard"><span class="oq-trring"></span><b id="oq-trbig-t"></b><small id="oq-trbig-s"></small><div class="oq-trbar"><i id="oq-trbig-bar"></i></div><button type="button" id="oq-trbig-x">Keep browsing while it loads</button></div></div>
    <div class="oq-trsmall" id="oq-trsmall" hidden><span class="oq-trring sm"></span><span id="oq-trsmall-t"></span></div>`;
  document.body.appendChild(trUI);
  function trProgress(lang, adding) {
    const nat = LANG_NATIVE[lang] || lang, left = trWait.size;
    if (adding) {
      if (!trBusy || trAllN === 0 || trDoneN >= trAllN) { trAllN = 0; trDoneN = 0; }
      trAllN += adding;
      // a lot of text at once means a new language or a new page: show the big card
      if (!trBigOn && trAllN + left >= 15 && !$("oq-trbig").dataset.closed && !document.querySelector(".oq-modal")) { trBigOn = true; $("oq-trbig").hidden = false; clearTimeout(trBigT); trBigT = setTimeout(() => { trBigOn = false; $("oq-trbig").hidden = true; }, 25000); }
    }
    const total = Math.max(trAllN, trDoneN) + left, pc = total ? Math.min(100, Math.round(trDoneN / total * 100)) : 100;
    const busy = trBusy > 0 || left > 0;
    $("oq-trbig-t").textContent = `Changing the language to ${nat}`;
    $("oq-trbig-s").textContent = `Translating the page… ${pc}%`;
    $("oq-trbig-bar").style.width = `${Math.max(6, pc)}%`;
    $("oq-trsmall-t").textContent = `Translating into ${nat}…`;
    clearTimeout(trHideT);
    if (busy) { $("oq-trsmall").hidden = trBigOn; return; }
    // finished: let the bar reach 100%, then hide everything
    trHideT = setTimeout(() => { trBigOn = false; clearTimeout(trBigT); $("oq-trbig").hidden = true; $("oq-trsmall").hidden = true; trAllN = trDoneN = 0; }, 400);
  }
  const trCss = document.createElement("style");
  trCss.textContent = `
    .oq-trbig { position: fixed; inset: 0; z-index: 2147483000; display: grid; place-items: center; background: rgba(7, 11, 22, .72); backdrop-filter: blur(6px); }
    .oq-trbig[hidden], .oq-trsmall[hidden] { display: none; }
    .oq-trcard { width: min(360px, 88vw); padding: 30px 26px 22px; border: 1px solid #2a3650; border-radius: 20px; background: #111a2b; box-shadow: 0 24px 60px rgba(0,0,0,.45); text-align: center; display: grid; justify-items: center; gap: 8px; font-family: "Inter", system-ui, sans-serif; }
    .oq-trcard b { color: #fff; font-size: 18px; margin-top: 8px; }
    .oq-trcard small { color: #9fb0c8; font-size: 13.5px; }
    .oq-trbar { width: 100%; height: 6px; border-radius: 6px; background: #22324a; overflow: hidden; margin-top: 8px; }
    .oq-trbar i { display: block; height: 100%; width: 6%; border-radius: 6px; background: linear-gradient(90deg, #55cfff, #8b7dff); transition: width .4s ease; }
    .oq-trcard button { margin-top: 10px; border: 0; background: none; color: #7f93b2; font: 600 12.5px "Inter", system-ui, sans-serif; cursor: pointer; text-decoration: underline; }
    .oq-trring { width: 46px; height: 46px; border-radius: 50%; border: 4px solid #22324a; border-top-color: #55cfff; border-right-color: #8b7dff; animation: oqSpin .8s linear infinite; }
    .oq-trring.sm { width: 16px; height: 16px; border-width: 2.5px; }
    .oq-trsmall { position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 2147483000; display: flex; align-items: center; gap: 10px; padding: 10px 16px; border: 1px solid #2a3650; border-radius: 999px; background: #111a2b; color: #e8ecf8; font: 600 13.5px "Inter", system-ui, sans-serif; box-shadow: 0 12px 30px rgba(0,0,0,.4); }
    @keyframes oqSpin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(trCss);
  $("oq-trbig-x").addEventListener("click", () => { trBigOn = false; $("oq-trbig").hidden = true; $("oq-trbig").dataset.closed = "1"; trProgress(siteLang(), 0); setTimeout(() => { delete $("oq-trbig").dataset.closed; }, 20000); });
  document.addEventListener("load", e => { if (e.target && e.target.tagName === "IFRAME") trSoon(); }, true);
  window.addEventListener("storage", trSoon);
  trSoon();

  /* ---------- 13. study tools: mistake notebook, progress, flashcards, notes, voice ---------- */
  const MKEY = "omniQuestMistakes", PKEY = "omniQuestProgress", CKEY = "omniQuestCards";
  const getJ = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? def : v; } catch (_) { return def; } };
  const putJ = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* storage full */ } };
  const DAY = 864e5;
  const pct = (r, n) => (n ? Math.round(r / n * 100) : 0);
  const barColor = p => (p >= 75 ? "#25c58a" : p >= 50 ? "#f5b544" : "#f07883");

  // every answered question goes through here
  function record(a) {
    if (!a || !a.q || !Array.isArray(a.options) || !SUBJECTS[a.s]) return;
    const ok = a.picked === a.answer, topic = String(a.topic || "Practice").slice(0, 80);
    const P = getJ(PKEY, {}), sp = P[a.s] = P[a.s] || {}, t = sp[topic] = sp[topic] || { r: 0, n: 0 };
    t.n++; if (ok) t.r++; t.last = Date.now();
    putJ(PKEY, P);
    let M = getJ(MKEY, []);
    const i = M.findIndex(m => m.q === a.q);
    if (!ok) {
      const m = { s: a.s, topic, q: String(a.q).slice(0, 400), options: a.options.map(o => String(o).slice(0, 200)), answer: a.answer, picked: a.picked, explain: String(a.explain || "").slice(0, 500), when: Date.now(), fixed: 0 };
      if (i >= 0) M.splice(i, 1);
      M.unshift(m);
      M = M.slice(0, 200);
    } else if (i >= 0 && a.review) {
      M[i].fixed = (M[i].fixed || 0) + 1;
      if (M[i].fixed >= 2) M.splice(i, 1);
    }
    putJ(MKEY, M);
    refreshLinks();
  }
  const bump = field => { const d = read(); write({ [field]: (d[field] || 0) + 1 }); };

  // answers from the Biology and Physics quizzes (science.html)
  window.addEventListener("message", e => { if (e.data && e.data.oq === "answer") record(e.data); });
  // answers from the Chemistry quiz and the Element Boss Fight
  document.addEventListener("click", e => {
    const b = e.target.closest("#quiz-options .quiz-option, #boss-options button");
    if (!b || b.dataset.oqRec) return;
    const boss = !!b.closest("#boss-options");
    setTimeout(() => {
      const opts = [...b.parentElement.querySelectorAll(boss ? "button" : ".quiz-option")];
      const answer = opts.findIndex(x => x.classList.contains("correct"));
      if (answer < 0) return;
      opts.forEach(x => { x.dataset.oqRec = "1"; });
      record({ s: "chem", topic: boss ? "Element Boss Fight" : "Chemistry quiz", q: ($(boss ? "boss-question" : "quiz-question")?.textContent || "").trim(), options: opts.map(x => x.textContent.trim()), answer, picked: opts.indexOf(b), explain: ($(boss ? "boss-feedback" : "quiz-feedback")?.textContent || "").replace(/^[✓✗]\s*/, "").trim() });
    }, 50);
  });

  const toolPage = id => { const sec = document.createElement("section"); sec.id = id; sec.className = "page-section"; main.appendChild(sec); return sec; };
  const mistakesPage = toolPage("oq-mistakes"), progressPage = toolPage("oq-progress"), cardsPage = toolPage("oq-cards");
  function refreshLinks() {
    const n = getJ(MKEY, []).length, due = dueCount();
    const m = $("oq-go-mis"), c = $("oq-go-cards");
    if (m) m.innerHTML = `Mistakes${n ? ` <span class="oq-count">${n}</span>` : ""}`;
    if (c) c.innerHTML = `Flashcards${due ? ` <span class="oq-count">${due}</span>` : ""}`;
  }

  /* --- mistake notebook --- */
  let misFilter = "all";
  function openMistakes() {
    current = { page: "Mistake notebook" };
    setCrumb({ name: "Mistake notebook" });
    activate("oq-mistakes");
    const all = getJ(MKEY, []), list = all.filter(m => misFilter === "all" || m.s === misFilter);
    const counts = {}; all.forEach(m => { counts[m.s] = (counts[m.s] || 0) + 1; });
    mistakesPage.innerHTML = `<div class="oq-page">
      <div class="oq-pagehead"><div><span class="oq-label">STUDY TOOLS</span><h1>Mistake notebook</h1><p>Every question you get wrong is saved here. Answer it correctly twice in practice and it's cleared.</p></div>
        ${list.length ? `<button type="button" class="oq-btn primary" id="mis-go">Practise ${Math.min(10, list.length)} mistakes</button>` : ""}</div>
      ${all.length ? `<div class="oq-row" style="margin-bottom:14px"><button type="button" class="oq-chip ${misFilter === "all" ? "on" : ""}" data-mf="all">All · ${all.length}</button>${Object.keys(SUBJECTS).filter(k => counts[k]).map(k => `<button type="button" class="oq-chip ${misFilter === k ? "on" : ""}" style="--c:${SUBJECTS[k].color}" data-mf="${k}">${SUBJECTS[k].name} · ${counts[k]}</button>`).join("")}</div>` : ""}
      ${list.length ? `<div class="oq-mislist">${list.map(m => `<div class="oq-sec oq-mis" style="--c:${SUBJECTS[m.s].color}">
          <div class="oq-mis-top"><span class="oq-label">${SUBJECTS[m.s].name.toUpperCase()} · ${esc(m.topic).toUpperCase()}</span><button type="button" class="oq-x" data-del="${esc(m.q)}" aria-label="Remove">Remove</button></div>
          <p class="q">${esc(m.q)}</p>
          <div class="oq-ans">${m.picked !== null && m.picked !== undefined && m.options[m.picked] !== undefined ? `<span class="bad">Your answer: ${esc(m.options[m.picked])}</span>` : `<span class="bad">Not answered</span>`}<span class="good">Correct: ${esc(m.options[m.answer])}</span></div>
          ${m.explain ? `<p class="exp">${esc(m.explain)}</p>` : ""}</div>`).join("")}</div>`
        : `<div class="oq-empty-box"><h3>${all.length ? "No mistakes in this subject" : "No mistakes yet"}</h3><p>Answer questions in lessons, quizzes and tests. Anything you get wrong will appear here so you can fix it.</p><button type="button" class="oq-btn primary" id="mis-test">Take a test</button></div>`}
    </div>`;
    mistakesPage.querySelectorAll("[data-mf]").forEach(b => b.addEventListener("click", () => { misFilter = b.dataset.mf; openMistakes(); }));
    mistakesPage.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => { putJ(MKEY, getJ(MKEY, []).filter(m => m.q !== b.dataset.del)); refreshLinks(); openMistakes(); }));
    if ($("mis-go")) $("mis-go").addEventListener("click", () => practiseMistakes(list.slice(0, 10)));
    if ($("mis-test")) $("mis-test").addEventListener("click", () => openExam());
  }
  function practiseMistakes(qs) {
    let i = 0, right = 0;
    const show = () => {
      if (i >= qs.length) {
        const left = getJ(MKEY, []).length;
        mistakesPage.innerHTML = `<div class="oq-page"><div class="oq-sec oq-score"><span class="oq-label">PRACTICE COMPLETE</span><b>${right} / ${qs.length}</b><p>${left ? `${left} mistake${left === 1 ? "" : "s"} still to fix.` : "Your notebook is clear. Great work."}</p></div>
          <div class="oq-actions"><button type="button" class="oq-btn primary" id="mis-back">Back to notebook</button></div></div>`;
        $("mis-back").addEventListener("click", openMistakes);
        return;
      }
      const m = qs[i];
      mistakesPage.innerHTML = `<div class="oq-page"><span class="oq-label">PRACTISING MISTAKES · ${i + 1} OF ${qs.length}</span>
        <div class="oq-prog">${qs.map((_, k) => `<i class="${k < i ? "done" : k === i ? "now" : ""}"></i>`).join("")}</div>
        <div class="oq-sec oq-q" style="--c:${SUBJECTS[m.s].color}"><span class="oq-label">${SUBJECTS[m.s].name.toUpperCase()} · ${esc(m.topic).toUpperCase()}</span><p>${esc(m.q)}</p>
          <div class="oq-opts">${m.options.map((o, k) => `<button type="button" class="oq-opt" data-k="${k}">${esc(o)}</button>`).join("")}</div><div class="oq-exp">${esc(m.explain)}</div></div>
        <div class="oq-actions" id="mis-next"></div></div>`;
      mistakesPage.querySelectorAll(".oq-opt").forEach(b => b.addEventListener("click", () => {
        const k = Number(b.dataset.k), ok = k === m.answer;
        mistakesPage.querySelectorAll(".oq-opt").forEach(x => { x.disabled = true; if (Number(x.dataset.k) === m.answer) x.classList.add("right"); });
        if (ok) { right++; giveXP(5); } else b.classList.add("wrong");
        record({ ...m, picked: k, review: true });
        mistakesPage.querySelector(".oq-exp").classList.add("show");
        $("mis-next").innerHTML = `<button type="button" class="oq-btn primary" id="mis-n">${i + 1 >= qs.length ? "See result" : "Next question"}</button>`;
        $("mis-n").addEventListener("click", () => { i++; show(); });
      }));
    };
    show();
  }

  /* --- progress --- */
  function openProgress() {
    current = { page: "My progress" };
    setCrumb({ name: "My progress" });
    activate("oq-progress");
    const d = read(), P = getJ(PKEY, {}), M = getJ(MKEY, []);
    let R = 0, N = 0;
    Object.values(P).forEach(sp => Object.values(sp).forEach(t => { R += t.r; N += t.n; }));
    const tiles = [["QUESTIONS ANSWERED", N], ["ACCURACY", N ? pct(R, N) + "%" : "–"], ["LESSONS READ", d.lessonsRead || 0], ["LABS EXPLORED", d.labsOpened || 0]];
    progressPage.innerHTML = `<div class="oq-page">
      <div class="oq-pagehead"><div><span class="oq-label">STUDY TOOLS</span><h1>My progress</h1><p>How you're doing in each subject, based on every quiz, test and lesson question you answer.</p></div></div>
      <div class="oq-tiles">${tiles.map(([l, v]) => `<div class="oq-tile"><span>${l}</span><b>${v}</b></div>`).join("")}</div>
      <div class="oq-subgrid">${Object.entries(SUBJECTS).map(([k, s]) => {
        const topics = Object.entries(P[k] || {}), r = topics.reduce((a, [, t]) => a + t.r, 0), n = topics.reduce((a, [, t]) => a + t.n, 0), p = pct(r, n);
        const weakest = topics.sort((x, y) => (x[1].r / x[1].n) - (y[1].r / y[1].n) || y[1].n - x[1].n).slice(0, 5);
        const mis = M.filter(m => m.s === k).length;
        return `<div class="oq-sec oq-subprog" style="--c:${s.color}">
          <div class="oq-subprog-top"><h3>${s.name}</h3><b style="color:${n ? barColor(p) : "#7d8fa8"}">${n ? p + "%" : "–"}</b></div>
          <div class="oq-meter"><div style="width:${p}%;background:${barColor(p)}"></div></div>
          <small>${n} answered${mis ? ` · ${mis} to fix` : ""}</small>
          ${weakest.length ? `<div class="oq-topics">${weakest.map(([name, t]) => { const tp = pct(t.r, t.n); return `<div class="oq-topic"><span>${esc(name)}</span><span class="t"><div style="width:${tp}%;background:${barColor(tp)}"></div></span><span class="v">${t.r}/${t.n}</span>${tp < 75 && !/quiz|boss fight|practice/i.test(name) ? `<button type="button" class="oq-mini" data-rev="${esc(name)}" data-s="${k}">Revise</button>` : `<span></span>`}</div>`; }).join("")}</div>`
            : `<p class="oq-muted">No answers yet. Try a lesson quiz or take a ${s.name} test.</p>`}
          <div class="oq-row" style="margin-top:12px"><button type="button" class="oq-btn sm" data-test="${k}">Take a test</button><button type="button" class="oq-btn sm" data-ch="${k}">Chapters</button></div>
        </div>`;
      }).join("")}</div>
      ${N ? `<div class="oq-actions"><button type="button" class="oq-btn" id="pr-reset">Reset my progress</button></div>` : ""}
    </div>`;
    progressPage.querySelectorAll("[data-rev]").forEach(b => b.addEventListener("click", () => openLesson({ name: b.dataset.rev, s: b.dataset.s, chapter: true })));
    progressPage.querySelectorAll("[data-test]").forEach(b => b.addEventListener("click", () => openExam(b.dataset.test)));
    progressPage.querySelectorAll("[data-ch]").forEach(b => b.addEventListener("click", () => openSubject(b.dataset.ch)));
    if ($("pr-reset")) $("pr-reset").addEventListener("click", e => {
      if (e.target.dataset.sure) { putJ(PKEY, {}); openProgress(); return; }
      e.target.dataset.sure = "1"; e.target.textContent = "Click again to reset"; setTimeout(() => { if (e.target.isConnected) { delete e.target.dataset.sure; e.target.textContent = "Reset my progress"; } }, 4000);
    });
  }

  /* --- flashcards (spaced repetition: cards you know come back later, cards you miss come back soon) --- */
  const BOX_DAYS = [0, 1, 3, 7, 14, 30];
  const decks = () => getJ(CKEY, []);
  const saveDecks = v => { putJ(CKEY, v); refreshLinks(); };
  function dueCount() { const now = Date.now(); return decks().reduce((a, dk) => a + dk.cards.filter(c => c.due <= now).length, 0); }
  let cardSubj = "bio";
  function openCards(prefill) {
    current = { page: "Flashcards" };
    setCrumb({ name: "Flashcards" });
    activate("oq-cards");
    if (prefill && prefill.s) cardSubj = prefill.s;
    const all = decks(), now = Date.now();
    const syl = sylCached(cardSubj), chapters = syl ? syl.chapters.map(c => c.name) : [];
    cardsPage.innerHTML = `<div class="oq-page">
      <div class="oq-pagehead"><div><span class="oq-label">STUDY TOOLS</span><h1>Flashcards</h1><p>Verity makes a deck for any chapter or topic. Cards you know come back later; cards you miss come back sooner.</p></div></div>
      <div class="oq-sec oq-make">
        <span class="oq-label">MAKE A NEW DECK</span>
        <div class="oq-row" style="margin:8px 0 12px">${Object.entries(SUBJECTS).map(([k, s]) => `<button type="button" class="oq-chip ${cardSubj === k ? "on" : ""}" style="--c:${s.color}" data-cs="${k}">${s.name}</button>`).join("")}</div>
        <div class="oq-makerow"><input id="cd-topic" list="cd-list" type="text" placeholder="Chapter or topic, e.g. ${esc(chapters[0] || "Photosynthesis")}" value="${esc((prefill && prefill.topic) || "")}" autocomplete="off"><datalist id="cd-list">${chapters.map(c => `<option value="${esc(c)}">`).join("")}</datalist><button type="button" class="oq-btn primary" id="cd-make">Make flashcards</button></div>
        <div id="cd-msg"></div>
      </div>
      ${all.length ? `<span class="oq-label" style="margin-top:20px;display:block">YOUR DECKS</span><div class="oq-decks">${all.map((dk, i) => {
        const due = dk.cards.filter(c => c.due <= now).length, known = dk.cards.filter(c => c.box >= 3).length;
        return `<div class="oq-deck" style="--c:${SUBJECTS[dk.s] ? SUBJECTS[dk.s].color : "#55cfff"}"><div><b>${esc(dk.topic)}</b><small>${SUBJECTS[dk.s] ? SUBJECTS[dk.s].name : ""} · ${dk.cards.length} cards · ${known} learnt</small></div>
          <div class="oq-row"><span class="oq-due ${due ? "on" : ""}">${due ? `${due} due` : "All done"}</span><button type="button" class="oq-btn sm ${due ? "primary" : ""}" data-study="${i}">${due ? "Study" : "Study again"}</button><button type="button" class="oq-x" data-deldeck="${i}" aria-label="Delete deck">Delete</button></div></div>`;
      }).join("")}</div>` : ""}
    </div>`;
    cardsPage.querySelectorAll("[data-cs]").forEach(b => b.addEventListener("click", () => { cardSubj = b.dataset.cs; openCards({ topic: $("cd-topic").value }); if (!sylCached(cardSubj)) getSyllabus(cardSubj).then(() => { if (current.page === "Flashcards") openCards({ topic: $("cd-topic")?.value }); }).catch(() => {}); }));
    cardsPage.querySelectorAll("[data-study]").forEach(b => b.addEventListener("click", () => studyDeck(Number(b.dataset.study))));
    cardsPage.querySelectorAll("[data-deldeck]").forEach(b => b.addEventListener("click", e => {
      if (!e.target.dataset.sure) { e.target.dataset.sure = "1"; e.target.textContent = "Sure?"; return; }
      const v = decks(); v.splice(Number(b.dataset.deldeck), 1); saveDecks(v); openCards();
    }));
    const make = async () => {
      const topic = $("cd-topic").value.trim();
      if (!topic) { $("cd-topic").focus(); return; }
      const btn = $("cd-make"); btn.disabled = true;
      $("cd-msg").innerHTML = `<div class="oq-loading" style="margin-top:12px"><span class="oq-dots"><span></span><span></span><span></span></span>Verity is making your flashcards…</div>`;
      try {
        const j = await askAI({ mode: "cards", topic, subject: SUBJECTS[cardSubj].name });
        const cards = (j.cards || []).filter(c => c && c.front && c.back).slice(0, 16);
        if (cards.length < 3) throw new Error("Verity couldn't make cards for that. Try a chapter name.");
        const v = decks();
        v.unshift({ s: cardSubj, topic, made: Date.now(), cards: cards.map(c => ({ f: String(c.front).slice(0, 200), b: String(c.back).slice(0, 400), box: 0, due: 0 })) });
        saveDecks(v.slice(0, 30));
        studyDeck(0);
      } catch (err) {
        btn.disabled = false;
        $("cd-msg").innerHTML = `<p class="oq-err">${esc(err.message)}</p>`;
      }
    };
    $("cd-make").addEventListener("click", make);
    $("cd-topic").addEventListener("keydown", e => { if (e.key === "Enter") make(); });
    if (prefill && prefill.auto && prefill.topic) make();
  }
  function studyDeck(idx) {
    const all = decks(), dk = all[idx]; if (!dk) return openCards();
    const now = Date.now();
    let queue = dk.cards.map((c, i) => i).filter(i => dk.cards[i].due <= now);
    if (!queue.length) queue = dk.cards.map((c, i) => i);
    queue = queue.sort(() => Math.random() - .5);
    const total = queue.length; let done = 0, again = 0;
    const color = SUBJECTS[dk.s] ? SUBJECTS[dk.s].color : "#55cfff";
    const show = () => {
      if (!queue.length) {
        cardsPage.innerHTML = `<div class="oq-page"><div class="oq-sec oq-score"><span class="oq-label">${esc(dk.topic).toUpperCase()}</span><b>${total} cards</b><p>${again ? `${again} card${again === 1 ? "" : "s"} needed another look. They'll come back sooner.` : "You knew every card. They'll come back in a few days."}</p></div>
          <div class="oq-actions"><button type="button" class="oq-btn primary" id="cd-back">Back to decks</button></div></div>`;
        $("cd-back").addEventListener("click", () => openCards());
        giveXP(Math.min(20, total));
        return;
      }
      const c = dk.cards[queue[0]];
      cardsPage.innerHTML = `<div class="oq-page oq-study" style="--c:${color}">
        <div class="oq-studyhead"><span class="oq-label">${esc(dk.topic).toUpperCase()}</span><span class="oq-muted">${done} of ${total} done</span></div>
        <div class="oq-meter" style="margin-bottom:18px"><div style="width:${done / total * 100}%;background:${color}"></div></div>
        <button type="button" class="oq-flash" id="cd-card" aria-label="Flip card"><div class="in"><div class="face front"><span class="oq-label">QUESTION</span><p>${esc(c.f)}</p><small>Click or press Space to flip</small></div><div class="face back"><span class="oq-label">ANSWER</span><p>${esc(c.b)}</p></div></div></button>
        <div class="oq-studybtns" id="cd-btns" hidden><button type="button" class="oq-btn" id="cd-again">Again</button><button type="button" class="oq-btn primary" id="cd-got">Got it</button></div>
        <div class="oq-actions" style="justify-content:center"><button type="button" class="oq-linkbtn" id="cd-stop">Stop studying</button></div>
      </div>`;
      const flip = () => { $("cd-card").classList.toggle("flipped"); $("cd-btns").hidden = false; };
      $("cd-card").addEventListener("click", flip);
      const grade = ok => {
        const v = decks(), card = v[idx] && v[idx].cards[queue[0]];
        if (card) {
          if (ok) { card.box = Math.min(BOX_DAYS.length - 1, card.box + 1); card.due = Date.now() + BOX_DAYS[card.box] * DAY; }
          else { card.box = 0; card.due = 0; }
          saveDecks(v); dk.cards[queue[0]] = card;
        }
        const id = queue.shift();
        if (ok) done++; else { again++; queue.push(id); }
        show();
      };
      $("cd-again").addEventListener("click", () => grade(false));
      $("cd-got").addEventListener("click", () => grade(true));
      $("cd-stop").addEventListener("click", () => openCards());
    };
    show();
  }
  document.addEventListener("keydown", e => {
    if (!cardsPage.classList.contains("active") || !$("cd-card") || /INPUT|TEXTAREA/.test(document.activeElement?.tagName || "")) return;
    if (e.code === "Space") { e.preventDefault(); $("cd-card").click(); }
    else if (!$("cd-btns").hidden && (e.key === "1" || e.key === "ArrowLeft")) $("cd-again").click();
    else if (!$("cd-btns").hidden && (e.key === "2" || e.key === "ArrowRight")) $("cd-got").click();
  });

  /* --- notes as PDF: prints only the lesson, in a clean black-on-white layout --- */
  function printNotes(title) {
    const old = document.title;
    document.title = `${title} - OmniQuest notes`;
    document.body.classList.add("oq-printing");
    const done = () => { document.body.classList.remove("oq-printing"); document.title = old; window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
    setTimeout(done, 1500);
  }

  /* --- talk to Verity: microphone button in the chat --- */
  (function addMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition, form = $("chatbot-form"), input = $("chatbot-input");
    if (!SR || !form || !input || $("oq-mic")) return;
    const LOC = { English: "en-IN", Hindi: "hi-IN", Bengali: "bn-IN", Marathi: "mr-IN", Telugu: "te-IN", Tamil: "ta-IN", Gujarati: "gu-IN", Urdu: "ur-IN", Kannada: "kn-IN", Odia: "or-IN", Malayalam: "ml-IN", Punjabi: "pa-IN", French: "fr-FR", German: "de-DE", Spanish: "es-ES", Arabic: "ar-SA", Chinese: "zh-CN", Japanese: "ja-JP" };
    const mic = document.createElement("button");
    mic.type = "button"; mic.id = "oq-mic"; mic.className = "oq-mic"; mic.setAttribute("aria-label", "Speak your question"); mic.title = "Speak your question";
    mic.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
    form.insertBefore(mic, form.querySelector('button[type="submit"]'));
    let rec = null;
    mic.addEventListener("click", () => {
      if (rec) { rec.stop(); return; }
      rec = new SR();
      rec.lang = LOC[read().lang] || "en-IN";
      rec.interimResults = true;
      const before = input.value;
      rec.onresult = ev => { input.value = (before ? before + " " : "") + [...ev.results].map(r => r[0].transcript).join(""); if (ev.results[ev.results.length - 1].isFinal) { rec.stop(); } };
      rec.onend = () => { mic.classList.remove("on"); const said = input.value.trim(); rec = null; if (said && said !== before.trim()) form.requestSubmit ? form.requestSubmit() : form.querySelector('button[type="submit"]').click(); };
      rec.onerror = () => { mic.classList.remove("on"); rec = null; };
      mic.classList.add("on");
      try { rec.start(); } catch (_) { mic.classList.remove("on"); rec = null; }
    });
  })();

  const studyCss = document.createElement("style");
  studyCss.textContent = `
    .oq-extra .oq-count { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; margin-left: 4px; border-radius: 9px; background: #f07883; color: #fff; font-size: 11px; font-weight: 800; vertical-align: 1px; }
    .oq-pagehead { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
    .oq-pagehead h1 { margin: 2px 0 6px; font-size: clamp(28px, 3.4vw, 40px); color: #fff; }
    .oq-pagehead p { margin: 0; color: #a9b8cc; max-width: 640px; line-height: 1.55; }
    .oq-muted { color: #7d8fa8; font-size: 13.5px; font-weight: 600; }
    .oq-empty-box { text-align: center; padding: 46px 20px; border: 1px dashed #334155; border-radius: 16px; }
    .oq-empty-box h3 { color: #fff; margin: 0 0 6px; }
    .oq-empty-box p { color: #8195ad; margin: 0 auto 16px; max-width: 460px; line-height: 1.55; }
    .oq-mislist { display: grid; gap: 10px; }
    .oq-mis { border-left: 3px solid var(--c); margin: 0 !important; }
    .oq-mis-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
    .oq-mis .q { color: #fff; font-weight: 700; margin: 4px 0 10px; white-space: normal; }
    .oq-ans { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
    .oq-ans span { font-size: 13px; font-weight: 700; padding: 5px 10px; border-radius: 8px; }
    .oq-ans .bad { background: #3d1c25; color: #ffb3bd; }
    .oq-ans .good { background: #10392e; color: #8ff0c4; }
    .oq-mis .exp { color: #a9b8cc; font-size: 13.5px; margin: 0; }
    .oq-x { border: 0; background: transparent; color: #7d8fa8; font: 700 12.5px "Inter", system-ui, sans-serif; cursor: pointer; padding: 4px 6px; border-radius: 6px; }
    .oq-x:hover { color: #f07883; background: #2a1a22; }
    .oq-prog { display: flex; gap: 5px; margin: 8px 0 14px; }
    .oq-prog i { flex: 1; height: 5px; border-radius: 4px; background: #22324a; }
    .oq-prog i.done { background: #55cfff; } .oq-prog i.now { background: #a78bfa; }
    .oq-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .oq-tile { background: linear-gradient(160deg, #1b2639, #141e30); border: 1px solid #2c3d53; border-radius: 14px; padding: 14px 16px; }
    .oq-tile span { display: block; color: #7d8fa8; font-size: 11px; font-weight: 800; letter-spacing: 1.1px; }
    .oq-tile b { font-size: 26px; color: #fff; }
    .oq-subgrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .oq-subprog { margin: 0 !important; border-top: 3px solid var(--c); }
    .oq-subprog-top { display: flex; justify-content: space-between; align-items: baseline; }
    .oq-subprog-top h3 { margin: 0; }
    .oq-subprog-top b { font-size: 22px; }
    .oq-meter { height: 7px; background: #1e293b; border-radius: 6px; overflow: hidden; margin: 8px 0 6px; }
    .oq-meter div { height: 100%; border-radius: 6px; transition: width .5s; }
    .oq-subprog small { color: #7d8fa8; font-weight: 700; }
    .oq-topics { display: grid; gap: 7px; margin-top: 12px; }
    .oq-topic { display: grid; grid-template-columns: minmax(0, 1fr) 90px 42px 64px; gap: 8px; align-items: center; font-size: 13px; color: #dbe7f3; font-weight: 600; }
    .oq-topic > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .oq-topic .t { height: 6px; background: #1e293b; border-radius: 6px; overflow: hidden; }
    .oq-topic .t div { height: 100%; }
    .oq-topic .v { color: #7d8fa8; font-size: 12px; text-align: right; }
    .oq-mini { border: 1px solid #334155; background: #172337; color: #dbe7f3; border-radius: 8px; padding: 4px 8px; font: 700 12px "Inter", system-ui, sans-serif; cursor: pointer; }
    .oq-mini:hover { border-color: var(--c); }
    .oq-btn.sm { padding: 7px 12px; font-size: 13px; }
    .oq-makerow { display: flex; gap: 10px; }
    .oq-makerow input { flex: 1; background: #0f1726; border: 1px solid #334155; border-radius: 11px; padding: 11px 14px; color: #fff; font: 600 15px "Inter", system-ui, sans-serif; outline: none; }
    .oq-makerow input:focus { border-color: #55cfff; box-shadow: 0 0 0 4px #55cfff22; }
    .oq-err { color: #ffb3bd; font-weight: 700; margin: 10px 0 0; }
    .oq-decks { display: grid; gap: 8px; margin-top: 8px; }
    .oq-deck { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; background: linear-gradient(160deg, #1b2639, #141e30); border: 1px solid #2c3d53; border-left: 3px solid var(--c); border-radius: 13px; padding: 12px 14px; }
    .oq-deck b { color: #fff; display: block; }
    .oq-deck small { color: #7d8fa8; font-weight: 700; }
    .oq-due { font-size: 12.5px; font-weight: 800; color: #7d8fa8; }
    .oq-due.on { color: #f5b544; }
    .oq-study { max-width: 720px; margin: 0 auto; }
    .oq-studyhead { display: flex; justify-content: space-between; align-items: center; }
    .oq-flash { display: block; width: 100%; height: 300px; border: 0; padding: 0; background: transparent; perspective: 1400px; cursor: pointer; font: inherit; }
    .oq-flash .in { position: relative; width: 100%; height: 100%; transition: transform .5s; transform-style: preserve-3d; }
    .oq-flash.flipped .in { transform: rotateY(180deg); }
    .oq-flash .face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; padding: 26px; border-radius: 18px; border: 1px solid #2c3d53; background: linear-gradient(160deg, #1d2a40, #141e30); box-shadow: 0 18px 40px #0005; text-align: center; }
    .oq-flash .face p { margin: 0; color: #fff; font-size: 21px; font-weight: 700; line-height: 1.45; }
    .oq-flash .back { transform: rotateY(180deg); border-color: var(--c); }
    .oq-flash .back p { font-size: 18px; font-weight: 600; color: #e2ebf6; }
    .oq-flash small { color: #7d8fa8; font-weight: 600; }
    .oq-studybtns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
    .oq-studybtns[hidden] { display: none; }
    .oq-studybtns .oq-btn { padding: 13px; font-size: 15px; }
    .oq-linkbtn { border: 0; background: none; color: #7d8fa8; font: 700 13px "Inter", system-ui, sans-serif; cursor: pointer; text-decoration: underline; }
    .oq-mic { display: inline-grid; place-items: center; width: 36px; height: 36px; flex: none; border-radius: 50%; border: 1px solid #334155; background: #172337; color: #cfe0f1; cursor: pointer; margin-right: 6px; }
    .oq-mic:hover { border-color: #55cfff; color: #fff; }
    .oq-mic.on { background: #f07883; border-color: #f07883; color: #fff; animation: oqMic 1.2s ease-in-out infinite; }
    @keyframes oqMic { 50% { box-shadow: 0 0 0 7px rgba(240, 120, 131, .25); } }
    @media (max-width: 900px) { .oq-tiles { grid-template-columns: repeat(2, 1fr); } .oq-subgrid { grid-template-columns: 1fr; } .oq-makerow { flex-direction: column; } .oq-topic { grid-template-columns: minmax(0, 1fr) 60px 40px 60px; } }
    @media print {
      body.oq-printing * { visibility: hidden !important; }
      body.oq-printing #oq-lesson, body.oq-printing #oq-lesson * { visibility: visible !important; }
      body.oq-printing #oq-lesson { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
      body.oq-printing { background: #fff !important; }
      body.oq-printing #oq-lesson * { color: #111 !important; background: transparent !important; box-shadow: none !important; text-shadow: none !important; animation: none !important; }
      body.oq-printing #oq-lesson .oq-sec { border: 1px solid #ccc !important; break-inside: avoid; }
      body.oq-printing #oq-lesson .oq-noprint, body.oq-printing #oq-lesson .oq-quizsec, body.oq-printing #oq-lesson .oq-actions, body.oq-printing #oq-lesson .oq-block { display: none !important; }
      body.oq-printing #oq-lesson h1 { font-size: 26pt; }
    }
  `;
  document.head.appendChild(studyCss);

  /* ---------- 14. Study tools menu (top bar), formula sheets and concept maps ---------- */
  const ICON = {
    hw: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    exam: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
    cards: '<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 2h12a2 2 0 0 1 2 2v12"/>',
    mis: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z"/><path d="M9 8l4 4m0-4l-4 4"/>',
    prog: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    form: '<path d="M4 4h16M4 20h16"/><path d="M8 8l8 8M16 8l-8 8"/>',
    map: '<circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><path d="M6 7l4 3.5M18 7l-4 3.5M6 17l4-3.5M18 17l-4-3.5"/>'
  };
  const svgIcon = k => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;
  const TOOLS = [
    ["hw", "Check my homework", "Find the step that went wrong", () => openHomework()],
    ["exam", "Exam mode", "A timed test in your board's style", () => openExam()],
    ["cards", "Flashcards", "Revise with smart cards", () => openCards()],
    ["mis", "Mistake notebook", "Practise what you got wrong", () => openMistakes()],
    ["prog", "My progress", "Your strong and weak topics", () => openProgress()],
    ["form", "Formula sheet", "Every formula for your class", () => openFormulas()],
    ["map", "Concept maps", "See how a chapter fits together", () => openMap()]
  ];
  const toolsWrap = document.createElement("div");
  toolsWrap.className = "oq-toolswrap";
  toolsWrap.innerHTML = `<button type="button" class="oq-pill oq-toolsbtn" id="oq-tools" aria-haspopup="true" aria-expanded="false">${svgIcon("cards").replace('width="18" height="18"', 'width="15" height="15"')}<span>Study tools</span><i class="oq-dot" id="oq-tools-dot" hidden></i></button>
    <div class="oq-menu" id="oq-menu" role="menu" hidden>${TOOLS.map(([k, name, sub]) => `<button type="button" role="menuitem" class="oq-mi" data-tool="${k}"><span class="ic">${svgIcon(k)}</span><span class="tx"><b>${name}</b><small>${sub}</small></span><span class="oq-count" id="oq-mc-${k}" hidden></span></button>`).join("")}</div>`;
  top.querySelector(".oq-right")?.insertBefore(toolsWrap, $("oq-xp"));
  const menu = $("oq-menu"), toolsBtn = $("oq-tools");
  const closeMenu = () => { menu.hidden = true; toolsBtn.setAttribute("aria-expanded", "false"); };
  toolsBtn.addEventListener("click", e => { e.stopPropagation(); refreshLinks(); menu.hidden = !menu.hidden; toolsBtn.setAttribute("aria-expanded", String(!menu.hidden)); });
  menu.querySelectorAll("[data-tool]").forEach(b => b.addEventListener("click", () => { closeMenu(); TOOLS.find(t => t[0] === b.dataset.tool)[3](); }));
  document.addEventListener("click", e => { if (!menu.hidden && !toolsWrap.contains(e.target)) closeMenu(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { closeMenu(); toolsBtn.focus(); } });
  // badges: mistakes waiting and flashcards due
  refreshLinks = function () {
    const n = getJ(MKEY, []).length, due = dueCount();
    const set = (k, v) => { const el = $(`oq-mc-${k}`); if (el) { el.hidden = !v; el.textContent = v; } };
    set("mis", n); set("cards", due);
    const dot = $("oq-tools-dot"); if (dot) dot.hidden = !(n || due);
  };
  refreshLinks();

  /* --- formula sheet --- */
  const FKEY = "omniQuestFormulas";
  let formSubj = "phy";
  async function openFormulas(sk, refresh) {
    if (sk) formSubj = sk;
    const s = SUBJECTS[formSubj], d = read(), g = Number(d.grade) || 7, word = d.board === "IGCSE" ? "Grade" : "Class";
    const isBio = formSubj === "bio", title = isBio ? "Key terms" : "Formula sheet";
    current = { page: "Formula sheet" };
    setCrumb({ name: title, s: formSubj });
    activate("oq-formulas");
    formPage.style.setProperty("--c", s.color);
    const head = `<div class="oq-pagehead"><div><span class="oq-label">${esc(d.board || "")} · ${word.toUpperCase()} ${g}</span><h1>${s.name} ${title.toLowerCase()}</h1><p>${isBio ? "Every key term and definition" : "Every formula and law"} you need for your syllabus, in one place.</p></div>
      <div class="oq-row"><input class="oq-filter" id="fs-find" type="search" placeholder="Find a formula…"><button type="button" class="oq-btn" id="fs-print">Print</button></div></div>
      <div class="oq-row oq-noprint" style="margin-bottom:16px">${Object.entries(SUBJECTS).map(([k, x]) => `<button type="button" class="oq-chip ${k === formSubj ? "on" : ""}" style="--c:${x.color}" data-fs="${k}">${x.name}</button>`).join("")}</div>`;
    formPage.innerHTML = `<div class="oq-page">${head}<div id="fs-body">${loadingHTML(`Verity is putting together your ${s.name} ${title.toLowerCase()}…`)}</div></div>`;
    formPage.querySelectorAll("[data-fs]").forEach(b => b.addEventListener("click", () => openFormulas(b.dataset.fs)));
    $("fs-print").addEventListener("click", () => printPage("oq-formulas", `${s.name} ${title}`));
    const key = `${d.board || "CBSE"}|${g}|${formSubj}|${d.lang || "English"}`, store = getJ(FKEY, {});
    let groups = refresh ? null : store[key];
    if (!groups) {
      try {
        let chapters = [];
        try { chapters = (await getSyllabus(formSubj)).chapters.map(c => c.name); } catch (_) { /* go without chapter names */ }
        groups = (await askAI({ mode: "formulas", subject: s.name, chapters })).groups;
        const st = getJ(FKEY, {}); st[key] = groups; const keys = Object.keys(st); if (keys.length > 12) delete st[keys[0]]; putJ(FKEY, st);
      } catch (err) {
        if (current.page !== "Formula sheet" || formSubj !== (sk || formSubj)) return;
        $("fs-body").innerHTML = errorHTML(err.message, "fs-retry"); $("fs-retry").addEventListener("click", () => openFormulas(formSubj, true));
        return;
      }
    }
    if (current.page !== "Formula sheet" || !$("fs-body")) return;
    $("fs-body").innerHTML = `<div class="oq-fgroups">${groups.map(gr => `<div class="oq-sec oq-fgroup"><span class="oq-label">${esc(gr.chapter).toUpperCase()}</span>
        ${gr.items.map(it => `<div class="oq-frow" data-find="${esc((gr.chapter + " " + it.name + " " + it.formula + " " + it.meaning).toLowerCase())}"><div class="nm">${esc(it.name)}</div><div class="eqn fx" translate="no">${esc(it.formula)}</div><div class="mn">${esc(it.meaning)}</div></div>`).join("")}</div>`).join("")}</div>
      <p class="oq-note oq-noprint">Made by Verity for your board and class. Check with your textbook if anything looks different. <button type="button" class="oq-linkbtn" id="fs-new">Make it again</button></p>`;
    $("fs-new").addEventListener("click", () => openFormulas(formSubj, true));
    $("fs-find").addEventListener("input", e => {
      const v = e.target.value.trim().toLowerCase();
      formPage.querySelectorAll(".oq-frow").forEach(r => { r.style.display = !v || r.dataset.find.includes(v) ? "" : "none"; });
      formPage.querySelectorAll(".oq-fgroup").forEach(gp => { gp.style.display = [...gp.querySelectorAll(".oq-frow")].some(r => r.style.display !== "none") ? "" : "none"; });
    });
  }

  /* --- concept maps --- */
  const MAPKEY = "omniQuestMaps";
  let mapSubj = "bio";
  function openMap(prefill) {
    if (prefill && prefill.s) mapSubj = prefill.s;
    current = { page: "Concept maps" };
    setCrumb({ name: "Concept maps" });
    activate("oq-map");
    const saved = getJ(MAPKEY, []), syl = sylCached(mapSubj), chapters = syl ? syl.chapters.map(c => c.name) : [];
    mapPage.innerHTML = `<div class="oq-page">
      <div class="oq-pagehead"><div><span class="oq-label">STUDY TOOLS</span><h1>Concept maps</h1><p>See a whole chapter on one page: the big ideas and how they connect. Click any idea to open its lesson.</p></div></div>
      <div class="oq-sec oq-make">
        <div class="oq-row" style="margin-bottom:12px">${Object.entries(SUBJECTS).map(([k, s]) => `<button type="button" class="oq-chip ${mapSubj === k ? "on" : ""}" style="--c:${s.color}" data-ms="${k}">${s.name}</button>`).join("")}</div>
        <div class="oq-makerow"><input id="mp-topic" list="mp-list" type="text" placeholder="Chapter or topic, e.g. ${esc(chapters[0] || "Life Processes")}" value="${esc((prefill && prefill.topic) || "")}" autocomplete="off"><datalist id="mp-list">${chapters.map(c => `<option value="${esc(c)}">`).join("")}</datalist><button type="button" class="oq-btn primary" id="mp-make">Make concept map</button></div>
        <div id="mp-msg"></div>
      </div>
      ${saved.length ? `<span class="oq-label" style="margin-top:20px;display:block">YOUR MAPS</span><div class="oq-row" style="margin-top:8px">${saved.map((m, i) => `<button type="button" class="oq-chip" style="--c:${SUBJECTS[m.s] ? SUBJECTS[m.s].color : "#55cfff"}" data-map="${i}">${esc(m.topic)}</button>`).join("")}</div>` : ""}
    </div>`;
    mapPage.querySelectorAll("[data-ms]").forEach(b => b.addEventListener("click", () => { mapSubj = b.dataset.ms; openMap({ topic: $("mp-topic").value }); if (!sylCached(mapSubj)) getSyllabus(mapSubj).then(() => { if (current.page === "Concept maps" && $("mp-topic")) openMap({ topic: $("mp-topic").value }); }).catch(() => {}); }));
    mapPage.querySelectorAll("[data-map]").forEach(b => b.addEventListener("click", () => showMap(getJ(MAPKEY, [])[b.dataset.map])));
    const make = async () => {
      const topic = $("mp-topic").value.trim();
      if (!topic) { $("mp-topic").focus(); return; }
      const d = read(), key = `${topic.toLowerCase()}|${mapSubj}|${d.grade}|${d.lang || "English"}`;
      const hit = getJ(MAPKEY, []).find(m => m.key === key);
      if (hit) return showMap(hit);
      $("mp-make").disabled = true;
      $("mp-msg").innerHTML = `<div class="oq-loading" style="margin-top:12px"><span class="oq-dots"><span></span><span></span><span></span></span>Verity is drawing your concept map…</div>`;
      try {
        const j = await askAI({ mode: "conceptmap", topic, subject: SUBJECTS[mapSubj].name });
        const entry = { key, s: mapSubj, topic, map: j.map };
        const v = getJ(MAPKEY, []).filter(m => m.key !== key); v.unshift(entry); putJ(MAPKEY, v.slice(0, 12));
        if (current.page === "Concept maps") showMap(entry);
      } catch (err) {
        if ($("mp-make")) { $("mp-make").disabled = false; $("mp-msg").innerHTML = `<p class="oq-err">${esc(err.message)}</p>`; }
      }
    };
    $("mp-make").addEventListener("click", make);
    $("mp-topic").addEventListener("keydown", e => { if (e.key === "Enter") make(); });
    if (prefill && prefill.auto && prefill.topic) make();
  }
  function mapSVG(m, color) {
    const PAL = ["#55cfff", "#a78bfa", "#3ddc97", "#ffb347", "#f472b6", "#facc15"];
    const tw = (t, size) => Math.min(230, Math.max(60, t.length * size * .56 + 28));
    const LEAF_H = 38, GAP = 18, W = 1180, CX = W / 2;
    const br = m.branches.map((b, i) => ({ ...b, color: PAL[i % PAL.length], side: i % 2 === 0 ? 1 : -1 }));
    const sides = { 1: br.filter(b => b.side === 1), "-1": br.filter(b => b.side === -1) };
    const blockH = b => Math.max(1, b.leaves.length) * LEAF_H;
    const sideH = k => sides[k].reduce((a, b) => a + blockH(b), 0) + GAP * Math.max(0, sides[k].length - 1);
    const H = Math.max(sideH(1), sideH(-1), 120) + 60, CY = H / 2;
    let out = "";
    const node = (x, y, text, opts) => { const w = tw(text, opts.size); return `<g class="${opts.cls || ""}" ${opts.data || ""}><rect x="${x - w / 2}" y="${y - opts.h / 2}" width="${w}" height="${opts.h}" rx="${opts.h / 2}" fill="${opts.fill}" stroke="${opts.stroke}" stroke-width="1.5"/><text x="${x}" y="${y + opts.size * .36}" text-anchor="middle" font-size="${opts.size}" font-weight="${opts.weight}" fill="${opts.text}">${esc(text)}</text></g>`; };
    const curve = (x1, y1, x2, y2, c, wdt) => `<path d="M${x1} ${y1} C${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}" fill="none" stroke="${c}" stroke-width="${wdt}" opacity=".7"/>`;
    [1, -1].forEach(side => {
      let y = CY - sideH(side) / 2;
      sides[side].forEach(b => {
        const h = blockH(b), by = y + h / 2, bx = CX + side * 250, lx = CX + side * 470;
        const cw = tw(m.center, 17) / 2, bw = tw(b.label, 14) / 2;
        out += curve(CX + side * cw, CY, bx - side * bw, by, b.color, 2.5);
        b.leaves.forEach((l, k) => {
          const ly = y + LEAF_H * k + LEAF_H / 2, lw = tw(l, 12.5) / 2;
          out += curve(bx + side * bw, by, lx - side * lw, ly, b.color, 1.5);
          out += node(lx, ly, l, { size: 12.5, h: 28, fill: "#141e30", stroke: b.color + "88", text: "#dbe7f3", weight: 600, cls: "leaf", data: `data-leaf="${esc(l)}"` });
        });
        out += node(bx, by, b.label, { size: 14, h: 34, fill: b.color + "26", stroke: b.color, text: "#ffffff", weight: 700, cls: "branch", data: `data-leaf="${esc(b.label)}"` });
        y += h + GAP;
      });
    });
    out += node(CX, CY, m.center, { size: 17, h: 46, fill: color, stroke: color, text: "#0b1220", weight: 800 });
    return `<svg class="oq-mapsvg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">${out}</svg>`;
  }
  function showMap(entry) {
    if (!entry || !entry.map) return openMap();
    const color = SUBJECTS[entry.s] ? SUBJECTS[entry.s].color : "#55cfff";
    current = { page: "Concept maps" };
    setCrumb({ name: "Concept maps" });
    activate("oq-map");
    mapPage.innerHTML = `<div class="oq-page oq-mappage">
      <div class="oq-pagehead"><div><span class="oq-label">${SUBJECTS[entry.s] ? SUBJECTS[entry.s].name.toUpperCase() : ""} · CONCEPT MAP</span><h1>${esc(entry.topic)}</h1><p>Click any idea to open its lesson.</p></div>
        <div class="oq-row oq-noprint"><button type="button" class="oq-btn" id="mp-print">Print</button><button type="button" class="oq-btn" id="mp-back">All maps</button></div></div>
      <div class="oq-mapbox">${mapSVG(entry.map, color)}</div></div>`;
    mapPage.querySelectorAll("[data-leaf]").forEach(g => g.addEventListener("click", () => openLesson({ name: g.dataset.leaf, s: entry.s, inChapter: entry.topic })));
    $("mp-back").addEventListener("click", () => openMap({ s: entry.s }));
    $("mp-print").addEventListener("click", () => printPage("oq-map", `${entry.topic} concept map`));
  }
  // print any one page (formula sheet, concept map) cleanly
  function printPage(id, title) {
    const old = document.title;
    document.title = `${title} - OmniQuest`;
    document.body.classList.add("oq-printing", "oq-print-" + id);
    const done = () => { document.body.classList.remove("oq-printing", "oq-print-" + id); document.title = old; window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    window.print();
    setTimeout(done, 1500);
  }
  const formPage = toolPage("oq-formulas"), mapPage = toolPage("oq-map");

  const toolsCss = document.createElement("style");
  toolsCss.textContent = `
    .oq-toolswrap { position: relative; }
    .oq-toolsbtn { position: relative; gap: 7px; }
    .oq-toolsbtn svg { color: #9fdcff; }
    .oq-dot { position: absolute; top: 5px; right: 5px; width: 8px; height: 8px; border-radius: 50%; background: #f07883; box-shadow: 0 0 0 2px #0f1726; }
    .oq-dot[hidden] { display: none; }
    .oq-menu { position: absolute; right: 0; top: calc(100% + 8px); width: 320px; padding: 6px; background: #131d2f; border: 1px solid #334155; border-radius: 14px; box-shadow: 0 24px 60px #000a; z-index: 2000; animation: oqDrop .16s ease-out; }
    .oq-menu[hidden] { display: none; }
    .oq-btn:disabled { opacity: .6; cursor: progress; }
    .oq-btnspin { display: inline-block; width: 13px; height: 13px; border-width: 2px; margin-right: 8px; vertical-align: -2px; border-top-color: currentColor; }
    .oq-mi { display: flex; align-items: center; gap: 12px; width: 100%; border: 0; background: transparent; color: #e2ebf6; text-align: left; padding: 9px 10px; border-radius: 10px; cursor: pointer; }
    .oq-mi:hover, .oq-mi:focus-visible { background: #1f2d45; outline: none; }
    .oq-mi .ic { width: 34px; height: 34px; flex: none; display: grid; place-items: center; border-radius: 10px; background: #1b2840; color: #9fdcff; }
    .oq-mi .tx { flex: 1; min-width: 0; }
    .oq-mi b { display: block; font-size: 14px; }
    .oq-mi small { display: block; color: #7d8fa8; font-size: 12px; font-weight: 600; }
    .oq-mi .oq-count, .oq-count { display: inline-grid; place-items: center; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; background: #f07883; color: #fff; font-size: 11.5px; font-weight: 800; }
    .oq-mi .oq-count[hidden] { display: none; }
    .oq-fgroups { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; align-items: start; }
    .oq-fgroup { margin: 0 !important; border-top: 3px solid var(--c); }
    .oq-frow { display: grid; grid-template-columns: 1fr; gap: 3px; padding: 10px 0; border-top: 1px solid #22324a; }
    .oq-frow:first-of-type { border-top: 0; }
    .oq-frow .nm { color: #a9b8cc; font-size: 12.5px; font-weight: 700; }
    .oq-frow .fx { color: #fff; font-size: 18px; font-weight: 700; letter-spacing: .2px; white-space: normal; }
    .oq-frow .mn { color: #8195ad; font-size: 13px; line-height: 1.5; }
    .oq-mappage { max-width: none; }
    .oq-mapbox { background: linear-gradient(160deg, #141e30, #101828); border: 1px solid #2c3d53; border-radius: 16px; padding: 14px; overflow-x: auto; }
    .oq-mapsvg { display: block; width: 100%; min-width: 860px; height: auto; }
    .oq-mapsvg [data-leaf] { cursor: pointer; }
    .oq-mapsvg [data-leaf]:hover rect { stroke-width: 2.5; filter: brightness(1.25); }
    @media (max-width: 900px) { .oq-fgroups { grid-template-columns: 1fr; } .oq-menu { position: fixed; left: 12px; right: 12px; width: auto; top: 70px; } .oq-toolsbtn span { display: none; } }
    @media print {
      body.oq-print-oq-formulas #oq-formulas, body.oq-print-oq-formulas #oq-formulas *, body.oq-print-oq-map #oq-map, body.oq-print-oq-map #oq-map * { visibility: visible !important; }
      body.oq-print-oq-formulas #oq-formulas, body.oq-print-oq-map #oq-map { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
      body.oq-print-oq-formulas #oq-formulas * { color: #111 !important; background: transparent !important; box-shadow: none !important; animation: none !important; }
      body.oq-print-oq-formulas .oq-fgroup { border: 1px solid #ccc !important; break-inside: avoid; }
      body.oq-print-oq-formulas .oq-noprint, body.oq-print-oq-formulas .oq-row, body.oq-print-oq-map .oq-noprint { display: none !important; }
      body.oq-print-oq-map .oq-mapbox { border: 0 !important; }
      body.oq-print-oq-map #oq-map h1, body.oq-print-oq-map #oq-map p, body.oq-print-oq-map #oq-map .oq-label { color: #111 !important; }
    }
  `;
  document.head.appendChild(toolsCss);

  /* ---------- 12. start ---------- */
  if (sidebar) sidebar.setAttribute("aria-hidden", "true");
  refreshTop();
  netState();
  goHome();
  setTimeout(openProfile, 250);
  if (read().board) prefetchAll();
  console.log(`OmniQuest loaded: ${CATALOG.length} topics.`);
})();
