"use strict";

/* =========================================
   ELEMENT QUEST — COMPLETE JAVASCRIPT
   ========================================= */


/* =========================================
   1. ALL 118 ELEMENTS
   ========================================= */

const rawElements = [
  ["H","Hydrogen"],["He","Helium"],
  ["Li","Lithium"],["Be","Beryllium"],
  ["B","Boron"],["C","Carbon"],["N","Nitrogen"],
  ["O","Oxygen"],["F","Fluorine"],["Ne","Neon"],
  ["Na","Sodium"],["Mg","Magnesium"],
  ["Al","Aluminium"],["Si","Silicon"],["P","Phosphorus"],
  ["S","Sulfur"],["Cl","Chlorine"],["Ar","Argon"],
  ["K","Potassium"],["Ca","Calcium"],["Sc","Scandium"],
  ["Ti","Titanium"],["V","Vanadium"],["Cr","Chromium"],
  ["Mn","Manganese"],["Fe","Iron"],["Co","Cobalt"],
  ["Ni","Nickel"],["Cu","Copper"],["Zn","Zinc"],
  ["Ga","Gallium"],["Ge","Germanium"],["As","Arsenic"],
  ["Se","Selenium"],["Br","Bromine"],["Kr","Krypton"],
  ["Rb","Rubidium"],["Sr","Strontium"],["Y","Yttrium"],
  ["Zr","Zirconium"],["Nb","Niobium"],["Mo","Molybdenum"],
  ["Tc","Technetium"],["Ru","Ruthenium"],["Rh","Rhodium"],
  ["Pd","Palladium"],["Ag","Silver"],["Cd","Cadmium"],
  ["In","Indium"],["Sn","Tin"],["Sb","Antimony"],
  ["Te","Tellurium"],["I","Iodine"],["Xe","Xenon"],
  ["Cs","Caesium"],["Ba","Barium"],["La","Lanthanum"],
  ["Ce","Cerium"],["Pr","Praseodymium"],["Nd","Neodymium"],
  ["Pm","Promethium"],["Sm","Samarium"],["Eu","Europium"],
  ["Gd","Gadolinium"],["Tb","Terbium"],["Dy","Dysprosium"],
  ["Ho","Holmium"],["Er","Erbium"],["Tm","Thulium"],
  ["Yb","Ytterbium"],["Lu","Lutetium"],
  ["Hf","Hafnium"],["Ta","Tantalum"],["W","Tungsten"],
  ["Re","Rhenium"],["Os","Osmium"],["Ir","Iridium"],
  ["Pt","Platinum"],["Au","Gold"],["Hg","Mercury"],
  ["Tl","Thallium"],["Pb","Lead"],["Bi","Bismuth"],
  ["Po","Polonium"],["At","Astatine"],["Rn","Radon"],
  ["Fr","Francium"],["Ra","Radium"],["Ac","Actinium"],
  ["Th","Thorium"],["Pa","Protactinium"],["U","Uranium"],
  ["Np","Neptunium"],["Pu","Plutonium"],["Am","Americium"],
  ["Cm","Curium"],["Bk","Berkelium"],["Cf","Californium"],
  ["Es","Einsteinium"],["Fm","Fermium"],["Md","Mendelevium"],
  ["No","Nobelium"],["Lr","Lawrencium"],
  ["Rf","Rutherfordium"],["Db","Dubnium"],["Sg","Seaborgium"],
  ["Bh","Bohrium"],["Hs","Hassium"],["Mt","Meitnerium"],
  ["Ds","Darmstadtium"],["Rg","Roentgenium"],["Cn","Copernicium"],
  ["Nh","Nihonium"],["Fl","Flerovium"],["Mc","Moscovium"],
  ["Lv","Livermorium"],["Ts","Tennessine"],["Og","Oganesson"]
];

const elements = rawElements.map((item, index) => ({
  number: index + 1,
  symbol: item[0],
  name: item[1]
}));

const byNumber = number => elements[number - 1];

const alkali = [3,11,19,37,55,87];
const alkaline = [4,12,20,38,56,88];

const metalloids = [5,14,32,33,51,52];
const nonmetals = [1,6,7,8,15,16,34];
const halogens = [9,17,35,53,85,117];
const nobleGases = [2,10,18,36,54,86,118];

const postTransition = [13,31,49,50,81,82,83,84,113,114,115,116];

const lanthanides = [
  58,59,60,61,62,63,64,65,66,67,68,69,70,71
];

const actinides = [
  90,91,92,93,94,95,96,97,98,99,100,101,102,103
];

function getFamily(number) {
  if (alkali.includes(number)) return "alkali";
  if (alkaline.includes(number)) return "alkaline";
  if (lanthanides.includes(number)) return "lanthanide";
  if (actinides.includes(number)) return "actinide";
  if (metalloids.includes(number)) return "metalloid";
  if (nonmetals.includes(number)) return "nonmetal";
  if (halogens.includes(number)) return "halogen";
  if (nobleGases.includes(number)) return "noble";
  if (postTransition.includes(number)) return "post-transition";
  return "transition";
}

