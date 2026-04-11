/**
 * EXAMPLES — a sampler that exercises every built-in slide builder.
 * Used as both the documentation/showcase deck and the test fixture.
 *
 * To start a new presentation:
 *   cp -r presentations/examples presentations/<your-deck>
 */
(function () {
  const {
    textSlide,
    quoteSlide,
    diagramSlide,
    imageSlide,
    sectionSlide,
    listSlide,
    splitSlide,
    bigTextSlide,
    compareSlide,
  } = window.Builders;

  const slides = [
    sectionSlide({
      id: "intro",
      numeral: "I",
      eyebrow: "Act One",
      title: "The opener",
      subtitle: "A short subtitle that sets the scene.",
    }),

    textSlide({
      id: "hello",
      eyebrow: "Welcome",
      title: "Hello world",
      body: `<p>This is a plain <code>textSlide</code>. It also has speaker
      notes (press <kbd>N</kbd>) and code snippets (press <kbd>C</kbd>).</p>`,
      notes: "Speaker notes shown when the user presses N.",
      snippets: [
        {
          title: "config.js",
          lang: "js",
          code: `window.DECK_CONFIG = {\n  documentTitle: "My Talk",\n  intro: { title: "DECK", subtitle: "subtitle" },\n};`,
        },
        {
          title: "deck.js",
          lang: "js",
          code: `const slides = [\n  textSlide({ id: "hello", title: "Hi" }),\n];\nwindow.SLIDES = slides;`,
        },
      ],
    }),

    listSlide({
      id: "list-example",
      eyebrow: "Three things",
      title: "Reveal one bullet at a time",
      items: [
        "First idea — press → to reveal the next",
        "Second idea — backward goes back",
        "Third idea — then on to the next slide",
      ],
      notes: "Each → reveals one bullet.",
    }),

    splitSlide({
      id: "split-example",
      eyebrow: "Side by side",
      title: "Two-column layout",
      left: `<p>Use this when you want to pair text with a visual or with
      another piece of text.</p>`,
      right: `<p style="font-style:italic">Anything HTML works on either
      side — text, an image, even an inline diagram.</p>`,
    }),

    compareSlide({
      id: "compare-example",
      eyebrow: "Wrong vs right",
      title: "Compare layout",
      left:  { title: "Wrong", items: ["Doing X", "Doing Y", "Doing Z"] },
      right: { title: "Right", items: ["Try A", "Try B", "Try C"] },
    }),

    quoteSlide({
      id: "quote-example",
      quote: "An idea worth sitting with.",
      cite: "anonymous",
    }),

    bigTextSlide({
      id: "bigtext-example",
      text: "One sentence to remember.",
      footnote: "the line you want them to quote",
    }),

    diagramSlide({
      id: "diagram-example",
      eyebrow: "Diagram",
      title: "A simple flow",
      steps: [
        { type: "node", id: "a", shape: "ellipse", x: 200, y: 280, rx: 100, ry: 60, label: "INPUT" },
        { type: "node", id: "b", shape: "ellipse", x: 800, y: 280, rx: 100, ry: 60, label: "OUTPUT", accent: true },
        { type: "arrow", from: "a", to: "b", label: "transform" },
      ],
    }),

    sectionSlide({
      id: "outro",
      numeral: "Ω",
      eyebrow: "End",
      title: "Thanks",
    }),
  ];

  window.SLIDES = slides;
})();
