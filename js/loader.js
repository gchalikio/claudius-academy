/**
 * Loader — picks which presentation to open and dynamically loads its files.
 *
 * Resolution order:
 *   1. ?deck=<id> from the URL  (must exist in window.DECKS)
 *   2. Picker overlay (always shown when no ?deck= in URL)
 *
 * For each deck the loader brings in, in order:
 *   1. config.js                            (required)
 *   2. injects @font-face rules from config.fonts
 *   3. config.stylesheet                    (per-deck CSS, optional)
 *   4. deck.js                              (slide content, required)
 *   5. Boot.start()
 *
 * It also exposes window.DECK_PATH so deck files can build asset URLs.
 */
(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false; // preserve execution order
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
  }

  function loadStylesheet(href) {
    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      // Resolve on both load and error so a missing per-deck CSS doesn't block.
      link.onload = link.onerror = () => resolve();
      document.head.appendChild(link);
    });
  }

  function injectFonts(fonts) {
    if (!fonts || !fonts.length) return;
    const css = fonts
      .map((f) => {
        const lines = [
          `font-family: '${f.family}'`,
          `src: ${f.src}`,
          f.weight ? `font-weight: ${f.weight}` : null,
          f.style ? `font-style: ${f.style}` : null,
          `font-display: ${f.display || "swap"}`,
        ].filter(Boolean);
        return `@font-face { ${lines.join("; ")}; }`;
      })
      .join("\n");
    const style = document.createElement("style");
    style.dataset.deckFonts = "true";
    style.textContent = css;
    document.head.appendChild(style);
  }

  async function loadDeck(deckId) {
    // Decks marked `local: true` in the registry live under
    // presentations/local/<id>/ instead of presentations/<id>/.
    const entry = (window.DECKS || []).find((d) => d.id === deckId);
    const base = entry?.local
      ? `presentations/local/${deckId}`
      : `presentations/${deckId}`;
    window.DECK_PATH = base;

    // 1. Config first — defines everything else.
    await loadScript(`${base}/config.js`);

    // 2. Fonts (synchronous DOM injection)
    injectFonts(window.DECK_CONFIG?.fonts);

    // 3. Per-deck stylesheet (default convention OR explicit path).
    const stylesheet =
      window.DECK_CONFIG?.stylesheet ?? `${base}/theme.css`;
    if (stylesheet) await loadStylesheet(stylesheet);

    // 4. Deck content
    await loadScript(`${base}/deck.js`);
  }

  function renderPicker(decks) {
    const pcfg = window.PICKER || {};
    const wrap = document.createElement("div");
    wrap.className = "deck-picker";
    wrap.innerHTML = `
      <div class="deck-picker__panel">
        <h2>${pcfg.title || "Choose a presentation"}</h2>
        <ul>
          ${decks
            .map(
              (d, i) =>
                `<li><a href="?deck=${encodeURIComponent(d.id)}" data-index="${i}">
                  <span class="deck-picker__num">${i + 1}</span>${d.title || d.id}
                </a></li>`
            )
            .join("")}
        </ul>
        <p class="deck-picker__hint">${pcfg.hint || "↑ ↓ to move · enter to open · 1–9 to jump"}</p>
      </div>
    `;
    document.body.appendChild(wrap);

    const links = Array.from(wrap.querySelectorAll("a[data-index]"));
    let active = 0;
    const setActive = (i) => {
      active = (i + links.length) % links.length;
      links.forEach((a, idx) => a.classList.toggle("is-active", idx === active));
      links[active].focus({ preventScroll: true });
    };
    setActive(0);

    document.addEventListener("keydown", function pickerKeys(e) {
      if (!document.body.contains(wrap)) {
        document.removeEventListener("keydown", pickerKeys);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        setActive(active + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        setActive(active - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        links[active].click();
      } else if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i < links.length) {
          e.preventDefault();
          links[i].click();
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const decks = window.DECKS || [];
    if (!decks.length) {
      console.error("No decks registered. Edit presentations/index.js");
      return;
    }

    const params = new URLSearchParams(location.search);
    const requested = params.get("deck");
    const known = decks.map((d) => d.id);

    let deckId = null;
    if (requested && known.includes(requested)) {
      deckId = requested;
    } else {
      // No deck in URL → always show the picker.
      renderPicker(decks);
      return;
    }

    try {
      await loadDeck(deckId);
      if (window.Boot && typeof window.Boot.start === "function") {
        window.Boot.start();
      } else {
        renderLoadError(deckId, new Error("Boot.start not found — main.js failed to load."));
      }
    } catch (e) {
      console.error(e);
      renderLoadError(deckId, e);
    }
  });

  function renderLoadError(deckId, err) {
    const wrap = document.createElement("div");
    wrap.className = "load-error";
    wrap.innerHTML = `
      <div class="load-error__panel">
        <h2>Could not load <code>${deckId}</code></h2>
        <p>${(err && err.message) || String(err)}</p>
        <ul>
          <li>Does <code>presentations/${deckId}/config.js</code> exist?</li>
          <li>Does <code>presentations/${deckId}/deck.js</code> exist?</li>
          <li>Is the deck registered in <code>presentations/index.js</code>?</li>
          <li>Open the browser console for the full error.</li>
        </ul>
        <a href="./">← back to picker</a>
      </div>
    `;
    document.body.appendChild(wrap);
  }
})();
