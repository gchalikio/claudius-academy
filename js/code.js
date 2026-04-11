/**
 * Code — modal that shows code snippets per slide.
 *
 * Snippets come from the active slide's `snippets` array:
 *   snippets: [
 *     { title: 'CLAUDE.md', lang: 'md', code: '…', highlight: [3, 4] },
 *     { title: 'skill.yml', lang: 'yaml', code: '…' },
 *   ]
 *
 * Keys: C toggles, ←/→ switch tabs while open (numbers 1-9 jump direct).
 */
(function () {
  // ─── tiny synthetic highlighter ─────────────────────────────
  // Not a real parser — just enough to add visual rhythm. Order matters:
  // comments first, then strings, then keywords/numbers.
  const KEYWORDS = new Set([
    "const",
    "let",
    "var",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "class",
    "extends",
    "new",
    "import",
    "export",
    "from",
    "default",
    "async",
    "await",
    "try",
    "catch",
    "throw",
    "true",
    "false",
    "null",
    "undefined",
    "def",
    "elif",
    "lambda",
    "pass",
    "yield",
    "in",
    "is",
    "not",
    "and",
    "or",
    "module",
    "do",
    "end",
    "self",
    "nil",
    "puts",
    "require",
  ]);

  function escapeHtml(s) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  }

  function highlight(line, lang) {
    // Markdown / YAML / plain — minimal touch (just comments + strings).
    const isProgLang = !["md", "markdown", "yaml", "yml", "txt"].includes(lang);

    let out = escapeHtml(line);

    // Comments
    if (isProgLang) {
      out = out.replace(/(\/\/.*$)/g, '<span class="tok-com">$1</span>');
      out = out.replace(/(#.*$)/g, '<span class="tok-com">$1</span>');
    } else if (lang === "yaml" || lang === "yml") {
      out = out.replace(/(#.*$)/g, '<span class="tok-com">$1</span>');
    }

    // Strings (single + double)
    out = out.replace(/("[^"]*")/g, '<span class="tok-str">$1</span>');
    out = out.replace(/('[^']*')/g, '<span class="tok-str">$1</span>');

    if (isProgLang) {
      // Numbers
      out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
      // Keywords (only outside existing spans — cheap guard)
      out = out.replace(/\b([a-zA-Z_]\w*)\b/g, (m, w) =>
        KEYWORDS.has(w) ? `<span class="tok-kw">${w}</span>` : m
      );
    }

    return out;
  }

  function renderSnippet(snippet) {
    const lang = (snippet.lang || "").toLowerCase();
    const lines = snippet.code.replace(/\n$/, "").split("\n");
    const highlightSet = new Set(snippet.highlight || []);
    const items = lines
      .map((line, i) => {
        const cls = highlightSet.has(i + 1) ? ' class="is-highlight"' : "";
        return `<li${cls}>${highlight(line, lang) || "&nbsp;"}</li>`;
      })
      .join("");
    return `<ol>${items}</ol>`;
  }

  // ─── modal controller ──────────────────────────────────────
  const Code = {
    el: null,
    tabsEl: null,
    metaLangEl: null,
    bodyEl: null,
    copyBtn: null,
    snippets: [],
    active: 0,

    init() {
      this.el = document.getElementById("code-modal");
      this.tabsEl = this.el.querySelector(".code-tabs");
      this.metaLangEl = this.el.querySelector(".code-meta__lang");
      this.bodyEl = this.el.querySelector(".code-body");
      this.copyBtn = this.el.querySelector(".code-copy");

      this.copyBtn.addEventListener("click", () => this._copy());
    },

    setSnippets(snippets) {
      this.snippets = Array.isArray(snippets) ? snippets : [];
      this.active = 0;
      this._renderTabs();
      this._renderActive();
    },

    toggle() {
      this.el.hidden ? this.open() : this.close();
    },

    open() {
      // Pull snippets from the current slide each time we open.
      const slide = window.Router?.current();
      this.setSnippets(slide?.snippets || []);
      this.el.hidden = false;
    },

    close() {
      this.el.hidden = true;
    },

    nextTab() {
      if (!this.snippets.length) return;
      this.active = (this.active + 1) % this.snippets.length;
      this._renderTabs();
      this._renderActive();
    },

    prevTab() {
      if (!this.snippets.length) return;
      this.active = (this.active - 1 + this.snippets.length) % this.snippets.length;
      this._renderTabs();
      this._renderActive();
    },

    jumpTab(i) {
      if (i < 0 || i >= this.snippets.length) return;
      this.active = i;
      this._renderTabs();
      this._renderActive();
    },

    isOpen() {
      return !this.el.hidden;
    },

    _renderTabs() {
      if (!this.snippets.length) {
        this.tabsEl.innerHTML = "";
        return;
      }
      this.tabsEl.innerHTML = this.snippets
        .map(
          (s, i) =>
            `<button class="code-tab${i === this.active ? " is-active" : ""}" data-tab="${i}">${
              s.title || `snippet ${i + 1}`
            }</button>`
        )
        .join("");
      this.tabsEl.querySelectorAll(".code-tab").forEach((btn) => {
        btn.addEventListener("click", () => this.jumpTab(Number(btn.dataset.tab)));
      });
    },

    _renderActive() {
      if (!this.snippets.length) {
        this.metaLangEl.textContent = "";
        this.bodyEl.innerHTML = `<div class="code-empty">No snippets on this slide. Add a <code>snippets</code> array to the slide config in <code>js/slides.js</code>.</div>`;
        return;
      }
      const snippet = this.snippets[this.active];
      this.metaLangEl.textContent = snippet.lang || "";
      this.bodyEl.innerHTML = renderSnippet(snippet);
    },

    async _copy() {
      const snippet = this.snippets[this.active];
      if (!snippet) return;
      try {
        await navigator.clipboard.writeText(snippet.code);
        this.copyBtn.classList.add("is-ok");
        this.copyBtn.textContent = "copied";
        setTimeout(() => {
          this.copyBtn.classList.remove("is-ok");
          this.copyBtn.textContent = "copy";
        }, 1200);
      } catch (e) {
        console.warn("Clipboard write failed", e);
      }
    },
  };

  window.Code = Code;
})();
