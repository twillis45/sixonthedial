# Wordy — handoff

Read this first. It is written for a session that has none of the context.

Last verified 2026-08-28 against `main` at f842851. Every number below was
measured on the day, not carried forward.

**There is now a board.** `docs/tracker.html` puts every open item against the
ten-stage spine in three tracks, and it is the faster read for "what is left".
This file is the one that explains WHY, which a checklist cannot.

## The artifact

| Artifact | URL | Source |
|---|---|---|
| Six on the Dial Path to Production | https://claude.ai/code/artifact/0af681a8-e5ad-445f-af1a-7d7d8cdae7f6 | `docs/artifact/tracker.html` |

**Edit `docs/artifact/tracker-template.html`, never `docs/artifact/tracker.html`.** The published
page regenerates its own source from a base64 copy of the template when a
viewer ticks a box, so a hand edit to the built file breaks that fixed point.
`node scripts/build-tracker.js` rebuilds it and verifies the fixed point holds,
that the page parses, and that items actually reach the DOM — the last one
exists because a hand edit once published a blank page while every other check
said PASS.

Republish to the SAME url or the project's history splits in two. State as of
2026-08-28: **83 of 107 items (84 with the b4h tick), 3 blockers, Verify 14/16.**

## Where the catalogue stands

**141 authored boards across 17 themes, 520 puzzles shipped. 373 tests pass in
18 files.**

> ### SHIPPED 2026-08-28, and CI is green again
>
> Pushed at `4d6e488`. **Verified against production, not against the deploy's
> own success message:** 518 puzzles live and matching local, warm-up ladder
> serving `warmth, depict`, gate-zero ladder `trunks, wrongs`, all ten new
> boards present, and CRAFTY's rewritten clues served.
>
> **CI had been red since `bae5523` and nobody noticed.** `check-intro` typed
> `CRY` to bank a word — a word on CRAFTY, which stopped being board 1 the day
> that commit chose WARMTH instead. It failed on every push for days while
> saying something alarming and untrue about the first-run teach. It now
> derives the opening word from the shipped ladder. The second failure, a stale
> `docs/catalogue.html`, was this session's and is fixed.
>
> The lesson is the repo's own, one layer up: a check pinned to content that is
> *designed to change* will go red and stay red, and a permanently red CI is
> indistinguishable from no CI. Working tree clean, no open PRs or issues, production live at
`sixonthedial.com`.

Ten of those boards were authored on 2026-08-28 and are **not reader-reviewed**
— the five easy ones below, plus the whole of The Stoop.

**The Stoop shipped that day too** — the theme pack-radar had flagged [ready]
since its first run, with a 107-word vocabulary and zero boards. Five boards,
on-theme 0.680, shelved on The Block. It was second in PACK_PIPELINE's order of
work and is now struck off.

Two general packs shipped on 2026-08-27, the first new packs since the corpus
was rebuilt: **The Tailgate** (6 boards, 0.733) and **The Gym** (5 boards,
0.640). Both are general, which is why they went first — cultural packs sit
behind the bench and a reader.

**If you are wondering why the catalogue is smaller than an older number you
remember:** it was 395 boards once, and commit `3b69733` condemned it. 291 of
those 395 had fewer than two on-theme rows and 113 had none at all — six letters
and six legal words with no connection to the theme they shipped under. The
rebuild took it to 88 and the rate from 0.216 to 0.641. Any figure above ~130 in
an old document is counting boards that were about nothing. Do not treat
refilling to it as a goal.

Reproduce the rate with `node scripts/pack-radar.mjs` — it prints per theme,
and excludes the base row the way `src/lib/catalogue.test.ts` does.

The single most useful thing to know: **on-theme rate is a proxy, not the
product.** It measures whether a row's word appears in that theme's curated
vocabulary. It caught a real disaster once, taking the catalogue from 0.216 to
0.62, and it is now being optimized past its useful range. Players experience
CLUES, not vocabulary membership. Treat 0.60 as a floor that catches generic
boards, never as a target to chase — chasing it is how a vocabulary got padded
and a rate got reported as 0.58 when the truth was 0.34.

## The four rules, and what each one cost

All are in `docs/AUTHORING.md` with the measurements attached. In short:

1. **Measure base DENSITY before authoring.** Density is how many of the
   theme's words a base's six letters can spell. A base at density 2 caps its
   board at 0.40 whatever the clues do — no rewrite, donor swap or cut moves
   it. The Road Trip and Laundry Day were authored without this and both
   landed at 0.58 with no available repair.
2. **Never pad a vocabulary to move a number.** The test: would this word be
   on-theme for a DIFFERENT pack? If yes it is texture. `mat`, `bag`, `lift`,
   `set` fit a kitchen, a garage and a laundry, so they do no work in any.
