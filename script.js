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

/* Works out an element's group and period from the table layout */
function getElementPosition(number) {
  if (lanthanides.includes(number)) return { group: "f-block", period: 6 };
  if (actinides.includes(number)) return { group: "f-block", period: 7 };

  for (let row = 0; row < periodicRows.length; row++) {
    const column = periodicRows[row].indexOf(number);
    if (column !== -1) return { group: column + 1, period: row + 1 };
  }

  return { group: "—", period: "—" };
}

function selectElement(number) {
  const element = byNumber(number);
  if (!element) return;

  selectedElement = number;
  const family = getFamily(number);
  const familyName = familyNames[family];
  const position = getElementPosition(number);
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
   8. BOSS FIGHT QUESTION SETS
   3 sets of 10 questions. Each battle picks a random set
   (never the same set twice in a row) and shuffles it.
   ========================================= */

const BOSS_SETS = [
  {
    name: "Symbols & Numbers",
    questions: [
      { question: "An element has atomic number 6. Which element is it?", options: ["Oxygen", "Carbon", "Nitrogen", "Boron"], answer: 1, explanation: "Carbon has atomic number 6." },
      { question: "Which symbol belongs to Potassium?", options: ["P", "Pt", "K", "Po"], answer: 2, explanation: "Potassium's symbol is K, from its Latin name Kalium." },
      { question: "Which element has 11 protons?", options: ["Magnesium", "Neon", "Sodium", "Aluminium"], answer: 2, explanation: "An element with 11 protons has atomic number 11: Sodium." },
      { question: "An element has atomic number 20. Which element is it?", options: ["Potassium", "Calcium", "Scandium", "Argon"], answer: 1, explanation: "Calcium has atomic number 20." },
      { question: "Which element has the symbol Ag?", options: ["Gold", "Argon", "Silver", "Aluminium"], answer: 2, explanation: "Ag is Silver, from the Latin word Argentum." },
      { question: "Which element has the symbol Fe?", options: ["Fluorine", "Iron", "Fermium", "Francium"], answer: 1, explanation: "Fe is Iron, from the Latin word Ferrum." },
      { question: "What is the chemical symbol for Lead?", options: ["Le", "Ld", "Pb", "Pl"], answer: 2, explanation: "Lead's symbol is Pb, from the Latin word Plumbum." },
      { question: "An atom has 17 protons. What is its atomic number?", options: ["16", "18", "17", "34"], answer: 2, explanation: "Atomic number is the number of protons. Here it is 17." },
      { question: "Which element has the symbol Au?", options: ["Silver", "Gold", "Argon", "Aluminium"], answer: 1, explanation: "Au is Gold, from the Latin word Aurum." },
      { question: "Which element has atomic number 1?", options: ["Helium", "Hydrogen", "Lithium", "Oxygen"], answer: 1, explanation: "Hydrogen is element number 1, the lightest element." }
    ]
  },
  {
    name: "Families & the Table",
    questions: [
      { question: "An element is in Group 18. Which family does it belong to?", options: ["Halogens", "Noble gases", "Alkali metals", "Metalloids"], answer: 1, explanation: "Group 18 contains the noble gases." },
      { question: "Which element is in the same group as Oxygen?", options: ["Sulfur", "Nitrogen", "Fluorine", "Neon"], answer: 0, explanation: "Oxygen and Sulfur are both in Group 16." },
      { question: "Which of these is an alkali metal?", options: ["Calcium", "Lithium", "Chlorine", "Argon"], answer: 1, explanation: "Lithium belongs to Group 1, the alkali metals." },
      { question: "Which pair contains two halogens?", options: ["Fluorine and Chlorine", "Sodium and Potassium", "Helium and Neon", "Carbon and Silicon"], answer: 0, explanation: "Fluorine and Chlorine are both Group 17 halogens." },
      { question: "Which noble gas has atomic number 10?", options: ["Argon", "Helium", "Neon", "Krypton"], answer: 2, explanation: "Neon has atomic number 10 and belongs to Group 18." },
      { question: "What do elements in the same period have in common?", options: ["The same number of electron shells", "The same number of protons", "Identical chemical properties", "The same family name"], answer: 0, explanation: "Elements in the same period have the same number of occupied electron shells." },
      { question: "What is Group 2 of the periodic table called?", options: ["Alkali metals", "Alkaline earth metals", "Halogens", "Noble gases"], answer: 1, explanation: "Group 2 elements, like Magnesium and Calcium, are the alkaline earth metals." },
      { question: "Which of these elements is a metalloid?", options: ["Silicon", "Sodium", "Oxygen", "Neon"], answer: 0, explanation: "Silicon is a metalloid, with properties between metals and non-metals." },
      { question: "How many periods (rows) does the periodic table have?", options: ["7", "8", "18", "10"], answer: 0, explanation: "The periodic table has 7 periods." },
      { question: "How many groups (columns) does the periodic table have?", options: ["7", "12", "18", "20"], answer: 2, explanation: "The periodic table has 18 groups." }
    ]
  },
  {
    name: "Chemistry in Real Life",
    questions: [
      { question: "Which element is used widely in computer chips?", options: ["Silicon", "Sodium", "Helium", "Calcium"], answer: 0, explanation: "Silicon is a semiconductor used in computer chips." },
      { question: "Which metal is a liquid at room temperature?", options: ["Gold", "Iron", "Mercury", "Copper"], answer: 2, explanation: "Mercury is a metal that is liquid at room temperature." },
      { question: "Which gas makes up about 78% of Earth's air?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], answer: 1, explanation: "Nitrogen makes up about 78% of the air we breathe." },
      { question: "Which gas do our bodies need for breathing (respiration)?", options: ["Helium", "Nitrogen", "Oxygen", "Neon"], answer: 2, explanation: "Our cells use oxygen to release energy from food." },
      { question: "Table salt is made of sodium and which other element?", options: ["Chlorine", "Calcium", "Carbon", "Copper"], answer: 0, explanation: "Table salt is sodium chloride, made of sodium and chlorine." },
      { question: "Which light gas makes party balloons float?", options: ["Neon", "Helium", "Argon", "Chlorine"], answer: 1, explanation: "Helium is lighter than air, so helium balloons float." },
      { question: "Which metal is the key ingredient in phone and laptop batteries?", options: ["Lead", "Lithium", "Gold", "Zinc"], answer: 1, explanation: "Most phones and laptops use lithium-ion batteries." },
      { question: "Which metal is used in most electric wires?", options: ["Copper", "Iron", "Mercury", "Tin"], answer: 0, explanation: "Copper conducts electricity very well and costs less than silver." },
      { question: "Diamonds and pencil 'lead' (graphite) are both made of which element?", options: ["Lead", "Silicon", "Carbon", "Sulfur"], answer: 2, explanation: "Diamond and graphite are both pure carbon, arranged differently." },
      { question: "Which gas glows red-orange in bright advertising signs?", options: ["Neon", "Oxygen", "Hydrogen", "Nitrogen"], answer: 0, explanation: "Neon glows red-orange when electricity passes through it." }
    ]
  }
];

/* =========================================
   9. BOSS FIGHT ENGINE
   10 questions, 3 lives. Each correct answer deals 12.5% damage,
   so 8 correct answers defeat the boss. 3 wrong answers = game over.
   ========================================= */

const BOSS_DAMAGE = 12.5;

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

/* =========================================
   BOSS PIXEL MONSTER 👾
   An original pixel-art "Element Guardian" drawn with code.
   It flashes when hit, laughs when you miss, gets angry
   when its health is low, and spins away when defeated.
   ========================================= */

const BOSS_PIXELS_LEFT = [
  "...G.....",
  "....B....",
  ".....B...",
  "....LLBBB",
  "...LBBBBB",
  "..LBBWWWB",
  "..BBBWPPB",
  "..BBBWPPB",
  "BBBBBBBBB",
  "BB.BBBMMM",
  "BB.BBBMTM",
  "B..BBBBBB",
  "...BBBDDB",
  "...DD..DD"
];

const BOSS_COLORS = {
  B: "#8b5cf6", // body
  L: "#c4b5fd", // shine
  D: "#5b2fc9", // shadow / feet
  W: "#ffffff", // eye white
  P: "#1a1033", // pupil
  M: "#2b1650", // mouth
  T: "#ffffff", // teeth
  G: "#55cfff"  // glowing antenna tips
};

function bossSpriteSVG() {
  const rows = BOSS_PIXELS_LEFT.map(left => {
    const right = left.split("").reverse().join("").replace(/L/g, "B");
    return left + right;
  });
  let rects = "";
  rows.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      if (BOSS_COLORS[ch]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${BOSS_COLORS[ch]}"/>`;
    });
  });
  return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

