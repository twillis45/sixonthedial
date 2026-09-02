# Motion study — the shipped interaction — 2026-08-30

**Run late, and recorded as a deviation.** `motion-design` is a stage-2 skill
whose `at` is "before anything is animated". The game shipped animated on
2026-08-21. This measures what exists against the skill's rules rather than
pretending to precede it.

No prose spec without an artefact — the skill calls that a red flag. The
artefact here is the shipped CSS, read and measured, plus `npm run check:motion`
which already guards it and is itself mutation-tested twice by `check:guards`.

## Beats, as shipped

| Beat | Duration | Curve |
|---|---|---|
| tick (letter confirm) | 180ms | `cubic-bezier(.34,1.4,.64,1)` |
| **land (word banked — the success)** | **420ms** | `cubic-bezier(.22,1,.28,1)` |
| land-ring | 520ms | `cubic-bezier(.16,.8,.3,1)` |
| **shake (rejected — the failure)** | **340ms** | `ease-in-out` |
| bonus-in / counter-pop | 420ms | overshoot curves |
| fill-up | 620ms | `cubic-bezier(.16,.8,.3,1)` |
| prize-in / sweep | 700ms | `cubic-bezier(.16,1,.3,1)` |
| prize-ring / float-up | 900ms | — |
| rank-banner | 2200ms | `cubic-bezier(.2,1.2,.3,1)` |
| dial-turn | 420ms, 70% overshoot to 64° then settles 60° | `cubic-bezier(.22,1,.28,1)` |

**The ratio: success 420ms / rejection 340ms.** Failure is faster than success.
The rule holds, and success overshoots while failure uses `ease-in-out` and
snaps back — two curves, not one. Both as the skill requires.

## The finding: the ratio inverts under reduced motion

Under `prefers-reduced-motion: reduce`:

    .anim-land   → rm-appear  160ms   (opacity fade)
    .anim-shake  → rm-reject  420ms   (two danger-ring pulses)

**Rejection is 2.6× SLOWER than success.** The rule the skill says generalises —
*failure feedback must be faster than success feedback, because rejection is a
lesson and has to land before the player blames the app* — is inverted in this
path, and it is the path nobody plays in during development.

**It is not careless.** `rm-reject` carries two pulses (ring at 25% and 75%),
and without movement a rejection needs repetition to read as a rejection at all.
420ms buys two legible pulses. The reasoning is sound; the ratio is still wrong.

**And the existing guard cannot see it.** `check:motion` asserts the rejection
still EXISTS under reduced motion — `check:guards` mutation-tests exactly that
("reduced motion silences the rejection", caught by check-motion). Presence is
guarded. The *relationship between* success and failure timing is not, and that
relationship is the thing the rule is about.

### Options, for a ruling rather than a quiet fix

1. **Single pulse at ~200ms.** Restores the ratio. Costs the repetition that
   makes a non-moving cue read as rejection.
2. **Two pulses tightened to ~260ms** (130ms each). Keeps repetition, restores
   the ratio against a 160ms success. Probably the best trade.
3. **Accept it, in writing.** Reduced-motion users may genuinely need the extra
   dwell, and a documented exception is legitimate. Not an omission — a ruling.

4. **Do not time it at all — persist the state.** Added 2026-08-31 after a
   Mobbin scan of 20 rejection screens (`docs/REFERENCE_SCANS.md`). **The
   field's convention is unanimous: rejection without motion is a PERSISTENT
   STATE, not a timed event** — an outline and a message held until the input
   changes. Not one of the twenty used a timed cue. A persisted state cannot
   invert the ratio, because it has no duration to compare against success: it
   removes the defect rather than rebalancing it. The limit is that all twenty
   were form inputs, where the user must correct something before continuing;
   a word game rejects faster and more often, so the mechanism transfers but
   the visual weight should not.

This is a design decision, not a defect to patch silently. Recorded for the
operator.

## Unresolved

The skill says a study that omits these reads as finished when it is not.

- **Sound.** There is a haptics/feedback intensity control and a mute toggle;
  no sound design pass has been done against these beats.
- **Particles.** None; not attempted.
- **Real-device touch latency.** Never measured on hardware. Every timing here
  is from a desktop browser and headless Chrome. `b4h` — drag tested on a real
  finger — is still open on the board, and this is the same gap.
