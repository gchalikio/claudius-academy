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

  modals: {
    videoTitle: "Demo",
    codeTitle: "Code",
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
      { keys: ["V"], label: "video" },
      { keys: ["C"], label: "code" },
      { keys: ["N"], label: "notes" },
      { keys: ["T"], label: "timer" },
      { keys: ["Esc"], label: "overview" },
    ],
  },

  theme: {},

  fonts: [],

  stylesheet: "presentations/examples/theme.css",
};