3. **Prefer a prize word that belongs to the theme** — a preference, NOT a
   gate. Using it as a gate rejects rnb90s, which sits at 0.80 and is the best
   pack in the catalogue.
4. **US English.** `tyre`, `kerb`, `bonnet`, `boot`, `peg`, `tap` all shipped
   and had to be corrected.

## The two worksheets

    node scripts/viability.mjs      # can a theme carry a pack at all?
    node scripts/prize-words.mjs    # shortlist of prize words per pack
    node scripts/prize-words.mjs 7  # what a seventh tile would offer
    node scripts/pack-radar.mjs     # standing health check — what to build next

`viability.mjs` is the gate that should run BEFORE any authoring. It was not
run for Laundry Day or Caribbean, which is why both were written, shipped and
then found unfixable. `pack-radar.mjs` reports and never gates, on purpose — a
check that fails the build for saying "stoop has no boards" just gets muted.

## Decisions already made, with evidence

- **Cut laundry and caribbean — DONE.** Measured unviable at any wheel size,
  and both are now gone from `data/packs/` and the corpus.
- **A base may now have ONE doubled letter.** The old six-distinct rule threw
  away 76 usable theme words. Capped at one pair because two pairs leaves four
  distinct letters, and CHURCH yields three answers total — measured.
- **A seventh letter is a net loss right now.** It roughly doubles answers per
  board (43 -> 91), which changes the product from a 1-3 board sitting into a
  Spelling Bee style hunt, and it costs a full re-tune of the wheel geometry.
  Fewer packs qualify, not more. Revisit only if session length is wanted.
- **The binding constraint is vocabulary size, not wheel size.** rnb90s reaches
  0.80 on 150 usable words. Every structural lever tried moved things less than
  vocabulary depth did.

## What is queued

1. **`stoop` is the cheapest win left.** Vocabulary already shipped — 107 usable
   words, density 159, comfortably over the floor of 12 — and ZERO boards. It is
   a theme already paid for. `tailgate` is the same shape one step further back:
   204 words, density 453, not yet in `themes.json`.
2. **Depth, not more packs, for the six shallow ones.** sitcom (50 usable
   words), spades (52), juneteenth (52), beautysupply (75), garden (82),
   steppers (89) — against ~140-150 for the packs that reach 0.80.
3. **Re-base surviving packs on real prize words.** `prize-words.mjs` ranks but
   deliberately does not choose — "is this satisfying to be rewarded with" is a
   human judgment, and an auto-picking version returned PLATES for church.
   rnb90s, garden, beautysupply, hbcu, steppers and sitcom currently carry zero
   theme-owned prize words.
4. **Never shipped, still open:** Wing 7's veto read on The Beauty Supply clue
   set, and one real community reader per pack — budgeted before commercial
   ship and NOT yet done for any pack. See `docs/CULTURAL_BOARD.md`. This is
   also store BLOCKER 1.10.

## The Android track is DONE except for an upload

All of this landed 2026-08-27 and none of it is blocked on anything external
any more:

- **Play developer account**, organization, under the LLC. Organization was
  right twice: a personal account cannot be converted later, and the
  12-testers-for-14-days rule applies only to personal accounts — organizations
  are exempt, which saves two weeks at submission.
- **App created**, `com.sixonthedial.game`, Play App Signing enrolled.
- **`assetlinks.json` carries BOTH fingerprints** — the Play-managed app signing
  key and the upload key. The second one matters: a bundle installed from Play
  is signed by Google, a bundle you sideload is signed by the upload key, and
  without both a local test fails for a reason that looks like a broken build.
- **The TWA is built and signed** — `android/app-release-bundle.aab`, 1.15MB,
  `jarsigner verified`.

**What remains is one upload** to Test and release → Internal testing, plus a
tester list. Then the single observation the whole domain effort was for:
**address bar, or no address bar.**

`adb shell pm get-app-links com.sixonthedial.game` reads the verification state
directly. Look for `verified`; anything else means the bar will be there.

**The keystore is `android/upload.keystore`, gitignored, and cannot be
regenerated.** Losing it means never shipping an update to that app. It is not
in this repo and must not be.

## Store readiness

`docs/STORE_READINESS.md` is the row-by-row tracker; `docs/tracker.html` is the
same material as a board you can tick.

**The domain gate is CLOSED.** Until 2026-08-21 this section said Android could
not start without a custom domain, and that was the single biggest blocker on
the project. It is done: `sixonthedial.com` serves the app from the origin root,
and **`/.well-known/assetlinks.json` returns 200 from that root** — the path
this repo structurally could not publish while it lived on `github.io`, because
it belonged to the user-pages repo.

