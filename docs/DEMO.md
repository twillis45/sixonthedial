# Demo runbook

Written 2026-09-13, against the build at this commit. Every board, answer and
claim below was read out of the shipped catalogue or driven in the real app, not
remembered.

Two paths, because they are different demos and mixing them loses both:

- **Path A — the game.** Five minutes, for somebody who might play it.
- **Path B — the claims.** Five minutes, for somebody technical, or a store
  reviewer, who wants to know whether the things it says about itself are true.

---

## Before you start

| | |
|---|---|
| Where | `sixonthedial.com` |
| Browser | **A private window, every time.** Progress is `localStorage`. The teach card retires after the first banked word and stays retired, so a window you have already played in opens on the wrong beat — and the first beat is the demo. |
| Device | A phone if you have one. It is a thumb game; a laptop demo undersells the input. |
| Reset between demos | Clear site data, or open a new private window. Same reason. |

**Do not use a `?g0=` URL.** That parameter swaps the opening ladder for a
gate-zero run and will hand you a board this runbook does not describe.

---

## Path A — the game

The first board is fixed and deliberately easy. It is the same board every
first-timer meets, by ruling, and it is a general-audience one rather than a
cultural pack.

### Board 1 — Warm-up 1 of 2

**Sunday Dinner · THE TABLE** — *"The oven door, and the things kept behind it"*
Dial: **A H M R T W**

| Row | Answer | Clue |
|---|---|---|
| 3 | **HAM** | In there since one, foil tented, waiting for everything slower than it |
| 3 | **HAT** | Still on, because she came straight from church and has not sat down |
| 4 | **WARM** | Not hot. The distinction is the entire skill and it is never explained |
| 4 | **THAW** | Started Friday night, in the fridge, because Sunday was always the plan |
| 4 | **WHAM** | The oven door, closed with a hip, both hands full |
| 6 | **WARMTH** | What the lowest setting is for, and it holds four dishes at once |

**Play it in that order.** Opening on a three-letter row means they see a word
bank inside ten seconds, and leaving WARMTH until last means the board lands on
its own title.

The six beats, in order:

1. **Read the scene line and the top clue out loud.** This is the product. The
   letters are the category; the writing is the reason to choose this one.
2. **Tap H–A–M.** It banks, the teach line retires, the rank moves off Novice.
3. **Do the next row by dragging across the letters instead of tapping.** Both
   are first-class and neither is the "real" way — worth showing, because every
   competitor trains people to expect only one.
4. **Hit Shuffle once.** The shape changes and the answers do not. It is a
   thinking aid, not a mechanic.
5. **Finish on WARMTH.** The board lands on the word in its own scene line.
6. **Board 2 is The Cookout / DEPICT** — dip, pit, ice, tide, diet, depict. Play
   one row of it and move on; the point is that board 1 was not a one-off.

Then, if there is interest: the **themes catalogue** (17 packs), the **rank
ladder**, and **settings** — theme, accent, feedback intensity, text size.

### The one extra beat worth setting up

On 131 of the 518 boards a clue is written *around* its answer with the answer
blanked, and solving the row puts it back. It is the best thirty seconds in the
product and **neither warm-up board has one** — so it only happens if you go
looking for it.

Open the catalogue → **The Nineties** → the **INMATE** board. Four of its six
rows are redacted clues:

| Answer | Clue as shown |
|---|---|
| **NAME** | Destiny's Child wanted you to say it — Say My ———, 1999 |
| **MINE** | Brandy and Monica, 1998 — The Boy Is ———, thirteen weeks of arguing over him |
| **TIME** | SWV's debut, 1992 — It's About ——— |
| **MINT** | ——— Condition — Minneapolis, a full band, and no interest in being a boy band |

Solve NAME and let them watch the line complete itself. Do this **only if the
room is already interested** — it is board three of a demo, not board one.

### What not to do in Path A

