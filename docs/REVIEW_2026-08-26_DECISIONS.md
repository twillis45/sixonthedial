# Decision board — 2026-08-26

Convened under operator override (20 seats, players wing included). Seats drawn
from `REVIEW_BOARD_GAME_WING.md` and `PLAYER_BOARD.md`, which are authoritative.

**The doctrine's own caution, recorded once:** the convening skill holds that
above 12 seats accountability dilutes and a board drifts toward mush. Twenty was
directed. It is mitigated here by seating no general observers — every seat is
attached to a named open decision, and the cut list below says who was left out
and why.

**Limits that do not move.** These are lenses, not people. No real person
reviewed this build, no quote here is attributed to anyone, and the players wing
is structured personas, not user research. A persona cannot rage-quit, so it
cannot tell you the truth about retention. The cultural seat is structured
perspective and is **not** community consultation — that still requires a real
reader per pack, which is store row 1.10 and remains the blocker.

---

## The 20

**Store & release (4)** — App Store Review specialist · Play policy specialist ·
mobile release engineer · privacy counsel

**Monetization (3)** — F2P puzzle-economy designer · subscription strategist ·
Ramit Sethi *(is the paid thing worth paying for, and is the ask honest)*

**Game design (3)** — Jesse Schell *(does every system serve the essential
experience)* · Zach Gage *(teaching without tutorials)* · Josh Wardle *(radical
restraint; the anti-engagement-farming conscience)*

**Accessibility (2)** — WCAG 2.2 / mobile-a11y lead · motor-accessibility
specialist

**Onboarding & feel (2)** — Luke Wroblewski *(thumb zones)* · Emil Kowalski
*(purposeful motion, haptic and audio timing)*

**Cultural authenticity (1, holds a block)** — the culture bench seat

**Players (5)** — Latoya, 45, Wordscapes/Word Cookies, 40 min/day, ad-tolerant ·
Ellen, 49, NYT Games subscriber at $6/mo · Jess, 33, limited fine motor in one
hand · Marcus, 43, playing with his 9-year-old · Karen S., 57, non-Black player
meeting the packs

**Cut, and why:** Marisol (first-ever word game) — her finding is onboarding and
the first-run teach already ships and is guarded by `check:intro`. Bea (200%
text) and Tom (deuteranopia) — their dimensions were **measured** clean this
week rather than debated, by `check:a11y` and by the Tide/Plum accents; a seat
that would only re-argue a measurement is decoration. Priya (900-day streak) —
retention is not on today's decision list. Speedrunner, Scrabble and ESL seats —
no open decision touches them.

---

## Rulings

Each is a recommendation with its evidence. The operator can overturn any of
them; what they cannot do is claim one was checked when it was not.

### 1. Apple guideline 4.2 — DEFER iOS. Ship Android first.

**Ruling: do not submit a wrapper to Apple.** Not now, and not as a first
release.

The roster names 4.2 "the live grenade" and it is aimed correctly. What exists
today is a static export with no native capability — no widget, no Game Center,
no Live Activity, nothing the web build cannot do. That is the textbook shape of
what 4.2 rejects, and a rejection is not free: it attaches to the developer
account and colours later reviews.

Android has no equivalent risk. Play accepts a TWA, the domain work that gated
it is done, and `assetlinks.json` serves from the origin root. **Every remaining
Android blocker is one signup away.**

What would make iOS viable later is a build, not a wrap: a home-screen widget
carrying today's board, Live Activity for a streak, Game Center for the ladder,
or native haptics beyond what Safari exposes. Any one of those is a genuine
answer to 4.2. None of them exists today.

*Dissent recorded:* Ellen (NYT subscriber) notes the audience most likely to pay
$6/mo for a daily word game is on iOS. That is a real cost of deferring, and it
is a reason to build the native features, not a reason to risk 4.2.

### 2. COPPA and the age band — rate for everyone, and hold the line that earns it

**Ruling: Everyone / 4+, with "no data collected" on both forms.**

This is the strongest COPPA position available and it is already true rather
than promised: no accounts, no ads, no analytics, no third-party SDKs, and
`connect-src 'self'` in the shipped CSP as the structural backstop. COPPA
exposure in a game like this lives almost entirely in advertising and analytics,
and neither exists.

Marcus playing with his nine-year-old is therefore a supported case, not a
liability.

**The condition attached, which is the whole point:** this ruling is contingent
on the privacy position, not independent of it. Adding an ad SDK, an analytics
SDK, or a third-party crash reporter reverses it and drags in Play's Families
policy and Apple's kids rules. See ruling 4.

