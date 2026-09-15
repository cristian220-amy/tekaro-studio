/* =========================================================
   Asistent FAQ Tekaro Studio - fara AI, fara cheie API, gratuit.
   ---------------------------------------------------------
   Cum functioneaza: citeste intrebarile + raspunsurile deja
   scrise in sectiunea #faq de pe pagina (aceleasi 9 intrebari
   din acordeonul vizibil), si cand un vizitator scrie ceva in
   chat, cauta cea mai apropiata intrebare dupa cuvinte-cheie
   comune (fara diacritice, ca sa prinda si scris fara diacritice).
   Daca nu gaseste nimic apropiat, trimite spre WhatsApp.

   Singura sursa de adevar ramane sectiunea #faq - daca cineva
   adauga/schimba o intrebare acolo, chatul o "vede" automat, nu
   trebuie dublat continutul aici.
   ========================================================= */
(function () {
  "use strict";

  var STOPWORDS = new Set([
    "as", "am", "ai", "are", "al", "ale", "un", "o", "sa", "se", "si", "e",
    "este", "sunt", "la", "de", "cu", "in", "din", "pe", "ce", "cum", "care",
    "cat", "cati", "cate", "pentru", "mea", "meu", "mei", "voi", "va", "vom",
    "daca", "sau", "nu", "da", "ma", "te", "il", "ii", "lor", "lui", "ei",
    "un", "una", "unei", "unui", "mai", "prea", "atat", "acest", "aceasta",
  ]);

  var DIACRITICS = { ă: "a", â: "a", î: "i", ș: "s", ş: "s", ț: "t", ţ: "t" };

  function normalize(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[ăâîșşțţ]/g, function (c) { return DIACRITICS[c] || c; })
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(function (w) { return w.length > 2 && !STOPWORDS.has(w); });
  }

  // Corpus: fiecare intrebare din sectiunea de intrebari frecvente.
  // Suporta ambele structuri: pagina veche (#faq .faq-item) si cea noua
  // (.faq__item), ca acelasi fisier sa mearga pe amandoua fara duplicare.
  function buildCorpus() {
    var items = document.querySelectorAll("#faq .faq-item, .faq__item");
    var corpus = [];
    items.forEach(function (item) {
      var qEl = item.querySelector(".faq-item__q, .faq__q");
      var aEl = item.querySelector(".faq-item__a p, .faq__a p");
      if (!qEl || !aEl) return;
      var question = qEl.textContent.trim();
      var answer = aEl.textContent.trim();
      corpus.push({
        question: question,
        answer: answer,
        words: normalize(question + " " + answer),
        qWords: normalize(question),
      });
    });
    return corpus;
  }

  // Comparatie prin prefix, nu egalitate stricta - romana are multe forme
  // flexionare (program / programul / programului) si o egalitate exacta
  // ar rata majoritatea intrebarilor reale scrise de vizitatori.
  function wordsMatch(a, b) {
    if (a === b) return true;
    var minLen = Math.min(a.length, b.length);
    if (minLen < 4) return false;
    var prefixLen = Math.min(5, minLen);
    return a.slice(0, prefixLen) === b.slice(0, prefixLen);
  }

  function anyMatch(word, list) {
    for (var i = 0; i < list.length; i++) if (wordsMatch(word, list[i])) return true;
    return false;
  }

  function bestMatch(query, corpus) {
    var qWords = normalize(query);
    if (!qWords.length) return null;
    var best = null;
    var bestScore = 0;
    corpus.forEach(function (entry) {
      var score = 0;
      qWords.forEach(function (w) {
        if (anyMatch(w, entry.qWords)) score += 2; // cuvant din intrebare = potrivire mai puternica
        else if (anyMatch(w, entry.words)) score += 1;
      });
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    // prag minim - macar un cuvant relevant potrivit, altfel nu raspundem la intamplare
    return bestScore >= 2 ? best : null;
  }

  var WA_LINK = 'https://wa.me/40736844319?text=' + encodeURIComponent("Bună ziua! Am o întrebare despre programări.");
  var FALLBACK_HTML =
    'Nu am găsit un răspuns exact pentru asta. Scrie-ne direct pe ' +
    '<a href="' + WA_LINK + '" target="_blank" rel="noopener">WhatsApp</a> sau ' +
    'sună la <a href="tel:0736844319">0736 844 319</a> — răspuns în maxim 2 ore în program.';

  var QUICK_QUESTIONS = [
    "Care este programul?",
    "Cât costă o ședință?",
    "Ce trebuie să aduc la prima ședință?",
  ];

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("tk-chat-toggle");
    var panel = document.getElementById("tk-chat-panel");
    var closeBtn = document.getElementById("tk-chat-close");
    var body = document.getElementById("tk-chat-body");
    var quick = document.getElementById("tk-chat-quick");
    var form = document.getElementById("tk-chat-form");
    var input = document.getElementById("tk-chat-input");
    if (!toggle || !panel || !form || !input || !body) return;

    var corpus = buildCorpus();
    var opened = false;

    function addMessage(text, who, isHtml) {
      var msg = document.createElement("div");
      msg.className = "tk-msg tk-msg--" + who;
      if (isHtml) msg.innerHTML = text; else msg.textContent = text;
      body.appendChild(msg);
      body.scrollTop = body.scrollHeight;
    }

    function ask(question) {
      if (!question.trim()) return;
      addMessage(question, "user");
      var match = bestMatch(question, corpus);
      if (match) addMessage(match.answer, "bot");
      else addMessage(FALLBACK_HTML, "bot", true);
    }

    function renderQuick() {
      quick.textContent = "";
      QUICK_QUESTIONS.forEach(function (q) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = q;
        btn.addEventListener("click", function () { ask(q); });
        quick.appendChild(btn);
      });
    }

    function openPanel() {
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      if (!opened) {
        opened = true;
        addMessage("Bună! Sunt asistentul Tekaro Studio 👋 Întreabă-mă orice despre program, prețuri sau ședințe.", "bot");
        renderQuick();
      }
      input.focus();
    }

    function closePanel() {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      if (panel.hidden) openPanel(); else closePanel();
    });
    if (closeBtn) closeBtn.addEventListener("click", closePanel);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value;
      input.value = "";
      ask(q);
    });
  });
})();