const familyNames = {
  alkali: "Alkali Metal",
  alkaline: "Alkaline Earth Metal",
  transition: "Transition Metal",
  "post-transition": "Post-Transition Metal",
  metalloid: "Metalloid",
  nonmetal: "Non-Metal",
  halogen: "Halogen",
  noble: "Noble Gas",
  lanthanide: "Lanthanide",
  actinide: "Actinide"
};


/* =========================================
   2. PERIODIC TABLE LAYOUT
   ========================================= */

const periodicRows = [
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [3,4,0,0,0,0,0,0,0,0,0,0,5,6,7,8,9,10],
  [11,12,0,0,0,0,0,0,0,0,0,0,13,14,15,16,17,18],
  [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],
  [37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54],
  [55,56,57,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86],
  [87,88,89,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118]
];

const periodicTable = document.getElementById("periodic-table");
const fBlock = document.getElementById("f-block");

let selectedElement = null;

function makeElementTile(element) {
  const tile = document.createElement("button");

  tile.type = "button";
  tile.className = `element ${getFamily(element.number)}`;

  tile.style.setProperty("--tile-index", element.number);
  tile.dataset.number = element.number;
  tile.dataset.name = element.name.toLowerCase();
  tile.dataset.symbol = element.symbol.toLowerCase();

  tile.setAttribute(
    "aria-label",
    `${element.number} ${element.name}, ${element.symbol}`
  );

  tile.innerHTML = `
    <span class="atomic-number">${element.number}</span>
    <span class="symbol">${element.symbol}</span>
    <span class="element-name">${element.name}</span>
  `;

  tile.addEventListener("click", () => selectElement(element.number));

  return tile;
}

function buildPeriodicTable() {
  if (!periodicTable || !fBlock) return;

  periodicTable.innerHTML = "";
  fBlock.innerHTML = "";

  periodicRows.forEach((row, rowIndex) => {
    row.forEach((number, columnIndex) => {
      if (number === 0) return;

      const element = byNumber(number);
      const tile = makeElementTile(element);

      tile.style.gridColumn = columnIndex + 1;
      tile.style.gridRow = rowIndex + 1;

      periodicTable.appendChild(tile);
    });
  });

  lanthanides.forEach((number, index) => {
    const tile = makeElementTile(byNumber(number));
    tile.style.gridColumn = index + 1;
    tile.style.gridRow = 1;
    fBlock.appendChild(tile);
  });

  actinides.forEach((number, index) => {
    const tile = makeElementTile(byNumber(number));
    tile.style.gridColumn = index + 1;
    tile.style.gridRow = 2;
    fBlock.appendChild(tile);
  });
}


/* =========================================
   3. ELEMENT INFORMATION — EXPANDED PROFILES
   ========================================= */

const detailsName = document.getElementById("element-name");

const profileFields = {
  symbol: document.getElementById("detail-symbol"),
  number: document.getElementById("detail-number"),
  family: document.getElementById("detail-family"),
  atomic: document.getElementById("detail-atomic"),
  group: document.getElementById("detail-group"),
  period: document.getElementById("detail-period"),
  type: document.getElementById("detail-type"),
  overview: document.getElementById("detail-overview"),
  properties: document.getElementById("detail-properties"),
  uses: document.getElementById("detail-uses"),
  fact: document.getElementById("detail-fact")
};