What that leaves, in order of leverage:

1. **Create the Play app.** Everything else on the Android track is finished.
   The signing fingerprint is the last `REPLACE_WITH_` placeholder in
   `assetlinks.json` and it cannot exist until the app does. One signup
   unblocks the whole track.
2. **Rule Apple 4.2** (STORE_READINESS 0.1) — wrapper or real client, and
   therefore whether iOS is worth starting at all.
3. **Rule the age band** (1.4) — both stores ask, and the answer changes
   obligations.
4. **One real community reader per pack** (1.10). This is the blocker no amount
   of engineering clears, and it gates the paid half of the product.
   `docs/CULTURAL_BOARD.md` says plainly that the bench is structured
   perspective, NOT community consultation.

Licence work (ENABLE provenance, WordNet notice) is done. Privacy is measured
rather than asserted: "Data Not Collected" for Apple, "No data collected" for
Play, with `connect-src 'self'` as the structural backstop.

## Traps in this repo

- **`GENERAL_THEMES` is declared TWICE** — `scripts/build-puzzles.mjs` and
  `src/lib/game.ts`. The build partitions the array with it; the app decides how
  far into that array the daily may reach. Disagree and the daily silently
  serves a general pack. Exactly that happened when tailgate and gym shipped.
  `game.test.ts` catches it by name. Change both or neither.
- **`vet-bases` and `check-pack` must agree on what an ANSWER is.** They did not
  until 2026-08-27: vet-bases filtered through `isBlocked` and check-pack did
  not, so MASTER counted 110 in one and 111 in the other and the pool handed
  authors a base the build refused. Fixed; do not let them drift.
- **The redactor matches INSIDE longer words.** `properly` contains `rope` and
  would blank mid-word. check-pack catches it, but only after you have written
  the clue.
- **`public/data/puzzles.json` is generated by `npm run puzzles`, not by
  `next build`.** Merge a pack without running it and you ship a catalogue no
  player ever sees. Same for `npm run definitions` and
  `node scripts/build-catalogue.mjs`, which CI checks for staleness.
- **The warm-up ladder is NAMED, not sorted, and both slots are now decided.**
  `FIRST_BOARDS` in build-puzzles is `warmth` then `depict` — Sunday Dinner then
  The Cookout. Board 2 moved off `nicked` on 2026-08-28: three of its six rows
  were recall-gated trivia, which is CRAFTY's failure one slot later. See
  REVIEW_2026-08-26_DECISIONS.md, ruling 2. `content.test.ts` holds it, and it
  guards the machine-visible half only — domain-gating still needs a reader.
  It used to be "two easiest by difficulty", which is how a first-timer came to
  meet a clue about burn barrels that nobody chose for them.

- **The light theme is declared TWICE** — a `prefers-color-scheme` block and an
  explicit `[data-theme='light']` block, at `globals.css:393` and `:490`, with
  a second pair for the matte accent at `:1320` and `:1370`. Patching one and
  not the other has caused two separate bugs. Change both.
- **`merge-pack` runs `check-pack` and refuses on failure.** It used to be
  advisory, and a board with an unspellable row reached the catalogue that way.
  `npm test` passed on it, because the ratchet measures on-theme RATE and an
  unsolvable row is still an on-theme row.
- **Spellability is a MULTISET question.** `canSpell` in `lib/game.ts`. A set
  check says TOTTER is spellable from COTTON. The same class of bug once turned
  45 boards into 118 and produced LOCUST, which is kept as a named regression
  case in `multiset.test.ts`.
- **Shell quoting mangles inline node scripts** (backticks, `${...}`,
  apostrophes). Write to a scratchpad file and run that. Commit messages with
  backticks get shell-evaluated — use `git commit -F file`.
- Node must be PATH-pinned. There are TWO Node 20 installs on this machine and
  either works: `/usr/local/opt/node@20/bin` or `~/.local/node20/bin`.
- **This machine has an x86/arm64 fault that bites native modules.** `npm run
  icons` fails on `import PIL`, and `npx @bubblewrap/cli` resolved
  `@resvg/resvg-js-darwin-x64` on an arm64 Mac and could not run at all. The fix
  for bubblewrap was a LOCAL install (`android/node_modules`), which resolves
  `darwin-arm64` correctly. Suspect this before suspecting the tool.
- **bubblewrap's prompts echo character by character**, which mangles anything
  piped or driven by `expect`. It silently wrote `com.sixonthedial.twa` against
  assetlinks' `.game` and would have built green and shown an address bar. Write
  `twa-manifest.json` directly and run `bubblewrap update` instead of answering
  the wizard.