(function addBossSpriteStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .boss-sprite { display: inline-block; width: 150px; filter: drop-shadow(0 0 18px rgba(139, 92, 246, .55)); animation: bossBob 1.2s steps(2) infinite; transition: filter .3s; }
    .boss-sprite svg { display: block; width: 100%; height: auto; }
    .boss-icon .boss-sprite { width: 120px; }
    .boss-arena { position: relative; text-align: center; margin: 4px 0 18px; padding-top: 26px; }
    .boss-sprite.angry { filter: drop-shadow(0 0 22px rgba(139, 92, 246, .75)) hue-rotate(95deg) saturate(1.6); }
    .boss-sprite.hit { animation: bossHit .45s steps(6); }
    .boss-sprite.laugh { animation: bossLaugh .7s steps(4); }
    .boss-sprite.defeated { animation: bossDefeat 1.1s ease-in forwards; }
    .boss-pop { position: absolute; left: 50%; top: -6px; transform: translateX(-50%); font: 900 26px Arial, sans-serif; color: #ffd166; text-shadow: 2px 2px 0 #120f24; pointer-events: none; animation: bossPop .9s ease-out forwards; }
    @keyframes bossBob { 50% { transform: translateY(-6px); } }
    @keyframes bossHit { 0%,100% { transform: translateX(0); filter: brightness(1); } 20% { transform: translateX(-10px); filter: brightness(3); } 40% { transform: translateX(10px); } 60% { transform: translateX(-6px); filter: brightness(3); } 80% { transform: translateX(6px); } }
    @keyframes bossLaugh { 0%,100% { transform: translateY(0) scale(1); } 25% { transform: translateY(-14px) scale(1.08) rotate(-6deg); } 50% { transform: translateY(0) scale(1); } 75% { transform: translateY(-10px) scale(1.06) rotate(6deg); } }
    @keyframes bossDefeat { 0% { transform: rotate(0) scale(1); opacity: 1; } 100% { transform: rotate(540deg) scale(0); opacity: 0; } }
    @keyframes bossPop { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -40px); } }
  `;
  document.head.appendChild(style);
})();

// Monster on the intro screen (replaces the ☄ icon)
const bossIntroIcon = document.querySelector("#boss-intro .boss-icon");
if (bossIntroIcon) bossIntroIcon.innerHTML = `<span class="boss-sprite">${bossSpriteSVG()}</span>`;

// Monster inside the battle
const bossArena = document.createElement("div");
bossArena.className = "boss-arena";
bossArena.innerHTML = `<span class="boss-sprite" id="boss-sprite">${bossSpriteSVG()}</span>`;
if (bossGame) bossGame.insertBefore(bossArena, bossGame.firstChild);
const bossSprite = document.getElementById("boss-sprite");

function bossSpriteAnimate(className, popText) {
  if (!bossSprite) return;
  bossSprite.classList.remove("hit", "laugh", "defeated");
  void bossSprite.offsetWidth; // restart the animation
  bossSprite.classList.add(className);
  if (popText) {
    const pop = document.createElement("span");
    pop.className = "boss-pop";
    pop.textContent = popText;
    bossArena.appendChild(pop);
    setTimeout(() => pop.remove(), 900);
  }
}

function bossSpriteReset() {
  if (!bossSprite) return;
  bossSprite.classList.remove("hit", "laugh", "defeated", "angry");
}

function bossSpriteMood() {
  if (bossSprite) bossSprite.classList.toggle("angry", bossHealth > 0 && bossHealth <= 40);
}

let currentBossQuestions = [];
let currentBossSet = null;
let lastBossSetIndex = -1;
let bossIndex = 0;
let bossHealth = 100;
let bossLifeCount = 3;
let bossAnswered = false;
let bossCorrectAnswers = 0;
let bossQuestionsAnswered = 0;

// Update the intro text for the new rules
const bossIntroText = document.querySelector("#boss-intro p");
if (bossIntroText) {
  bossIntroText.textContent = "Ten questions. Three lives. Answer 8 correctly to defeat the boss! New questions every battle.";
}

function pickBossSet() {
  let index = Math.floor(Math.random() * BOSS_SETS.length);
  if (BOSS_SETS.length > 1 && index === lastBossSetIndex) {
    index = (index + 1 + Math.floor(Math.random() * (BOSS_SETS.length - 1))) % BOSS_SETS.length;
  }
  lastBossSetIndex = index;
  return BOSS_SETS[index];
}

function startBossFight() {
  const bossIntro = document.getElementById("boss-intro");
  if (bossIntro) bossIntro.hidden = true;
  if (bossResult) bossResult.hidden = true;
  if (bossGame) bossGame.hidden = false;

  currentBossSet = pickBossSet();
  currentBossQuestions = shuffle(currentBossSet.questions);

  bossIndex = 0;
  bossHealth = 100;
  bossLifeCount = 3;
  bossAnswered = false;
  bossCorrectAnswers = 0;
  bossQuestionsAnswered = 0;

  if (startBossButton) startBossButton.hidden = true;
  if (bossGame) bossGame.style.display = "block";
  if (bossResult) bossResult.textContent = "";

  bossSpriteReset();
  updateBossStats();
  showBossQuestion();
}

function updateBossStats() {
  const shown = Math.max(0, Math.round(bossHealth));
  bossHealthBar.style.width = `${shown}%`;
  bossHealthText.textContent = `${shown}%`;

  bossLives.textContent =
    "❤️ ".repeat(bossLifeCount) +
    "🖤 ".repeat(3 - bossLifeCount);
}

function showBossQuestion() {
  const question = currentBossQuestions[bossIndex];

  bossAnswered = false;
  bossQuestionCount.textContent =
    `${currentBossSet.name.toUpperCase()} · QUESTION ${bossIndex + 1} / ${currentBossQuestions.length}`;

  bossQuestion.textContent = question.question;
  bossFeedback.textContent = "";
  bossOptions.innerHTML = "";
  bossNextButton.hidden = true;

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener("click", () => answerBossQuestion(index, button));
    bossOptions.appendChild(button);
  });
}

function answerBossQuestion(selectedIndex, selectedButton) {
  if (bossAnswered) return;
  bossAnswered = true;
  bossQuestionsAnswered++;

  const question = currentBossQuestions[bossIndex];
  const buttons = bossOptions.querySelectorAll("button");
  buttons.forEach(button => { button.disabled = true; });

  if (selectedIndex === question.answer) {
    bossCorrectAnswers++;
    bossHealth = Math.max(0, bossHealth - BOSS_DAMAGE);
    selectedButton.classList.add("correct");
    bossFeedback.textContent = `✓ Direct hit! ${question.explanation}`;
    bossSpriteAnimate(bossHealth <= 0 ? "defeated" : "hit", "💥 HIT!");
  } else {
    bossLifeCount--;
    selectedButton.classList.add("wrong");
    buttons[question.answer].classList.add("correct");
    bossFeedback.textContent = `The boss got you! ${question.explanation}`;
    bossSpriteAnimate("laugh", "HA HA!");
  }

  updateBossStats();
  bossSpriteMood();
  bossNextButton.hidden = false;

  if (bossHealth <= 0) {
    bossNextButton.textContent = "Claim Victory 🏆";
    bossNextButton.onclick = finishBossFight;
  } else if (bossLifeCount <= 0) {
    bossNextButton.textContent = "See Result";
    bossNextButton.onclick = finishBossFight;
  } else if (bossIndex === currentBossQuestions.length - 1) {
    bossNextButton.textContent = "Finish Battle";
    bossNextButton.onclick = finishBossFight;
  } else {
    bossNextButton.textContent = "Next Challenge →";
    bossNextButton.onclick = nextBossQuestion;
  }
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

  const won = bossHealth <= 0 && bossLifeCount > 0;

  if (won) {
    bossResult.innerHTML = `
      <h2>🏆 YOU DEFEATED THE BOSS!</h2>
      <p>You answered ${bossCorrectAnswers} out of ${bossQuestionsAnswered} correctly in the "${currentBossSet.name}" battle.</p>
      <p>You have mastered this challenge!</p>
    `;
  } else {
    bossResult.innerHTML = `
      <h2>⚔ BATTLE OVER</h2>
      <p>You answered ${bossCorrectAnswers} out of ${bossQuestionsAnswered} correctly in the "${currentBossSet.name}" battle.</p>
      <p>You need 8 correct answers to win. Review the elements and try again!</p>
    `;
  }

  startBossButton.hidden = false;
  startBossButton.textContent = "Fight Again ⚔";
}

startBossButton.addEventListener("click", startBossFight);


/* =========================================
   10. VERITY AI CHATBOT
   Calls our Vercel server function. The AI key is kept
   in Vercel environment variables, never here.
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
// talk to the live Vercel site instead.
const VERITY_URL = window.location.protocol === "file:"
  ? "https://elemental-quest-one.vercel.app/api/verity"
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
        `Hmm, something went wrong: ${error.message} Please try again in a moment.`;
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
/* =========================================
   12. BOSS FX UPGRADE 💥😂
   Better HIT and LAUGH animations:
   - HIT: X-eyes face, white flash, knockback, screen shake,
     pixel explosion, damage number and combo counter
   - LAUGH: laughing face, bouncy laugh, floating "HA"s,
     red flash and shaking hearts
   ========================================= */

const BOSS_FACES = {
  normal: BOSS_PIXELS_LEFT,
  laugh: [
    "...G.....",
    "....B....",
    ".....B...",
    "....LLBBB",
    "...LBBBBB",
    "..LBBBPBB",
    "..BBBPBPB",
    "..BBBBBBB",
    "BBBBBBBBB",
    "BB.BBMTTT",
    "BB.BBMMMM",
    "B..BBBMRR",
    "...BBBDDB",
    "...DD..DD"
  ],
  hurt: [
    "...G.....",
    "....B....",
    ".....B...",
    "....LLBBB",
    "...LBBBBB",
    "..LBBPBPB",
    "..BBBBPBB",
    "..BBBPBPB",
    "BBBBBBBBB",
    "BB.BBBBBB",
    "BB.BBBTMT",
    "B..BBBBBB",
    "...BBBDDB",
    "...DD..DD"
  ]
};

BOSS_COLORS.R = "#ff7aa8"; // tongue

function bossFaceSVG(face) {
  const rows = BOSS_FACES[face].map(left => {
    const right = left.split("").reverse().join("").replace(/L/g, "B");
    return left + right;
  });
  let rects = "";
  rows.forEach((row, y) => {
    row.split("").forEach((ch, x) => {
      if (BOSS_COLORS[ch]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${BOSS_COLORS[ch]}"/>`;
    });
  });
  return `<svg viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
}

(function addBossFxStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .boss-sprite.hit { animation: fxHit .65s ease-out; }
    .boss-sprite.laugh { animation: fxLaugh 1.3s ease-in-out; }
    .boss-arena.shake { animation: fxShake .45s linear; }
    .boss-arena::before { content: ""; position: absolute; inset: -10px 0 -10px 0; background: radial-gradient(ellipse closest-side at 50% 55%, rgba(255, 70, 90, .55), transparent); opacity: 0; pointer-events: none; }
    .boss-arena.ouch::before { animation: fxOuch .8s ease-out; }
    #boss-lives.lost { display: inline-block; animation: fxLives .6s ease-out; }
    #boss-health-bar.flash { animation: fxBar .5s ease-out; }

    .fx-ring { position: absolute; left: 50%; top: 84px; width: 30px; height: 30px; margin: -15px 0 0 -15px; border: 4px solid #ffd166; border-radius: 50%; pointer-events: none; animation: fxRing .5s ease-out forwards; }
    .fx-pixel { position: absolute; left: 50%; top: 84px; width: 9px; height: 9px; pointer-events: none; animation: fxPixel .75s cubic-bezier(.2,.7,.4,1) forwards; }
    .fx-damage { position: absolute; left: 75%; top: 60px; font: 900 30px Arial, sans-serif; color: #ff5d73; text-shadow: 3px 3px 0 #120f24; pointer-events: none; animation: fxDamage 1s ease-out forwards; }
    .fx-combo { position: absolute; left: 25%; top: 70px; font: 900 20px Arial, sans-serif; color: #55cfff; text-shadow: 2px 2px 0 #120f24; pointer-events: none; white-space: nowrap; animation: fxCombo 1.1s ease-out forwards; }
    .fx-ha { position: absolute; top: 60px; font: 900 26px Arial, sans-serif; color: #c4b5fd; text-shadow: 3px 3px 0 #2b1650; pointer-events: none; opacity: 0; animation: fxHa 1.1s ease-out forwards; }
    .boss-pop { animation: fxPop .9s ease-out forwards; }

    @keyframes fxHit {
      0%   { transform: translateX(0) scale(1); filter: brightness(1); }
      8%   { transform: translateX(22px) rotate(10deg) scale(1.15, .85); filter: brightness(5) saturate(0); }
      20%  { transform: translateX(-14px) rotate(-7deg) scale(.9, 1.1); filter: brightness(1); }
      32%  { transform: translateX(10px) rotate(5deg); filter: brightness(4) saturate(0); }
      46%  { transform: translateX(-6px) rotate(-3deg); filter: brightness(1); }
      62%  { transform: translateX(3px) rotate(1deg); }
      100% { transform: translateX(0) rotate(0) scale(1); }
    }
    @keyframes fxLaugh {
      0%   { transform: translateY(0) scale(1); }
      8%   { transform: translateY(4px) scale(1.15, .85); }
      18%  { transform: translateY(-26px) scale(.9, 1.12) rotate(-8deg); }
      28%  { transform: translateY(2px) scale(1.12, .88); }
      38%  { transform: translateY(-20px) scale(.92, 1.1) rotate(8deg); }
      48%  { transform: translateY(2px) scale(1.1, .9); }
      58%  { transform: translateY(-14px) rotate(-6deg); }
      68%  { transform: translateY(1px) scale(1.06, .94); }
      78%  { transform: translateY(-8px) rotate(4deg); }
      90%  { transform: translateY(0) scale(1.03, .97); }
      100% { transform: translateY(0) scale(1); }
    }
    @keyframes fxShake {
      0%, 100% { transform: translate(0, 0); }
      15% { transform: translate(-8px, 4px); }
      30% { transform: translate(7px, -5px); }
      45% { transform: translate(-6px, -3px); }
      60% { transform: translate(5px, 4px); }
      75% { transform: translate(-3px, 2px); }
    }
    @keyframes fxOuch {
      0%   { opacity: 0; }
      25%  { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes fxLives {
      0%, 100% { transform: scale(1) rotate(0); }
      20% { transform: scale(1.4) rotate(-10deg); }
      40% { transform: scale(1.2) rotate(10deg); }
      60% { transform: scale(1.3) rotate(-6deg); }
      80% { transform: scale(1.1) rotate(4deg); }
    }
    @keyframes fxBar {
      0%   { filter: brightness(1); }
      30%  { filter: brightness(2.5); }
      100% { filter: brightness(1); }
    }
    @keyframes fxRing {
      from { transform: scale(.4); opacity: 1; }
      to   { transform: scale(6); opacity: 0; border-width: 1px; }
    }
    @keyframes fxPixel {
      0%   { transform: translate(-50%, -50%) rotate(0); opacity: 1; }
      100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--spin)); opacity: 0; }
    }
    @keyframes fxDamage {
      0%   { transform: translate(-50%, 10px) scale(.4); opacity: 0; }
      20%  { transform: translate(-50%, -10px) scale(1.4); opacity: 1; }
      40%  { transform: translate(-50%, -16px) scale(1); }
      100% { transform: translate(-50%, -60px) scale(1); opacity: 0; }
    }
    @keyframes fxCombo {
      0%   { transform: translateX(-50%) scale(0) rotate(-10deg); opacity: 0; }
      25%  { transform: translateX(-50%) scale(1.3) rotate(4deg); opacity: 1; }
      45%  { transform: translateX(-50%) scale(1) rotate(0); }
      100% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    }
    @keyframes fxHa {
      0%   { transform: translateY(0) scale(.3) rotate(var(--tilt)); opacity: 0; }
      25%  { transform: translateY(-10px) scale(1.25) rotate(var(--tilt)); opacity: 1; }
      100% { transform: translateY(-55px) scale(1) rotate(var(--tilt)); opacity: 0; }
    }
    @keyframes fxPop {
      0%   { transform: translate(-50%, 0) scale(.3); opacity: 0; }
      20%  { transform: translate(-50%, -6px) scale(1.3); opacity: 1; }
      40%  { transform: translate(-50%, -10px) scale(1); }
      100% { transform: translate(-50%, -40px) scale(1); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

let bossHitStreak = 0;
let bossFaceTimer = null;
let bossAnimTimer = null;

function setBossFace(face) {
  if (bossSprite) bossSprite.innerHTML = bossFaceSVG(face);
}

function replayClass(el, className, time) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // restart the animation
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), time);
}

function fxAdd(className, text, styles, life) {
  const el = document.createElement("span");
  el.className = className;
  if (text) el.textContent = text;
  Object.entries(styles || {}).forEach(([key, value]) => el.style.setProperty(key, value));
  bossArena.appendChild(el);
  setTimeout(() => el.remove(), life);
  return el;
}

function fxPixelBurst() {
  const colors = ["#8b5cf6", "#c4b5fd", "#ffd166", "#55cfff", "#ffffff"];
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
    const distance = 60 + Math.random() * 60;
    fxAdd("fx-pixel", "", {
      "--dx": `${Math.cos(angle) * distance}px`,
      "--dy": `${Math.sin(angle) * distance}px`,
      "--spin": `${Math.round(Math.random() * 360)}deg`,
      "background": colors[i % colors.length]
    }, 800);
  }
}

function fxPlayHit(defeated) {
  bossHitStreak++;
  setBossFace("hurt");

  replayClass(bossArena, "shake", 450);
  replayClass(bossHealthBar, "flash", 500);
  fxAdd("fx-ring", "", {}, 520);
  fxPixelBurst();
  fxAdd("fx-damage", `-${BOSS_DAMAGE}%`, {}, 1000);
  fxAdd("boss-pop", "💥 HIT!", {}, 900);
  if (bossHitStreak >= 2) fxAdd("fx-combo", `🔥 COMBO x${bossHitStreak}!`, {}, 1100);

  if (defeated) {
    bossSprite.classList.add("defeated");
    return;
  }

  bossSprite.classList.add("hit");
  bossAnimTimer = setTimeout(() => bossSprite.classList.remove("hit"), 650);
  bossFaceTimer = setTimeout(() => setBossFace("normal"), 900);
}

function fxPlayLaugh() {
  bossHitStreak = 0;
  setBossFace("laugh");

  bossSprite.classList.add("laugh");
  bossAnimTimer = setTimeout(() => bossSprite.classList.remove("laugh"), 1300);
  bossFaceTimer = setTimeout(() => setBossFace("normal"), 1400);

  replayClass(bossArena, "ouch", 800);
  replayClass(bossLives, "lost", 600);

  const spots = [
    { left: "18%", tilt: "-14deg", delay: 0 },
    { left: "70%", tilt: "12deg", delay: 220 },
    { left: "30%", tilt: "8deg", delay: 440 },
    { left: "60%", tilt: "-10deg", delay: 660 }
  ];
  spots.forEach(spot => {
    setTimeout(() => {
      fxAdd("fx-ha", "HA!", { "left": spot.left, "--tilt": spot.tilt }, 1100);
    }, spot.delay);
  });
}

// Replace the old simple animations with the new ones
bossSpriteAnimate = function (className) {
  if (!bossSprite || !bossArena) return;
  clearTimeout(bossFaceTimer);
  clearTimeout(bossAnimTimer);
  bossSprite.classList.remove("hit", "laugh", "defeated");
  void bossSprite.offsetWidth; // restart the animation

  if (className === "laugh") fxPlayLaugh();
  else fxPlayHit(className === "defeated");
};

bossSpriteReset = function () {
  if (!bossSprite) return;
  clearTimeout(bossFaceTimer);
  clearTimeout(bossAnimTimer);
  bossHitStreak = 0;
  bossSprite.classList.remove("hit", "laugh", "defeated", "angry");
  setBossFace("normal");
};

/* Load the 3D Atom Lab */
const atomLabScript = document.createElement("script");
atomLabScript.src = "atom-lab.js";
document.body.appendChild(atomLabScript);