const elementProfiles = {
  1: ["Hydrogen is the lightest element and the most abundant element in the universe.", "At ordinary conditions it is a colourless, odourless gas. Hydrogen atoms commonly form H₂ molecules.", "Used to manufacture ammonia, in fuel research and in some industrial processes.", "Most stars are made mainly of hydrogen and helium."],
  2: ["Helium is a very light element and the second element in the periodic table.", "A colourless, odourless, non-flammable noble gas. It has a very low boiling point.", "Used in specialist cooling systems, scientific equipment and balloons.", "Helium was identified in the Sun's spectrum before it was discovered on Earth."],
  3: ["Lithium is the lightest metal and belongs to the alkali-metal family.", "A soft, silvery metal that is highly reactive and must be stored carefully.", "Important in rechargeable batteries and some specialised glass and ceramics.", "Lithium-ion batteries are widely used in phones, laptops and electric vehicles."],
  6: ["Carbon is the element at the centre of organic chemistry and is found in all known living organisms.", "It can form several structures, including diamond and graphite, with very different properties.", "Used in fuels, filters, pencils, construction materials and countless chemical compounds.", "Diamond and graphite are both made entirely of carbon atoms."],
  7: ["Nitrogen is a major component of Earth's atmosphere and is essential to living things.", "A colourless gas that makes up about 78% of dry air. Nitrogen gas is relatively unreactive.", "Used in fertiliser production, food packaging and liquid-nitrogen cooling.", "Proteins and DNA contain nitrogen."],
  8: ["Oxygen is an essential element for respiration in humans and many other organisms.", "A colourless gas that makes up about 21% of Earth's atmosphere. It supports combustion but is not itself a fuel.", "Used in medical oxygen supplies, steelmaking and water treatment.", "Oxygen is the most abundant element by mass in Earth's crust."],
  10: ["Neon is a noble gas best known for its use in illuminated signs.", "A colourless, odourless gas that is very unreactive.", "Used in lighting, indicators and some specialised lasers.", "Neon signs glow when an electric current passes through the gas."],
  11: ["Sodium is a soft alkali metal whose compounds are common in everyday life.", "A silvery metal that reacts vigorously with water, so pure sodium is stored away from moisture.", "Sodium compounds are used in food, glass, soaps and chemical manufacturing.", "Table salt is sodium chloride, a compound of sodium and chlorine."],
  12: ["Magnesium is a lightweight metal that is important in biology and engineering.", "A silvery metal that burns with a brilliant white light when ignited.", "Used in lightweight alloys, flares and fireworks; magnesium compounds also have medical and industrial uses.", "The central atom in chlorophyll, the green pigment in plants, is magnesium."],
  13: ["Aluminium is a lightweight metal widely used in transport, packaging and construction.", "Silvery, malleable and protected by a thin oxide layer that helps resist corrosion.", "Used in cans, foil, aircraft, bicycles, buildings and electrical applications.", "Aluminium can be recycled repeatedly."],
  14: ["Silicon is a metalloid and one of the most important materials in modern electronics.", "A hard, brittle solid that behaves as a semiconductor.", "Used in computer chips, solar cells, glass and silicone materials.", "Silicon is abundant in Earth's crust, mostly in minerals such as silica and silicates."],
  15: ["Phosphorus is a reactive non-metal essential to living organisms.", "It occurs in several forms, including white and red phosphorus, which have different properties.", "Phosphate compounds are used in fertilisers and are important in biology.", "Phosphorus is part of DNA, RNA and the energy-carrying molecule ATP."],
  16: ["Sulfur is a yellow non-metal found naturally and in many minerals.", "A brittle solid that forms a wide range of compounds.", "Used to make sulfuric acid, fertilisers, rubber products and some medicines.", "Sulfur compounds contribute to the smell of some volcanic gases."],
  17: ["Chlorine is a halogen used in carefully controlled water disinfection.", "A reactive, greenish-yellow gas that is hazardous in concentrated form.", "Used to disinfect drinking water and swimming pools and to manufacture many chemicals.", "Chlorine is part of common table salt when combined with sodium."],
  18: ["Argon is a noble gas that makes up just under one percent of Earth's atmosphere.", "Colourless, odourless and very unreactive under ordinary conditions.", "Used in welding, lighting and as a protective gas in industrial processes.", "Argon is often used where a reaction with oxygen in air must be avoided."],
  26: ["Iron is a transition metal used extensively in construction and engineering.", "Strong, magnetic in common forms and capable of forming many compounds.", "The main ingredient in steel, which is used in buildings, vehicles, tools and machinery.", "Iron is essential in haemoglobin, the protein that helps blood carry oxygen."],
  29: ["Copper is a reddish transition metal known for conducting electricity and heat very well.", "Ductile, malleable and resistant to corrosion in many everyday environments.", "Used in electrical wiring, motors, plumbing and electronic components.", "Copper develops a green surface layer called a patina over long periods outdoors."],
  30: ["Zinc is a transition metal commonly used to protect iron and steel.", "A bluish-silvery metal that resists corrosion and forms useful alloys.", "Used for galvanising steel, making brass and in some batteries.", "A thin zinc coating helps protect steel from rusting."],
  47: ["Silver is a shiny precious metal with the highest electrical conductivity of any element.", "Malleable, ductile and reflective, though it can tarnish when exposed to sulfur compounds.", "Used in jewellery, electronics, mirrors and some medical materials.", "Silver conducts electricity better than copper, although copper is used more often for wiring because it costs less."],
  50: ["Tin is a soft metal used in alloys and protective coatings.", "Silvery, malleable and relatively resistant to corrosion.", "Used in solder alloys, tin-plated steel cans and bronze.", "Bronze is an alloy mainly of copper and tin."],
  53: ["Iodine is a halogen needed in small amounts for normal thyroid function.", "A dark, shiny solid that can form a violet vapour when heated.", "Used in some antiseptics, medical imaging compounds and iodised salt.", "Iodised salt helps prevent iodine deficiency."],
  79: ["Gold is a precious transition metal valued for its appearance and resistance to corrosion.", "Dense, soft, malleable and an excellent conductor of electricity.", "Used in jewellery, electronics, dentistry and specialist applications.", "Gold can be hammered into extremely thin sheets called gold leaf."],
  80: ["Mercury is a metal that is liquid at ordinary room temperature.", "A dense, silvery liquid metal. Mercury and many of its compounds are toxic.", "Historically used in some measuring instruments and switches; many uses are now restricted.", "Mercury is one of the very few elements that are liquid near room temperature."],
  82: ["Lead is a dense, soft post-transition metal.", "Bluish-grey, malleable and toxic, especially when exposure occurs over time.", "Used in some lead-acid batteries and specialised radiation shielding.", "Lead exposure is particularly harmful to children's developing nervous systems."],
  92: ["Uranium is a naturally occurring radioactive actinide metal.", "A very dense, silvery metal. All its isotopes are radioactive.", "Used as fuel in some nuclear power reactors under strict industrial controls.", "Uranium has the highest atomic number of the elements found naturally in significant quantities."],
  118: ["Oganesson is a synthetic element and the final element currently named on the periodic table.", "It is extremely radioactive and only a few atoms have ever been produced, so many of its properties remain uncertain.", "It is used only in scientific research.", "Oganesson is named in honour of physicist Yuri Oganessian."]
};

