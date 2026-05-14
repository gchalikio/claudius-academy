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
    mediaSlide,
    qrSlide,
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
      body: `<p>This is a plain <code>textSlide</code>. It carries notes
      (<kbd>N</kbd>), code snippets (<kbd>C</kbd>), images (<kbd>I</kbd>),
      and a video (<kbd>V</kbd>).</p>`,
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
      images: [
        {
          title: "sample 1",
          src: "presentations/examples/assets/images/sample-1.svg",
          alt: "Sample 1 placeholder",
          caption: "first per-slide image",
        },
        {
          title: "sample 2",
          src: "presentations/examples/assets/images/sample-2.svg",
          alt: "Sample 2 placeholder",
          caption: "second per-slide image",
        },
      ],
      videos: [
        {
          title: "intro reel",
          src: "presentations/examples/assets/videos/placeholder.mp4",
          type: "video/mp4",
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
      left: { title: "Wrong", items: ["Doing X", "Doing Y", "Doing Z"] },
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

    mediaSlide({
      id: "media-example-empty",
      eyebrow: "Demo",
      title: "mediaSlide — placeholder mode",
      body: `<p>When you haven't wired media yet, the slide shows a
      placeholder card so nothing breaks on stage.</p>`,
      placeholder: "TODO — placeholder demo",
    }),

    imageSlide({
      id: "image-example",
      eyebrow: "Anti-pattern",
      title: "Don't do this",
      src: "assets/placeholder.svg",
      alt: "Example to avoid — press → for the X",
    }),

    diagramSlide({
      id: "diagram-example",
      fullscreen: true,
      viewBox: { width: 1600, height: 900 },
      steps: [
        {
          type: "node",
          id: "a",
          shape: "ellipse",
          x: 320,
          y: 450,
          rx: 160,
          ry: 90,
          label: "INPUT",
        },
        {
          type: "node",
          id: "b",
          shape: "ellipse",
          x: 1280,
          y: 450,
          rx: 160,
          ry: 90,
          label: "OUTPUT",
          accent: true,
        },
        { type: "arrow", from: "a", to: "b", label: "transform" },
      ],
    }),

    qrSlide({
      id: "qr-example",
      eyebrow: "Outro",
      title: "Fork this deck",
      url: "https://github.com/example/claudius-academy",
      qrSrc: `${window.DECK_PATH}/assets/qr-placeholder.svg`,
      tagline: "Make it yours.",
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