- Dev server: `npm run dev -- -p 3007`. Port 3000 is a different project.

## What CI runs

Three workflows in `.github/workflows/`: `ci.yml`, `pages.yml`, `catalogue.yml`.
Beyond `npm test` and `npm run lint`, the browser-level gates are:

    npm run check:rail
    npm run check:intro       # first-run teach is shown, and ends by being acted on
    npm run check:hydration   # red-proofed: 3 of 3 loads failed before the fix

All three were added because something shipped that only a running browser could
have caught.

## Known open bugs

**None outstanding.** The React #418 hydration error that dominated this doc's
previous version is fixed and gated. Root cause was `fullscreenSupported()`
called in a render body — `false` on the server, `true` in a browser — so the
prerendered tree was thrown away on every load. It is now read through
`useSyncExternalStore` with a server snapshot of `false`. `Preferences.tsx`,
written as a patch for the symptom, is no longer load-bearing for it.

One thing is fixed but still unconfirmed in production: the stale-service-worker
fix (STORE_READINESS 5.1). All three fixes are confirmed present in the live
artifact, not just in source — but the live deploy has equalled HEAD every time
it was checked, so **there has never been a stale build to escape from**, and
the actual old-to-new transition remains unobserved.

Close it on the next deploy that touches `src/`, before touching anything else:
open the live URL, leave the tab open, let the deploy land, then confirm the tab
reloads itself and `caches.keys()` returns exactly one entry at the new stamp.
A commit that only touches `scripts/` or `store/` will NOT do — neither is a
build input, so the artifact can come out byte-identical and prove nothing.

## Gates that have run, and what they found

**WCAG AA — `npm run check:a11y`, 2026-08-26. Clean.** 189 text boxes across
six surface/theme combinations, zero contrast failures, every interactive
element named, reduced motion honoured. Red-proofed at 118 caught with faults
injected, 0 without. Not a failure but worth a decision: 81 controls sit under
Apple's 44px bar, including four header controls at 36x36 and the hint rows at
24x24. WCAG's own floor is 24 and they clear it.

**Nielsen 10 heuristics, 2026-08-26. No P0 or P1.** One P2: a spent hint has no
undo. It is well guarded — a two-step chooser, prices shown, unaffordable
options disabled rather than hidden, and the two options measured at 44px tall
with 95px between centres, so a mistap is unlikely — but the action is still
irreversible and consumes a scarce resource. Verified live rather than reasoned
about: solving a row, reloading, and confirming the row comes back solved.

Caveat on that pass, because it changes how much it is worth: the skill calls
for a clean-room subagent and this session was instructed not to spawn one, so
it ran inline. An inline pass is biased toward re-finding what the session
already knew, and is worth redoing cold before submission.

## The board has met three times, and its rulings bind

`docs/REVIEW_2026-08-26_DECISIONS.md` holds all of it. The rulings that change
what you would otherwise do:

1. **iOS is DEFERRED.** Apple 4.2 rejects a wrapper with no native capability,
   and a rejection attaches to the account. Do not buy the $99 developer
   account until there is a widget, a Live Activity or Game Center to point at.
   Android has no equivalent risk.
2. **Everyone / 4+, no data collected.** Contingent on the privacy line: any ad,
   analytics or third-party crash SDK reverses it and drags in Play's Families
   policy. No longer provisional — the corpus sweep ran and the one tobacco
   clue was rewritten.
3. **The business model is REOPENED.** Ruling 3 originally said free daily plus
   packs sold outright; the operator reopened it on 2026-08-27 and found a real
   gap — it had never asked paid DOWNLOAD versus free download. The Play form is
   set to **Paid**, because free→paid cannot be undone after publish and
   paid→free can. Three live options: paid download, free plus one-time unlock,
   free plus per-pack. **Settle after gate zero.**
4. **No third-party crash reporter.** It would trade a filed privacy position
   for telemetry on a binary that by design almost never changes.
5. **WITHDRAWN.** The header controls were already 44px on touch; the guard had
   measured them without `hasTouch`. Recorded because a twenty-seat board ruled
   on a number the harness invented.

**Pricing is NOT settled.** An approved `$16.99 / $29.99-yr` sits in store row
4.1 and must not be reused: it was set against 218 boards, which was a catalogue
three-quarters filler, and it includes a subscription tier two rulings have
since refused.

## The wedge did not survive its first demand scan

**Run 2026-08-30, late — a stage-1 skill run at stage 8.**
`ngw-os/docs/research/2026-08-30-ngw-wordy-demand-scan.md`.

1,674 store reviews across 8 apps on both stores; nine subreddits via the
arctic-shift archive; Google Suggest for language. Ahrefs volumes unavailable
on this account.