function getElementDescription(element) {
  const family = getFamily(element.number);
  const familyName = familyNames[family];

  const familyOverview = {
    alkali: "This element belongs to Group 1, the alkali metals. These metals are generally soft and highly reactive.",
    alkaline: "This element belongs to Group 2, the alkaline earth metals. These metals are reactive and commonly form compounds.",
    lanthanide: "This element belongs to the lanthanide series, a group of metallic elements often called rare earth elements.",
    actinide: "This element belongs to the actinide series. These elements are radioactive metals.",
    metalloid: "This element is a metalloid, with properties between those of metals and non-metals.",
    nonmetal: "This element is a non-metal. Non-metals generally have properties different from metals.",
    halogen: "This element belongs to Group 17, the halogens. They are reactive non-metals.",
    noble: "This element belongs to Group 18, the noble gases. They are generally very unreactive.",
    "post-transition": "This element is a post-transition metal, a group of metals with varied properties.",
    transition: "This element is a transition metal. These metals often conduct heat and electricity well."
  };

  const profile = elementProfiles[element.number];

  if (profile) {
    return `${element.name} (${element.symbol}) — atomic number ${element.number}. ${profile[0]}`;
  }

  return `${element.name} (${element.symbol}) has atomic number ${element.number}. ${familyOverview[family] || `It belongs to the ${familyName} family.`}`;
}

function setProfileText(field, value) {
  if (profileFields[field]) profileFields[field].textContent = value;
}

function selectElement(number) {
  const element = byNumber(number);
  if (!element) return;

  selectedElement = number;
  const family = getFamily(number);
  const familyName = familyNames[family];
const position = {
  group: element.group ?? "—",
  period: element.period ?? "—"
};
  const profile = elementProfiles[number];

  document.querySelectorAll(".element").forEach(tile => {
    tile.classList.toggle("selected", Number(tile.dataset.number) === number);
  });

  if (detailsName) detailsName.textContent = `${element.number}. ${element.name} (${element.symbol})`;

  setProfileText("symbol", element.symbol);
  setProfileText("number", `ELEMENT ${String(number).padStart(3, "0")}`);
  setProfileText("family", familyName);
  setProfileText("atomic", number);
  setProfileText("group", position.group);
  setProfileText("period", position.period);
  setProfileText("type", familyName);

  setProfileText("overview", profile ? profile[0] : getElementDescription(element));
  setProfileText("properties", profile ? profile[1] : `${element.name} is classified as a ${familyName.toLowerCase()}. Its detailed physical and chemical properties depend on its atomic structure. Some properties of very rare synthetic elements are still being studied.`);
  setProfileText("uses", profile ? profile[2] : `The uses of ${element.name} depend on its properties. ${element.number > 92 ? "This synthetic element is currently used only for scientific research." : "Elements in this family are used in materials, manufacturing or scientific research."}`);
  setProfileText("fact", profile ? profile[3] : `The atomic number of ${element.name} is ${number}, which means every atom of this element has ${number} protons.`);

  const detailsPanel = document.getElementById("element-details");
  if (detailsPanel && window.innerWidth < 900) {
    detailsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

buildPeriodicTable();
selectElement(1);

/* =========================================
   4. ELEMENT SEARCH
   ========================================= */

const searchInput = document.getElementById("element-search");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    document.querySelectorAll(".element").forEach(tile => {
      const matches =
        tile.dataset.name.includes(query) ||
        tile.dataset.symbol.includes(query) ||
        tile.dataset.number.includes(query);

      tile.style.opacity = matches ? "1" : "0.18";
      tile.style.filter = matches ? "" : "grayscale(1)";
    });
  });
}


