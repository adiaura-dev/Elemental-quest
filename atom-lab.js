/* =========================================
   ELEMENT QUEST — ATOM LAB 🧪
   Build atoms (protons, neutrons, electrons) and
   molecules in 3D. Drag the picture to spin it.
   This file adds its own menu button and page section.
   ========================================= */

(function () {
  "use strict";

  const main = document.querySelector(".main-content");
  const nav = document.querySelector(".sidebar nav") || document.querySelector("nav");
  if (!main || !nav || document.getElementById("atomlab-section")) return;

  /* ---------- 1. DATA ---------- */

  const SYMBOLS = ["", "H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca","Sc","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","Ga","Ge","As","Se","Br","Kr"];
  const NAMES = ["", "Hydrogen","Helium","Lithium","Beryllium","Boron","Carbon","Nitrogen","Oxygen","Fluorine","Neon","Sodium","Magnesium","Aluminium","Silicon","Phosphorus","Sulfur","Chlorine","Argon","Potassium","Calcium","Scandium","Titanium","Vanadium","Chromium","Manganese","Iron","Cobalt","Nickel","Copper","Zinc","Gallium","Germanium","Arsenic","Selenium","Bromine","Krypton"];
  const MAX_P = 36;

  // Neutron numbers of the stable isotopes of elements 1–36
  const STABLE = {1:[0,1],2:[1,2],3:[3,4],4:[5],5:[5,6],6:[6,7],7:[7,8],8:[8,9,10],9:[10],10:[10,11,12],11:[12],12:[12,13,14],13:[14],14:[14,15,16],15:[16],16:[16,17,18,20],17:[18,20],18:[18,20,22],19:[20,22],20:[20,22,23,24,26],21:[24],22:[24,25,26,27,28],23:[28],24:[26,28,29,30],25:[30],26:[28,30,31,32],27:[32],28:[30,32,33,34,36],29:[34,36],30:[34,36,37,38,40],31:[38,40],32:[38,40,41,42],33:[42],34:[40,42,43,44,46],35:[44,46],36:[44,46,47,48,50]};
  // Neutron number of the most common isotope
  const COMMON = {1:0,2:2,3:4,4:5,5:6,6:6,7:7,8:8,9:10,10:10,11:12,12:12,13:14,14:14,15:16,16:16,17:18,18:22,19:20,20:20,21:24,22:26,23:28,24:28,25:30,26:30,27:32,28:30,29:34,30:34,31:38,32:42,33:42,34:46,35:44,36:48};
  const NOBLE = [2, 10, 18, 36];

  function neutralShells(z) {
    if (z <= 2) return [z];
    if (z <= 10) return [2, z - 2];
    if (z <= 18) return [2, 8, z - 10];
    const special = { 19: [2,8,8,1], 20: [2,8,8,2], 24: [2,8,13,1], 29: [2,8,18,1] };
    if (special[z]) return special[z].slice();
    if (z <= 30) return [2, 8, 8 + (z - 20), 2];
    return [2, 8, 18, z - 28];
  }

  function shellsFor(z, e) {
    const s = neutralShells(z);
    if (e < z) {
      let remove = z - e;
      while (remove > 0 && s.length) {
        const last = s.length - 1;
        const take = Math.min(remove, s[last]);
        s[last] -= take;
        remove -= take;
        if (s[last] === 0) s.pop();
      }
    } else if (e > z) {
      let add = e - z;
      while (add > 0) {
        const last = s.length - 1;
        const cap = last === 0 ? 2 : 8;
        const room = Math.max(0, cap - s[last]);
        if (room === 0) { s.push(0); continue; }
        const take = Math.min(room, add);
        s[last] += take;
        add -= take;
      }
    }
    return s;
  }

  const ATOM_STYLE = {
    H:  { color: "#f1f5f9", r: 17, text: "#1e293b", name: "Hydrogen" },
    C:  { color: "#52525b", r: 25, text: "#ffffff", name: "Carbon" },
    N:  { color: "#3b82f6", r: 24, text: "#ffffff", name: "Nitrogen" },
    O:  { color: "#ef4444", r: 23, text: "#ffffff", name: "Oxygen" },
    F:  { color: "#a3e635", r: 21, text: "#1e293b", name: "Fluorine" },
    Cl: { color: "#22c55e", r: 29, text: "#ffffff", name: "Chlorine" },
    S:  { color: "#facc15", r: 29, text: "#1e293b", name: "Sulfur" },
    Na: { color: "#a855f7", r: 32, text: "#ffffff", name: "Sodium" }
  };
  const PALETTE = ["H", "C", "N", "O", "F", "Cl", "S", "Na"];
  const MAX_ATOMS = 10;

  // Molecule recipes. Positions are in ångströms (real shapes).
  const MOLECULES = [
    { id: "h2", name: "Hydrogen gas", formula: "H₂", atoms: [["H",-0.37,0,0],["H",0.37,0,0]], bonds: [[0,1,1]], shape: "Linear", bondText: "1 single covalent bond", fact: "The lightest gas in the universe. It is also used as rocket fuel." },
    { id: "o2", name: "Oxygen gas", formula: "O₂", atoms: [["O",-0.6,0,0],["O",0.6,0,0]], bonds: [[0,1,2]], shape: "Linear", bondText: "1 double covalent bond", fact: "The oxygen you breathe is made of O₂ molecules." },
    { id: "n2", name: "Nitrogen gas", formula: "N₂", atoms: [["N",-0.55,0,0],["N",0.55,0,0]], bonds: [[0,1,3]], shape: "Linear", bondText: "1 triple covalent bond", fact: "About 78% of the air around you is N₂. Its triple bond is very strong." },
    { id: "cl2", name: "Chlorine gas", formula: "Cl₂", atoms: [["Cl",-1.0,0,0],["Cl",1.0,0,0]], bonds: [[0,1,1]], shape: "Linear", bondText: "1 single covalent bond", fact: "A greenish-yellow, poisonous gas. Small amounts of chlorine keep pool water clean." },
    { id: "f2", name: "Fluorine gas", formula: "F₂", atoms: [["F",-0.71,0,0],["F",0.71,0,0]], bonds: [[0,1,1]], shape: "Linear", bondText: "1 single covalent bond", fact: "Fluorine is the most reactive element of all." },
    { id: "hcl", name: "Hydrogen chloride", formula: "HCl", atoms: [["H",-0.64,0,0],["Cl",0.64,0,0]], bonds: [[0,1,1]], shape: "Linear", bondText: "1 single covalent bond", fact: "Dissolved in water it becomes hydrochloric acid, which is also in your stomach!" },
    { id: "hf", name: "Hydrogen fluoride", formula: "HF", atoms: [["H",-0.46,0,0],["F",0.46,0,0]], bonds: [[0,1,1]], shape: "Linear", bondText: "1 single covalent bond", fact: "Used to etch glass. It is very dangerous to touch." },
    { id: "h2o", name: "Water", formula: "H₂O", atoms: [["O",0,0.12,0],["H",0.76,-0.47,0],["H",-0.76,-0.47,0]], bonds: [[0,1,1],[0,2,1]], shape: "Bent (104.5°)", bondText: "2 single covalent bonds", fact: "Its bent shape makes water polar, which is why it can dissolve so many things." },
    { id: "h2s", name: "Hydrogen sulfide", formula: "H₂S", atoms: [["S",0,0.15,0],["H",0.96,-0.82,0],["H",-0.96,-0.82,0]], bonds: [[0,1,1],[0,2,1]], shape: "Bent (92°)", bondText: "2 single covalent bonds", fact: "It smells like rotten eggs!" },
    { id: "co2", name: "Carbon dioxide", formula: "CO₂", atoms: [["C",0,0,0],["O",-1.16,0,0],["O",1.16,0,0]], bonds: [[0,1,2],[0,2,2]], shape: "Linear (180°)", bondText: "2 double covalent bonds", fact: "You breathe it out, and plants use it to make food in photosynthesis." },
    { id: "co", name: "Carbon monoxide", formula: "CO", atoms: [["C",-0.56,0,0],["O",0.56,0,0]], bonds: [[0,1,3]], shape: "Linear", bondText: "1 triple covalent bond", fact: "A poisonous gas with no colour or smell." },
    { id: "ch4", name: "Methane", formula: "CH₄", atoms: [["C",0,0,0],["H",0.63,0.63,0.63],["H",0.63,-0.63,-0.63],["H",-0.63,0.63,-0.63],["H",-0.63,-0.63,0.63]], bonds: [[0,1,1],[0,2,1],[0,3,1],[0,4,1]], shape: "Tetrahedral (109.5°)", bondText: "4 single covalent bonds", fact: "The main gas in natural gas (CNG), used as fuel." },
    { id: "nh3", name: "Ammonia", formula: "NH₃", atoms: [["N",0,0.3,0],["H",0.94,-0.08,0],["H",-0.47,-0.08,0.81],["H",-0.47,-0.08,-0.81]], bonds: [[0,1,1],[0,2,1],[0,3,1]], shape: "Trigonal pyramid (107°)", bondText: "3 single covalent bonds", fact: "Ammonia is used to make fertilisers that help crops grow." },
    { id: "o3", name: "Ozone", formula: "O₃", atoms: [["O",0,0.25,0],["O",1.09,-0.42,0],["O",-1.09,-0.42,0]], bonds: [[0,1,2],[0,2,1]], shape: "Bent (117°)", bondText: "1 double + 1 single bond", fact: "The ozone layer high in the sky protects us from the Sun's UV rays." },
    { id: "nacl", name: "Sodium chloride (table salt)", formula: "NaCl", atoms: [["Na",-1.2,0,0],["Cl",1.2,0,0]], bonds: [[0,1,0]], shape: "Ions held by attraction", bondText: "Ionic bond (Na⁺ and Cl⁻)", fact: "Sodium gives one electron to chlorine. The + and − ions then stick together.", ionic: true }
  ];

  /* ---------- 2. STYLES ---------- */

  const style = document.createElement("style");
  style.textContent = `
    #atomlab-section .al-tabs { display: flex; gap: 8px; margin: 0 0 16px; flex-wrap: wrap; }
    .al-tab { border: 1px solid #34465d; background: #1e293b; color: #c4d0df; border-radius: 10px; padding: 10px 16px; font-weight: 700; cursor: pointer; transition: all .2s; }
    .al-tab:hover { border-color: #55cfff; color: #fff; }
    .al-tab.active { background: #20334a; color: #62d4ff; border-color: #55cfff; box-shadow: 0 0 18px #55cfff33; }
    .al-layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, 1fr); gap: 18px; align-items: start; }
    .al-card { background: linear-gradient(145deg, #1e293b, #172337); border: 1px solid #34465d; border-radius: 17px; padding: 16px; box-shadow: 0 18px 50px #0003; }
    .al-stage { position: relative; padding: 0; overflow: hidden; }
    .al-canvas { display: block; width: 100%; height: 440px; cursor: grab; touch-action: none; border-radius: 17px 17px 0 0; }
    .al-canvas:active { cursor: grabbing; }
    .al-hint { position: absolute; left: 14px; top: 12px; font-size: 11px; color: #8fb3cf; letter-spacing: .5px; pointer-events: none; }
    .al-toast { position: absolute; left: 50%; top: 14px; transform: translateX(-50%) translateY(-60px); background: #20334a; border: 1px solid #55cfff; color: #fff; padding: 9px 16px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 0 24px #55cfff55; transition: transform .35s cubic-bezier(.2,1.4,.4,1); pointer-events: none; white-space: nowrap; z-index: 2; }
    .al-toast.show { transform: translateX(-50%) translateY(0); }
    .al-controls { padding: 14px 16px 16px; border-top: 1px solid #2c3d53; display: grid; gap: 10px; }
    .al-row { display: flex; align-items: center; gap: 10px; }
    .al-row-label { flex: 1; display: flex; align-items: center; gap: 9px; color: #dbe7f3; font-weight: 700; font-size: 14px; }
    .al-dot { width: 14px; height: 14px; border-radius: 50%; display: inline-block; box-shadow: 0 0 10px currentColor; }
    .al-step { width: 38px; height: 38px; border-radius: 10px; border: 1px solid #3a4b62; background: #263449; color: #fff; font-size: 20px; font-weight: 800; cursor: pointer; transition: transform .12s, background .2s, border-color .2s; }
    .al-step:hover { border-color: #55cfff; background: #30445f; }
    .al-step:active { transform: scale(.88); }
    .al-count { min-width: 34px; text-align: center; font-size: 18px; font-weight: 900; color: #fff; }
    .al-count.bump { animation: alBump .3s ease-out; }
    .al-quick { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .al-quick span { color: #8195ad; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-right: 4px; }
    .al-chip-btn { border: 1px solid #3a4b62; background: #1a2638; color: #cfe3f5; border-radius: 8px; padding: 7px 11px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all .2s; }
    .al-chip-btn:hover { border-color: #55cfff; color: #fff; transform: translateY(-2px); }
    .al-info h2 { margin: 6px 0 2px; font-size: 26px; color: #fff; }
    .al-sub { margin: 0 0 12px; color: #8fb3cf; font-weight: 700; }
    .al-symbol { width: 92px; height: 92px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at 30% 25%, #2e4a6a, #182638); border: 2px solid #55cfff; box-shadow: 0 0 26px #55cfff44; color: #fff; }
    .al-symbol small { font-size: 12px; color: #9fd9ff; font-weight: 800; }
    .al-symbol strong { font-size: 38px; line-height: 1; }
    .al-symbol.pop { animation: alPop .55s cubic-bezier(.2,1.6,.4,1); }
    .al-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 12px 0; }
    .al-stat { background: #172337; border: 1px solid #2c3d53; border-radius: 10px; padding: 9px 10px; }
    .al-stat span { display: block; font-size: 10px; color: #8195ad; font-weight: 800; letter-spacing: 1px; }
    .al-stat strong { font-size: 17px; color: #fff; }
    .al-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .al-badge { padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 1px solid; }
    .al-badge.good { color: #6ee7b7; border-color: #25c58a; background: #10392e; }
    .al-badge.warn { color: #fcd34d; border-color: #d4a017; background: #3a2f0e; animation: alGlow 1.2s ease-in-out infinite; }
    .al-badge.plus { color: #fda4af; border-color: #f07883; background: #3d1d25; }
    .al-badge.minus { color: #c4b5fd; border-color: #8b5cf6; background: #261b45; }
    .al-explain { color: #c8d5e5; font-size: 13.5px; line-height: 1.65; margin: 0 0 10px; }
    .al-progress { font-size: 12px; color: #8fb3cf; font-weight: 700; }
    .al-bar { height: 7px; background: #263449; border-radius: 10px; overflow: hidden; margin-top: 6px; }
    .al-bar div { height: 100%; background: linear-gradient(90deg, #55cfff, #a855f7); border-radius: 10px; transition: width .5s; }
    .al-palette { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .al-atom-btn { border: 1px solid #3a4b62; background: #1a2638; border-radius: 12px; padding: 8px 4px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #cfe3f5; font-size: 11px; font-weight: 700; transition: all .2s; }
    .al-atom-btn:hover { border-color: #55cfff; transform: translateY(-3px); }
    .al-atom-btn:active { transform: scale(.92); }
    .al-ball { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; }
    .al-bench { display: flex; flex-wrap: wrap; gap: 6px; min-height: 36px; align-items: center; }
    .al-bench-empty { color: #6f839b; font-size: 13px; }
    .al-bench-chip { display: flex; align-items: center; gap: 6px; background: #263449; border: 1px solid #3a4b62; border-radius: 20px; padding: 4px 6px 4px 10px; color: #fff; font-weight: 800; font-size: 13px; animation: alPop .35s ease-out; }
    .al-bench-chip button { width: 22px; height: 22px; border-radius: 50%; border: 0; background: #3a4b62; color: #fff; cursor: pointer; font-weight: 900; line-height: 1; }
    .al-bench-chip button:hover { background: #f07883; }
    .al-formula { font-size: 40px; font-weight: 900; color: #fff; letter-spacing: 1px; }
    .al-formula.pop { animation: alPop .6s cubic-bezier(.2,1.6,.4,1); }
    .al-challenge { background: #20334a; border: 1px dashed #55cfff; border-radius: 12px; padding: 10px 12px; margin: 10px 0; color: #dff4ff; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .al-collection { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .al-col-chip { padding: 5px 9px; border-radius: 8px; font-size: 12px; font-weight: 800; border: 1px solid #2c3d53; color: #50627a; background: #151f2e; }
    .al-col-chip.got { color: #6ee7b7; border-color: #25c58a; background: #10392e; }
    .al-section-title { font-size: 11px; color: #8195ad; font-weight: 800; letter-spacing: 1.3px; margin: 4px 0 8px; }
    /* --- tidier layout --- */
    .al-left, .al-right { display: grid; gap: 18px; align-content: start; }
    .al-wrap { position: relative; }
    .al-wrap.shake { animation: alShake .45s linear; }
    .al-wrap::after { content: ""; position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; border-radius: 17px; }
    .al-wrap.flash::after { animation: alFlash .35s ease-out; }
    .al-canvas { border-radius: 17px; }
    .al-panel .al-section-title:first-child { margin-top: 0; }
    .al-parts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
    .al-part { background: #172337; border: 1px solid #2c3d53; border-top: 3px solid var(--c); border-radius: 12px; padding: 10px 8px 12px; text-align: center; }
    .al-part-head { color: #dbe7f3; font-weight: 800; font-size: 12px; letter-spacing: 1px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .al-part-head small { color: #8195ad; font-weight: 700; }
    .al-part-head .al-dot { background: var(--c); color: var(--c); width: 11px; height: 11px; }
    .al-part-ctrl { display: flex; align-items: center; justify-content: center; gap: 8px; }
    .al-part .al-count { font-size: 22px; min-width: 32px; }
    .al-missions { display: grid; gap: 5px; }
    .al-mission { display: flex; align-items: center; gap: 10px; background: #172337; border: 1px solid #2c3d53; border-radius: 9px; padding: 6px 10px; color: #c8d5e5; font-size: 12.5px; font-weight: 700; transition: all .3s; }
    .al-mission .al-check { width: 19px; height: 19px; border-radius: 6px; border: 2px solid #3a4b62; display: flex; align-items: center; justify-content: center; font-size: 13px; flex: none; }
    .al-mission.done { border-color: #25c58a; background: #10392e; color: #6ee7b7; }
    .al-mission.done .al-check { background: #25c58a; border-color: #25c58a; color: #0b1a14; }
    .al-mission.just-done { animation: alMission .7s cubic-bezier(.2,1.5,.4,1); }
    .al-card-title { display: flex; justify-content: space-between; align-items: center; margin: 0 0 10px; color: #fff; font-size: 15px; font-weight: 800; }
    .al-card-title span { color: #55cfff; font-size: 12px; }

    /* --- boss-style effects --- */
    .al-fx { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: 17px; }
    .al-pop { position: absolute; transform: translate(-50%, -50%); font: 900 22px Arial, sans-serif; text-shadow: 3px 3px 0 #0b1220; white-space: nowrap; opacity: 0; animation: alFloat 1.1s ease-out forwards; }
    .al-pop.big { font-size: 40px; letter-spacing: 2px; animation-duration: 1.4s; }
    .al-ring { position: absolute; left: 50%; top: 50%; width: 40px; height: 40px; margin: -20px 0 0 -20px; border: 4px solid var(--c, #55cfff); border-radius: 50%; animation: alRing .6s ease-out forwards; }
    @keyframes alFloat {
      0%   { opacity: 0; transform: translate(-50%, -30%) scale(.4); }
      18%  { opacity: 1; transform: translate(-50%, -60%) scale(1.3); }
      35%  { transform: translate(-50%, -70%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -190%) scale(1); }
    }
    @keyframes alRing { from { transform: scale(.4); opacity: 1; } to { transform: scale(9); opacity: 0; border-width: 1px; } }
    @keyframes alShake { 0%, 100% { transform: translate(0, 0); } 15% { transform: translate(-7px, 3px); } 30% { transform: translate(6px, -4px); } 45% { transform: translate(-5px, -2px); } 60% { transform: translate(4px, 3px); } 75% { transform: translate(-2px, 1px); } }
    @keyframes alFlash { 0% { opacity: .35; } 100% { opacity: 0; } }
    @keyframes alMission { 0% { transform: scale(1); } 40% { transform: scale(1.06); box-shadow: 0 0 22px #25c58a88; } 100% { transform: scale(1); } }
    @keyframes alPop { 0% { transform: scale(.5); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
    @keyframes alBump { 0% { transform: scale(1); } 40% { transform: scale(1.45); color: #55cfff; } 100% { transform: scale(1); } }
    @keyframes alGlow { 50% { box-shadow: 0 0 14px #facc1566; } }
    @media (max-width: 900px) { .al-layout { grid-template-columns: 1fr; } .al-canvas { height: 360px; } }
    @media (max-width: 520px) { .al-parts { gap: 6px; } .al-part { padding: 8px 4px 10px; } .al-part-head { font-size: 10px; } .al-step { width: 32px; height: 32px; font-size: 17px; } .al-part .al-count { font-size: 18px; min-width: 24px; } .al-pop.big { font-size: 30px; } }
  `;
  document.head.appendChild(style);

  /* ---------- 3. PAGE + MENU BUTTON ---------- */

  const navButton = document.createElement("button");
  navButton.className = "nav-button";
  navButton.type = "button";
  navButton.dataset.section = "atomlab-section";
  navButton.textContent = "🧪 Atom Lab";
  nav.appendChild(navButton);

  const section = document.createElement("section");
  section.id = "atomlab-section";
  section.className = "page-section";
  section.innerHTML = `
    <header class="page-header">
      <div>
        <p class="eyebrow">BUILD &amp; EXPLORE</p>
        <h1>Atom Lab</h1>
        <p class="subtitle">Build atoms and molecules in 3D. Drag the picture to spin it around.</p>
      </div>
    </header>

    <div class="al-tabs">
      <button type="button" class="al-tab active" data-mode="atom">⚛ Build an Atom</button>
      <button type="button" class="al-tab" data-mode="molecule">🔗 Build a Molecule</button>
    </div>

    <div class="al-layout">
      <div class="al-left">
        <div class="al-card al-stage">
          <div class="al-wrap" id="al-wrap">
            <canvas class="al-canvas" id="al-canvas" aria-label="3D model"></canvas>
            <div class="al-fx" id="al-fx"></div>
            <div class="al-hint">🖱 DRAG TO SPIN</div>
            <div class="al-toast" id="al-toast"></div>
          </div>
        </div>

        <div class="al-card al-panel" id="al-atom-controls">
          <div class="al-section-title">BUILD YOUR ATOM</div>
          <div class="al-parts">
            <div class="al-part" style="--c:#ff5d73">
              <div class="al-part-head"><span class="al-dot"></span>PROTONS <small>+</small></div>
              <div class="al-part-ctrl">
                <button type="button" class="al-step" data-part="p" data-step="-1" aria-label="Remove proton">−</button>
                <span class="al-count" id="al-count-p">6</span>
                <button type="button" class="al-step" data-part="p" data-step="1" aria-label="Add proton">+</button>
              </div>
            </div>
            <div class="al-part" style="--c:#94a3b8">
              <div class="al-part-head"><span class="al-dot"></span>NEUTRONS <small>0</small></div>
              <div class="al-part-ctrl">
                <button type="button" class="al-step" data-part="n" data-step="-1" aria-label="Remove neutron">−</button>
                <span class="al-count" id="al-count-n">6</span>
                <button type="button" class="al-step" data-part="n" data-step="1" aria-label="Add neutron">+</button>
              </div>
            </div>
            <div class="al-part" style="--c:#55cfff">
              <div class="al-part-head"><span class="al-dot"></span>ELECTRONS <small>−</small></div>
              <div class="al-part-ctrl">
                <button type="button" class="al-step" data-part="e" data-step="-1" aria-label="Remove electron">−</button>
                <span class="al-count" id="al-count-e">6</span>
                <button type="button" class="al-step" data-part="e" data-step="1" aria-label="Add electron">+</button>
              </div>
            </div>
          </div>
          <div class="al-section-title">QUICK BUILD</div>
          <div class="al-quick">
            <button type="button" class="al-chip-btn" data-quick="1">H</button>
            <button type="button" class="al-chip-btn" data-quick="2">He</button>
            <button type="button" class="al-chip-btn" data-quick="6">C</button>
            <button type="button" class="al-chip-btn" data-quick="8">O</button>
            <button type="button" class="al-chip-btn" data-quick="11">Na</button>
            <button type="button" class="al-chip-btn" data-quick="26">Fe</button>
            <button type="button" class="al-chip-btn" id="al-neutral">⚖ Make neutral</button>
            <button type="button" class="al-chip-btn" id="al-stable">✓ Most stable</button>
          </div>
        </div>

        <div class="al-card al-panel" id="al-mol-controls" hidden>
          <div class="al-section-title">TAP AN ATOM TO ADD IT</div>
          <div class="al-palette" id="al-palette"></div>
          <div class="al-section-title" style="margin-top:14px">YOUR WORKBENCH</div>
          <div class="al-bench" id="al-bench"></div>
          <div class="al-quick" style="margin-top:10px"><button type="button" class="al-chip-btn" id="al-clear">🧹 Clear all</button></div>
        </div>
      </div>

      <div class="al-right">
        <div class="al-card al-info" id="al-atom-info">
          <div style="display:flex;gap:14px;align-items:center">
            <div class="al-symbol" id="al-symbol"><small id="al-z">6</small><strong id="al-sym">C</strong></div>
            <div>
              <h2 id="al-name">Carbon</h2>
              <p class="al-sub" id="al-iso">Carbon-12</p>
            </div>
          </div>
          <div class="al-stats">
            <div class="al-stat"><span>MASS NUMBER</span><strong id="al-mass">12</strong></div>
            <div class="al-stat"><span>CHARGE</span><strong id="al-charge">0</strong></div>
            <div class="al-stat"><span>ELECTRON SHELLS</span><strong id="al-shells">2, 4</strong></div>
            <div class="al-stat"><span>OUTER ELECTRONS</span><strong id="al-valence">4</strong></div>
          </div>
          <div class="al-badges" id="al-badges"></div>
          <p class="al-explain" id="al-explain"></p>
          <div class="al-progress"><span id="al-disc-text">🔓 Elements discovered: 0 / 36</span>
            <div class="al-bar"><div id="al-disc-bar" style="width:0%"></div></div>
          </div>
        </div>

        <div class="al-card" id="al-missions-card">
          <div class="al-card-title">🎯 Missions <span id="al-mission-count">0 / 8</span></div>
          <div class="al-missions" id="al-missions"></div>
        </div>

        <div class="al-card al-info" id="al-mol-info" hidden>
          <div class="al-challenge"><span id="al-challenge-text">🎯 Challenge</span><button type="button" class="al-chip-btn" id="al-skip">Skip ↻</button></div>
          <div class="al-formula" id="al-formula">?</div>
          <h2 id="al-mol-name">Start building!</h2>
          <p class="al-sub" id="al-mol-shape"></p>
          <p class="al-explain" id="al-mol-text">Tap atoms to add them to your workbench. When they make a real molecule, they snap together in 3D!</p>
        </div>

        <div class="al-card" id="al-col-card" hidden>
          <div class="al-card-title">🧪 Collection <span><span id="al-col-text">0 / ${MOLECULES.length}</span> · <span id="al-score">⭐ 0</span></span></div>
          <div class="al-collection" id="al-collection"></div>
        </div>
      </div>
    </div>
  `;
  main.appendChild(section);

  function openLab() {
    document.querySelectorAll(".page-section").forEach(s => s.classList.toggle("active", s === section));
    document.querySelectorAll(".nav-button").forEach(b => b.classList.toggle("active", b === navButton));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  navButton.addEventListener("click", openLab);
  document.querySelectorAll(".nav-button").forEach(button => {
    if (button === navButton) return;
    button.addEventListener("click", () => {
      section.classList.remove("active");
      navButton.classList.remove("active");
    });
  });

  /* ---------- 4. HELPERS ---------- */

  const $ = id => document.getElementById(id);
  const canvas = $("al-canvas");
  const ctx = canvas.getContext("2d");
  let W = 600, H = 440, DPR = 1;

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(hex, target, amount) {
    const c = hexToRgb(hex);
    const t = target === "white" ? [255, 255, 255] : [0, 0, 0];
    return `rgb(${c.map((v, i) => Math.round(v + (t[i] - v) * amount)).join(",")})`;
  }
  function rand(i) {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function popClass(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  let toastTimer = null;
  function toast(text) {
    const t = $("al-toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* ignore */ }
  }

  /* Boss-style effects: floating text, shockwave ring, shake, flash */
  function fxPop(text, color, x, y, big, delay) {
    setTimeout(() => {
      const el = document.createElement("span");
      el.className = "al-pop" + (big ? " big" : "");
      el.textContent = text;
      el.style.color = color;
      el.style.left = x + "%";
      el.style.top = y + "%";
      $("al-fx").appendChild(el);
      setTimeout(() => el.remove(), big ? 1500 : 1200);
    }, delay || 0);
  }
  function fxRing(color) {
    const el = document.createElement("span");
    el.className = "al-ring";
    el.style.setProperty("--c", color);
    $("al-fx").appendChild(el);
    setTimeout(() => el.remove(), 650);
  }
  function fxShake() { popClass($("al-wrap"), "shake"); setTimeout(() => $("al-wrap").classList.remove("shake"), 460); }
  function fxFlash() { popClass($("al-wrap"), "flash"); setTimeout(() => $("al-wrap").classList.remove("flash"), 360); }

  /* ---------- 5. 3D CAMERA ---------- */

  const cam = { rotX: -0.35, rotY: 0.6, zoom: 1, targetZoom: 1, fov: 900 };
  let dragging = false, lastX = 0, lastY = 0, lastTouch = 0;

  canvas.addEventListener("pointerdown", e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", e => {
    if (!dragging) return;
    cam.rotY += (e.clientX - lastX) * 0.01;
    cam.rotX = Math.max(-1.4, Math.min(1.4, cam.rotX + (e.clientY - lastY) * 0.01));
    lastX = e.clientX; lastY = e.clientY;
    lastTouch = performance.now();
  });
  ["pointerup", "pointercancel"].forEach(type => canvas.addEventListener(type, () => { dragging = false; }));

  function project(x, y, z) {
    const cy = Math.cos(cam.rotY), sy = Math.sin(cam.rotY);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const cx = Math.cos(cam.rotX), sx = Math.sin(cam.rotX);
    const y2 = y * cx - z1 * sx;
    const z2 = y * sx + z1 * cx;
    const f = cam.fov / (cam.fov + z2) * cam.zoom;
    return { x: W / 2 + x1 * f, y: H / 2 + y2 * f, z: z2, f };
  }

  function drawSphere(x, y, r, color, alpha) {
    if (r <= 0.3) return;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
    g.addColorStop(0, mix(color, "white", 0.75));
    g.addColorStop(0.35, color);
    g.addColorStop(1, mix(color, "black", 0.6));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawGlow(x, y, r, rgb, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const stars = Array.from({ length: 70 }, (_, i) => ({ x: rand(i), y: rand(i + 99), s: rand(i + 7) * 1.6 + 0.4, t: rand(i + 3) * 6 }));

  function drawBackground(time, glowRgb) {
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0d1626");
    bg.addColorStop(1, "#111c2e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    stars.forEach(s => {
      ctx.globalAlpha = 0.25 + 0.35 * Math.sin(time / 900 + s.t) ** 2;
      ctx.fillStyle = "#9fd9ff";
      ctx.fillRect(s.x * W, s.y * H, s.s, s.s);
    });
    ctx.globalAlpha = 1;
    drawGlow(W / 2, H / 2, Math.min(W, H) * 0.55, glowRgb, 0.16);
  }

  /* ---------- 6. ATOM BUILDER ---------- */

  const atom = { p: 6, n: 6, e: 6 };
  let nucleons = [];   // {type, x,y,z, tx,ty,tz}
  let leaving = [];    // flying-away particles
  let sparks = [];
  let electronBorn = [];
  let discovered = new Set(load("atomLabDiscovered", []));
  let lastSymbol = null;

  function spawnFar() {
    const a = Math.random() * Math.PI * 2, b = Math.acos(Math.random() * 2 - 1);
    const d = 420;
    return { x: Math.sin(b) * Math.cos(a) * d, y: Math.cos(b) * d, z: Math.sin(b) * Math.sin(a) * d };
  }

  function layoutNucleus() {
    const protons = nucleons.filter(o => o.type === "p");
    const neutrons = nucleons.filter(o => o.type === "n");
    while (protons.length < atom.p) { const o = { type: "p", ...spawnFar() }; protons.push(o); }
    while (neutrons.length < atom.n) { const o = { type: "n", ...spawnFar() }; neutrons.push(o); }
    while (protons.length > atom.p) { const o = protons.pop(); leaveParticle(o, "#ff5d73"); }
    while (neutrons.length > atom.n) { const o = neutrons.pop(); leaveParticle(o, "#94a3b8"); }

    const total = protons.length + neutrons.length;
    const ordered = [];
    let acc = 0, pi = 0, ni = 0;
    for (let k = 0; k < total; k++) {
      acc += protons.length / total;
      if ((acc >= 1 && pi < protons.length) || ni >= neutrons.length) { ordered.push(protons[pi++]); acc -= 1; }
      else ordered.push(neutrons[ni++]);
    }
    const R = 8 * 1.2 * Math.cbrt(Math.max(total, 1));
    ordered.forEach((o, i) => {
      const r = total === 1 ? 0 : R * Math.cbrt((i + 0.5) / total);
      const u = rand(i * 3 + 1) * 2 - 1, th = rand(i * 3 + 2) * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      o.tx = Math.cos(th) * s * r; o.ty = u * r; o.tz = Math.sin(th) * s * r;
    });
    nucleons = ordered;
  }

  function leaveParticle(o, color) {
    const d = Math.hypot(o.x, o.y, o.z) || 1;
    leaving.push({ x: o.x, y: o.y, z: o.z, vx: o.x / d * 6 + (Math.random() - .5) * 4, vy: o.y / d * 6 - 3, vz: o.z / d * 6, life: 1, color, r: 8 });
  }

  function nucleusRadius() { return 8 * 1.2 * Math.cbrt(Math.max(atom.p + atom.n, 1)) + 8; }
  function shellRadius(i) { return nucleusRadius() + 40 + i * 36; }

  const TILTS = [[0.35, 0.2], [-0.7, 0.55], [1.05, -0.45], [-0.3, -1.0], [0.6, 1.2]];
  function shellBasis(i) {
    const [ax, az] = TILTS[i % TILTS.length];
    const rot = v => {
      let [x, y, z] = v;
      [y, z] = [y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)];
      [x, y] = [x * Math.cos(az) - y * Math.sin(az), x * Math.sin(az) + y * Math.cos(az)];
      return [x, y, z];
    };
    return { u: rot([1, 0, 0]), v: rot([0, 0, 1]) };
  }

  function setAtom(part, value, quiet) {
    const limits = { p: [1, MAX_P], n: [0, 60], e: [0, Math.min(MAX_P + 4, atom.p + 4)] };
    if (part === "p") limits.p = [1, MAX_P];
    const [lo, hi] = limits[part];
    const v = Math.max(lo, Math.min(hi, value));
    if (v === atom[part]) {
      if (!quiet) toast(part === "e" && value > hi ? "⚡ That's too many extra electrons!" : "🚫 Can't go further!");
      return;
    }
    const before = snapshot();
    const old = atom[part];
    atom[part] = v;
    if (part === "p" && atom.e > atom.p + 4) atom.e = atom.p + 4;
    if (part === "e" && v > old) {
      for (let k = old; k < v; k++) electronBorn[k] = performance.now();
    }
    if (part === "e" && v < old) {
      const r = shellRadius(shellsFor(atom.p, old).length - 1);
      for (let k = v; k < old; k++) leaving.push({ x: r, y: 0, z: 0, vx: 7, vy: -2 - Math.random() * 3, vz: (Math.random() - .5) * 6, life: 1, color: "#55cfff", r: 5 });
    }
    popClass($("al-count-" + part), "bump");
    layoutNucleus();
    updateAtomInfo();
    atomFx(before, true);
  }

  function snapshot() {
    return {
      p: atom.p, n: atom.n, e: atom.e,
      stable: (STABLE[atom.p] || []).includes(atom.n),
      charge: atom.p - atom.e,
      full: atom.p === atom.e && NOBLE.includes(atom.p)
    };
  }

  function atomFx(before, single) {
    const now = snapshot();
    let d = 0;
    if (single) {
      [["p", "PROTON", "#ff5d73", 25], ["n", "NEUTRON", "#cbd5e1", 50], ["e", "ELECTRON", "#7fe0ff", 75]].forEach(([k, label, color, x]) => {
        const diff = now[k] - before[k];
        if (diff) fxPop(`${diff > 0 ? "+" : "−"}${Math.abs(diff)} ${label}${Math.abs(diff) > 1 ? "S" : ""}`, color, x, 82);
      });
    }
    if (now.p !== before.p) {
      fxRing("#55cfff");
      fxFlash();
      fxPop(NAMES[now.p].toUpperCase() + "!", "#55cfff", 50, 48, true, 60);
      d = 300;
    }
    if (before.stable && !now.stable) { fxShake(); fxPop("☢ UNSTABLE!", "#facc15", 50, 22, false, d); }
    else if (!before.stable && now.stable) fxPop("✓ STABLE!", "#4ade80", 50, 22, false, d);
    if (before.charge === 0 && now.charge !== 0) fxPop("⚡ ION!", now.charge > 0 ? "#fda4af" : "#c4b5fd", 22, 34, false, d + 150);
    else if (before.charge !== 0 && now.charge === 0) fxPop("⚖ NEUTRAL!", "#6ee7b7", 78, 34, false, d + 150);
    if (!before.full && now.full) { fxRing("#fde68a"); fxPop("✨ FULL SHELL!", "#fde68a", 50, 64, false, d + 300); }
    checkMissions();
  }

  /* Mini missions */
  const MISSIONS = [
    { id: "o", text: "Build an Oxygen atom", test: s => s.p === 8 },
    { id: "neg", text: "Make a negative ion (extra electrons)", test: s => s.charge < 0 },
    { id: "pos", text: "Make a positive ion (missing electrons)", test: s => s.charge > 0 },
    { id: "rad", text: "Find a radioactive isotope ☢", test: s => !s.stable },
    { id: "noble", text: "Build a noble gas with a full shell", test: s => s.full },
    { id: "c14", text: "Build Carbon-14 (used to date fossils)", test: s => s.p === 6 && s.n === 8 },
    { id: "fe56", text: "Build a neutral Iron-56 atom", test: s => s.p === 26 && s.n === 30 && s.charge === 0 },
    { id: "ten", text: "Discover 10 elements", test: () => discovered.size >= 10 }
  ];
  const missionsDone = new Set(load("atomLabMissions", []));

  function renderMissions(justDone) {
    $("al-missions").innerHTML = MISSIONS.map(m => {
      const done = missionsDone.has(m.id);
      return `<div class="al-mission ${done ? "done" : ""} ${justDone.includes(m.id) ? "just-done" : ""}"><span class="al-check">${done ? "✓" : ""}</span>${m.text}</div>`;
    }).join("");
    $("al-mission-count").textContent = `${missionsDone.size} / ${MISSIONS.length}`;
  }

  function checkMissions() {
    const s = snapshot();
    const newly = MISSIONS.filter(m => !missionsDone.has(m.id) && m.test(s)).map(m => m.id);
    if (newly.length) {
      newly.forEach(id => missionsDone.add(id));
      save("atomLabMissions", [...missionsDone]);
      burstConfetti(70);
      const first = MISSIONS.find(m => m.id === newly[0]);
      setTimeout(() => toast(`🎯 Mission complete: ${first.text.split(" (")[0]}!`), 400);
      if (missionsDone.size === MISSIONS.length) setTimeout(() => { burstConfetti(150); fxPop("🏆 ALL MISSIONS DONE!", "#facc15", 50, 50, true); }, 900);
    }
    renderMissions(newly);
  }

  section.querySelectorAll(".al-step").forEach(btn => {
    btn.addEventListener("click", () => setAtom(btn.dataset.part, atom[btn.dataset.part] + Number(btn.dataset.step)));
  });
  section.querySelectorAll("[data-quick]").forEach(btn => {
    btn.addEventListener("click", () => {
      const z = Number(btn.dataset.quick);
      const before = snapshot();
      const oldE = atom.e;
      atom.p = z; atom.n = COMMON[z]; atom.e = z;
      for (let k = oldE; k < z; k++) electronBorn[k] = performance.now();
      layoutNucleus();
      updateAtomInfo();
      atomFx(before, false);
    });
  });
  $("al-neutral").addEventListener("click", () => {
    if (atom.e === atom.p) { toast("✅ Already neutral!"); return; }
    setAtom("e", atom.p, true);
    toast("⚖ Balanced! Now it's a neutral atom.");
  });
  $("al-stable").addEventListener("click", () => {
    if (atom.n === COMMON[atom.p]) { toast("✅ Already the most common isotope!"); return; }
    setAtom("n", COMMON[atom.p], true);
    toast(`✓ ${NAMES[atom.p]}-${atom.p + atom.n}: the most common one!`);
  });

  const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  const sup = num => String(num).split("").map(d => SUP[d]).join("");

  function updateAtomInfo() {
    const { p, n, e } = atom;
    const sym = SYMBOLS[p], name = NAMES[p];
    const charge = p - e;
    const shells = shellsFor(p, e);
    const stable = (STABLE[p] || []).includes(n);
    const mass = p + n;

    $("al-count-p").textContent = p;
    $("al-count-n").textContent = n;
    $("al-count-e").textContent = e;
    $("al-z").textContent = p;
    $("al-sym").textContent = sym;
    $("al-name").textContent = name;
    $("al-iso").textContent = `${name}-${mass}`;
    $("al-mass").textContent = mass;
    $("al-charge").textContent = charge === 0 ? "0" : (charge > 0 ? `+${charge}` : `−${-charge}`);
    $("al-shells").textContent = shells.length ? shells.join(", ") : "none";
    $("al-valence").textContent = shells.length ? shells[shells.length - 1] : 0;

    const badges = [];
    if (charge === 0) badges.push(`<span class="al-badge good">Neutral atom</span>`);
    else if (charge > 0) badges.push(`<span class="al-badge plus">Positive ion ${sym}${charge > 1 ? sup(charge) : ""}⁺</span>`);
    else badges.push(`<span class="al-badge minus">Negative ion ${sym}${-charge > 1 ? sup(-charge) : ""}⁻</span>`);
    badges.push(stable ? `<span class="al-badge good">✓ Stable</span>` : `<span class="al-badge warn">☢ Radioactive</span>`);
    $("al-badges").innerHTML = badges.join("");

    const parts = [];
    parts.push(`${p} proton${p === 1 ? "" : "s"} make${p === 1 ? "s" : ""} it <b>${name}</b>. The number of protons decides which element it is.`);
    if (charge === 0) parts.push("The protons (+) and electrons (−) balance out, so it has no charge.");
    else if (charge > 0) parts.push(`It has ${charge} fewer electron${charge > 1 ? "s" : ""} than protons, so it is a <b>positive ion</b>. Add ${charge} electron${charge > 1 ? "s" : ""} to make it neutral.`);
    else parts.push(`It has ${-charge} extra electron${-charge > 1 ? "s" : ""}, so it is a <b>negative ion</b>. Remove ${-charge} to make it neutral.`);
    if (!stable) {
      const list = STABLE[p] || [];
      const tooMany = list.length && n > Math.max(...list);
      parts.push(`☢ ${name}-${mass} would be radioactive: its nucleus has too ${tooMany ? "many" : "few"} neutrons, so it would break apart over time. The most common one is ${name}-${p + COMMON[p]} (${COMMON[p]} neutrons).`);
    }
    if (charge === 0 && NOBLE.includes(p)) parts.push("✨ Its outer shell is full. That's why noble gases hardly react with anything!");
    $("al-explain").innerHTML = parts.join(" ");

    if (sym !== lastSymbol) {
      popClass($("al-symbol"), "pop");
      if (lastSymbol !== null && !discovered.has(p)) toast(`🔓 New element discovered: ${name}!`);
      lastSymbol = sym;
    }
    discovered.add(p);
    save("atomLabDiscovered", [...discovered]);
    $("al-disc-text").textContent = `🔓 Elements discovered: ${discovered.size} / ${MAX_P}`;
    $("al-disc-bar").style.width = `${discovered.size / MAX_P * 100}%`;
  }

  function renderAtom(time) {
    const charge = atom.p - atom.e;
    const glow = charge === 0 ? "85,207,255" : charge > 0 ? "255,90,110" : "168,85,247";
    drawBackground(time, glow);

    const shells = shellsFor(atom.p, atom.e);
    const outer = shells.length ? shellRadius(shells.length - 1) : nucleusRadius();
    cam.targetZoom = (Math.min(W, H) / 2 - 24) / (outer + 14);
    const stable = (STABLE[atom.p] || []).includes(atom.n);
    const items = [];

    // nucleus
    const jitter = stable ? 0 : 1.6;
    nucleons.forEach(o => {
      o.x += (o.tx - o.x) * 0.12; o.y += (o.ty - o.y) * 0.12; o.z += (o.tz - o.z) * 0.12;
      const q = project(o.x + (Math.random() - .5) * jitter, o.y + (Math.random() - .5) * jitter, o.z + (Math.random() - .5) * jitter);
      items.push({ z: q.z, draw: () => drawSphere(q.x, q.y, 8.5 * q.f, o.type === "p" ? "#ff5d73" : "#94a3b8") });
    });

    if (!stable && Math.random() < 0.18) {
      const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
      const d = nucleusRadius();
      sparks.push({ x: Math.sin(b) * Math.cos(a) * d, y: Math.cos(b) * d, z: Math.sin(b) * Math.sin(a) * d, vx: Math.sin(b) * Math.cos(a) * 3, vy: Math.cos(b) * 3, vz: Math.sin(b) * Math.sin(a) * 3, life: 1 });
    }

    // electron shells
    let flat = 0;
    shells.forEach((count, i) => {
      const R = shellRadius(i);
      const { u, v } = shellBasis(i);
      const SEG = 72;
      let prev = null;
      for (let s = 0; s <= SEG; s++) {
        const a = s / SEG * Math.PI * 2;
        const q = project(R * (Math.cos(a) * u[0] + Math.sin(a) * v[0]), R * (Math.cos(a) * u[1] + Math.sin(a) * v[1]), R * (Math.cos(a) * u[2] + Math.sin(a) * v[2]));
        if (prev) {
          const p0 = prev;
          items.push({ z: (p0.z + q.z) / 2, draw: () => {
            ctx.strokeStyle = "rgba(85,207,255,0.28)";
            ctx.lineWidth = 1.3 * q.f;
            ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          } });
        }
        prev = q;
      }
      const speed = 0.0011 / Math.sqrt(i + 1);
      for (let k = 0; k < count; k++) {
        const a = time * speed * (i % 2 ? -1 : 1) + k / count * Math.PI * 2 + i;
        const q = project(R * (Math.cos(a) * u[0] + Math.sin(a) * v[0]), R * (Math.cos(a) * u[1] + Math.sin(a) * v[1]), R * (Math.cos(a) * u[2] + Math.sin(a) * v[2]));
        const born = electronBorn[flat] || 0;
        const age = (time - born) / 500;
        const grow = age < 1 ? Math.max(0.05, Math.sin(age * Math.PI / 2) * 1.3) : 1;
        const flash = age < 1 ? 1 - age : 0;
        flat++;
        items.push({ z: q.z, draw: () => {
          drawGlow(q.x, q.y, (14 + flash * 30) * q.f * grow, "85,207,255", 0.55 + flash * 0.4);
          drawSphere(q.x, q.y, 4.6 * q.f * grow, "#7fe0ff");
        } });
      }
    });

    // sparks + leaving particles
    sparks = sparks.filter(s => (s.life -= 0.03) > 0);
    sparks.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.z += s.vz;
      const q = project(s.x, s.y, s.z);
      items.push({ z: q.z, draw: () => drawGlow(q.x, q.y, 7 * q.f, "250,204,21", s.life) });
    });
    leaving = leaving.filter(o => (o.life -= 0.025) > 0);
    leaving.forEach(o => {
      o.x += o.vx; o.y += o.vy; o.z += o.vz;
      const q = project(o.x, o.y, o.z);
      items.push({ z: q.z, draw: () => drawSphere(q.x, q.y, o.r * q.f, o.color, o.life) });
    });

    items.sort((a, b) => b.z - a.z).forEach(it => it.draw());
  }

  /* ---------- 7. MOLECULE BUILDER ---------- */

  let molAtoms = [];   // {sym, x,y,z, tx,ty,tz, seed}
  let currentMatch = null;
  let bondGrow = 0;
  let collected = new Set(load("atomLabMolecules", []));
  let score = load("atomLabScore", 0);
  let challenge = null;
  let confetti = [];
  let atomSeed = 1;

  const palette = $("al-palette");
  PALETTE.forEach(sym => {
    const st = ATOM_STYLE[sym];
    const b = document.createElement("button");
    b.type = "button";
    b.className = "al-atom-btn";
    b.innerHTML = `<span class="al-ball" style="background:radial-gradient(circle at 35% 30%, ${mix(st.color, "white", .6)}, ${st.color} 45%, ${mix(st.color, "black", .5)});color:${st.text}">${sym}</span>${st.name}`;
    b.addEventListener("click", () => addMolAtom(sym));
    palette.appendChild(b);
  });

  function addMolAtom(sym) {
    if (molAtoms.length >= MAX_ATOMS) { fxShake(); toast("🧪 Workbench full! Remove some atoms."); return; }
    molAtoms.push({ sym, ...spawnFar(), seed: atomSeed++ });
    fxPop(`+${sym}`, sym === "C" ? "#d4d4d8" : ATOM_STYLE[sym].color, 25 + Math.random() * 50, 72);
    checkMolecule();
  }
  function removeMolAtom(sym) {
    for (let i = molAtoms.length - 1; i >= 0; i--) {
      if (molAtoms[i].sym === sym) {
        const o = molAtoms.splice(i, 1)[0];
        leaving.push({ x: o.x, y: o.y, z: o.z, vx: (Math.random() - .5) * 10, vy: -6, vz: (Math.random() - .5) * 10, life: 1, color: ATOM_STYLE[sym].color, r: ATOM_STYLE[sym].r });
        break;
      }
    }
    checkMolecule();
  }
  $("al-clear").addEventListener("click", () => {
    molAtoms.forEach(o => leaving.push({ x: o.x, y: o.y, z: o.z, vx: (Math.random() - .5) * 12, vy: -5 - Math.random() * 4, vz: (Math.random() - .5) * 12, life: 1, color: ATOM_STYLE[o.sym].color, r: ATOM_STYLE[o.sym].r }));
    molAtoms = [];
    checkMolecule();
  });

  function counts(list) {
    const c = {};
    list.forEach(a => { const s = a.sym || a[0]; c[s] = (c[s] || 0) + 1; });
    return c;
  }
  function sameCounts(a, b) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) if ((a[k] || 0) !== (b[k] || 0)) return false;
    return true;
  }

  function newChallenge() {
    const options = MOLECULES.filter(m => !challenge || m.id !== challenge.id);
    const notYet = options.filter(m => !collected.has(m.id));
    const pool = notYet.length ? notYet : options;
    challenge = pool[Math.floor(Math.random() * pool.length)];
    $("al-challenge-text").textContent = `🎯 Challenge: build ${challenge.name.split(" (")[0]} (${challenge.formula})`;
  }
  $("al-skip").addEventListener("click", newChallenge);

  function checkMolecule() {
    const c = counts(molAtoms);
    const match = MOLECULES.find(m => sameCounts(c, counts(m.atoms))) || null;

    // workbench chips
    const bench = $("al-bench");
    const syms = Object.keys(c);
    bench.innerHTML = syms.length
      ? syms.map(s => `<span class="al-bench-chip"><span class="al-dot" style="background:${ATOM_STYLE[s].color};color:${ATOM_STYLE[s].color}"></span>${s} × ${c[s]} <button type="button" data-remove="${s}" aria-label="Remove ${s}">−</button></span>`).join("")
      : `<span class="al-bench-empty">Empty. Tap an atom above!</span>`;
    bench.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => removeMolAtom(b.dataset.remove)));

    if (match && match !== currentMatch) {
      // snap atoms to the real shape
      const used = new Set();
      molAtoms.forEach(a => {
        const idx = match.atoms.findIndex((m, i) => !used.has(i) && m[0] === a.sym);
        used.add(idx);
        a.slot = idx;
      });
      molAtoms.sort((a, b) => a.slot - b.slot);
      bondGrow = 0;
      burstConfetti(60);
      const shortName = match.name.split(" (")[0].toUpperCase();
      fxRing("#4ade80");
      fxFlash();
      fxPop("💥 BONDED!", "#facc15", 50, 26);
      fxPop(shortName + "!", "#4ade80", 50, 50, shortName.length <= 14, 250);
      const isNew = !collected.has(match.id);
      collected.add(match.id);
      save("atomLabMolecules", [...collected]);
      if (challenge && challenge.id === match.id) {
        score++;
        save("atomLabScore", score);
        burstConfetti(90);
        toast(`🎯 Challenge complete! +1 ⭐`);
        fxPop("⭐ +1", "#facc15", 50, 74, true, 650);
        setTimeout(newChallenge, 1800);
      } else {
        toast(`🎉 You built ${match.name.split(" (")[0]}!${isNew ? " (new!)" : ""}`);
      }
      popClass($("al-formula"), "pop");
    }
    currentMatch = match;

    if (match) {
      $("al-formula").textContent = match.formula;
      $("al-mol-name").textContent = match.name;
      $("al-mol-shape").textContent = `Shape: ${match.shape} · ${match.bondText}`;
      $("al-mol-text").textContent = match.fact;
    } else {
      $("al-formula").textContent = molAtoms.length ? "?" : "…";
      $("al-mol-name").textContent = molAtoms.length ? "🤔 Not a molecule yet" : "Start building!";
      $("al-mol-shape").textContent = "";
      $("al-mol-text").textContent = molAtoms.length ? hintFor(c) : "Tap atoms to add them to your workbench. When they make a real molecule, they snap together in 3D!";
    }

    $("al-col-text").textContent = `${collected.size} / ${MOLECULES.length}`;
    $("al-score").textContent = `⭐ ${score}`;
    $("al-collection").innerHTML = MOLECULES.map(m => `<span class="al-col-chip ${collected.has(m.id) ? "got" : ""}" title="${collected.has(m.id) ? m.name : "Not built yet"}">${collected.has(m.id) ? m.formula : "???"}</span>`).join("");
  }

  function hintFor(c) {
    let best = null, bestExtra = Infinity;
    MOLECULES.forEach(m => {
      const need = counts(m.atoms);
      let ok = true, extra = 0;
      Object.keys(c).forEach(k => { if ((need[k] || 0) < c[k]) ok = false; });
      if (!ok) return;
      Object.keys(need).forEach(k => { extra += need[k] - (c[k] || 0); });
      if (extra < bestExtra) { bestExtra = extra; best = m; }
    });
    if (!best) return "Hmm, none of the molecules in our lab has those atoms together. Try removing one!";
    const need = counts(best.atoms);
    const missing = Object.keys(need).filter(k => need[k] > (c[k] || 0)).map(k => `${need[k] - (c[k] || 0)} more ${ATOM_STYLE[k].name}`);
    return `You're close! Add ${missing.join(" and ")} to make ${best.name.split(" (")[0]} (${best.formula}).`;
  }

  function burstConfetti(n) {
    const colors = ["#55cfff", "#a855f7", "#facc15", "#ff5d73", "#4ade80", "#ffffff"];
    for (let i = 0; i < n; i++) {
      confetti.push({ x: W / 2 + (Math.random() - .5) * 60, y: H / 2 - 20, vx: (Math.random() - .5) * 11, vy: -Math.random() * 9 - 3, size: 4 + Math.random() * 4, color: colors[i % colors.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .3, life: 1 });
    }
  }

  function drawIonic(A, B, progress) {
    ctx.setLineDash([6, 7]);
    ctx.strokeStyle = "rgba(250,204,21,0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(A.x + (B.x - A.x) * progress, A.y + (B.y - A.y) * progress); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draws one half of a bond: from atom A towards the middle
  function drawHalfBond(A, B, order, progress) {
    const dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const x2 = A.x + dx * progress / 2, y2 = A.y + dy * progress / 2;
    const gap = 7 * A.f;
    ctx.lineCap = "butt";
    for (let k = 0; k < order; k++) {
      const off = (k - (order - 1) / 2) * gap;
      ctx.strokeStyle = "#0b1220";
      ctx.lineWidth = 7 * A.f;
      ctx.beginPath(); ctx.moveTo(A.x + nx * off, A.y + ny * off); ctx.lineTo(x2 + nx * off, y2 + ny * off); ctx.stroke();
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 4 * A.f;
      ctx.beginPath(); ctx.moveTo(A.x + nx * off, A.y + ny * off); ctx.lineTo(x2 + nx * off, y2 + ny * off); ctx.stroke();
    }
  }

  function renderMolecule(time) {
    drawBackground(time, currentMatch ? "74,222,128" : "85,207,255");
    const SCALE = 70;
    const n = molAtoms.length;

    molAtoms.forEach((a, i) => {
      if (currentMatch) {
        const m = currentMatch.atoms[a.slot];
        a.tx = m[1] * SCALE; a.ty = -m[2] * SCALE; a.tz = m[3] * SCALE;
      } else {
        const r = 40 + n * 14;
        const u = rand(a.seed * 3) * 2 - 1, th = rand(a.seed * 3 + 1) * Math.PI * 2, s = Math.sqrt(1 - u * u);
        a.tx = Math.cos(th) * s * r + Math.sin(time / 700 + a.seed) * 10;
        a.ty = u * r + Math.cos(time / 800 + a.seed * 2) * 10;
        a.tz = Math.sin(th) * s * r;
      }
      const ease = currentMatch ? 0.14 : 0.06;
      a.x += (a.tx - a.x) * ease; a.y += (a.ty - a.y) * ease; a.z += (a.tz - a.z) * ease;
    });

    let extent = 60;
    molAtoms.forEach(a => { extent = Math.max(extent, Math.hypot(a.tx, a.ty, a.tz) + ATOM_STYLE[a.sym].r); });
    cam.targetZoom = (Math.min(W, H) / 2 - 30) / extent;
    if (cam.targetZoom > 2.2) cam.targetZoom = 2.2;

    const items = [];
    const proj = molAtoms.map(a => project(a.x, a.y, a.z));
    if (currentMatch) {
      bondGrow = Math.min(1, bondGrow + 0.035);
      currentMatch.bonds.forEach(([i, j, order]) => {
        const A = proj[i], B = proj[j];
        if (!A || !B) return;
        if (currentMatch.ionic) {
          items.push({ z: Math.max(A.z, B.z) + 50, draw: () => drawIonic(A, B, bondGrow) });
        } else {
          items.push({ z: A.z + 0.5, draw: () => drawHalfBond(A, B, order, bondGrow) });
          items.push({ z: B.z + 0.5, draw: () => drawHalfBond(B, A, order, bondGrow) });
        }
      });
    }
    molAtoms.forEach((a, i) => {
      const q = proj[i];
      const st = ATOM_STYLE[a.sym];
      items.push({ z: q.z, draw: () => {
        const r = st.r * q.f;
        if (currentMatch) drawGlow(q.x, q.y, r * 1.9, "74,222,128", 0.18);
        drawSphere(q.x, q.y, r, st.color);
        ctx.fillStyle = st.text;
        ctx.font = `900 ${Math.max(10, r * 0.75)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let label = a.sym;
        if (currentMatch && currentMatch.ionic) label += a.sym === "Na" ? "⁺" : "⁻";
        ctx.fillText(label, q.x, q.y + 1);
      } });
    });

    leaving = leaving.filter(o => (o.life -= 0.03) > 0);
    leaving.forEach(o => {
      o.x += o.vx; o.y += o.vy; o.z += o.vz;
      const q = project(o.x, o.y, o.z);
      items.push({ z: q.z, draw: () => drawSphere(q.x, q.y, o.r * q.f, o.color, o.life) });
    });

    items.sort((a, b) => b.z - a.z).forEach(it => it.draw());

    if (!n) {
      ctx.fillStyle = "#6f839b";
      ctx.font = "700 15px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Tap atoms below to start building ⚗", W / 2, H / 2);
    }
  }

  /* ---------- 8. MODE SWITCH + MAIN LOOP ---------- */

  let mode = "atom";
  section.querySelectorAll(".al-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      mode = tab.dataset.mode;
      section.querySelectorAll(".al-tab").forEach(t => t.classList.toggle("active", t === tab));
      $("al-atom-controls").hidden = mode !== "atom";
      $("al-atom-info").hidden = mode !== "atom";
      $("al-mol-controls").hidden = mode !== "molecule";
      $("al-mol-info").hidden = mode !== "molecule";
      $("al-missions-card").hidden = mode !== "atom";
      $("al-col-card").hidden = mode !== "molecule";
      leaving = [];
      if (mode === "molecule" && !challenge) newChallenge();
    });
  });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w && h && (w !== W || h !== H || dpr !== DPR)) {
      W = w; H = h; DPR = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function frame(time) {
    requestAnimationFrame(frame);
    if (!section.classList.contains("active")) return;
    resize();
    if (!dragging && time - lastTouch > 1500) cam.rotY += 0.004;
    cam.zoom += (cam.targetZoom - cam.zoom) * 0.08;

    if (mode === "atom") renderAtom(time);
    else renderMolecule(time);

    confetti = confetti.filter(c => (c.life -= 0.012) > 0 && c.y < H + 20);
    confetti.forEach(c => {
      c.vy += 0.25; c.x += c.vx; c.y += c.vy; c.rot += c.vr;
      ctx.save();
      ctx.globalAlpha = Math.min(1, c.life * 2);
      ctx.translate(c.x, c.y); ctx.rotate(c.rot);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
      ctx.restore();
    });
  }

  layoutNucleus();
  nucleons.forEach(o => { o.x = o.tx; o.y = o.ty; o.z = o.tz; });
  updateAtomInfo();
  renderMissions([]);
  checkMolecule();
  requestAnimationFrame(frame);
})();