| Claim from COMPETITIVE.md | Verdict |
|---|---|
| Respectful, ad-free daily | **SOLVED** — real, and already fixed for $12–30/yr |
| **Cited themed hand-written clues** | **NO CORROBORATION** — 0 sources, 2 instruments |
| Being finite | **CONTRADICTED** |
| Black American cultural content | **UNTESTED** — needs a non-Reddit instrument |

**Read the middle row carefully. That is the differentiator this product is
built on, and neither instrument found anyone asking for it.** Not "demand does
not exist" — two instruments looked and found nothing, which is a different and
weaker statement, and the honest one.

Ad fatigue is confirmed and enormous, and it is the least defensible half:
the top-voted Reddit replies name the working fix, an NYT subscription at
$12–30/year, beneath a saturated free ad-free clone tier. Finite is
contradicted outright — users use *"endless"* as praise, and the genuine
fatigue is **compulsion loops** (timers, competition clocks), not content
volume. This product already avoids those; the finite catalogue is not what
earns that.

**The byproduct is worth more than the verdict.** Users stated a price anchor
unprompted: **$1–3/month, or $12–30/year.** `b1j` (business model) and `m9q`
(pricing) have had no demand-side evidence at all until now.

**Two consequences.** Gate zero matters MORE — it is the only free instrument
left that can tell whether a stranger values this. And the cultural readers
move from a quality gate to an **evidence** gate: they are the only route to
the untested claim that exists today.

Coverage holes, named rather than smoothed: **Puzzmo and Squabble returned zero
Apple reviews** and they are the closest competitors, so there is no user voice
from either; Play pagination echoed page one, so the sample is 724 unique not
3,750; and no TikTok/Instagram pass ran, which is the instrument the cultural
claim actually needs.

## The gate record was empty, and the stage was never earned

Read from the Command Center on 2026-08-30, not from memory:
`curl -s http://127.0.0.1:4321/api/path-to-production`.

**`ngw-wordy` sat at stage 8 with ZERO gates ever recorded.** The stage came
from the disk heuristic — last commit, files present — not from anything passing
a gate. The board carried one vague flag: *"1 gate unanswered from before the
model shipped."*

**Three gates are now recorded, and two are RULED (operator, 2026-08-30):**

| Stage | Status |
|---|---|
| 0 — Adoption | **skipped** — not an inbound project, recorded not blank |
| 1 — Idea → Problem statement | **not-yet** — the wedge did not survive its scan |
| 2 — Scope & design | **not-yet** — one open ruling, the reduced-motion rejection |
| 4 — Verify | **not-yet** — a defensible pass; guards green, critique clean |
| 5 — Security & data review | **passed** — clean, nothing outstanding |
| 6 — Deploy | **not-yet** — a defensible pass; target chosen and recorded |
| 9 — Promotion | **passed-with-conditions** — three conditions carry forward |

Seven gates, one for every stage that has required skills. **The record was
empty when this started** — the stage came from the disk heuristic, not from
anything passing a gate.

A clean pass at stage 9 was declined because it would have discarded the
conditions. They persist past the stage that produced them, which is the point
of that status: **gate zero has never run; no community reader has read any
pack; the first-timer seat is unconfirmed.** The board now carries them as a
standing `conditional` flag rather than as prose nobody re-reads.

### Skills that never fired, and their `at` has passed

| Skill | Stage | State |
|---|---|---|
| route-sweep | 5 | **RUN 2026-08-30** — `check:routes`, enumerating, red-proofed |
| security-review | 5 | **RUN 2026-08-30** — `docs/SECURITY_REVIEW.md` |
| demand-scan | 1 | **NOT RUN** — the wedge was tested against supply only |
| promote-surface | 9 | **NOT RUN** — and the surface went public without it |
| motion-design | 2 | NOT RUN as a skill; `check:motion` exists |
| reference-scan | 2 | **RAN — three passes**, indexed 2026-08-31 in `docs/REFERENCE_SCANS.md`. Earlier called "partial"; that was wrong |
| deploy-to-render | 6 | target chosen and recorded (Pages); skill not run |

Every one of these is late rather than pending. A late scan is worth running; a
late scan reported as on-time is not, which is why each is recorded as a
deviation rather than quietly ticked.

**Only the owner rules a gate.** Stage 5 is recorded `not-yet` with a
recommendation of PASS and no findings. Reading `docs/SECURITY_REVIEW.md` and
ruling it is a five-minute job that moves the board honestly.

## The check suite is bigger than CI, and part of it was lying

Measured 2026-08-28, by running every `check:*` script rather than trusting
the green CI badge.

