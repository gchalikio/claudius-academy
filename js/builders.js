/**
 * Builders — reusable slide constructors used by presentations.
 *
 * Every builder returns a slide config the Router understands. The shape is:
 *   { id, type, title?, notes?, snippets?, videos?, images?, steps?,
 *     render(), onEnter?, onStep?, onUnstep?, onLeave? }
 *
 * `title`    is read by the overview mode for card labels.
 * `notes`    is read by the speaker-notes pane.
 * `snippets`/`videos`/`images` are read by the unified Media modal.
 * `type`     is used by the overview to show a small icon per slide kind.
 *
 * To avoid forgetting to forward those fields when adding a new builder,
 * always go through `baseSlide(opts, type, extra)`.
 */
(function () {
  /**
   * Compose a slide config from caller opts + the builder's specifics.
   * Forwards every "media" field automatically so a new builder never
   * has to remember to plumb them through.
   */
  function baseSlide(opts, type, extra) {
    return {
      id: opts.id,
      type,
      notes: opts.notes,
      snippets: opts.snippets,
      videos: opts.videos,
      images: opts.images,
      ...extra,
    };
  }

  /** Standard eyebrow + h2 header used by most builders. */
  function slideHeader({ eyebrow, title }) {
    return `
      ${eyebrow ? `<div class="slide__eyebrow">${eyebrow}</div>` : ""}
      ${title ? `<h2 class="slide__title">${title}</h2>` : ""}
    `;
  }

  function textSlide(opts) {
    const { title, body, modifier } = opts;
    return baseSlide(opts, "text", {
      title,
      render(root) {
        root.classList.add("slide--text");
        if (modifier) root.classList.add(`slide--${modifier}`);
        root.innerHTML = `
          ${slideHeader(opts)}
          <div class="slide__body">${body || ""}</div>
        `;
      },
    });
  }

  function quoteSlide(opts) {
    const { quote, cite } = opts;
    return baseSlide(opts, "quote", {
      title: quote,
      render(root) {
        root.classList.add("slide--quote");
        root.innerHTML = `
          <blockquote>${quote}</blockquote>
          ${cite ? `<cite>— ${cite}</cite>` : ""}
        `;
      },
    });
  }

  function diagramSlide(opts) {
    const { title, steps, fullscreen, viewBox } = opts;
    let diagram = null;
    return baseSlide(opts, "diagram", {
      title: title || "Diagram",
      steps: steps.length,
      render(root) {
        root.classList.add("slide--diagram");
        if (fullscreen) {
          root.classList.add("slide--diagram-fullscreen");
          root.innerHTML = `<div class="diagram-wrap"></div>`;
        } else {
          root.innerHTML = `
            ${slideHeader(opts)}
            <div class="diagram-wrap"></div>
          `;
        }
        const wrap = root.querySelector(".diagram-wrap");
        const vb = viewBox || { width: 1600, height: 900 };
        diagram = Diagram.create(wrap, vb);
        diagram.defineSteps(steps);
      },
      onEnter() {
        if (diagram) diagram.playTo(0, { animate: false });
      },
      onStep(stepIndex, _ctx, runOpts = {}) {
        if (diagram) diagram.playTo(stepIndex, { animate: !runOpts.replay });
      },
      onUnstep(stepIndex) {
        if (diagram) diagram.playTo(stepIndex - 1, { animate: false });
      },
    });
  }

  function imageSlide(opts) {
    const { title, src, alt } = opts;
    let rootEl = null;
    let xSvg = null;
    let lineA = null;
    let lineB = null;

    function setupLines() {
      if (!xSvg || !lineA || !lineB) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const padX = w * 0.16;
      const padY = h * 0.14;
      const x1 = padX,
        x2 = w - padX;
      const y1 = padY,
        y2 = h - padY;
      lineA.setAttribute("x1", x2);
      lineA.setAttribute("y1", y1);
      lineA.setAttribute("x2", x1);
      lineA.setAttribute("y2", y2);
      lineB.setAttribute("x1", x1);
      lineB.setAttribute("y1", y1);
      lineB.setAttribute("x2", x2);
      lineB.setAttribute("y2", y2);
      const len = Math.hypot(x2 - x1, y2 - y1);
      [lineA, lineB].forEach((l) => {
        l.style.strokeDasharray = len;
        l.style.strokeDashoffset = len;
      });
    }

    return baseSlide(opts, "image", {
      title: title || "Image",
      steps: 1,
      render(root) {
        root.classList.add("slide--image");
        root.innerHTML = `
          ${slideHeader(opts)}
          <div class="image-frame">
            <img class="image-frame__img" src="${src}" alt="${alt || ""}" />
          </div>
          <svg class="image-x" xmlns="http://www.w3.org/2000/svg">
            <line class="laser laser--a" />
            <line class="laser laser--b" />
          </svg>
        `;
        rootEl = root;
        xSvg = root.querySelector(".image-x");
        lineA = xSvg.querySelector(".laser--a");
        lineB = xSvg.querySelector(".laser--b");
        setupLines();
      },
      onEnter() {
        setupLines();
        if (rootEl) rootEl.classList.remove("is-x");
        window.addEventListener("resize", setupLines);
      },
      onLeave() {
        window.removeEventListener("resize", setupLines);
      },
      onStep(stepIndex) {
        if (stepIndex === 1 && rootEl) rootEl.classList.add("is-x");
      },
      onUnstep() {
        if (rootEl) rootEl.classList.remove("is-x");
      },
    });
  }

  function sectionSlide(opts) {
    const { numeral, eyebrow, title, subtitle } = opts;
    return baseSlide(opts, "section", {
      title: title || numeral || "Section",
      render(root) {
        root.classList.add("slide--section");
        root.innerHTML = `
          <div class="section__inner">
            ${numeral ? `<div class="section__numeral">${numeral}</div>` : ""}
            ${eyebrow ? `<div class="section__eyebrow">${eyebrow}</div>` : ""}
            ${title ? `<h2 class="section__title">${title}</h2>` : ""}
            ${subtitle ? `<p class="section__subtitle">${subtitle}</p>` : ""}
          </div>
        `;
      },
    });
  }

  function listSlide(opts) {
    const { title, items, ordered } = opts;
    let listEl = null;
    return baseSlide(opts, "list", {
      title,
      steps: items.length,
      render(root) {
        root.classList.add("slide--list");
        const tag = ordered ? "ol" : "ul";
        const lis = items.map((it) => `<li class="list__item">${it}</li>`).join("");
        root.innerHTML = `
          ${slideHeader(opts)}
          <${tag} class="list">${lis}</${tag}>
        `;
        listEl = root.querySelector(".list");
      },
      onEnter() {
        listEl?.querySelectorAll(".list__item").forEach((el) => el.classList.remove("is-revealed"));
      },
      onStep(stepIndex) {
        const els = listEl?.querySelectorAll(".list__item");
        if (els && els[stepIndex - 1]) els[stepIndex - 1].classList.add("is-revealed");
      },
      onUnstep(stepIndex) {
        const els = listEl?.querySelectorAll(".list__item");
        if (els && els[stepIndex - 1]) els[stepIndex - 1].classList.remove("is-revealed");
      },
    });
  }

  function splitSlide(opts) {
    const { title, left, right, ratio } = opts;
    return baseSlide(opts, "split", {
      title,
      render(root) {
        root.classList.add("slide--split");
        root.innerHTML = `
          ${slideHeader(opts)}
          <div class="split" style="grid-template-columns: ${ratio || "1fr 1fr"}">
            <div class="split__col">${left || ""}</div>
            <div class="split__col">${right || ""}</div>
          </div>
        `;
      },
    });
  }

  function bigTextSlide(opts) {
    const { text, footnote, reveal } = opts;
    let textEl = null;
    return baseSlide(opts, "bigtext", {
      title: text,
      steps: reveal ? 1 : 0,
      render(root) {
        root.classList.add("slide--bigtext");
        if (reveal) root.classList.add("is-hidden");
        root.innerHTML = `
          <p class="bigtext">${text}</p>
          ${footnote ? `<p class="bigtext__foot">${footnote}</p>` : ""}
        `;
        textEl = root;
      },
      onEnter() {
        if (reveal) textEl?.classList.add("is-hidden");
      },
      onStep(stepIndex) {
        if (stepIndex === 1) textEl?.classList.remove("is-hidden");
      },
      onUnstep() {
        if (reveal) textEl?.classList.add("is-hidden");
      },
    });
  }

  /**
   * compareSlide — side-by-side comparison.
   *   compareSlide({
   *     id, title,
   *     left:  { title: "Wrong", items: ["...", "..."] },
   *     right: { title: "Right", items: ["...", "..."] }
   *   })
   */
  function compareSlide(opts) {
    const { title, left, right } = opts;
    const renderCol = (col, kind) => `
      <div class="compare__col compare__col--${kind}">
        <div class="compare__head">${col?.title || ""}</div>
        <ul class="compare__list">
          ${(col?.items || []).map((it) => `<li>${it}</li>`).join("")}
        </ul>
      </div>
    `;
    return baseSlide(opts, "compare", {
      title,
      render(root) {
        root.classList.add("slide--compare");
        root.innerHTML = `
          ${slideHeader(opts)}
          <div class="compare">
            ${renderCol(left, "wrong")}
            ${renderCol(right, "right")}
          </div>
        `;
      },
    });
  }

  window.Builders = {
    textSlide,
    quoteSlide,
    diagramSlide,
    imageSlide,
    sectionSlide,
    listSlide,
    splitSlide,
    bigTextSlide,
    compareSlide,

    /**
     * Register a custom slide builder from a deck file:
     *
     *   Builders.register('myThing', function (opts) {
     *     return Builders._baseSlide(opts, 'myThing', {
     *       title: opts.title,
     *       render(root) { ... }
     *     });
     *   });
     *
     *   const { myThing } = window.Builders;
     *   myThing({ id: 'foo', ... })
     *
     * Lets a deck add slide types without editing engine code.
     */
    register(name, factory) {
      if (this[name]) {
        console.warn(`Builders.register: '${name}' already exists, overwriting`);
      }
      this[name] = factory;
    },

    // Exposed so custom builders registered from deck files can use them.
    _baseSlide: baseSlide,
    _slideHeader: slideHeader,
  };
})();
