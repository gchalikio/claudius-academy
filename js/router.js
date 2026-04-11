/**
 * Router — slide + step navigation engine.
 *
 * Each slide is a config object:
 *   {
 *     id: 'unique-slug',
 *     title: 'Optional, used in counter',
 *     render(container)        — required, builds the slide DOM
 *     steps?: number           — internal step count (0 = single static slide)
 *     onStep?(stepIndex, ctx)  — called when stepping forward into a step
 *     onUnstep?(stepIndex, ctx)— called when stepping backward out of a step
 *     onEnter?(ctx)            — when the slide becomes active
 *     onLeave?(ctx)            — when the slide is left
 *   }
 *
 * State is persisted to localStorage AND reflected in the URL hash so a refresh
 * lands you on the same slide+step.
 *
 * Reusable: this engine knows nothing about the content. Drop a new slides[]
 * array into js/slides.js and you have a new presentation.
 */
(function () {
  const STORAGE_KEY = "deck:position";

  const Router = {
    slides: [],
    index: 0,
    step: 0,
    container: null,
    listeners: new Set(),

    init(slides, container) {
      this.slides = slides;
      this.container = container;

      // Restore from URL hash first, then localStorage, then defaults.
      const fromHash = this._parseHash();
      const fromStore = this._loadStored();
      const start = fromHash || fromStore || { id: slides[0]?.id, step: 0 };

      const idx = Math.max(
        0,
        slides.findIndex((s) => s.id === start.id)
      );
      this.index = idx === -1 ? 0 : idx;
      this.step = Math.min(start.step ?? 0, this._stepsOf(this.index));

      this._mountAll();
      this._activate(true);

      window.addEventListener("hashchange", () => {
        const h = this._parseHash();
        if (!h) return;
        const i = this.slides.findIndex((s) => s.id === h.id);
        if (i >= 0 && (i !== this.index || h.step !== this.step)) {
          this.goTo(i, h.step);
        }
      });
    },

    /* ─── public API ───────────────────────────────────────────── */

    next() {
      const slide = this.current();
      const stepCount = this._stepsOf(this.index);
      if (this.step < stepCount) {
        this.step += 1;
        if (slide.onStep) slide.onStep(this.step, this._ctx());
        this._sync();
      } else if (this.index < this.slides.length - 1) {
        this.goTo(this.index + 1, 0);
      }
    },

    prev() {
      const slide = this.current();
      if (this.step > 0) {
        if (slide.onUnstep) slide.onUnstep(this.step, this._ctx());
        this.step -= 1;
        this._sync();
      } else if (this.index > 0) {
        const prevIdx = this.index - 1;
        this.goTo(prevIdx, this._stepsOf(prevIdx));
      }
    },

    // Jump to the next slide regardless of internal step state.
    nextSlide() {
      if (this.index < this.slides.length - 1) this.goTo(this.index + 1, 0);
    },

    // Jump to the previous slide, landing on its final step (mirrors prev()).
    prevSlide() {
      if (this.index > 0) {
        const prevIdx = this.index - 1;
        this.goTo(prevIdx, this._stepsOf(prevIdx));
      }
    },

    goTo(index, step = 0) {
      if (index < 0 || index >= this.slides.length) return;
      const leaving = this.current();
      if (leaving?.onLeave) leaving.onLeave(this._ctx());

      this.index = index;
      this.step = Math.min(step, this._stepsOf(index));
      this._activate(false);
    },

    current() {
      return this.slides[this.index];
    },

    onChange(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    },

    /* ─── internals ────────────────────────────────────────────── */

    _stepsOf(i) {
      return this.slides[i]?.steps ?? 0;
    },

    _ctx() {
      return {
        slide: this.current(),
        index: this.index,
        step: this.step,
        total: this.slides.length,
      };
    },

    _mountAll() {
      this.container.innerHTML = "";
      this.slides.forEach((slide) => {
        const section = document.createElement("section");
        section.className = "slide";
        section.dataset.slideId = slide.id;
        slide._el = section;
        slide.render(section);
        this.container.appendChild(section);
      });
    },

    _activate(isInitial) {
      this.slides.forEach((s) => s._el.classList.remove("is-active"));
      const slide = this.current();
      slide._el.classList.add("is-active");

      if (slide.onEnter) slide.onEnter(this._ctx());

      // If we're entering a slide at a non-zero step (e.g. via hash refresh),
      // replay steps so the diagram catches up.
      if (this.step > 0 && slide.onStep) {
        for (let i = 1; i <= this.step; i++) slide.onStep(i, this._ctx(), { replay: true });
      }

      this._sync();
    },

    _sync() {
      const ctx = this._ctx();
      this.listeners.forEach((fn) => fn(ctx));
      this._writeHash();
      this._store();
    },

    _parseHash() {
      const h = window.location.hash.replace(/^#\/?/, "");
      if (!h) return null;
      const [id, step] = h.split("/");
      return { id, step: Number(step) || 0 };
    },

    _writeHash() {
      const { id } = this.current();
      const next = this.step > 0 ? `#/${id}/${this.step}` : `#/${id}`;
      if (window.location.hash !== next) {
        history.replaceState(null, "", next);
      }
    },

    _store() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ id: this.current().id, step: this.step })
        );
      } catch (e) {}
    },

    _loadStored() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY));
      } catch (e) {
        return null;
      }
    },
  };

  window.Router = Router;
})();