**CI runs 7 of the 17 check scripts.** `npm test`, check-pack on staged packs,
the puzzle-build match, the catalogue match, `check:rail`, `check:intro`,
`check:hydration`. The other ten exist, are wired into `package.json`, and are
executed by nobody unless somebody types them.

**Two of them were pinned to a board the product deliberately changed**, and
both went red at `bae5523` — the commit that CHOSE Sunday Dinner/WARMTH as
board 1 instead of letting a difficulty sort pick Barbecue/CRAFTY:

- `check:intro` typed `CRY` to bank a word. No C, R or Y on WARMTH's wheel.
- `check:drag` reached for CRAFTY's tiles and found none, then printed *"the
  dial spells the wrong word after it turns: 6 of 7"* on every run.

Both now read the shipped ladder. The second one matters more than it looks:
red-proofing it by pinning the dial's rotation to `0deg` — a genuine
catastrophic failure — produces **the same 6 of 7**. For days a real dial
breakage would have been indistinguishable from the noise.

**`check:a11y` was reporting a failure that did not exist. FIXED, and the
cause is worth carrying.** It reported three WCAG failures on *"Play today to
start a streak."* at 1.00–1.08:1, in every theme, for as long as anyone had
run it. The text measures 5.85–6.42:1 and passes AA comfortably.

The guard collected every text box in one pass and screenshotted them in
another. **The page moves between the two.** The Rail renders a placeholder
line that is replaced once real progress arrives, which pushes everything
below it down — measured, the last line in the rail sat at y=809 when
collected and y=826 when photographed. A 17px drift, so the crop caught
background and no glyphs at all, and two near-identical luminances report as
1.00:1.

Only the bottom-most element failed, because drift accumulates downward and
everything above it moved less. That is why it looked element-specific and
not like a broken instrument.

The fix is NOT a longer wait — that is a guessed number that happens to work
today. Each element is now re-resolved immediately before its own screenshot,
so a box that has moved, vanished or left the viewport is skipped rather than
sampled at a stale address. Proved both directions: clean run reports no
failures, and `--red` still catches all 118 injected faults — with that same
line now correctly reading 3.25:1 instead of garbage.

**`check-a11y --red` is the only self-falsifying check in the repo and nothing
runs it.** It is not in `package.json`, not in CI, and not covered by
`check-guards`. It is the one command that would have caught this.

### A guard that could have caught it, written correctly, and never run

Measured 2026-08-28. `check-guards` mutation-tests **7 of the 16** guards:
rail (5 mutations), tiles (3), motion (2), settings, drag, depth, color.

**Nine have no meta-test at all** — a11y, ranks, marks, intro, gate0,
assetlinks, listing, share, hydration. `check-a11y`, the instrument currently
reporting a contrast failure that three independent measurements say is not
real, is one of those nine. Nothing has ever verified it can fail correctly.

The sharper half is `check-drag`. It **was** covered — there is a mutation for
it in this very suite — and it still sat broken for days, printing "the dial
spells the wrong word after it turns" on every run. The meta-guard existed, was
correct, and caught nothing, because `check:guards` is not in CI and takes over
twenty minutes, so nobody ran it.

This repo has already catalogued *a check that cannot fail*. This is a
different animal: **a guard that could have failed, and was never executed.**
Coverage without execution is worth zero and looks identical to safety from the
outside — arguably worse, because the meta-guard's existence is reassuring.

Both of today's silently-red checks fit the pattern from opposite sides.
`check:intro` runs in CI, and its failure was invisible inside a CI that had
been red since `bae5523`. `check:drag` had a meta-guard nobody ran. Two
mechanisms, one outcome: frightening and false statements about the product,
unread for days.

**What would actually change this** is not more guards. It is making the
existing ones run — and noticing when a suite goes red and stays red, because a
permanently red CI is indistinguishable from no CI.

**`check:share` is ported into the suite — it could not run, and it was
measuring the wrong corpus.** It imports a `.ts` file, so it goes through
`npx tsx`, which needs the Node this repo declares (`.nvmrc` says 22) while the
machine default is **16.16.0**. It died on an ESM error that reads like a code
fault and is not one; `next build` refuses outright for the same reason, which
is the honest version of the same message. **`nvm use` before working here**,
or the first thing touching Node will mislead you.

Its status was UNKNOWN rather than green, and CI never ran it either, so the
one hard limit on the surface the whole growth thesis rests on was unguarded.

The second fault had nothing to do with Node and was worse: it walked
`data/packs/*.json`, the STAGED pack files. Four are behind the catalogue, so
it measured six dropped cookout boards and missed wobble, camera, bought,
spirit, attend and the entire Stoop pack. A guard on content has to read what
ships. The assertion now lives in `share-convention.test.ts`, reads the built
`puzzles.json`, and runs in CI. Red-proofed.