**One check still owed, and it is not optional:** nobody has audited the clue
corpus for age-appropriateness. The themes include the barbershop, spades and
90s R&B — adult cultural settings, which is not the same as adult content, but
"not the same" is a claim and there is no check behind it. Ruling 2 is
provisional until that sweep runs.

### 3. Business model — paid packs. No ads, no subscription.

**Ruling: a free daily puzzle, with hand-authored themed packs sold outright.**

Three seats converge and one dissents.

*Against ads:* they require SDKs that reverse ruling 2 and break a privacy claim
already filed with both stores. Latoya is ad-tolerant and plays 40 minutes a
day, and she is the category leader's player — but serving her means becoming
the category leader's business, and the category leader earns roughly 55% of
revenue from advertising. That is a different product.

*Against subscription:* Ellen pays $6/mo to NYT for **five games daily**, in
perpetuity. A subscription is a promise about cadence. This catalogue is 118
boards across 14 carrying themes, and six of those themes are shallow. Selling a
recurring promise the content pipeline cannot keep is the dishonest ask Sethi's
seat exists to refuse.

*For paid packs:* it matches what the thing actually is — finite, hand-authored,
researched, cited. You can sell that honestly because it is what was made.

*Consequence:* store row 4.1 goes live. Digital goods must use Play Billing and
StoreKit, entitlement cannot live in `localStorage` where a player can edit it,
and restore-purchases becomes mandatory on Apple. That is real work and it was
blocked behind this ruling.

*Dissent recorded:* the F2P economy seat notes that a hint currency already
exists with a faucet and a sink, and that hint packs are the conventional
monetization for exactly this loop. Declined on Wardle's grounds — selling
relief from a difficulty you control is the engagement-farming this product has
otherwise refused. Worth revisiting only with real retention data, which does
not exist.

### 4. Crash reporting — no third-party SDK

**Ruling: ship without a third-party crash reporter. Do not trade the privacy
position for it.**

The rollout plan says halt on a crash-rate move, and there is no crash
reporting, which is a real gap. But a third-party reporter is a data-sharing
decision that reverses rulings 2 and 3 and breaks a filed claim, and it would be
traded for telemetry on a binary that, by design, almost never changes.

What covers the gap instead:

1. **The web layer is the rollback.** A bad clue or logic change is `git revert`
   plus a deploy, and network-first with `no-store` takes it on one online load.
2. **Stage the rollout small**, held at least one full daily cycle, because a
   bug in daily rollover is invisible inside an hour.
3. If crash data is genuinely wanted later, it should be **first-party and
   opt-in** — an error the player chooses to send — which keeps "Data Not
   Collected" honest.

### 5. Thumb targets — raise the four header controls, leave the rows

**Ruling: header controls to 44. Hint rows stay at 24.**

Measured, not argued: 81 controls sit under Apple's 44px bar. WCAG's floor is 24
and everything clears it, so none of this is a conformance failure.

The four header controls are 36×36 and are persistent chrome — present on every
board, in the corner, reached one-handed. Jess's seat is decisive: a control you
hit on every session should not be the one you miss. Raising them costs layout
work against a rail tuned over 108 viewport combinations, and that cost is worth
paying for four controls.

The hint rows at 24×24 stay. They sit in a spaced list, they are not persistent,
and enlarging them pushes the ladder — which is the component that has already
cost the most layout work in this project.

### 6. Never claim the wheel — CONFIRMED

Wordscapes is built on the letter wheel and leads the category. No listing,
landing page or preview may use "only", "first" or "unique" about the dial.
Karen S.'s seat adds the adjacent trap: do not describe the themed packs as
teaching or explaining Black culture to anyone. They are made for the people in
them first.

---

## What this board did NOT settle

- **Cultural reader per pack** — cannot be settled by a board. It needs a real
  person per pack and remains store row 1.10.
- **Prize words for six packs** — `prize-words.mjs` ranks and deliberately
  refuses to choose, because "is this satisfying to be rewarded with" is human
  judgment. Unchanged.
- **Campaign theme** — deferred to the cultural seat, which cannot rule without
  the reader above.
- **Preview audio** — Kowalski's seat wants the real mix; the pipeline cannot
  capture page audio. Open as an engineering task, not a decision.
- **The age-appropriateness sweep** that ruling 2 depends on.

---

## Addendum — the age-appropriateness sweep ruling 2 depended on

