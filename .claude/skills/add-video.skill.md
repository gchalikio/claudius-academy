---
name: add-video
description: Wire a video file into the V key modal — places the file under per-deck assets, points the modal at it, and verifies it plays without breaking screen-share.
---

# Skill: add a video

Use this when the user wants to play a video during the talk via the
`V` key modal (typically a pre-recorded interactive task or demo reel).

## Read first

- `js/modal.js` — the video modal controller
- `index.html` — the `#video-modal` element and its `<video>` tag
- `presentations/<deck>/config.js` — for `modals.videoTitle`

## Steps

1. **Confirm the source.**
   Where is the video coming from?
   - User has an `.mp4` already → great
   - User wants to record → use Loom/QuickTime/OBS, export as `.mp4`
     (H.264, AAC). MP4 is the safe lowest common denominator.
   - User wants a YouTube embed → don't. The video modal plays a local
     `<source>`; YouTube needs an iframe and won't work offline. Have
     them download instead.

2. **Drop the file in the right place.**
   - Per-deck (recommended):
     `presentations/<deck>/assets/videos/<name>.mp4`
   - Shared across decks: `assets/videos/<name>.mp4`
   - Keep the file under ~100 MB if you plan to commit it; use Git LFS
     for anything bigger, or keep it gitignored if it's personal.

3. **Update the `<source>` tag** in `index.html`:
   ```html
   <video id="video-player" controls preload="metadata">
     <source src="presentations/<deck>/assets/videos/<name>.mp4" type="video/mp4" />
   </video>
   ```
   - Keep `preload="metadata"` so the file isn't fully downloaded until
     the modal opens.
   - Don't set `autoplay`. Browsers block it without user interaction
     anyway, and presenters need to control timing.

4. **Set the modal header label** in `presentations/<deck>/config.js`:
   ```js
   modals: {
     videoTitle: "Demo reel",   // or "Live build", "Skill in action", etc.
   },
   ```

5. **Add a "press V" cue on the slide that introduces the video.**
   In `deck.js`, add a `textSlide` (or extend an existing one) with a
   visible hint:
   ```js
   body: `<p>Three things to watch for...</p>
          <p style="margin-top:24px;color:var(--gold-700)">
            Press <kbd>V</kbd> to play.
          </p>`,
   ```

6. **Verify in the browser.**
   - Reload the deck.
   - Press `V` — the modal opens.
   - The video plays. Audio works.
   - Pressing `Esc` (or clicking the X) closes the modal AND pauses the
     video.
   - Pressing `V` again resumes from where it stopped (or restarts —
     depends on browser).
   - Pressing `C` while the video is open closes the video first
     (modals are mutually exclusive).

7. **Important — screen-share check.**
   When you share the *entire screen* during a Zoom/Meet/Teams call,
   browser audio does NOT route to the audience by default. To fix:
   - **Zoom:** check "Share computer sound" in the share dialog.
   - **Meet:** share a *Chrome tab* (which transmits audio) instead of
     the whole screen, OR open the deck in a Chrome tab so you can do
     this.
   - **Teams:** "Include computer sound" toggle.
   Test this BEFORE the talk. Audience can't hear your demo if you skip it.

8. **For multiple videos**, you have two options:
   a. **Single source, swap before play:** call `Modal.open("path")`
      from a slide's `onEnter` hook. The Modal API supports this.
   b. **Multiple `<source>` tags** — not supported by the current
      modal. Use option (a).

## Don't

- Don't commit huge video files without Git LFS — they bloat the repo
  and clone times.
- Don't enable `autoplay`. Browsers block it and it surprises presenters.
- Don't forget the audio routing on screen-share. This is the #1
  rookie mistake at remote talks.
- Don't use a YouTube/Vimeo embed — the modal is a local `<video>` tag.
- Don't open the video modal *during* the intro animation. The intro
  sequence is fragile to focus changes.