/* =========================================
   5. SIDE NAVIGATION
   Supports both .content-section and .page-section.
   ========================================= */

const navButtons = document.querySelectorAll(".nav-button");
const sections = document.querySelectorAll(".content-section, .page-section");

function showSection(sectionId) {
  sections.forEach(section => {
    section.classList.toggle("active", section.id === sectionId);
  });

  navButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach(button => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});


/* =========================================
   6. QUIZ QUESTION BANK
   ========================================= */

const quizQuestions = [
  {
    question: "What is the chemical symbol for Sodium?",
    options: ["S", "So", "Na", "N"],
    answer: 2,
    explanation: "Sodium's symbol is Na, from its Latin name Natrium."
  },
  {
    question: "Which element has atomic number 8?",
    options: ["Nitrogen", "Oxygen", "Carbon", "Fluorine"],
    answer: 1,
    explanation: "Oxygen has atomic number 8."
  },
  {
    question: "Which family contains Helium and Neon?",
    options: ["Halogens", "Alkali metals", "Noble gases", "Metalloids"],
    answer: 2,
    explanation: "Helium and Neon are noble gases, found in Group 18."
  },
  {
    question: "What is the symbol for Iron?",
    options: ["Ir", "In", "I", "Fe"],
    answer: 3,
    explanation: "Iron has the symbol Fe, from the Latin word Ferrum."
  },
  {
    question: "Which element is a metalloid?",
    options: ["Silicon", "Sodium", "Oxygen", "Neon"],
    answer: 0,
    explanation: "Silicon is a metalloid and has properties between metals and non-metals."
  },
  {
    question: "What is the atomic number of Carbon?",
    options: ["4", "6", "8", "12"],
    answer: 1,
    explanation: "Carbon has 6 protons, so its atomic number is 6."
  },
  {
    question: "Which element is a liquid at room temperature?",
    options: ["Gold", "Iron", "Mercury", "Copper"],
    answer: 2,
    explanation: "Mercury is a metal that is liquid at typical room temperature."
  },
  {
    question: "Which group contains the halogens?",
    options: ["Group 1", "Group 2", "Group 17", "Group 18"],
    answer: 2,
    explanation: "Halogens are in Group 17."
  },
  {
    question: "Which element has the symbol K?",
    options: ["Krypton", "Potassium", "Calcium", "Copper"],
    answer: 1,
    explanation: "K is the symbol for Potassium."
  },
  {
    question: "Which element is the most abundant gas in Earth's atmosphere?",
    options: ["Oxygen", "Hydrogen", "Nitrogen", "Helium"],
    answer: 2,
    explanation: "Nitrogen makes up about 78% of Earth's atmosphere."
  },
  {
    question: "How many protons does an atom of Aluminium have?",
    options: ["12", "13", "14", "27"],
    answer: 1,
    explanation: "Aluminium's atomic number is 13, so it has 13 protons."
  },
  {
    question: "Which pair belongs to Group 1?",
    options: ["Lithium and Sodium", "Oxygen and Sulfur", "Helium and Neon", "Calcium and Magnesium"],
    answer: 0,
    explanation: "Lithium and Sodium are both alkali metals in Group 1."
  },
  {
    question: "Which element has the symbol Ag?",
    options: ["Gold", "Argon", "Silver", "Aluminium"],
    answer: 2,
    explanation: "Ag is the chemical symbol for Silver."
  },
  {
    question: "What do elements in the same group generally share?",
    options: [
      "The same atomic number",
      "Similar chemical properties",
      "The same atomic mass",
      "The same number of shells"
    ],
    answer: 1,
    explanation: "Elements in the same group generally have similar chemical properties because they have the same number of outer-shell electrons."
  },
  {
    question: "Which element has atomic number 17?",
    options: ["Argon", "Sulfur", "Chlorine", "Phosphorus"],
    answer: 2,
    explanation: "Chlorine has atomic number 17."
  }
];


/* =========================================
   7. QUIZ ENGINE
   ========================================= */

const startQuizButton = document.getElementById("start-quiz");
const quizContainer = document.getElementById("quiz-container");
const quizProgress = document.getElementById("quiz-progress");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const nextQuestionButton = document.getElementById("next-question");
const quizResult = document.getElementById("quiz-result");

let currentQuiz = [];
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function startQuiz() {
  const quizIntro = document.getElementById("quiz-intro");
  if (quizIntro) quizIntro.hidden = true;
  if (quizResult) quizResult.hidden = true;
  if (quizContainer) quizContainer.hidden = false;
  currentQuiz = shuffle(quizQuestions).slice(0, 5);
  quizIndex = 0;
  quizScore = 0;
  quizAnswered = false;

  if (startQuizButton) startQuizButton.hidden = true;
  if (quizContainer) quizContainer.style.display = "block";
  if (quizResult) quizResult.textContent = "";

  showQuizQuestion();
}

