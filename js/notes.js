/**
 * Notes — speaker notes pane (toggled with N).
 *
 * Each slide config can carry a `notes` field. The pane is hidden by default
 * (so screen-share doesn't expose your notes), and toggling it shows the
 * current slide's notes. Updates automatically as you navigate.
 */
(function () {
  const Notes = {
    el: null,
    bodyEl: null,

    init() {
      const wrap = document.createElement("aside");
      wrap.id = "notes";
      wrap.className = "notes";
      wrap.hidden = true;
      wrap.innerHTML = `
        <header class="notes__head">
          <span class="notes__title">Speaker notes</span>
          <span class="notes__hint">N to toggle</span>
        </header>
        <div class="notes__body"></div>
      `;
      document.body.appendChild(wrap);
      this.el = wrap;
      this.bodyEl = wrap.querySelector(".notes__body");

      Router.onChange((ctx) => this._render(ctx.slide));
    },

    toggle() {
      this.el.hidden = !this.el.hidden;
    },

    isOpen() {
      return !this.el.hidden;
    },

    _render(slide) {
      const notes = slide?.notes;
      if (!notes) {
        this.bodyEl.innerHTML = `<p class="notes__empty">No notes for this slide.</p>`;
        return;
      }
      this.bodyEl.innerHTML = `<p>${String(notes).replace(/\n/g, "<br>")}</p>`;
    },
  };

  window.Notes = Notes;
})();
