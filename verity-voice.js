/* =========================================
   VERITY VOICE  (v3 — Fish Audio voice + browser backup)
   Adds a speaker button to every Verity answer and a voice chooser.
   1st choice: Fish Audio's natural AI voice (through /api/speak on Vercel).
   Backup: the browser's built-in voices, so Verity never goes silent.
   ========================================= */

(() => {
  const messages = document.getElementById("chatbot-messages");
  if (!messages || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;

  /* ---------- Styles ---------- */
  const VV_ICON = {
    play: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
    stop: '<svg width="12" height="12" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor"/></svg>',
    wait: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>'
  };
  const style = document.createElement("style");
  style.textContent = `
    .verity-speak {
      display: inline-flex; align-items: center; justify-content: center;
      margin-left: 8px; width: 28px; height: 28px; vertical-align: middle;
      border: 1px solid #55cfff; border-radius: 50%;
      background: rgba(85, 207, 255, .12); color: #fff;
      font-size: 14px; cursor: pointer; transition: transform .2s, background .2s;
    }
    .verity-speak:hover { transform: scale(1.12); background: rgba(85, 207, 255, .3); }
    .verity-speak.speaking { background: #8b5cf6; border-color: #c4b5fd; animation: verityPulseSpeak 1s ease-in-out infinite; }
    @keyframes verityPulseSpeak { 50% { box-shadow: 0 0 0 6px rgba(139, 92, 246, .25); } }
    .verity-voice-bar {
      display: flex; align-items: center; gap: 8px; padding: 6px 14px;
      background: rgba(32, 51, 74, .9); border-bottom: 1px solid rgba(85, 207, 255, .2);
      font-size: 11px; color: #cfe8f5;
    }
    .verity-voice-bar select {
      flex: 1; min-width: 0; font: inherit; font-size: 11px; color: #fff;
      background: #0f1a2a; border: 1px solid #40516a; border-radius: 6px; padding: 4px 6px;
    }
    .verity-voice-bar button {
      font: inherit; font-size: 11px; color: #fff; cursor: pointer;
      background: #168bc4; border: 0; border-radius: 6px; padding: 4px 8px;
    }
  `;
  document.head.appendChild(style);

  /* ---------- Language detection ---------- */
  function detectLang(text) {
    if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
    if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
    if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN";
    if (/[\u0C00-\u0C7F]/.test(text)) return "te-IN";
    if (/[\u0980-\u09FF]/.test(text)) return "bn-IN";
    if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN";
    if (/[\u0A80-\u0AFF]/.test(text)) return "gu-IN";
    if (/[\u0600-\u06FF]/.test(text)) return "ar-SA";
    if (/[\u4E00-\u9FFF]/.test(text)) return "zh-CN";
    if (/[\u3040-\u30FF]/.test(text)) return "ja-JP";
    if (/[\uAC00-\uD7AF]/.test(text)) return "ko-KR";
    if (/[\u0400-\u04FF]/.test(text)) return "ru-RU";
    return "en";
  }

  /* ---------- Choosing the nicest voice ---------- */
  const SAVED_KEY = "verityVoiceName";
  function savedVoiceName() { try { return localStorage.getItem(SAVED_KEY) || ""; } catch { return ""; } }
  function saveVoiceName(name) { try { localStorage.setItem(SAVED_KEY, name); } catch { /* ignore */ } }

  // Higher score = sounds more human
  function scoreVoice(v, lang) {
    const base = lang.split("-")[0];
    const vlang = (v.lang || "").replace("_", "-");
    let s = 0;
    if (vlang.toLowerCase() === lang.toLowerCase()) s += 60;
    else if (vlang.toLowerCase().startsWith(base)) s += 40;
    else return -1;
    if (base === "en" && /en-(IN|GB|US|AU)/i.test(vlang)) s += 5;
    if (base === "en" && /en-IN/i.test(vlang)) s += 3;
    if (/natural|neural/i.test(v.name)) s += 50;
    if (/online/i.test(v.name)) s += 15;
    if (/google/i.test(v.name)) s += 30;
    if (/premium|enhanced|siri/i.test(v.name)) s += 25;
    if (/neerja|swara|aria|jenny|sonia|libby|natasha|samantha|karen|moira|female/i.test(v.name)) s += 6;
    if (/espeak|robot|novelty|whisper|zarvox|bad news|bells|bubbles|cellos|trinoids|albert|boing/i.test(v.name)) s -= 80;
    return s;
  }

  function bestVoice(lang) {
    const voices = synth.getVoices();
    const base = lang.split("-")[0];
    const chosen = savedVoiceName();
    if (chosen) {
      const v = voices.find(x => x.name === chosen);
      if (v && (v.lang || "").toLowerCase().startsWith(base)) return v;
    }
    let best = null, bestScore = -1;
    voices.forEach(v => {
      const sc = scoreVoice(v, lang === "en" ? "en-IN" : lang);
      if (sc > bestScore) { best = v; bestScore = sc; }
    });
    return best;
  }

  /* ---------- Making the text sound natural ---------- */
  const SUBSCRIPTS = { "₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9" };

  function cleanForSpeech(text) {
    return text
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
      .replace(/[₀-₉]/g, d => SUBSCRIPTS[d])
      .replace(/°C/g, " degrees Celsius")
      .replace(/°F/g, " degrees Fahrenheit")
      .replace(/\s*[–—]\s*/g, ", ")
      .replace(/[•*#_]/g, " ")
      .replace(/\(([^)]{1,25})\)/g, ", $1,")
      .replace(/\s+,/g, ",")
      .replace(/,\s*,/g, ",")
      .replace(/[ \t]+/g, " ")
      .trim();
  }

  // Split into sentences so the voice can breathe between them
  function toChunks(text) {
    const parts = [];
    text.split(/\n+/).forEach(para => {
      const sentences = para.match(/[^.!?।？！]+[.!?।？！]*\s*/g) || [para];
      sentences.forEach((s, si) => {
        const t = s.trim();
        if (!t) return;
        if (parts.length && t.length < 18 && si > 0) parts[parts.length - 1].text += " " + t;
        else parts.push({ text: t, pauseAfter: si === sentences.length - 1 ? 450 : 220 });
      });
    });
    return parts;
  }

  /* ---------- Speaking ---------- */
  let currentButton = null;
  let queue = [];
  let pauseTimer = null;
  let session = 0;
  let currentAudio = null;

  function stopSpeaking() {
    session++;
    queue = [];
    clearTimeout(pauseTimer);
    synth.cancel();
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    if (currentButton) {
      currentButton.classList.remove("speaking");
      if (currentButton.dataset.label) currentButton.textContent = currentButton.dataset.label; else currentButton.innerHTML = VV_ICON.play;
      currentButton = null;
    }
  }

  function speakNext(mySession, lang, voice) {
    if (mySession !== session) return;
    const part = queue.shift();
    if (!part) { stopSpeaking(); return; }
    const u = new SpeechSynthesisUtterance(part.text);
    u.lang = voice ? voice.lang : (lang === "en" ? "en-IN" : lang);
    if (voice) u.voice = voice;
    u.rate = /natural|neural|google/i.test(voice ? voice.name : "") ? 0.98 : 0.9;
    u.pitch = 1;
    u.volume = 1;
    u.onend = () => {
      if (mySession !== session) return;
      pauseTimer = setTimeout(() => speakNext(mySession, lang, voice), part.pauseAfter);
    };
    u.onerror = () => { if (mySession === session) stopSpeaking(); };
    synth.speak(u);
  }

  /* ---------- Fish Audio voice (super natural) ---------- */
  const SPEAK_URL = window.location.protocol === "file:"
    ? "https://elemental-quest-one.vercel.app/api/speak"
    : "/api/speak";
  const audioCache = new Map();
  let fishBroken = false;

  function wantsFish() {
    return !fishBroken && savedVoiceName() === "";
  }

  async function fishAudioUrl(text) {
    if (audioCache.has(text)) return audioCache.get(text);
    const res = await fetch(SPEAK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (!res.ok || !(res.headers.get("Content-Type") || "").includes("audio")) {
      throw new Error("Fish voice not available (" + res.status + ")");
    }
    const url = URL.createObjectURL(await res.blob());
    audioCache.set(text, url);
    return url;
  }

  async function speakWithFish(text, button, mySession) {
    if (button.dataset.label) button.textContent = "…"; else button.innerHTML = VV_ICON.wait;
    const url = await fishAudioUrl(text);
    if (mySession !== session) return;
    const audio = new Audio(url);
    currentAudio = audio;
    if (button.dataset.label) button.textContent = "Stop"; else button.innerHTML = VV_ICON.stop;
    audio.onended = () => { if (mySession === session) stopSpeaking(); };
    await audio.play();
  }

  function speak(text, button) {
    if (currentButton === button) { stopSpeaking(); return; }
    stopSpeaking();
    const clean = cleanForSpeech(text);
    if (!clean) return;
    const lang = detectLang(clean);
    const voice = bestVoice(lang);
    currentButton = button;
    button.classList.add("speaking");
    const mySession = session;

    const browserSpeak = () => {
      if (mySession !== session) return;
      queue = toChunks(clean);
      if (button.dataset.label) button.textContent = "Stop"; else button.innerHTML = VV_ICON.stop;
      speakNext(mySession, lang, voice);
    };

    if (wantsFish()) {
      speakWithFish(clean, button, mySession).catch(err => {
        console.warn("Verity voice: using browser voice instead.", err.message);
        fishBroken = true;
        browserSpeak();
      });
    } else {
      browserSpeak();
    }
  }

  /* ---------- Speaker buttons on Verity's answers ---------- */
  function addSpeaker(bubble) {
    if (!bubble || bubble.querySelector(".verity-speak")) return;
    const text = bubble.textContent.trim();
    if (!text || (/thinking/i.test(text) && text.length < 30)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "verity-speak";
    button.innerHTML = VV_ICON.play;
    button.title = "Read aloud";
    button.setAttribute("aria-label", "Read this answer aloud");
    button.addEventListener("click", e => {
      e.stopPropagation();
      const copy = bubble.cloneNode(true);
      copy.querySelectorAll(".verity-speak").forEach(b => b.remove());
      speak(copy.textContent, button);
    });
    bubble.appendChild(button);
  }

  function scan() { messages.querySelectorAll(".bot-message").forEach(addSpeaker); }

  const observer = new MutationObserver(() => {
    observer.disconnect();
    scan();
    observer.observe(messages, { childList: true, subtree: true, characterData: true });
  });
  observer.observe(messages, { childList: true, subtree: true, characterData: true });
  scan();

  /* ---------- Voice chooser bar ---------- */
  const bar = document.createElement("div");
  bar.className = "verity-voice-bar";
  bar.innerHTML = `<span>Voice</span><select aria-label="Choose Verity's voice"></select><button type="button">Test</button>`;
  const select = bar.querySelector("select");
  const testBtn = bar.querySelector("button");
  testBtn.dataset.label = "Test";
  messages.parentNode.insertBefore(bar, messages);

  function fillVoices() {
    const voices = synth.getVoices();
    const saved = savedVoiceName();
    const sorted = voices
      .map(v => ({ v, s: Math.max(scoreVoice(v, "en-IN"), scoreVoice(v, "hi-IN")) }))
      .sort((a, b) => b.s - a.s || a.v.name.localeCompare(b.v.name));
    select.innerHTML = `<option value="">Fish Audio voice (most natural)</option>` +
      sorted.map(({ v }) => {
        const nice = /natural|neural|google|premium|enhanced/i.test(v.name) ? "" : "";
        const name = v.name.replace(/</g, "&lt;");
        return `<option value="${name}"${v.name === saved ? " selected" : ""}>${nice}${name} (${v.lang})</option>`;
      }).join("");
  }

  select.addEventListener("change", () => { saveVoiceName(select.value); stopSpeaking(); });
  testBtn.addEventListener("click", () => {
    const v = savedVoiceName();
    const voice = synth.getVoices().find(x => x.name === v);
    const sample = voice && /^hi/i.test(voice.lang)
      ? "नमस्ते! मैं वेरिटी हूँ, आपकी केमिस्ट्री गाइड।"
      : "Hi! I'm Verity, your chemistry guide. Ask me anything about the elements!";
    speak(sample, testBtn);
  });

  fillVoices();
  synth.onvoiceschanged = fillVoices;

  const closeBtn = document.getElementById("chatbot-close");
  if (closeBtn) closeBtn.addEventListener("click", stopSpeaking);
})();