`node scripts/check-rating.mjs`, 2026-08-26. 132 boards, 1,848 strings, 14
packs. **21 hits. Twenty are false positives. One is real.**

The false positives are the whole reason the sweep was worth running, because
every one of them is what an automated store scan or a reviewer skimming a word
list at speed would see, stripped of its context:

- **`pot liquor`** — the cooking liquid off a pot of greens, in the Sunday
  dinner pack. The clearest case in the corpus: entirely food, reads as alcohol.
- **`breast`** — a chicken breast, and it is the *base* of the first board in
  the cookout pack, so it appears on the wheel.
- **`forty`** ×4 — the number. "Minute forty", "forty times", "forty minutes".
- **`Brandy`** — the singer. *Brandy and Monica, 1998.*
- **`knife`** — the man carving at the pit.
- **`shot`** — where a video *got shot* when the budget ran out.
- **`gin`**, **`shot`** as answers — dictionary words their bases happen to
  spell. That is the English language, not a reference, and removing one means
  rebuilding a board.

**The one real hit** is in `cookout/phased`, the clue for `ash`:

> Flicked off the end of a cigarette nobody admits to having

That is a tobacco reference in authored prose, and it changes an answer on a
form that asks the question directly.

**Not ruled here, deliberately.** Rewriting it would make the questionnaire
tidier, and it would also be sanitising an observed detail out of a pack about
Black American cultural life to make a form easier — which is the exact move
the cultural bench exists to object to. That is a content decision belonging to
the cultural seat and the reader at row 1.10, not a compliance chore to be
quietly discharged by an agent.

Two honest options, both defensible:

1. **Keep the clue** and answer the tobacco question truthfully. One mild,
   non-glamorising reference does not by itself push a rating out of Everyone,
   but it must be declared rather than overlooked.
2. **Rewrite the clue** — and record that it was rewritten for a form, so
   nobody later mistakes the sanitised version for what was observed.

Ruling 2 stays **provisional** until one of those is chosen. Everything else in
the corpus is clear.

### Ruling on the one real hit — REWRITTEN 2026-08-26, and why

Operator chose to rewrite. Recorded here rather than only in a diff, because a
rewrite that is not explained becomes, within a year, indistinguishable from
what was always there.

**What was there**, on `cookout/phased`, the board whose scene is *the card
table under the tree*:

> ash — Flicked off the end of a cigarette nobody admits to having

That was an observed detail. The person who quit, at the edge of the table,
and everybody politely not seeing it. It sat in the same register as its
neighbours on that board — *"the reason two grown people are standing up"*,
*"and it is not the cards"*.

**What replaced it:**

> ash — What blows over from the grill and lands on a score pad two people
> already disagree about

**Why:** both stores ask directly whether the app references tobacco. The old
clue made the honest answer yes. It was one mild, non-glamorising reference and
would probably not have moved the rating on its own — the rewrite buys a
cleaner form, not a rescue.

**What was given up, stated so it is not lost:** a specific piece of observed
life, removed because a questionnaire asked. The replacement is not worse
writing — it keeps the board's running argument and ties the card table to the
grill it is sitting next to — but it is *safer* writing, and safer is not the
same as truer. If a real reader later says the original was the better clue,
that reader is not wrong, and this note is what lets them see there was a
choice rather than an absence.

The sweep now reports zero tobacco hits. Ruling 2 (Everyone / 4+) is no longer
provisional on this item.

---

## Ruling 5 — WITHDRAWN 2026-08-26. The premise was a measurement error.

**The four header controls already meet 44px on a phone.** They are
`h-9 w-9 touch:h-11 touch:w-11` — 36 with a mouse, 44 with a finger. No phone
has ever rendered them at 36.

`check-a11y.mjs` set width, height and deviceScaleFactor and **not `hasTouch`**,
so Chrome reported no touch, the `touch:` variant never applied, and the guard
measured a control at a size that does not exist in the field. That produced
"81 targets under the thumb bar", and this board ruled on it. With touch
emulated the count falls to 69, and the twelve that vanish are exactly those
four controls across three themes.

**This is worse than the session's other instrument defects and worth saying so.**
The other six produced bad readings. This one produced a *decision*: twenty
seats deliberated, the motor-accessibility seat was decisive — "the control you
hit on every session should not be the one you miss" — and the problem did not
exist. The reasoning was sound on the input it was given. The input was
fabricated by the harness.

