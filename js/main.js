/**
 * Boot — exposes start() so the loader can call it after a deck is loaded.
 *
 * To launch directly into the deck (skip intro), append `?nointro` to the URL
 * or set localStorage.setItem('deck:skipIntro', '1').
 */
(function () {
  function applyConfig(cfg) {
    if (!cfg) return;

    if (cfg.documentTitle) document.title = cfg.documentTitle;

    if (cfg.theme) {
      for (const [rawKey, value] of Object.entries(cfg.theme)) {
        const key = rawKey.startsWith("--")
          ? rawKey
          : `--${rawKey.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}`;
        document.documentElement.style.setProperty(key, value);
      }
    }

    if (cfg.author) {
      const tag = document.createElement("div");
      tag.className = "author-tag";
      tag.textContent = cfg.author;
      document.body.appendChild(tag);
    }

    // Hints overlay — render from config if provided
    if (cfg.hints) {
      const hintsEl = document.getElementById("hints");
      if (hintsEl) {
        const items = (cfg.hints.items || [])
          .map((item) => {
            const keys = (item.keys || []).map((k) => `<kbd>${k}</kbd>`).join("+");
            return `<li>${keys} ${item.label || ""}</li>`;
          })
          .join("");
        hintsEl.innerHTML = `
          <h3>${cfg.hints.title || "Keys"}</h3>
          <ul>${items}</ul>
        `;
      }
    }
  }

  const Boot = {
    start() {
      applyConfig(window.DECK_CONFIG);

      Media.init();
      Notes.init();
      Overview.init();
      Timer.init();

      const stage = document.getElementById("stage");
      const skipIntro =
        new URLSearchParams(location.search).has("nointro") ||
        location.hash.length > 1 ||
        localStorage.getItem("deck:skipIntro") === "1";

      const startDeck = () => {
        stage.hidden = false;
        Nav.init();
        Router.init(window.SLIDES, stage);
        Nav.show();
      };

      if (skipIntro) {
        document.getElementById("intro").hidden = true;
        startDeck();
      } else {
        Intro.init(startDeck, window.DECK_CONFIG?.intro);
      }
    },
  };

  window.Boot = Boot;
})();