function showQuizQuestion() {
  const question = currentQuiz[quizIndex];

  quizAnswered = false;
  quizProgress.textContent = `QUESTION ${quizIndex + 1} / ${currentQuiz.length}`;
  quizQuestion.textContent = question.question;
  quizFeedback.textContent = "";
  quizOptions.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.textContent = option;

    button.addEventListener("click", () => answerQuiz(index, button));

    quizOptions.appendChild(button);
  });

  nextQuestionButton.hidden = true;
}

function answerQuiz(index, clickedButton) {
  if (quizAnswered) return;
  quizAnswered = true;

  const question = currentQuiz[quizIndex];
  const optionButtons = quizOptions.querySelectorAll(".quiz-option");

  optionButtons.forEach((button, buttonIndex) => {
    button.disabled = true;

    if (buttonIndex === question.answer) {
      button.classList.add("correct");
    }
  });

  if (index === question.answer) {
    quizScore++;
    quizFeedback.textContent = `Correct! ${question.explanation}`;
    quizFeedback.className = "quiz-feedback correct-feedback";
  } else {
    clickedButton.classList.add("wrong");
    quizFeedback.textContent = `Not quite. ${question.explanation}`;
    quizFeedback.className = "quiz-feedback wrong-feedback";
  }

  nextQuestionButton.hidden = false;
  nextQuestionButton.textContent =
    quizIndex === currentQuiz.length - 1 ? "See Results" : "Next Question";
}

function nextQuizQuestion() {
  quizIndex++;

  if (quizIndex < currentQuiz.length) {
    showQuizQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  if (quizContainer) quizContainer.hidden = true;
  if (quizResult) {
    quizResult.hidden = false;
    quizResult.innerHTML = `
      <h3>QUIZ COMPLETE</h3>
      <p class="quiz-final-score">${quizScore} / ${currentQuiz.length}</p>
      <p>${quizScore === currentQuiz.length
        ? "Perfect score! Excellent work."
        : quizScore >= 3
          ? "Great effort! Keep learning."
          : "Keep practising — you can improve your score."}</p>
      <button type="button" id="retry-quiz" class="primary-button">Try Again</button>
    `;

    document.getElementById("retry-quiz").addEventListener("click", startQuiz);
  }

  if (startQuizButton) startQuizButton.hidden = false;
}

if (startQuizButton) startQuizButton.addEventListener("click", startQuiz);
if (nextQuestionButton) nextQuestionButton.addEventListener("click", nextQuizQuestion);
/* =========================================
   8. BOSS FIGHT QUESTION BANK
   ========================================= */

const bossQuestions = [
  {
    question: "An element has atomic number 6. Which element is it?",
    options: ["Oxygen", "Carbon", "Nitrogen", "Boron"],
    answer: 1,
    explanation: "Carbon has atomic number 6."
  },
  {
    question: "Which symbol belongs to Potassium?",
    options: ["P", "Pt", "K", "Po"],
    answer: 2,
    explanation: "Potassium's symbol is K."
  },
  {
    question: "An element is in Group 18. Which family does it belong to?",
    options: ["Halogens", "Noble gases", "Alkali metals", "Metalloids"],
    answer: 1,
    explanation: "Group 18 contains the noble gases."
  },
  {
    question: "Which element has 11 protons?",
    options: ["Magnesium", "Neon", "Sodium", "Aluminium"],
    answer: 2,
    explanation: "An element with 11 protons has atomic number 11: Sodium."
  },
  {
    question: "Which element is in the same group as Oxygen?",
    options: ["Sulfur", "Nitrogen", "Fluorine", "Neon"],
    answer: 0,
    explanation: "Oxygen and Sulfur are both in Group 16."
  },
  {
    question: "Which of these is an alkali metal?",
    options: ["Calcium", "Lithium", "Chlorine", "Argon"],
    answer: 1,
    explanation: "Lithium belongs to Group 1, the alkali metals."
  },
  {
    question: "An atom has 17 protons. What is its atomic number?",
    options: ["16", "18", "17", "34"],
    answer: 2,
    explanation: "Atomic number is the number of protons. Here it is 17."
  },
  {
    question: "Which element is used widely in computer chips?",
    options: ["Silicon", "Sodium", "Helium", "Calcium"],
    answer: 0,
    explanation: "Silicon is a semiconductor widely used in computer chips."
  },
  {
    question: "Which statement about elements in the same period is correct?",
    options: [
      "They have the same number of electron shells",
      "They have the same number of protons",
      "They have identical chemical properties",
      "They belong to the same family"
    ],
    answer: 0,
    explanation: "Elements in the same period have the same number of occupied electron shells."
  },
  {
    question: "Which pair contains two halogens?",
    options: [
      "Fluorine and Chlorine",
      "Sodium and Potassium",
      "Helium and Neon",
      "Carbon and Silicon"
    ],
    answer: 0,
    explanation: "Fluorine and Chlorine are both Group 17 halogens."
  },
  {
    question: "An element has atomic number 20. Which element is it?",
    options: ["Potassium", "Calcium", "Scandium", "Argon"],
    answer: 1,
    explanation: "Calcium has atomic number 20."
  },
  {
    question: "Which element is a noble gas with atomic number 10?",
    options: ["Argon", "Helium", "Neon", "Krypton"],
    answer: 2,
    explanation: "Neon has atomic number 10 and belongs to Group 18."
  }
];

/* =========================================
   9. BOSS FIGHT ENGINE
   ========================================= */

const startBossButton = document.getElementById("start-boss");
const bossGame = document.getElementById("boss-game");
const bossQuestion = document.getElementById("boss-question");
const bossOptions = document.getElementById("boss-options");
const bossFeedback = document.getElementById("boss-feedback");
const bossNextButton = document.getElementById("boss-next");
const bossResult = document.getElementById("boss-result");

const bossHealthBar = document.getElementById("boss-health-bar");
const bossHealthText = document.getElementById("boss-health-text");
const bossLives = document.getElementById("boss-lives");
const bossQuestionCount = document.getElementById("boss-question-count");

let currentBossQuestions = [];
let bossIndex = 0;
let bossHealth = 100;
let bossLifeCount = 3;
let bossAnswered = false;
let bossCorrectAnswers = 0;

function startBossFight() {
  const bossIntro = document.getElementById("boss-intro");
  if (bossIntro) bossIntro.hidden = true;
  if (bossResult) bossResult.hidden = true;
  if (bossGame) bossGame.hidden = false;

  currentBossQuestions = shuffle(bossQuestions).slice(0, 5);

  bossIndex = 0;
  bossHealth = 100;
  bossLifeCount = 3;
  bossAnswered = false;
  bossCorrectAnswers = 0;

  if (startBossButton) startBossButton.hidden = true;
  if (bossGame) bossGame.style.display = "block";
  if (bossResult) bossResult.textContent = "";

  updateBossStats();
  showBossQuestion();
}

function updateBossStats() {
  bossHealthBar.style.width = `${bossHealth}%`;
  bossHealthText.textContent = `${bossHealth}%`;

  bossLives.textContent =
    "❤️ ".repeat(bossLifeCount) +
    "🖤 ".repeat(3 - bossLifeCount);
}

function showBossQuestion() {
  const question = currentBossQuestions[bossIndex];

  bossAnswered = false;
  bossQuestionCount.textContent =
    `Question ${bossIndex + 1} / 5`;

  bossQuestion.textContent = question.question;
  bossFeedback.textContent = "";
  bossOptions.innerHTML = "";
  bossNextButton.hidden = true;

  question.options.forEach((option, index) => {
    const button = document.createElement("button");

    button.className = "answer-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", () => {
      answerBossQuestion(index, button);
    });

    bossOptions.appendChild(button);
  });
}

