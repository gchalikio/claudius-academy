# Assets — what to drop here

Placeholders are in place so the deck runs offline immediately. Replace any of
these with the real thing when you have it.

## logo.svg (or logo.png)
A pixel-style placeholder is provided. To swap:
- Drop your file as `assets/logo.svg` (or `logo.png` and update the `<img src>` in `index.html`).
- Square aspect, ~256×256 minimum, transparent background.

## Fonts (optional, for full offline polish)
The deck currently falls back to system serifs. To get the real Roman/CRT vibe,
download `.woff2` files for these fonts and place them in `assets/fonts/`:

- **Cinzel** (display serif — Roman capitals)
- **IM Fell English** (body serif — old print)
- **VT323** (pixel/CRT mono)

Then add an `@font-face` block to `css/theme.css` and the `--font-display`,
`--font-serif`, `--font-pixel` tokens will pick them up automatically.

## Videos
Drop `.mp4` files into `assets/videos/` and reference them either:
- as the default in `index.html` (`<source src="assets/videos/your-file.mp4" />`), or
- per-button via `Modal.open('assets/videos/your-file.mp4')`.

The video modal opens with the **V** key.