- **Do not hunt bonus words.** It stalls the demo, and there is a known open
  item (`b4s`) where a long bonus run can overflow the "Your words" card,
  because the guard that should catch it measures a board with almost none
  found. It is on the board, unfixed, and it is avoidable in a demo.
- **Do not spend a hint** unless asked to show one. There is no undo.
- **Do not name a price.** The model is decided (packs sold outright, once, no
  subscription); the number is not.
- **Do not say the packs have been community-reviewed.** See the third answer
  below.

---

## Path B — the claims, and how to verify each one live

The pitch here is not "it is private". It is **that the privacy claims are
structural and checkable**, which is a different and much stronger thing. Work
down the table in the browser with them watching.

| Claim | How to show it, in front of them |
|---|---|
| Nothing about your play leaves the device | DevTools → Network. Play a whole board. Every request is same-origin. |
| …and it *cannot*, rather than *does not* | View source → the CSP meta tag: `connect-src 'self'`. It is a structural limit, not a policy page. |
| No analytics or ad SDK in the build | `node -p "Object.keys(require('./package.json').dependencies).join(', ')"` → `next, react, react-dom`. Three runtime dependencies, total. (Do **not** use `npm ls` — it prints dev dependencies and extraneous platform packages, and the noise eats the point.) |
| Progress is yours and local | Application → Local Storage. Clear it, reload: the streak and the cleared boards are gone, and there is no copy anywhere to restore from. |
| The required legal pages are published **and readable** | `/privacy`, `/terms`, `/support`. Scroll each to the last line. (Until this commit they could not be scrolled at all — see `b3k` in the handoff. Worth telling a technical audience: it is a better story than pretending it never happened.) |
| The clues are researched, not decorated | `/press` for the position, then `data/canon.json` for the citations. `npm test` fails the build if a cited clue is edited without updating its canon entry. |
| The claims have checks behind them | `npm test` → 376 tests in 18 files. `npm run check:press`, `check:pages`, `check:a11y`, `check:listing`. |
| Contrast and targets hold to WCAG AA | `npm run check:a11y` — it refuses to report anything until it recovers four known contrast ratios at 12px, 13px and 44px. |
| The Android wrapper would verify | `npm run check:assetlinks` — fetches the live file the way Android does, and treats an unreachable host as a failure rather than a pass. |

### What not to do in Path B

- **Do not open or install the Android build.** It is signed and it has never
  been opened on a device (`b3j`). The one thing that demo would prove is the
  one thing nobody has checked.
- **Do not describe it as available on either store.** Neither build has been
  submitted.

---

## The three questions you will get, and the true answers

**"How many people play it?"**
Nobody, meaningfully, and there is no way to count. No telemetry ships and no
store build is released. That is not a dodge — it is the same fact as the
privacy claim, and saying so is what makes the privacy claim credible.

**"What does it cost?"**
The daily board is free. Themed packs are sold outright, once, with no
subscription and no timers. The price is not set, and there is no date.

**"Have people from these communities reviewed the packs?"**
A standing review bench reads them. **That is structured perspective, not
community consultation** — the project's own documents say so in those words. A
paid reader from each community is budgeted and has not happened for a single
pack. If somebody writes that the packs are community-reviewed, correct it.

---

## If something goes wrong mid-demo

| Symptom | Fix |
|---|---|
| Stale content after a deploy | Hard reload. The service worker is network-first with `cache: 'no-store'`, so one online load takes a correction. |
| Board is not the one above | You are in a window with saved progress, or on a `?g0=` URL. New private window, plain URL. |
| Everything looks unstyled | The host stripped `_next` (Jekyll). That is a deploy problem, not a demo one — fall back to a local `npm run build && npx serve -l 4310 out`. |

## Running it locally instead

    npm ci
    npm run build
    npx serve -l 4310 out      # then http://localhost:4310

The export is static — no server, no database, no environment to configure.
That is itself a demonstrable claim: `npm run check:routes` enumerates every
source file and asserts zero server-execution surfaces exist.
