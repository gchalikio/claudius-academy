/**
 * Diagram — progressive SVG diagram engine.
 *
 * Usage:
 *   const d = Diagram.create(container, { width: 1000, height: 560 });
 *   d.defineSteps([
 *     { type: 'node', id: 'ctx', shape: 'circle', x: 500, y: 280, r: 70, label: 'CONTEXT', accent: true },
 *     { type: 'node', id: 'jira', shape: 'rect', x: 140, y: 120, w: 140, h: 60, label: 'JIRA' },
 *     { type: 'arrow', from: 'jira', to: 'ctx', label: 'tickets' },
 *     // …later…
 *     { type: 'arrow', from: 'ctx', to: 'jira', accent: true, label: 'writes back' },
 *   ]);
 *   d.play(1);   // forward to step 1
 *   d.unplay(1); // remove the most recent step
 *
 * Steps are pure data, so they can live inside any slide config and are easy
 * to author without touching the engine.
 */
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [k, v] of Object.entries(attrs)) {
      if (v !== undefined && v !== null) node.setAttribute(k, v);
    }
    return node;
  }

  function nodeAnchor(n) {
    return { x: n.x, y: n.y };
  }

  // Edge point on the boundary of a node, in the direction of (tx,ty).
  function edgePoint(n, tx, ty) {
    const dx = tx - n.x;
    const dy = ty - n.y;
    const len = Math.hypot(dx, dy) || 1;
    if (n.shape === "circle") {
      return { x: n.x + (dx / len) * n.r, y: n.y + (dy / len) * n.r };
    }
    if (n.shape === "ellipse") {
      // Parametric scale: clamp the unit ray to lie on the ellipse boundary.
      const ux = dx / len;
      const uy = dy / len;
      const k = 1 / Math.sqrt((ux * ux) / (n.rx * n.rx) + (uy * uy) / (n.ry * n.ry));
      return { x: n.x + ux * k, y: n.y + uy * k };
    }
    // rect: clamp ray to half-extents
    const hw = n.w / 2;
    const hh = n.h / 2;
    const sx = dx === 0 ? Infinity : hw / Math.abs(dx);
    const sy = dy === 0 ? Infinity : hh / Math.abs(dy);
    const s = Math.min(sx, sy);
    return { x: n.x + dx * s, y: n.y + dy * s };
  }

  // Quadratic bezier from a→b with perpendicular curvature `c` (fraction of chord).
  function curvedPath(ax, ay, bx, by, c = 0.18) {
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    // Perpendicular unit vector (rotate 90° clockwise)
    const px = -dy / len;
    const py = dx / len;
    const off = len * c;
    const cx = mx + px * off;
    const cy = my + py * off;
    return { d: `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`, cx, cy };
  }

  const Diagram = {
    create(container, opts = {}) {
      const width = opts.width ?? 1000;
      const height = opts.height ?? 560;

      const svg = el("svg", {
        class: "diagram",
        viewBox: `0 0 ${width} ${height}`,
        preserveAspectRatio: "xMidYMid meet",
      });

      // <defs>: arrowhead markers + hand-drawn wobble filter
      const defs = el("defs");

      // Arrowhead — feather/quill style triangle
      const mkMarker = (id, color) => {
        const m = el("marker", {
          id,
          viewBox: "0 0 12 12",
          refX: 10,
          refY: 6,
          markerWidth: 9,
          markerHeight: 9,
          orient: "auto-start-reverse",
        });
        m.appendChild(el("path", { d: "M0,0 L12,6 L0,12 L3,6 Z", fill: color }));
        defs.appendChild(m);
      };
      mkMarker("arrowhead", "var(--ink-900)");
      mkMarker("arrowhead-accent", "var(--crimson-600)");

      // Hand-drawn wobble — turbulence + displacement
      const filter = el("filter", {
        id: "sketch",
        x: "-10%",
        y: "-10%",
        width: "120%",
        height: "120%",
      });
      filter.appendChild(
        el("feTurbulence", {
          type: "fractalNoise",
          baseFrequency: "0.018",
          numOctaves: "2",
          seed: "4",
          result: "noise",
        })
      );
      filter.appendChild(
        el("feDisplacementMap", {
          in: "SourceGraphic",
          in2: "noise",
          scale: "1.6",
        })
      );
      defs.appendChild(filter);

      svg.appendChild(defs);

      const layers = {
        arrows: el("g", { class: "layer-arrows" }),
        nodes: el("g", { class: "layer-nodes" }),
        labels: el("g", { class: "layer-labels" }),
      };
      svg.appendChild(layers.arrows);
      svg.appendChild(layers.nodes);
      svg.appendChild(layers.labels);

      container.appendChild(svg);

      const state = {
        svg,
        layers,
        steps: [],
        nodes: new Map(), // id → {data, el}
        drawn: [], // stack of {step, els[]} for unplay
        playedTo: 0,
      };

      function drawNode(step, animate) {
        const g = el("g", {
          class: "node" + (step.accent ? " node--accent" : "") + (step.ghost ? " node--ghost" : ""),
        });
        const shapeWrap = el("g");
        if (step.shape === "circle") {
          shapeWrap.appendChild(el("circle", { cx: step.x, cy: step.y, r: step.r }));
        } else if (step.shape === "ellipse") {
          shapeWrap.appendChild(
            el("ellipse", { cx: step.x, cy: step.y, rx: step.rx, ry: step.ry })
          );
        } else {
          shapeWrap.appendChild(
            el("rect", {
              x: step.x - step.w / 2,
              y: step.y - step.h / 2,
              width: step.w,
              height: step.h,
              rx: 6,
            })
          );
        }
        g.appendChild(shapeWrap);
        if (step.label) {
          const text = el("text", { x: step.x, y: step.y });
          text.textContent = step.label;
          g.appendChild(text);
        }
        if (animate) {
          g.classList.add("is-entering");
          setTimeout(() => g.classList.remove("is-entering"), 600);
        }
        state.layers.nodes.appendChild(g);
        state.nodes.set(step.id, { data: step, el: g });
        return [g];
      }

      function drawArrow(step, animate) {
        const from = state.nodes.get(step.from);
        const to = state.nodes.get(step.to);
        if (!from || !to) {
          console.warn("Diagram: arrow references missing node", step);
          return [];
        }
        // Aim for the *center* of the target so curvature looks natural,
        // then trim to the boundaries. Curvature defaults to a gentle arc.
        const a = nodeAnchor(from.data);
        const b = nodeAnchor(to.data);
        const start = edgePoint(from.data, b.x, b.y);
        const end = edgePoint(to.data, a.x, a.y);
        const curve = step.curve ?? 0.18;
        const { d } = curvedPath(start.x, start.y, end.x, end.y, curve);

        const cls = "arrow" + (step.accent ? " arrow--accent" : "");
        const path = el("path", {
          class: cls,
          d,
          "marker-end": step.accent ? "url(#arrowhead-accent)" : "url(#arrowhead)",
        });
        // IMPORTANT: append before measuring — Safari returns 0 for
        // getTotalLength() on detached SVG elements.
        state.layers.arrows.appendChild(path);
        const len = path.getTotalLength();
        path.style.setProperty("--len", len);
        if (animate) {
          path.classList.add("is-entering");
          setTimeout(() => path.classList.remove("is-entering"), 700);
        }

        const created = [path];
        if (step.label) {
          // Place label at the bezier midpoint along the curve, nudged outward.
          const mid = path.getPointAtLength(len / 2);
          const t = el("text", {
            class: "label",
            x: mid.x,
            y: mid.y - 8,
            "text-anchor": "middle",
          });
          t.textContent = step.label;
          if (animate) t.classList.add("is-entering");
          state.layers.labels.appendChild(t);
          created.push(t);
        }
        return created;
      }

      function applyStep(step, { animate }) {
        switch (step.type) {
          case "node":
            return drawNode(step, animate);
          case "arrow":
            return drawArrow(step, animate);
          default:
            console.warn("Diagram: unknown step type", step);
            return [];
        }
      }

      return {
        svg,
        defineSteps(steps) {
          state.steps = steps;
          this.reset();
        },
        reset() {
          state.layers.arrows.innerHTML = "";
          state.layers.nodes.innerHTML = "";
          state.layers.labels.innerHTML = "";
          state.nodes.clear();
          state.drawn = [];
          state.playedTo = 0;
        },
        // Bring diagram up to N steps. Animates only the newly-added steps.
        playTo(n, { animate = true } = {}) {
          n = Math.max(0, Math.min(n, state.steps.length));
          if (n === state.playedTo) return;
          if (n < state.playedTo) {
            while (state.playedTo > n) this.unplay();
            return;
          }
          while (state.playedTo < n) {
            const step = state.steps[state.playedTo];
            const created = applyStep(step, { animate });
            state.drawn.push({ step, els: created });
            state.playedTo += 1;
          }
        },
        unplay() {
          const last = state.drawn.pop();
          if (!last) return;
          last.els.forEach((e) => e.remove());
          if (last.step.type === "node") state.nodes.delete(last.step.id);
          state.playedTo -= 1;
        },
      };
    },
  };

  window.Diagram = Diagram;
})();