It is also the argument *for* measuring rather than against it. Nothing but a
second measurement would have found this; no amount of care in the room would
have.

**What is actually under the thumb bar on a phone**, after scoping the 44px bar
to touch surfaces (it is Apple's guidance for a finger, and warning about it on
a mouse-driven desktop is noise nobody can act on): 9 controls, every one of
them exactly 24px tall and therefore clearing WCAG's own floor.

- The six hint rows — **already ruled to stay**, and that ruling stands.
- `Shuffle`, `0 bonus`, and the puzzles chip — 24px tall pills, not ruled on
  before because they were buried under twelve phantom findings.

Left unchanged and recorded rather than quietly fixed: they are height-
constrained pills in a laid-out row, none is persistent chrome, and after this
particular error the right move is to put the corrected number in front of a
human rather than act on it immediately.

---

# Sitting 2 — 2026-08-27 · What happens next

Seven seats, not twenty. The standing override permits twenty; the convening
doctrine says size to the decision, and a sequencing question does not need a
panel too large to disagree in. Seats: **Josh Wardle** (restraint), **Zach
Gage** (teaching without tutorials), **Ramit Sethi** (is the ask honest, and is
the spend), **a mobile release engineer**, **the cultural authenticity seat**
(holds a block), **Karen S.** (non-Black player meeting the packs), and
**Marisol** (first-ever word game, the seat gate zero exists to test).

## The finding that arrived before the question could be asked

The recommendation put to this board — *run gate zero before spending on
readers* — rested on an assumption nobody had checked: that gate zero tests the
mechanic.

**It does not, as currently configured.** The cold-profile ladder is `crafty`
and `nicked`, and both are culturally-specific boards. The first thing any
stranger sees is Eastern Carolina whole-hog barbecue:

> cart — *Ash from the burn barrel to the pit, all night, by somebody's nephew*

That clue requires knowing a burn barrel feeds a pit. Nothing chose it as an
onboarding board; it is simply the easiest board by difficulty sort (0.06).

## Ruling 1 — Gate zero still goes first, and it runs on a GENERAL board

**Unanimous on the sequencing.** Sethi's seat is decisive on spend: commissioning
$1,100–2,200 of reader time to review clue quality, before twelve strangers have
shown that anybody can reach a clue at all, buys careful review of content nobody
gets to. Wardle's restraint agrees from the other side — do not spend ahead of
evidence you can get for free in an afternoon.

**Unanimous, and material, on the board it runs on.** As configured the test
cannot distinguish its own failure modes: a Miss might be *the mechanic is
unclear* or *the clue is outside my world*, and those need opposite fixes. Gage's
seat: a tutorial-free game must be legible on its own terms before cultural
specificity is added as a variable, or you learn nothing about either.

Garden and tailgate are general packs and both now ship. **Gate zero runs on a
general board.** This is a change to the test rig, not to the product.

## Ruling 2 — The warm-up ladder is a product question, and it was never decided

Karen S.'s seat, and this is the sitting's most useful output.

A first-time player's first board is a cultural board **because the difficulty
sort put it there**. That is a default, not a decision. It may well be the right
one — the packs are the product, and leading with them is a defensible stance —
but nobody has taken it deliberately, and the same clue that delights an insider
can read as a locked door to someone the pack was not written for.

Referred back to the operator as an open decision. The board declines to rule it
here because it is a positioning question and belongs in the marketing track's
phase 1, not in a sequencing sitting.

## Ruling 3 — Reader outreach starts now; commissions wait

The cultural seat's **dissent is recorded and is not overruled**: deferring
readers behind a legibility test reads as ranking the cultural work second, and
this bench has been explicit that structured perspective is not consultation.

What the sitting rules is narrower than the dissent fears. **Outreach — finding,
asking, scheduling — starts immediately**, because it costs nothing and runs on
other people's calendars. Only the *payment* waits on gate zero, and it waits
weeks at most. If gate zero passes, nothing is lost. If it fails, the readers
are still needed and are simply not yet spent.

The seat's one binding condition, accepted: **gate zero does not become a reason
to show unreviewed cultural material to strangers at volume.** Ruling 1 already
satisfies it — the test moves to a general board — and the condition stands
independently in case the test rig changes again.

## Ruling 4 — Buy the Play account now. Not Apple.

The release engineer's seat, uncontested. Identity verification runs on Google's
clock, and the signing fingerprint it produces is the last placeholder in
`assetlinks.json`. It is a queue you join, not a bet you place. Apple stays
deferred under ruling 1 of the first sitting: $99 buys nothing until a native
capability exists to answer 4.2.

