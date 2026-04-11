/**
 * Media — unified modal for videos, code snippets, and images.
 *
 * Three "kinds" share one modal:
 *   - videos    (V key)
 *   - snippets  (C key)
 *   - images    (I key)
 *
 * Items come from the active slide AND from DECK_CONFIG.media (global).
 * Per-slide items come first, global items follow.
 *
 *   slide.videos   = [{ title, src, poster?, type? }]
 *   slide.snippets = [{ title, lang, code, highlight? }]
 *   slide.images   = [{ title, src, alt?, caption? }]
 *
 *   DECK_CONFIG.media = { videos: [...], snippets: [...], images: [...] }
 *
 * Top bar has a kind selector (videos / snippets / images) plus a tab strip
 * for the items of the active kind. ←/→ moves through tabs while open;
 * 1-9 jumps. Pressing the same kind key again closes the modal.
 */
(function () {
  const KINDS = ["videos", "snippets", "images"];

  const KIND_LABEL = {
    videos: "Videos",
    snippets: "Code",
    images: "Images",
  };

  // ─── tiny synthetic syntax highlighter (snippets) ──────────
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
    const isProgLang = !["md", "markdown", "yaml", "yml", "txt"].includes(lang);
    let out = escapeHtml(line);
    if (isProgLang) {
      out = out.replace(/(\/\/.*$)/g, '<span class="tok-com">$1</span>');
      out = out.replace(/(#.*$)/g, '<span class="tok-com">$1</span>');
    } else if (lang === "yaml" || lang === "yml") {
      out = out.replace(/(#.*$)/g, '<span class="tok-com">$1</span>');
    }
    out = out.replace(/("[^"]*")/g, '<span class="tok-str">$1</span>');
    out = out.replace(/('[^']*')/g, '<span class="tok-str">$1</span>');
    if (isProgLang) {
      out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
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
    return `
      <div class="media-snippet">
        <div class="media-snippet__meta">
          <span class="media-snippet__lang">${escapeHtml(snippet.lang || "")}</span>
          <button class="media-snippet__copy" type="button">copy</button>
        </div>
        <pre class="media-snippet__body"><ol>${items}</ol></pre>
      </div>
    `;
  }

  function renderVideo(video) {
    const src = video.src || "";
    const type = video.type || "video/mp4";
    const poster = video.poster ? ` poster="${escapeHtml(video.poster)}"` : "";
    return `
      <div class="media-video">
        <video controls preload="metadata"${poster} data-testid="media-video-el">
          <source src="${escapeHtml(src)}" type="${escapeHtml(type)}" />
          Your browser cannot play this video.
        </video>
        ${video.caption ? `<p class="media-caption">${escapeHtml(video.caption)}</p>` : ""}
      </div>
    `;
  }

  function renderImage(image) {
    return `
      <div class="media-image">
        <img class="media-image__img" src="${escapeHtml(image.src || "")}" alt="${escapeHtml(image.alt || "")}" />
        ${image.caption ? `<p class="media-caption">${escapeHtml(image.caption)}</p>` : ""}
      </div>
    `;
  }

  function emptyMessage(kind) {
    const what = {
      videos: `videos. Add a <code>videos</code> array to the slide config or to <code>DECK_CONFIG.media.videos</code>.`,
      snippets: `code snippets. Add a <code>snippets</code> array to the slide config or to <code>DECK_CONFIG.media.snippets</code>.`,
      images: `images. Add an <code>images</code> array to the slide config or to <code>DECK_CONFIG.media.images</code>.`,
    };
    return `<div class="media-empty">No ${what[kind]}</div>`;
  }

  // ─── controller ────────────────────────────────────────────
  const Media = {
    el: null,
    titleEl: null,
    kindBtnsEl: null,
    tabsEl: null,
    bodyEl: null,
    kind: "snippets",
    items: [],
    active: 0,

    init() {
      this.el = document.getElementById("media-modal");
      if (!this.el) return;
      this.titleEl = this.el.querySelector(".modal__title");
      this.kindBtnsEl = this.el.querySelector(".media-kinds");
      this.tabsEl = this.el.querySelector(".media-tabs");
      this.bodyEl = this.el.querySelector(".media-body");

      this.kindBtnsEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-kind]");
        if (!btn) return;
        this.switchKind(btn.dataset.kind);
      });

      this.tabsEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-tab]");
        if (!btn) return;
        this.jumpTab(Number(btn.dataset.tab));
      });

      this.bodyEl.addEventListener("click", (e) => {
        if (e.target.closest(".media-snippet__copy")) this._copy(e.target.closest("button"));
      });
    },

    /** Open the modal in a particular kind. If already open in that kind, close. */
    toggle(kind) {
      if (this.isOpen() && this.kind === kind) return this.close();
      this.open(kind);
    },

    open(kind) {
      if (!KINDS.includes(kind)) kind = "snippets";
      this.kind = kind;
      this._collectItems();
      this.active = 0;
      this._renderAll();
      this.el.hidden = false;
    },

    close() {
      this.el.hidden = true;
      // Pause any playing video so it doesn't keep rolling in the background.
      this.el.querySelectorAll("video").forEach((v) => v.pause());
    },

    switchKind(kind) {
      if (!KINDS.includes(kind)) return;
      this.kind = kind;
      this._collectItems();
      this.active = 0;
      this._renderAll();
    },

    nextTab() {
      if (!this.items.length) return;
      this.active = (this.active + 1) % this.items.length;
      this._renderAll();
    },

    prevTab() {
      if (!this.items.length) return;
      this.active = (this.active - 1 + this.items.length) % this.items.length;
      this._renderAll();
    },

    jumpTab(i) {
      if (i < 0 || i >= this.items.length) return;
      this.active = i;
      this._renderAll();
    },

    isOpen() {
      return this.el && !this.el.hidden;
    },

    currentKind() {
      return this.kind;
    },

    /* ─── internals ───────────────────────────────────────── */

    _collectItems() {
      const slide = window.Router?.current() || {};
      const global = (window.DECK_CONFIG?.media || {})[this.kind] || [];
      const local = slide[this.kind] || [];
      // Per-slide items first, then global.
      this.items = [...local, ...global];
    },

    _renderAll() {
      this._renderTitle();
      this._renderKindButtons();
      this._renderTabs();
      this._renderBody();
    },

    _renderTitle() {
      if (this.titleEl) this.titleEl.textContent = KIND_LABEL[this.kind];
    },

    _renderKindButtons() {
      this.kindBtnsEl.innerHTML = KINDS.map(
        (k) =>
          `<button class="media-kind${k === this.kind ? " is-active" : ""}" data-kind="${k}" type="button">${KIND_LABEL[k]}</button>`
      ).join("");
    },

    _renderTabs() {
      if (!this.items.length) {
        this.tabsEl.innerHTML = "";
        return;
      }
      this.tabsEl.innerHTML = this.items
        .map((item, i) => {
          const label = item.title || `${KIND_LABEL[this.kind]} ${i + 1}`;
          return `<button class="media-tab${i === this.active ? " is-active" : ""}" data-tab="${i}" type="button">${escapeHtml(label)}</button>`;
        })
        .join("");
    },

    _renderBody() {
      if (!this.items.length) {
        this.bodyEl.innerHTML = emptyMessage(this.kind);
        return;
      }
      const item = this.items[this.active];
      if (this.kind === "snippets") this.bodyEl.innerHTML = renderSnippet(item);
      else if (this.kind === "videos") this.bodyEl.innerHTML = renderVideo(item);
      else this.bodyEl.innerHTML = renderImage(item);
    },

    async _copy(btn) {
      const item = this.items[this.active];
      if (!item || this.kind !== "snippets") return;
      try {
        await navigator.clipboard.writeText(item.code);
        btn.classList.add("is-ok");
        const original = btn.textContent;
        btn.textContent = "copied";
        setTimeout(() => {
          btn.classList.remove("is-ok");
          btn.textContent = original;
        }, 1200);
      } catch (e) {
        console.warn("Clipboard write failed", e);
      }
    },
  };

  window.Media = Media;
})();