**HEADROOM IS 2 CHARACTERS.** 846 cards measured, worst at 278 of X's 280:

    278/280  Barbecue/crafty/fat        <- written 2026-08-28, blind
    278/280  The Nineties/baring/rain
    274/280  The Stoop/posted/posted

The way this breaks is not a bad clue. It is a GOOD one written three
characters longer than the record, and it breaks for long-streak players
first — the people most likely to paste a card. **The overflow rule sitting 2
left to the operator — "which evidence line drops" — is now nearly due rather
than theoretical.**

**`check:guards` takes longer than ten minutes and MUTATES SOURCE while it
runs.** It is the meta-check: it breaks something, rebuilds, and asserts the
guard notices. Kill it mid-run and the working tree keeps the injected fault —
which happened here, leaving `Rail.tsx` with a `gap-16` that is not real code.
It carries a stale-lock warning for exactly this and it fired. Run it in the
background, never under a timeout, and check `git status` before believing any
run that was interrupted.

## The easy end of the catalogue, and why it is not the ladder

Five boards were authored on 2026-08-28 specifically to widen the easy end,
after the ask "five as easy as CRAFTY":

    wobble  0.0593  THE CHAIR / The Shop      <- easiest board shipping
    camera  0.0636  THE TABLE / The Cookout
    bought  0.0690  THE TABLE / The Cookout
    spirit  0.0756  THE TABLE / The Cookout
    attend  0.0770  THE TABLE / Sunday Dinner

**The number was not fully reachable and this is worth knowing before anyone
asks again.** Across all 2,247 viable unclaimed bases, exactly FIVE can reach
CRAFTY's 0.0629, and three of them carry no theme vocabulary at all — hitting
the number exactly would have meant shipping TYRANT and CHUMPS as celebrated
prize words. Difficulty is answer space; it does not care what the word is.

**CRAFTY's clues were rewritten the same day.** Three of six rows were written
from inside the practice — `cart` assumed a burn barrel feeds a pit, `fat`
cited the whole-hog argument as its own reason, `fry` assumed skin is crisped
and passed round. They now put the object or the action on screen. The
eastern-NC barrel stays, because it is canon-verified and it is the
specificity that makes the board ours.

**None of this changes the warm-up ladder, deliberately.** All five are
ladder-ELIGIBLE — 0/6 recall-gated, so they pass the guard — and every one is
easier than WARMTH (0.090) and DEPICT (0.096). They are still not the ladder,
for one reason: **they have not been read by a human.** The first board a
stranger meets is the worst place in the product to put unreviewed cultural
content, and swapping the ladder onto a lower difficulty number would be the
exact error ruling 2 was raised to correct, running in the other direction.
Revisit after the readers, not before.

## Two traps found on 2026-08-28, one now guarded

**Four pack files are BEHIND the catalogue** — `cookout.json` (missing three
shipping boards, still carrying six that were dropped), `shop.json`,
`beautysupply.json` and `roadtrip.json` (ten more between them). `merge-pack`
replaces a theme's boards wholesale, so running it on cookout would have
deleted three boards authored that morning and resurrected six removed on
purpose, leaving only a large diff as evidence.

`merge-pack` now REFUSES when a merge would delete a shipping board the pack
file does not contain, behind its own `--allow-drops` flag rather than riding
on `--force`. The pack files themselves are still behind; that is a real
divergence and nobody has decided which direction is correct.

**AUTHORING.md was wrong, not stale.** It opened with "six DISTINCT letters"
long after `vet-bases.mjs` relaxed the rule to at-most-one-doubled-letter. It
is binding on anyone writing content, so it was a wrong instruction rather
than an out-of-date comment, and it nearly cost WOBBLE and ATTEND — both
legal, both now in the six easiest boards shipping. Fixed, and two tests now
pin the rule the prose describes, including one asserting the relaxation is
actually exercised so a quiet return to six-distinct cannot leave the
paragraph describing nothing.

## Gate zero exists, is frozen, and has never run

`docs/gate0.html`, and it is the single highest-value thing a human can do.

Four first-run variants are built and guarded behind `?g0=a|b|c|d`, the kill
rule is frozen at 60% Read / max 20% Quit over twelve strangers, and
`check:gate0` asserts each variant shows exactly what it claims — including that
a player with no parameter is on the shipping path.

**One thing before it runs, and one fact about it:**