## What this sitting did not settle

- **Which theme fronts the campaign**, and now also **which board a first-timer
  meets** — both belong to the cultural seat, and both wait on a reader.
- **The share card's overflow rule.** Not a board question; the operator picks
  which evidence line drops.

---

# Sitting 3 — 2026-08-27 · Paid app, reopened by the operator

Six seats: **Ramit Sethi** (is the ask honest), **Josh Wardle** (restraint,
anti-engagement-farming), **the F2P puzzle-economy designer**, **a mobile
release engineer**, **Latoya** (Wordscapes, 40 min/day, ad-tolerant), and
**Ellen** (NYT Games subscriber, $6/mo).

The operator's instruction is *"it has to be paid."* The board takes that as a
position to test, not a preference to ratify — and finds the position stronger
than ruling 3 credited, on grounds ruling 3 never examined.

## What ruling 3 got wrong

It framed the choice as *paid packs versus ads versus subscription* and never
asked the prior question: **paid download versus free download.** "Sold
outright" was written to rule out a subscription, and it was then read as
settling a model it had not considered. That is a real gap and the operator
found it.

Three arguments for paid that the first sitting did not weigh:

**It deletes most of wing 6's remaining work.** A paid app has Google collect
the money. No Play Billing integration, no StoreKit, no restore-purchases flow,
no receipt validation, and no forgeable entitlement — the defect ruling 3 spent
a paragraph on simply stops existing. Wing 6 sits at 5 largely because billing
is unbuilt; paid download makes most of it unnecessary rather than pending.

**It is the purest form of the anti-engagement-farming position.** Wardle's seat
is decisive here and it argues *for* the operator. A paid app has no mechanism
to manipulate: no hint economy to squeeze, no timer to sell relief from, no
upsell inside a puzzle. The player pays once and the product has no further
interest in their attention. Every dark pattern this project has refused is
structurally impossible.

**The thing being sold is a finished artifact.** 300 hand-authored, researched,
cited puzzles is a book, not a service. Sethi's seat: you can ask for money for
that honestly, and the ask is cleaner than metering it out.

## The cost, which is the acquisition thesis

**Marketing ruling m1a is the share loop, and a paid download breaks it.**
Somebody pastes a result; their friend taps it and hits a paywall instead of a
board. Wordle grew because the friend could play immediately. Latoya's seat is
blunt: she has never paid up-front for a word game and will not start with an
unknown one. Ellen pays $6/mo — but to a publisher with five daily games and a
masthead, which is a different transaction from a stranger's first purchase.

The release engineer adds the discovery point: a paid word game from a first-time
developer, ranked against free Wordle and Wordscapes, has close to no organic
install path, and no free tier means no volume of ratings to rank with.

## The option neither sitting had named

**Free download with a single one-time unlock is economically identical to a
paid app and keeps the share loop.** One price, paid once, no subscription, no
metering — and a friend who taps a shared card still lands on a playable board.
It costs the Play Billing work that paid download avoids, and it is the reason
most premium mobile games stopped charging up front.

That is a third position, and it deserves to be chosen or rejected deliberately
rather than by default.

## Ruling — set it PAID on the create-app form, and settle the model after gate zero

**Unanimous, and it is not a compromise.**

Play's own warning decides the immediate question: **you cannot change a free
app to paid after publishing, but you can change paid to free.** Pricing is
editable up to publish. So on this form:

- **Paid** keeps every option open — paid download, or drop to free later with
  or without an unlock.
- **Free** permanently forecloses paid download, on a model question that has
  now been reopened and that gate zero has not informed.

Choosing Paid today costs nothing and closes nothing. Choosing Free closes a
door that cannot be reopened.

**The model itself is deferred to after gate zero**, where it belongs: whether
strangers can understand the first board bears directly on whether they will
buy it unseen. The three live options are paid download, free plus one-time
unlock, and free plus per-pack purchases — and the operator's stated preference
for paid is on the record as the starting position.

**Consequences recorded now**, so nothing is discovered later:

- `LISTING.md` says *"Free to play, every day"* in copy that reaches buyers.
  That sentence is now provisional and must not ship until the model is settled.
- Store row 4.1 (IAP required for digital goods) becomes moot under paid
  download and live under either free option.
- `lib/entitlement.ts` is unnecessary under paid download. Twelve tests and an
  afternoon; recorded as possibly-sunk rather than quietly kept.
