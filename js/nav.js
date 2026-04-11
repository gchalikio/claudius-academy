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
        if (action === "close-code") Code.close();
      });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        // Ignore when typing in inputs
        if (e.target.matches("input, textarea")) return;

        const videoOpen = !document.getElementById("video-modal").hidden;
        const codeOpen = Code.isOpen();
        const overviewOpen = window.Overview && Overview.isOpen();

        // Esc behavior:
        //   1. close any open modal first
        //   2. otherwise close overview if it's open
        //   3. otherwise open overview
        if (e.key === "Escape") {
          if (codeOpen) return Code.close();
          if (videoOpen) return Modal.close();
          if (overviewOpen) return Overview.close();
          return Overview.open();
        }

        // While overview is open, its own handler runs (added by Overview.open)
        if (overviewOpen) return;

        // Code modal: tab + jump shortcuts intercept arrows/digits/c only.
        // Everything else (F, V, ?, etc.) falls through to the main switch.
        if (codeOpen) {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            return Code.nextTab();
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            return Code.prevTab();
          }
          if (/^[1-9]$/.test(e.key)) {
            return Code.jumpTab(Number(e.key) - 1);
          }
          if (e.key === "c" || e.key === "C") return Code.close();
        }

        switch (e.key) {
          case "ArrowRight":
          case " ":
            if (codeOpen) return; // already handled above
            e.preventDefault();
            if (e.shiftKey) Router.nextSlide();
            else Router.next();
            break;
          case "ArrowLeft":
            if (codeOpen) return;
            if (e.shiftKey) Router.prevSlide();
            else Router.prev();
            break;
          case "v":
          case "V":
            // Mutually exclusive — close the other modal first.
            if (codeOpen) Code.close();
            Modal.toggle();
            break;
          case "c":
          case "C":
            if (videoOpen) Modal.close();
            Code.toggle();
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
          case ")":
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
