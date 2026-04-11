(function () {
  const Intro = {
    el: null,
    done: false,

    init(onDone, cfg = {}) {
      this.el = document.getElementById("intro");

      // Apply config to intro DOM (title, subtitle, logo, skip text, laurels).
      const titleEl = this.el.querySelector(".intro__title");
      const subEl = this.el.querySelector(".intro__subtitle");
      const logoEl = this.el.querySelector(".intro__logo");
      const skipEl = this.el.querySelector(".intro__skip");
      const laurelLeftEl = this.el.querySelector(".intro__laurel--left");
      const laurelRightEl = this.el.querySelector(".intro__laurel--right");

      if (cfg.title && titleEl) {
        titleEl.textContent = cfg.title;
        titleEl.dataset.text = cfg.title;
        titleEl.style.animation = `intro-type 1.6s steps(${cfg.title.length}, end) 0.6s forwards`;
      }
      if (cfg.subtitle && subEl) subEl.textContent = cfg.subtitle;
      if (cfg.logo && logoEl) logoEl.src = cfg.logo;
      if (cfg.skipText && skipEl) skipEl.textContent = cfg.skipText;

      const laurel = cfg.laurel;
      if (laurel) {
        if (laurel.show === false) {
          laurelLeftEl?.remove();
          laurelRightEl?.remove();
        } else {
          if (laurel.left && laurelLeftEl) laurelLeftEl.textContent = laurel.left;
          if (laurel.right && laurelRightEl) laurelRightEl.textContent = laurel.right;
        }
      }

      const finish = () => {
        if (this.done) return;
        this.done = true;
        this.el.classList.add("is-leaving");
        setTimeout(() => {
          this.el.hidden = true;
          onDone();
        }, 360);
      };

      const skip = () => {
        finish();
        document.removeEventListener("keydown", skip);
        this.el.removeEventListener("click", skip);
      };
      document.addEventListener("keydown", skip);
      this.el.addEventListener("click", skip);

      setTimeout(finish, cfg.autoAdvanceMs ?? 5200);
    },
  };

  window.Intro = Intro;
})();
