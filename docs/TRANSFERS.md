# What transfers

Written while the project is alive, not at its end. **Recording what transfers
is what makes any outcome an asset**, and an outcome that is still uncertain is
exactly when the record is honest — after a good result everything looks like a
method, and after a bad one nothing does.

The precedent is the Spades closing memo. This file is the same shape.

## What came IN, from Snug and Spades

Named because none of it was invented here, and because the direction matters:
these arrived, got used hard, and are leaving improved.

| Came in | What this project did to it |
|---|---|
| The self-publishing tracker | Added a parse check, a fixed-point verification, a renders-visible-text check, and a state-carry-forward fix — see below |
| The gate-zero protocol | Four variants behind one URL parameter, a frozen kill rule, and a curtain for static exports |
| The claim-ledger listing check | `check:listing`, run against the built artifact rather than the source |
| The capture pipeline | Store-preview encoding settled at CRF 16; 60 stills, 3 clips, 12 mockups |

## What goes OUT, improved or new

Ranked by how portable it actually is, not by how much work it was.

### Portable to any project

- **"A check must assert the thing EXISTS before asserting it is green."**
  The single most valuable line this project produced. Absence and success look
  identical to a naive query, and the two worst defects found here were not
  wrong measurements but **checks that could not fail** — which is how
  production was once reported as carrying a change it never received.
- **Red-proofing.** A guard is not finished when it passes; it is finished when
  the fault it guards has been reintroduced and watched failing. Every guard
  added on 2026-08-28 was proved both ways.
- **The ratchet.** Where a corpus is imperfect and a full fix is a separate
  pass, assert *it does not get worse* and record the number. Used for the
  catalogue quality floors, and for the clue-leak count — which went 20 → 17 →
  0, at which point the ratchet became `toBe(0)` rather than being deleted.
- **Measure, do not look.** Nine measurement defects in one session, and in
  **every case the app was fine and the instrument lied** — contrast buckets
  too coarse, calibration at 44px for text measured at 12px, target sizes
  measured without `hasTouch` producing a board ruling on a fabricated number.
  Calibrate an instrument against a known answer before believing it.
- **A gate that refuses valid work is not a safe failure.** `check-pack` was
  rejecting bases and rows the build accepts. It teaches whoever hits it that
  the gate is wrong and can be skipped — which is how the merge step became
  advisory once already.

### Portable to any self-publishing artifact

- **`scripts/build-tracker.js`** and the template pattern: a page that
  regenerates its own source from a base64 copy of itself, verified as a fixed
  point rather than assumed. Now also carries viewer state forward, after a
  rebuild was found silently resetting every tick made on the live page.
- The lesson under it: **a page built by script fails silently and completely
  if the script throws**, and reading the source will not tell you. Render it
  headless and assert visible text.

### Portable to any TWA / store project

- **`scripts/check-assetlinks.mjs`** — fetches the file the way Android does:
  no redirects followed, content-type asserted, fingerprints diffed against the
  repo, and **unreachable treated as a failure rather than a pass.** Every way
  that fetch goes wrong surfaces identically, as an address bar, and gets
  misdiagnosed as an app fault.
- **`src/lib/version.ts`** — `YYMMDD*100+seq` version codes, which produced the
  real build's numbers on first contact.
- The three-state assetlinks model (unbuilt / wired / testable) and why a
  sideloaded build needs the upload key as well as the Play signing key.

### Specific to a themed word game, but reusable in one

- `vet-bases.mjs` and the base-pool discipline: never pick a base by hand.
  Skipping it cost seven re-authors; skipping the anagram check cost fourteen
  boards.
- **Density before authoring.** A 2-density base caps a board at 0.40 no matter
  how good the clues are, and no rewrite recovers it.
- **Difficulty measures answer space, not readability** — the single most
  useful finding for content. The easiest board in the catalogue was also the
  one a stranger could least get into, because its clues were written from
  inside the practice. "Write from the doorway, not from the pit."
- The separation of **recall-gated** (machine-visible: a year, a fill-in-blank)
  from **domain-gated** (invisible to any check: "a burn barrel feeds a pit").
  Only the first can be guarded; the second is why a human reader is the
  ceiling.

## What does NOT transfer

Recorded so nobody carries it into a project it will hurt.

- **The blindness.** `connect-src 'self'` and no analytics is right *here*,
  where the privacy position is filed and the audience includes children. It is
  a severe constraint, it makes marketing unmeasurable, and it should be a
  decision made fresh each time rather than inherited as a default.
- **The cultural review gate.** It is the correct ceiling for this catalogue
  and it is not a general engineering practice. Applying it to content that
  does not describe a specific community's life would be theatre.
- **The shelf ceiling** (five, vetoed at six). A real constraint about one
  browse screen and one person's patience, not a principle.

## The condition on all of it

If this project stops, it stops having produced the list above, and that is a
different thing from having produced nothing. If it ships, the same list goes
out with it. **Either way the record is written before the outcome is known**,
which is the only time it can be trusted.
