/**
 * EXAMPLES — a sampler that exercises every built-in slide builder.
 *
 * To start a new presentation, copy this folder:
 *   cp -r presentations/examples presentations/<your-deck>
 * Then edit config.js + deck.js and register your deck in
 * presentations/index.js.
 */
window.DECK_CONFIG = {
  documentTitle: "Examples — Claudius Academy",
  author: null,

  intro: {
    title: "EXAMPLES",
    subtitle: "every builder",
    logo: "presentations/examples/assets/logo.svg",
    skipText: "press any key to enter ▸",
    autoAdvanceMs: 5200,
    laurel: { show: true, left: "❦", right: "❦" },
  },

  // Global media — appended to every slide's own videos / snippets / images.
  media: {
    videos: [
      {
        title: "Global demo",
        src: "presentations/examples/assets/videos/placeholder.mp4",
        type: "video/mp4",
      },
    ],
    snippets: [
      {
        title: "global hint",
        lang: "md",
        code: "# Global snippet\n\nShown on every slide via DECK_CONFIG.media.snippets.",
      },
    ],
    images: [
      {
        title: "global logo",
        src: "presentations/examples/assets/images/global-logo.svg",
        alt: "Global logo placeholder",
      },
    ],
  },

  nav: {
    counterFormat: (i, total) => `${i + 1} / ${total}`,
  },

  timer: {
    show: false,
    target: 30,
  },

  hints: {
    title: "Keys",
    items: [
      { keys: ["→", "Space"], label: "next" },
      { keys: ["←"], label: "previous" },
      { keys: ["⇧", "→"], label: "skip slide" },
      { keys: ["V"], label: "videos" },
      { keys: ["C"], label: "code" },
      { keys: ["I"], label: "images" },
      { keys: ["N"], label: "notes" },
      { keys: ["T"], label: "timer" },
      { keys: ["Esc"], label: "overview" },
      { keys: ["⇧", "0"], label: "back to picker" },
    ],
  },

  theme: {},

  fonts: [],

  stylesheet: "presentations/examples/theme.css",
};
