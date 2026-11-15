/* =========================================
   VERITY VOICE 🔊
   Adds a speaker button to every Verity answer.
   Uses the browser's built-in voice — free, no API key.
   ========================================= */

(() => {
  const messages = document.getElementById("chatbot-messages");
  if (!messages || !("speechSynthesis" in window)) return;

  /* ---- Styles for the speaker button ---- */
  const style = document.createElement("style");
  style.textContent = `
    .bot-message { position: relative; }
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
  `;
  document.head.appendChild(style);

  /* ---- Pick the right language from the text ---- */
  function detectLang(text) {
    if (/[ऀ-ॿ]/.test(text)) return "hi-IN";   // Hindi / Marathi
    if (/[ಀ-೿]/.test(text)) return "kn-IN";   // Kannada
    if (/[஀-௿]/.test(text)) return "ta-IN";   // Tamil
    if (/[ఀ-౿]/.test(text)) return "te-IN";   // Telugu
    if (/[ঀ-৿]/.test(text)) return "bn-IN";   // Bengali
    if (/[ഀ-ൿ]/.test(text)) return "ml-IN";   // Malayalam
    if (/[઀-૿]/.test(text)) return "gu-IN";   // Gujarati
    if (/[؀-ۿ]/.test(text)) return "ar-SA";   // Arabic / Urdu
    if (/[一-鿿]/.test(text)) return "zh-CN";   // Chinese
    if (/[぀-ヿ]/.test(text)) return "ja-JP";   // Japanese
    if (/[가-힯]/.test(text)) return "ko-KR";   // Korean
    if (/[Ѐ-ӿ]/.test(text)) return "ru-RU";   // Russian
    return "en-IN";
  }

  function pickVoice(lang) {
    const voices = speechSynthesis.getVoices();
    const base = lang.split("-")[0];
    return voices.find(v => v.lang === lang) ||
           voices.find(v => v.lang && v.lang.startsWith(base)) ||
           (base === "en" ? voices.find(v => v.lang && v.lang.startsWith("en")) : null) ||
           null;
  }

  // Remove emojis and symbols so the voice doesn't read them out
  function cleanForSpeech(text) {
    return text
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
      .replace(/[•*#_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  let currentButton = null;

  function stopSpeaking() {
    speechSynthesis.cancel();
    if (currentButton) {
      currentButton.classList.remove("speaking");
      currentButton.textContent = "🔊";
      currentButton = null;
    }
  }

  function speak(text, button) {
    // Clicking the same button again stops the voice
    if (currentButton === button) { stopSpeaking(); return; }
    stopSpeaking();

    const clean = cleanForSpeech(text);
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = detectLang(clean);
    const voice = pickVoice(utterance.lang);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = stopSpeaking;
    utterance.onerror = stopSpeaking;

    currentButton = button;
    button.classList.add("speaking");
    button.textContent = "⏹";
    speechSynthesis.speak(utterance);
  }

  /* ---- Add a 🔊 button to a Verity message ---- */
  function addSpeaker(bubble) {
    if (!bubble || bubble.querySelector(".verity-speak")) return;
    const text = bubble.textContent.trim();
    // Skip the "thinking..." placeholder
    if (!text || /thinking/i.test(text) && text.length < 30) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "verity-speak";
    button.textContent = "🔊";
    button.title = "Read aloud";
    button.setAttribute("aria-label", "Read this answer aloud");
    button.addEventListener("click", e => {
      e.stopPropagation();
      const words = bubble.cloneNode(true);
      words.querySelectorAll(".verity-speak").forEach(b => b.remove());
      speak(words.textContent, button);
    });
    bubble.appendChild(button);
  }

  /* ---- Watch the chat for new answers ---- */
  function scan() {
    messages.querySelectorAll(".bot-message").forEach(addSpeaker);
  }

  const observer = new MutationObserver(() => {
    observer.disconnect();          // don't react to our own buttons
    scan();
    observer.observe(messages, { childList: true, subtree: true, characterData: true });
  });
  observer.observe(messages, { childList: true, subtree: true, characterData: true });

  // Voices load a moment after the page opens in some browsers
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  scan();

  // Stop talking when the chat window is closed
  const closeBtn = document.getElementById("chatbot-close");
  if (closeBtn) closeBtn.addEventListener("click", stopSpeaking);
})();
