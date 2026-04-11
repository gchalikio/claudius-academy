/**
 * Overview — grid of all slides (toggled with Esc when no modal is open).
 *
 * Click a card to jump to that slide. Arrow keys move the highlight,
 * Enter to select, Esc to close.
 */
(function () {
  const TYPE_GLYPH = {
    text: "❡",
    quote: "“",
    diagram: "◉",
    image: "▣",
    section: "§",
    list: "≡",
    split: "▥",
    bigtext: "★",
    compare: "⇄",
  };

  const Overview = {
    el: null,
    cards: [],
    active: 0,
    keyHandler: null,

    init() {
      const wrap = document.createElement("div");
      wrap.id = "overview";
      wrap.className = "overview";
      wrap.hidden = true;
      wrap.innerHTML = `
        <header class="overview__head">
          <h2>Overview</h2>
          <span class="overview__hint">↑ ↓ ← → · enter · esc to close</span>
        </header>
        <div class="overview__grid"></div>
      `;
      document.body.appendChild(wrap);
      this.el = wrap;
    },

    open() {
      this._build();
      this.el.hidden = false;
      this.active = Router.index;
      this._highlight();
      this.keyHandler = (e) => this._onKey(e);
      document.addEventListener("keydown", this.keyHandler);
    },

    close() {
      this.el.hidden = true;
      if (this.keyHandler) {
        document.removeEventListener("keydown", this.keyHandler);
        this.keyHandler = null;
      }
    },

    isOpen() {
      return !this.el.hidden;
    },

    _build() {
      const grid = this.el.querySelector(".overview__grid");
      const slides = window.SLIDES || [];
      grid.innerHTML = slides
        .map((s, i) => {
          const glyph = TYPE_GLYPH[s.type] || "•";
          const title = s.title || s.id || "(untitled)";
          return `
            <button class="ov-card" data-index="${i}">
              <span class="ov-card__num">${i + 1}</span>
              <span class="ov-card__glyph">${glyph}</span>
              <span class="ov-card__title">${title}</span>
              <span class="ov-card__id">#${s.id || ""}</span>
              <span class="ov-card__type">${s.type || ""}</span>
            </button>
          `;
        })
        .join("");
      this.cards = Array.from(grid.querySelectorAll(".ov-card"));
      this.cards.forEach((card) => {
        card.addEventListener("click", () => {
          const i = Number(card.dataset.index);
          Router.goTo(i, 0);
          this.close();
        });
      });
    },

    _highlight() {
      this.cards.forEach((c, i) => c.classList.toggle("is-active", i === this.active));
      this.cards[this.active]?.scrollIntoView({ block: "nearest" });
    },

    _onKey(e) {
      // Stop other handlers (esp. nav.js) from acting while overview is open.
      e.stopPropagation();
      const cols = this._cols();
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          return this.close();
        case "ArrowRight":
          e.preventDefault();
          this.active = Math.min(this.cards.length - 1, this.active + 1);
          return this._highlight();
        case "ArrowLeft":
          e.preventDefault();
          this.active = Math.max(0, this.active - 1);
          return this._highlight();
        case "ArrowDown":
          e.preventDefault();
          this.active = Math.min(this.cards.length - 1, this.active + cols);
          return this._highlight();
        case "ArrowUp":
          e.preventDefault();
          this.active = Math.max(0, this.active - cols);
          return this._highlight();
        case "Enter":
          e.preventDefault();
          Router.goTo(this.active, 0);
          return this.close();
      }
    },

    _cols() {
      // Best-effort column count from current grid layout.
      const grid = this.el.querySelector(".overview__grid");
      const style = getComputedStyle(grid);
      const tracks = style.gridTemplateColumns.split(" ").length || 1;
      return tracks;
    },
  };

  window.Overview = Overview;
})();
