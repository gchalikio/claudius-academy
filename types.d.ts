/**
 * Type definitions for the Claudius Academy presentation engine.
 *
 * This file is consumed by editors (VS Code, Cursor, JetBrains) to provide
 * autocomplete and typo squiggles when editing config.js / deck.js.
 * No build step required — open the project and your editor picks it up.
 *
 * If your editor needs a hint, add this jsdoc tag at the top of any deck file:
 *   /// <reference path="../../types.d.ts" />
 */

declare global {
  interface Window {
    DECK_CONFIG?: DeckConfig;
    SLIDES?: SlideConfig[];
    DECKS?: DeckRegistryEntry[];
    DEFAULT_DECK?: string;
    PICKER?: PickerConfig;
    DECK_PATH?: string;
    Builders: BuildersAPI;
    Boot: { start(): void };
  }
}

/* ─── Deck-level config (presentations/<id>/config.js) ─────────── */

export interface DeckConfig {
  documentTitle?: string;
  author?: string | null;

  intro?: {
    title?: string;
    subtitle?: string;
    logo?: string;
    skipText?: string;
    autoAdvanceMs?: number;
    laurel?: { show?: boolean; left?: string; right?: string };
  };

  /** Global media — appended to every slide's per-slide arrays. */
  media?: {
    videos?: VideoItem[];
    snippets?: Snippet[];
    images?: ImageItem[];
  };

  nav?: {
    counterFormat?: (index: number, total: number) => string;
  };

  timer?: {
    show?: boolean;
    target?: number; // minutes
  };

  hints?: {
    title?: string;
    items?: { keys: string[]; label: string }[];
  };

  /** CSS variable overrides; keys with or without leading "--" */
  theme?: Record<string, string>;

  fonts?: FontFaceConfig[];
  stylesheet?: string;
}

export interface FontFaceConfig {
  family: string;
  src: string;
  weight?: number | string;
  style?: "normal" | "italic" | "oblique";
  display?: "auto" | "block" | "swap" | "fallback" | "optional";
}

/* ─── Registry (presentations/index.js) ────────────────────────── */

export interface DeckRegistryEntry {
  id: string;
  title?: string;
}

export interface PickerConfig {
  title?: string;
  hint?: string;
}

/* ─── Slide configs (returned by builders) ─────────────────────── */

export type SlideType =
  | "text"
  | "quote"
  | "diagram"
  | "image"
  | "section"
  | "list"
  | "split"
  | "bigtext"
  | "compare"
  | "media"
  | "qr"
  | string;

export interface SlideContext {
  slide: SlideConfig;
  index: number;
  step: number;
  total: number;
}

export interface SlideConfig {
  id: string;
  type?: SlideType;
  title?: string;
  notes?: string;
  snippets?: Snippet[];
  videos?: VideoItem[];
  images?: ImageItem[];
  steps?: number;
  render(root: HTMLElement): void;
  onEnter?(ctx: SlideContext): void;
  onStep?(stepIndex: number, ctx: SlideContext, opts?: { replay?: boolean }): void;
  onUnstep?(stepIndex: number, ctx: SlideContext): void;
  onLeave?(ctx: SlideContext): void;
}

export interface Snippet {
  title?: string;
  lang?: string;
  code: string;
  highlight?: number[];
}

export interface VideoItem {
  title?: string;
  src: string;
  type?: string;
  poster?: string;
  caption?: string;
}

export interface ImageItem {
  title?: string;
  src: string;
  alt?: string;
  caption?: string;
}

/* ─── Diagram step shapes ──────────────────────────────────────── */

export type DiagramStep = NodeStep | ArrowStep;

export interface NodeStep {
  type: "node";
  id: string;
  shape: "circle" | "ellipse" | "rect";
  x: number;
  y: number;
  r?: number; // circle
  rx?: number; // ellipse
  ry?: number; // ellipse
  w?: number; // rect
  h?: number; // rect
  label?: string;
  accent?: boolean;
  ghost?: boolean;
}

export interface ArrowStep {
  type: "arrow";
  from: string;
  to: string;
  label?: string;
  accent?: boolean;
  curve?: number; // -1..1, perpendicular bend as fraction of chord
}

/* ─── Builders API ─────────────────────────────────────────────── */

export interface BuildersAPI {
  textSlide(opts: TextSlideOpts): SlideConfig;
  quoteSlide(opts: QuoteSlideOpts): SlideConfig;
  diagramSlide(opts: DiagramSlideOpts): SlideConfig;
  imageSlide(opts: ImageSlideOpts): SlideConfig;
  sectionSlide(opts: SectionSlideOpts): SlideConfig;
  listSlide(opts: ListSlideOpts): SlideConfig;
  splitSlide(opts: SplitSlideOpts): SlideConfig;
  bigTextSlide(opts: BigTextSlideOpts): SlideConfig;
  compareSlide(opts: CompareSlideOpts): SlideConfig;
  mediaSlide(opts: MediaSlideOpts): SlideConfig;
  qrSlide(opts: QrSlideOpts): SlideConfig;
  register(name: string, factory: (opts: any) => SlideConfig): void;
  [extra: string]: any;
}

export interface TextSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  modifier?: string;
  snippets?: Snippet[];
  videos?: VideoItem[];
  images?: ImageItem[];
  notes?: string;
}

export interface QuoteSlideOpts {
  id: string;
  quote: string;
  cite?: string;
  snippets?: Snippet[];
  videos?: VideoItem[];
  images?: ImageItem[];
  notes?: string;
}

export interface DiagramSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  steps: DiagramStep[];
  snippets?: Snippet[];
  notes?: string;
  fullscreen?: boolean;
  viewBox?: { width: number; height: number };
}

export interface ImageSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  src: string;
  alt?: string;
  snippets?: Snippet[];
  videos?: VideoItem[];
  images?: ImageItem[];
  notes?: string;
}

export interface SectionSlideOpts {
  id: string;
  numeral?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  snippets?: Snippet[];
  videos?: VideoItem[];
  images?: ImageItem[];
  notes?: string;
}

export interface ListSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  items: string[];
  ordered?: boolean;
  snippets?: Snippet[];
  videos?: VideoItem[];
  images?: ImageItem[];
  notes?: string;
}

export interface SplitSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  left?: string;
  right?: string;
  ratio?: string;
  snippets?: Snippet[];
  videos?: VideoItem[];
  images?: ImageItem[];
  notes?: string;
}

export interface BigTextSlideOpts {
  id: string;
  text: string;
  footnote?: string;
  reveal?: boolean;
  snippets?: Snippet[];
  videos?: VideoItem[];
  images?: ImageItem[];
  notes?: string;
}

export interface CompareSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  left?: { title?: string; items?: string[] };
  right?: { title?: string; items?: string[] };
  snippets?: Snippet[];
  videos?: VideoItem[];
  images?: ImageItem[];
  notes?: string;
}

export interface MediaSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  /** Optional shown text when no videos/images are wired yet. */
  placeholder?: string;
  videos?: VideoItem[];
  images?: ImageItem[];
  snippets?: Snippet[];
  notes?: string;
}

export interface QrSlideOpts {
  id: string;
  eyebrow?: string;
  title?: string;
  /** URL the QR encodes; also rendered as plain text under the QR. */
  url: string;
  /** Path to a static QR image (SVG/PNG); generate offline. */
  qrSrc: string;
  tagline?: string;
  notes?: string;
  snippets?: Snippet[];
}

export {};
