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

    if (cfg.modals?.videoTitle) {
      const t = document.querySelector("#video-modal .modal__title");
      if (t) t.textContent = cfg.modals.videoTitle;
    }
    if (cfg.modals?.codeTitle) {
      const t = document.querySelector("#code-modal .modal__title");
      if (t) t.textContent = cfg.modals.codeTitle;
    }

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
            const keys = (item.keys || [])
              .map((k) => `<kbd>${k}</kbd>`)
              .join("+");
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

      Modal.init();
      Code.init();
      Notes.init();
      Overview.init();
      Timer.init();

      const stage = document.getElementById("stage");
      const skipIntro =
        new URLSearchParams(location.search).has("nointro") ||
        localStorage.getItem("deck:skipIntro") === "1";

      const startDeck = () => {
        stage.hidden = false;
        Router.init(window.SLIDES, stage);
        Nav.init();
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