function answerBossQuestion(selectedIndex, selectedButton) {
  if (bossAnswered) return;
    bossAnswered = true;

  const question = currentBossQuestions[bossIndex];
  const buttons = bossOptions.querySelectorAll("button");

  buttons.forEach(button => {
    button.disabled = true;
  });

  if (selectedIndex === question.answer) {
    bossCorrectAnswers++;
    bossHealth = Math.max(0, bossHealth - 20);

    selectedButton.classList.add("correct");
    bossFeedback.textContent =
      `✓ Direct hit! ${question.explanation}`;
  } else {
    bossLifeCount--;

    selectedButton.classList.add("wrong");
    buttons[question.answer].classList.add("correct");

    bossFeedback.textContent =
      `The boss got you! ${question.explanation}`;
  }

  updateBossStats();

  if (bossLifeCount <= 0) {
    bossNextButton.hidden = false;
    bossNextButton.textContent = "See Result";
    bossNextButton.onclick = finishBossFight;
    return;
  }

  if (bossIndex === currentBossQuestions.length - 1) {
    bossNextButton.textContent = "Finish Battle";
    bossNextButton.onclick = finishBossFight;
  } else {
    bossNextButton.textContent = "Next Challenge →";
    bossNextButton.onclick = nextBossQuestion;
  }

  bossNextButton.hidden = false;
}

function nextBossQuestion() {
  if (bossIndex < currentBossQuestions.length - 1) {
    bossIndex++;
    showBossQuestion();
  }
}

