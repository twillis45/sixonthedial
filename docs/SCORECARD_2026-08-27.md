# Wing scorecard — 2026-08-27

Supersedes `wing-scoreboard.html`, which was written **2026-08-11** and says
"all ten wings at parity or ahead". That claim is sixteen days old and predates
the domain, the store assets, the accessibility guard, the Nielsen pass, the
competitive sweep, accents, settings, the studio theme, reminders and the
listing. Most of that is improvement — but it is also new surface nobody scored,
and an unrechecked readiness claim is the expensive kind.

## How this is scored, and the two rules that make the number mean something

**10+ means beating the leader, not matching it.** That is this project's own
convention and it is why the target is 9 rather than 7.

**A surface scores as its LOWEST dimension.** Ten wings at 9 and one at 4 is a
4, not an 8.6. Averaging is how a blocked dimension gets hidden.

And a rule this scorecard adds, because the session that produced it needed it:
**a dimension with no check behind it is UNSCORED, not assumed good.** Unscored
counts as the lowest for the purpose above. Seven times this week a measurement
turned out to be measuring nothing while reporting green; a confident number
with no instrument behind it is worth less than an admitted blank.

---

| # | Wing | Score | Standing on |
|---|---|---|---|
| 1 | Game design & core loop | **UNSCORED** | Gate zero built and never run |
| 2 | Layout, hierarchy & visual system | **9** | Rail holds at 108 viewport/text combinations |
| 3 | Interaction, motion & feel | **9** | Motion, drag, depth and feedback all guarded |
| 4 | Onboarding, friction & first run | **UNSCORED** | The bench predicts failure; nothing has tested it |
| 5 | Accessibility | **9** | WCAG AA measured clean, calibrated, red-proofed |
| 6 | Monetization & pay | **3** | Ruled, nothing built |
| 7 | Store readiness & release | **7** | Everything but the accounts |
| 8 | Security, privacy & IP | **9** | Structural, not promised |
| 9 | Cultural authenticity | **BLOCKED** | No pack has had a real reader |
| 10 | Live ops & retention | **4** | A reminder, and no evidence anyone returns |

**The surface scores BLOCKED.** Not 7, not 6.6.

---

## The three that hold at 9

**Layout (2).** The rail holds across 108 viewport and text-size combinations
including a browser-font axis, and the guard is mutation-tested. Not 10: nothing
here beats a leader, it just does not lose.

**Accessibility (5).** 189 text boxes across six surface/theme combinations,
zero contrast failures, every interactive element named, reduced motion
correctly honoured, red-proofed at 118 caught. The instrument calibrates against
four known ratios at 12px before it will report anything — which it earned,
having produced 101 fictions before that gate existed.

**Security & privacy (8).** `connect-src 'self'` makes "nothing leaves the
device" a property of the build rather than a sentence in a policy. Three
runtime dependencies. Both store forms answerable as "no data collected", and
the age rating is now swept rather than assumed.

## The two that are unscored, and why that is not modesty

**Game design (1)** and **onboarding (4)** are the same gap wearing two hats.
Gate zero exists, its kill rule is frozen, all four variants are built and
guarded — and it has been run on zero strangers. The player bench predicts seat
one is gone at 0:40 because the board never says the goal in words. A persona
cannot rage-quit, so that prediction is worth nothing until a hallway tests it.

These are the two dimensions where the leaders are strongest and where this
product has the least evidence. Scoring them from taste would be inventing the
number the whole exercise exists to avoid.

## The two that are genuinely low

**Monetization (6) — 3.** Ruled on 2026-08-26: free daily, packs sold outright.
Nothing is built. No IAP, no StoreKit, no Play Billing, and entitlement still
lives in `localStorage` where a player can edit it. A ruling is not an
implementation.

**Live ops & retention (10) — 4.** A daily reminder ships as a calendar file and
the streak logic is careful about what counts. But retention is the thing this
product lives on and there is not one data point about it. The leader in this
category is a habit, not a game.

## The one that blocks

**Cultural authenticity (9).** `CULTURAL_BOARD.md` states the limit in its own
words: the bench is structured perspective, **not** community consultation, and
one real reader per pack is budgeted before culturally-specific content ships
commercially. That has not happened for a single pack. The wing holds a block,
and the block is live.

This is the ceiling. No amount of engineering moves it — it is a hiring
decision, and until it is made the surface cannot score above BLOCKED however
good everything else gets.

---

## What this means for the "9/10 vs leaders" goal

Reachable by engineering alone: wings 2, 3, 5, 7, 8 — of which three are already
at 9 and store readiness is waiting on account signups rather than work.

Not reachable by engineering: 1 and 4 need twelve strangers, 6 needs a
ruling turned into billing code, 10 needs players and time, and 9 needs a person
who is paid to read.

**The honest end state of autonomous work on this project is five dimensions at
9 and five that require a human to do something.** That is close, and it is not
9/10, and the difference between those two sentences is the whole reason this
file exists.