- **It runs on a GENERAL board, and that is now wired end to end.**
  Sitting 2 ruled it: as configured the test could not tell its own failure
  modes apart, because a Miss might be "the mechanic is unclear" or "this clue
  is outside my world" and those need opposite fixes.

  All three parts are in. `build-puzzles.mjs` emits **`gate0Starters`** — ROAD
  TRIP/TRUNKS then GARDEN/WRONGS, named rather than sorted, chosen because
  every clue lands for anybody who has been in a car. `puzzleForPlayer` takes
  the override, and `Game.tsx` passes it whenever the `g0` parameter is
  present — **presence, not variant**, so A meets the same board as B/C/D and
  a typo'd `?g0=B` is still a run.

  One thing came out of wiring it that is worth knowing before the run. The
  site is a static export, so the query string does not exist at export time:
  the prerendered HTML carried the shipping board and the swap landed about a
  second AFTER hydration — measured, wheel AHMRTW becoming KNRSTU with the
  page sitting there. A board changing under a stranger inside the first
  second is the exact window this test measures. A head script now holds the
  paint for `?g0=` URLs only; a player with no parameter never enters that
  branch. `check:gate0` reads the board on the **first visible frame**, which
  is what a fixed wait failed to catch, and it is red-proofed both ways.

- **Wipe the device between every stranger.** The teach card retires after the
  first banked word and that is persisted, so stranger two silently becomes the
  control. Skip it and every run after the first is contaminated toward D, and
  the tallies will look perfectly reasonable.

Do not route it through Play internal testing — twelve Google accounts is
brutal friction. Run it on the web.

## What shipped since this file was last accurate

Between 2026-08-26 and 2026-08-28:

- **Two packs**: The Tailgate and The Gym, catalogue 118 → 131 (now 136).
- **The whole Android chain**: account, verification, app, signing, both
  fingerprints, a built and signed bundle.
- **A path-to-production board** — `docs/tracker.html`, self-publishing, done
  items collapsed. 72/103 across the ten-stage spine, 4 blockers, 10 decisions.
- **A wing scorecard** — `docs/SCORECARD_2026-08-27.md`. Three wings at 9,
  two UNSCORED because gate zero has not run, and the surface scores **BLOCKED**
  because Cultural Authenticity holds a live block. That is the honest ceiling:
  five dimensions can reach 9 without a human and five cannot.
- **A marketing roadmap** — store readiness §6, four phases with exit conditions
  rather than dates. Its binding fact: marketing here is **blind by design**,
  because `connect-src 'self'` means no UTM lands anywhere and no share is
  counted. The only instruments that will ever exist are the store consoles and
  the reviews.
- **New guards**: `check:a11y` (WCAG AA, calibrated against known ratios before
  it will report anything), `check:listing`, `check:share`, `check:gate0`,
  `check:rating`.
- **`src/lib/version.ts`** — versionCode `YYMMDD*100+seq`, 14 tests, and it
  produced the real build's 26082700/26082701 on first contact.
- **`src/lib/entitlement.ts`** — the store is the ledger, never localStorage.
  Possibly sunk if the model lands on paid download; recorded rather than
  quietly kept.

### The lesson worth carrying, because it repeated nine times

Nine separate measurement or verification defects in one session, and in **every
case the app was fine and the instrument lied**. Contrast buckets too coarse.
Calibration at 44px for text measured at 12px. Reduced-motion flagged on a
correct accommodation. Target sizes measured without `hasTouch` — which produced
a twenty-seat board ruling on a fabricated number. A build check happy with a
page that could not parse. A CI check that read the newest run instead of the
one for the pushed commit. A replace that matched nothing and said nothing.

The two dangerous ones were not measurements, they were **checks that could not
fail**. A broken measurement gives a wrong number you might notice. A check that
cannot fail gives you green, and green is what you stop looking at — it is how
production was reported as carrying a change it never received.

**The rule that came out of it: a check must assert the thing EXISTS before
asserting it is green.** Absence and success look identical to a naive query.

## What to do next, in order

1. **Upload the bundle** to internal testing and look for the address bar.
2. **Run gate zero** — it is on the general board and green; wipe between strangers.

**Before the bundle upload, run `npm run check:assetlinks`.** It fetches the
file the way Android does — no redirects followed, content-type asserted,
fingerprints diffed against the repo — and treats an unreachable host as a
failure rather than a pass. `assetlinks.test.ts` only ever checked the LOCAL
file's shape, and Android never reads that one. A redirect, a `text/plain`,
or a deploy stale by one fingerprint all surface as an address bar and all get
misdiagnosed as an app fault; one session was already lost to exactly that.
3. **Commission the cultural readers.** One per pack, and it is the ceiling on
   everything: no amount of engineering moves Wing 9.
4. **Settle the model**, then price it. Both wait on gate zero.

Everything else on the board is behind one of those four.
