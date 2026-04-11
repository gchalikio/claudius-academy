/**
 * Timer — elapsed-time counter for the talk (toggled with T).
 *
 * Optional config (in DECK_CONFIG.timer):
 *   show:   true  → visible from the start
 *   target: 45    → target talk length in minutes; turns gold past 80%, red past 100%
 */
(function () {
  const Timer = {
    el: null,
    startedAt: null,
    intervalId: null,
    targetMs: null,

    init() {
      const cfg = window.DECK_CONFIG?.timer || {};
      this.targetMs = cfg.target ? cfg.target * 60 * 1000 : null;

      const wrap = document.createElement("div");
      wrap.id = "timer";
      wrap.className = "timer";
      wrap.hidden = !cfg.show;
      wrap.textContent = "00:00";
      document.body.appendChild(wrap);
      this.el = wrap;

      this.startedAt = Date.now();
      this.intervalId = setInterval(() => this._tick(), 1000);
      this._tick();
    },

    toggle() {
      this.el.hidden = !this.el.hidden;
    },

    reset() {
      this.startedAt = Date.now();
      this._tick();
    },

    _tick() {
      const elapsed = Date.now() - this.startedAt;
      const m = Math.floor(elapsed / 60000);
      const s = Math.floor((elapsed % 60000) / 1000);
      this.el.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      if (this.targetMs) {
        const ratio = elapsed / this.targetMs;
        this.el.classList.toggle("is-warn", ratio >= 0.8 && ratio < 1);
        this.el.classList.toggle("is-over", ratio >= 1);
      }
    },
  };

  window.Timer = Timer;
})();
