---
name: rehearse-talk
description: Pre-talk rehearsal flow — walks through the deck end to end, times the run, surfaces missing notes, and produces a punch list of what to fix before going live.
---

# Skill: rehearse a talk

Use this when the user is about to give a talk and wants to do a serious
rehearsal. The output is a punch list of things to fix BEFORE the live run,
not a vague "looks good."

## Read first

- The deck file: `presentations/<deck>/deck.js`
- `presentations/<deck>/config.js` — for `timer.target` (the budget)
- `js/timer.js`, `js/notes.js`, `js/overview.js` — to understand the
  rehearsal helpers

## Steps

1. **Confirm the target time.**
   Look at `config.timer.target` (in minutes). Ask the user if it's right.
   If not, update it before rehearsing — the timer goes amber at 80% and
   red past 100%.

2. **Open the deck cleanly.**
   ```bash
   python3 -m http.server 8000
   ```
   Visit `http://localhost:8000?deck=<deck-id>&nointro` to skip the intro
   for rehearsal speed. Press `T` to show the timer. Press `N` to open
   the speaker notes pane (close it again before screen-sharing!).

3. **Walk every slide once, all the way through, in real time.**
   Use `→` for each step. Don't skim. Speak the words you'd say to the
   audience out loud (or in your head — but full sentences).

4. **As you go, capture issues into a punch list.** For each slide, check:
   - **Does the title match what I'm actually saying?**
   - **Are there speaker notes? Do they match what I'd actually need to
     remember?** If empty and you stumble, add notes.
   - **Are there too many bullets?** Lists with >5 items lose people.
   - **Are the diagram steps in the right order?** Diagrams should unfold
     in the order you naturally explain them.
   - **Do code snippets render legibly?** If you can't read them on your
     own monitor, the audience can't either.
   - **Does the transition out of the slide land?** Awkward transitions
     are usually a sign that two slides should be merged or reordered.

5. **Note the elapsed time per act.**
   Press `Esc` to open the overview between acts and screenshot/record
   the timer reading. After the run, you'll know which acts are bleeding
   minutes.

6. **Stop when the timer hits the target.** That's your real run length.
   If you're not done yet, you're over budget — see the "Cutting" section
   below.

7. **Run the punch list.** For each captured issue:
   - Fix typos and notes inline.
   - Use the `add-slide` skill to add or merge slides if needed.
   - Use the `theme-deck` skill if the issue is visual.
   - Use the `write-diagram` skill if a diagram needs work.

8. **Do a second clean run.** This one should hit the target time without
   surprises. If it doesn't, do a third.

9. **Final dress rehearsal in fullscreen.**
   - Press `F` for browser fullscreen.
   - Open exactly the apps you'll have open during the talk.
   - Close the notes pane (`N`).
   - Walk it once more, no stops.

## Cutting (when you're over time)

In order of pain (least to most):

1. **Cut sub-bullets and side-stories.** These are the cheapest minutes.
2. **Merge two adjacent slides** that say the same thing two ways.
3. **Cut a whole slide** that doesn't move the thesis forward.
4. **Cut a sub-act.** Painful, but better than running over.
5. **Last resort: cut the Q&A demo / interactive task.** Only if the
   talk is dying — it's the most memorable part.

## Don't

- Don't rehearse silently. If you don't say the words, you don't know how
  long the slide actually takes.
- Don't fix issues mid-rehearsal. Capture them, fix them after. Stopping
  to edit kills the timing.
- Don't skip the dress rehearsal. The fullscreen + tabs-open environment
  hides bugs that show up in the wild (font fallback, modal z-index,
  laptop trackpad accidentally triggering Esc).
- Don't rehearse with the timer hidden. Knowing the elapsed time is half
  the point.
