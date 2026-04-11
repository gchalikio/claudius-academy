(function () {
  const Nav = {
    init() {
      const counter = document.getElementById("nav-counter");
      const stepEl = document.getElementById("nav-step");
      const bar = document.getElementById("progress-bar");

      // Buttons
      document.addEventListener("click", (e) => {
        const action = e.target.closest("[data-action]")?.dataset.action;
        if (action === "next") Router.next();
        if (action === "prev") Router.prev();
        if (action === "close-media") Media.close();
      });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        // Ignore when typing in inputs
        if (e.target.matches("input, textarea")) return;

        const mediaOpen = Media.isOpen();
        const overviewOpen = window.Overview && Overview.isOpen();

        // Esc behavior:
        //   1. close media modal if open
        //   2. otherwise close overview if it's open
        //   3. otherwise open overview
        if (e.key === "Escape") {
          if (mediaOpen) return Media.close();
          if (overviewOpen) return Overview.close();
          return Overview.open();
        }

        // While overview is open, its own handler runs (added by Overview.open)
        if (overviewOpen) return;

        // Media modal: ←/→ switch tabs, 1-9 jump, V/C/I switch kinds.
        if (mediaOpen) {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            return Media.nextTab();
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            return Media.prevTab();
          }
          if (/^[1-9]$/.test(e.key)) {
            e.preventDefault();
            return Media.jumpTab(Number(e.key) - 1);
          }
          if (e.key === "v" || e.key === "V") return Media.toggle("videos");
          if (e.key === "c" || e.key === "C") return Media.toggle("snippets");
          if (e.key === "i" || e.key === "I") return Media.toggle("images");
        }

        // Shift+0 → back to picker. Browsers disagree on what key this fires:
        // some report e.key === ")" (the typed char), some keep e.key === "0"
        // with shiftKey=true. Handle both.
        if (e.shiftKey && (e.key === "0" || e.key === ")")) {
          e.preventDefault();
          window.location.href = window.location.pathname;
          return;
        }

        switch (e.key) {
          case "ArrowRight":
          case " ":
            e.preventDefault();
            if (e.shiftKey) Router.nextSlide();
            else Router.next();
            break;
          case "ArrowLeft":
            if (e.shiftKey) Router.prevSlide();
            else Router.prev();
            break;
          case "v":
          case "V":
            Media.toggle("videos");
            break;
          case "c":
          case "C":
            Media.toggle("snippets");
            break;
          case "i":
          case "I":
            Media.toggle("images");
            break;
          case "f":
          case "F":
            toggleFullscreen();
            break;
          case "n":
          case "N":
            Notes.toggle();
            break;
          case "t":
          case "T":
            Timer.toggle();
            break;
          case "?":
            document.getElementById("hints").hidden = !document.getElementById("hints").hidden;
            break;
          case "Home":
            e.preventDefault();
            // Back to the deck picker (clears ?deck= and the hash).
            window.location.href = window.location.pathname;
            break;
        }
      });

      const counterFormat =
        window.DECK_CONFIG?.nav?.counterFormat || ((i, total) => `${i + 1} / ${total}`);

      // Reflect router state in chrome
      Router.onChange((ctx) => {
        counter.textContent = counterFormat(ctx.index, ctx.total);
        const slide = ctx.slide;
        const stepCount = slide.steps ?? 0;
        stepEl.textContent = stepCount > 0 ? `step ${ctx.step} / ${stepCount}` : "";

        const total = ctx.total - 1 || 1;
        bar.style.width = `${(ctx.index / total) * 100}%`;
      });
    },

    show() {
      document.querySelector(".nav").hidden = false;
      document.querySelector(".progress").hidden = false;
    },
  };

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }

  window.Nav = Nav;
})();
