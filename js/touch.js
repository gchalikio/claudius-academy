/**
 * Touch — swipe-to-navigate for the slide stage on mobile.
 *
 * Listens to touchstart/touchend on #stage. A horizontal swipe past
 * SWIPE_THRESHOLD pixels (and dominant over the vertical movement)
 * advances to the next or previous slide.
 *
 * Suppressed while:
 *   - the media modal is open (its own scroll/tap behavior wins)
 *   - the overview is open
 *   - the picker is showing (no #stage at that point)
 *
 * Tap (no horizontal movement) is intentionally NOT mapped to "next" —
 * the bottom nav buttons handle that and double-mapping causes accidental
 * advances when the user just wants to read.
 */
(function () {
  const SWIPE_THRESHOLD = 50; // px
  const VERTICAL_TOLERANCE = 0.7; // |dy/dx| ratio above which it's a vertical scroll, not a swipe

  const Touch = {
    init() {
      const stage = document.getElementById("stage");
      if (!stage) return;

      let startX = 0;
      let startY = 0;
      let active = false;

      stage.addEventListener(
        "touchstart",
        (e) => {
          if (!shouldHandle()) return;
          if (e.touches.length !== 1) return;
          active = true;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
        },
        { passive: true }
      );

      stage.addEventListener(
        "touchend",
        (e) => {
          if (!active) return;
          active = false;
          if (!shouldHandle()) return;
          const t = e.changedTouches[0];
          if (!t) return;
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          if (Math.abs(dx) < SWIPE_THRESHOLD) return;
          if (Math.abs(dy) / Math.abs(dx) > VERTICAL_TOLERANCE) return;
          if (dx < 0) Router.next();
          else Router.prev();
        },
        { passive: true }
      );
    },
  };

  function shouldHandle() {
    if (window.Media && Media.isOpen()) return false;
    if (window.Overview && Overview.isOpen()) return false;
    return true;
  }

  window.Touch = Touch;
})();