function finishBossFight() {
  const bossIntro = document.getElementById("boss-intro");
  if (bossIntro) bossIntro.hidden = false;
  if (bossGame) bossGame.hidden = true;
  if (bossResult) bossResult.hidden = false;

  bossQuestion.textContent = "Battle completed!";
  bossOptions.innerHTML = "";
  bossFeedback.textContent = "";
  bossNextButton.hidden = true;

  const won = bossHealth === 0 && bossLifeCount > 0;

  if (won) {
    bossResult.innerHTML = `
      <h2>🏆 YOU DEFEATED THE BOSS!</h2>
      <p>You answered ${bossCorrectAnswers} out of 5 correctly.</p>
      <p>You have mastered this challenge!</p>
    `;
  } else {
    bossResult.innerHTML = `
      <h2>⚔ BATTLE OVER</h2>
      <p>You answered ${bossCorrectAnswers} out of 5 correctly.</p>
      <p>Review the elements you learned and try again.</p>
    `;
  }

  startBossButton.hidden = false;
  startBossButton.textContent = "Fight Again ⚔";
}

startBossButton.addEventListener("click", startBossFight);


/* =========================================
   10. VERITY AI CHATBOT
   Calls a Netlify Function. Keep the API key
   in Netlify environment variables, never here.
   ========================================= */

const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotWindow = document.getElementById("chatbot-window");
const chatbotClose = document.getElementById("chatbot-close");
const chatbotForm = document.getElementById("chatbot-form");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotMessages = document.getElementById("chatbot-messages");

let verityHistory = [];
let verityBusy = false;

if (chatbotToggle && chatbotWindow && chatbotInput) {
  chatbotToggle.addEventListener("click", () => {
    chatbotWindow.classList.toggle("open");

    if (chatbotWindow.classList.contains("open")) {
      chatbotInput.focus();
    }
  });
}

if (chatbotClose && chatbotWindow) {
  chatbotClose.addEventListener("click", () => {
    chatbotWindow.classList.remove("open");
  });
}

function addChatMessage(message, type) {
  if (!chatbotMessages) return null;

  const bubble = document.createElement("div");
  bubble.className = type === "user" ? "user-message" : "bot-message";
  bubble.textContent = message;

  chatbotMessages.appendChild(bubble);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  return bubble;
}

function addVerityTyping() {
  if (!chatbotMessages) return null;

  const typing = document.createElement("div");
  typing.className = "typing-indicator";
  typing.setAttribute("aria-label", "Verity is thinking");
  typing.innerHTML = "<span></span><span></span><span></span>";

  chatbotMessages.appendChild(typing);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  return typing;
}

// On the live site use the normal address. If index.html is opened from your computer,
// talk to the live Netlify site instead (it must be deployed first).
const VERITY_URL = window.location.protocol === "file:"
  ? "https://elementalquest-123.netlify.app/.netlify/functions/verity"
  : "/.netlify/functions/verity";

async function askVerity(message) {
  const typing = addVerityTyping();

  try {
    const response = await fetch(VERITY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        history: verityHistory.slice(-8),
        selectedElement: selectedElement
          ? byNumber(selectedElement)
          : null
      })
    });

    let data = {};

    try {
      data = await response.json();
    } catch (_) {
      throw new Error("The server returned an unreadable response.");
    }

    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status}).`);
    }

    const reply =
      data.reply || "I couldn't create a response. Please try again.";

    if (typing) typing.remove();

    addChatMessage(reply, "bot");

    verityHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: reply }
    );

    verityHistory = verityHistory.slice(-10);

  } catch (error) {
    if (typing) typing.remove();

    let explanation;

    if (window.location.protocol === "file:") {
      explanation =
        "I couldn't reach my AI brain on your live website. 🔌 " +
        "Make sure the site is deployed from GitHub and your internet is on, then try again.";
    } else if (error.message === "Failed to fetch") {
      explanation =
        "I couldn't connect to the internet or the server. Please check your connection and try again.";
    } else {
      explanation =
        `I couldn't reach my AI service. ${error.message} ` +
        "Check the Netlify function deployment, the OPENAI_API_KEY environment variable, and your OpenAI billing/limits.";
    }

    addChatMessage(explanation, "bot");
  }
}

if (chatbotForm && chatbotInput) {
  chatbotForm.addEventListener("submit", async event => {
    event.preventDefault();

    const message = chatbotInput.value.trim();

    if (!message || verityBusy) return;

    verityBusy = true;
    chatbotInput.disabled = true;

    addChatMessage(message, "user");
    chatbotInput.value = "";

    await askVerity(message);

    chatbotInput.disabled = false;
    chatbotInput.focus();
    verityBusy = false;
  });
}


/* =========================================
   11. INITIAL PAGE STATE
   ========================================= */

if (document.getElementById("periodic-section")) {
  showSection("periodic-section");
} else if (sections.length && sections[0].id) {
  showSection(sections[0].id);
}

console.log("ELEMENT QUEST loaded successfully.");
console.log(`${elements.length} elements available.`);