(function () {
  const Modal = {
    el: null,
    video: null,

    init() {
      this.el = document.getElementById("video-modal");
      this.video = document.getElementById("video-player");

      document.addEventListener("click", (e) => {
        const action = e.target.closest("[data-action]")?.dataset.action;
        if (action === "close-modal") this.close();
      });
    },

    toggle() {
      this.el.hidden ? this.open() : this.close();
    },

    open(src) {
      if (src && this.video) {
        const source = this.video.querySelector("source");
        if (source) source.src = src;
        this.video.load();
      }
      this.el.hidden = false;
    },

    close() {
      this.el.hidden = true;
      if (this.video) this.video.pause();
    },
  };

  window.Modal = Modal;
})();
