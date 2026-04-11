// @ts-nocheck
/**
 * ESLint flat config — works with ESLint v9+.
 *
 * Linting only (no formatting — Prettier owns formatting). The engine is
 * vanilla JS using IIFEs that attach globals to `window`, so we declare
 * those globals explicitly here.
 */
const js = require("@eslint/js");
const prettier = require("eslint-config-prettier");

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  location: "readonly",
  history: "readonly",
  localStorage: "readonly",
  sessionStorage: "readonly",
  navigator: "readonly",
  console: "readonly",
  Event: "readonly",
  CustomEvent: "readonly",
  TouchEvent: "readonly",
  setTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  clearTimeout: "readonly",
  requestAnimationFrame: "readonly",
  cancelAnimationFrame: "readonly",
  getComputedStyle: "readonly",
  URLSearchParams: "readonly",
  HTMLElement: "readonly",
  Element: "readonly",
};

// Globals attached by engine modules (one per IIFE)
const engineGlobals = {
  Router: "writable",
  Diagram: "writable",
  Media: "writable",
  Notes: "writable",
  Overview: "writable",
  Timer: "writable",
  Intro: "writable",
  Builders: "writable",
  Boot: "writable",
  Nav: "writable",
  Touch: "writable",
};

// Globals attached by deck files (presentations/*/config.js, deck.js)
const deckGlobals = {
  SLIDES: "writable",
  DECKS: "writable",
  DEFAULT_DECK: "writable",
  PICKER: "writable",
  DECK_CONFIG: "writable",
  DECK_PATH: "writable",
};

module.exports = [
  // Ignore generated and vendored paths. The `presentations/local/` tree
  // is gitignored AND listed here so any personal decks living under it
  // are never linted, whether or not they exist.
  {
    ignores: [
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      "playwright/.cache/**",
      "presentations/local/**",
    ],
  },

  js.configs.recommended,
  prettier,

  // Engine + deck source
  {
    files: ["js/**/*.js", "presentations/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...browserGlobals, ...engineGlobals, ...deckGlobals },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-console": "off",
    },
  },

  // Tests + Playwright config + scripts (CommonJS, Node)
  {
    files: ["tests/**/*.js", "playwright.config.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...browserGlobals,
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // ESLint config itself
  {
    files: ["eslint.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "readonly",
      },
    },
  },
];
