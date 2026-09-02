# Reference scans — index

**The waste is not the first scan; it is the fourth scan of the same question
six weeks later.** This file exists so a scan gets found again. Add a row when
one runs.

Created 2026-08-31, backfilling three scans that had already happened and were
never indexed. They were spread across three unrelated documents, which is why a
path audit on 2026-08-30 read `reference-scan` as "partial". **It was not
partial. It ran three times, in three registers, and nobody could find it.**

## The limitation that governs every future scan here

**Mobbin does not index this category's leaders.** Recorded 2026-08-21:

> *"Mobbin indexes none of Wordscapes, Word Cookies or Words With Friends, and
> they are canvas-driven with no readable stylesheet."*

A canvas-driven game has no DOM to capture, so the pattern libraries cannot see
it. Any question about *how word games do it* must be answered from store
screenshots, gameplay video, or play — not from Mobbin. Mobbin remains useful
here for **general app patterns** (progress, streaks, elevation, theming), which
is exactly what the three scans below used it for.

**Do not re-run a Mobbin scan on word-game mechanics.** It has been tried and it
returns nothing. That is a measured result, not an assumption.

## The scans

### Competitive field — the category, not the craft
**`docs/COMPETITIVE.md`** · supply side

**Pattern found:** the letter wheel is **not ours** — Wordscapes is built on it
and leads the category on revenue.
**Our decision:** diverge on content, not on mechanic. No copy may imply we are
alone in the wheel.
**Why:** claiming a mechanic an incumbent owns is both false and checkable, and
the listing check (`check:listing`) enforces it.
**Carries its own "Limits of this sweep" section.** Read it before citing.

### Retention and progress — how leaders show a streak
**`docs/REVIEW_2026-08-21_RETENTION.md`** · Mobbin screens, read not remembered

**Pattern found:** Duolingo uses a dated calendar with a **Personal/Friends**
split — social comparison scoped to friends, never global. Vocabulary shows a
percentile against the population **with no identities attached**.
**Our decision:** diverge. No social layer at all; the streak is private and the
freeze mechanic is shown before the miss, not after.
**Why:** a global ladder needs an identity system this product deliberately does
not have, and fear of losing a streak is what makes people stop opening an app.

### Visual system — elevation and tint
**`docs/BRAND_KIT.md`** · Mobbin, 8 dark-mode + 6 light-mode leaders

**Pattern found:** **none of the fourteen climb cool with elevation.**
**Our decision:** follow. Every surface sits at a flat +3 blue-over-red.
**Why:** the shipped gradient had elevation encoding temperature as well as
lightness (2 → 14 dark, up to +43 light), so a surface read cooler the higher it
sat. Elevation now means one thing: lightness.

## Rejection without motion — scanned 2026-08-31
**Source:** Mobbin (screens, ios, deep) · 20 results examined, not skimmed

**The question:** `docs/MOTION_STUDY.md` found the success/failure timing ratio
inverts under `prefers-reduced-motion` — success 160ms, rejection 420ms — and
left three options for a ruling. How does the field signal *rejected* when it
cannot move anything?

**Pattern found, and it is unanimous across all 20: rejection is a PERSISTENT
STATE, not a timed event.** A coloured outline on the offending element, plus an
inline message naming what is wrong, held until the input changes. Not one of
the twenty uses a timed cue. There is no duration to get right because nothing
is animating.

Three variants inside that:

- **Outline + inline message** — the default, in the large majority.
  [eBay](https://mobbin.com/screens/10ab7db4-3381-490b-90ab-dde99e30c2dc) ·
  [Tesla Robotaxi](https://mobbin.com/screens/9e3452d9-6a79-40a2-9313-67f24cbbcf61) ·
  [Depop](https://mobbin.com/screens/c63b35d5-9f0b-43da-9c09-91fcc98b5ec6) ·
  [Zopa Bank](https://mobbin.com/screens/dcb456e0-0a61-4505-8c11-5c91a803da22)
- **Persistent banner**, separate from the field, for errors that are not
  field-local.
  [Posh](https://mobbin.com/screens/450e9571-11d6-4e9b-bc7e-5b0373470d9e) ·
  [inDrive](https://mobbin.com/screens/853b177e-0f35-4bbc-aa25-b96a60431ada)
- **Live rule checklist** — continuous ✓/✗ feedback rather than a rejection
  event at all.
  [IMDb](https://mobbin.com/screens/09c297ec-13b9-4280-a384-638e0909cb40)

**Our decision: it opens a FOURTH option the motion study did not consider.**
The three recorded there all argue about *how long* the reduced-motion rejection
should last. The field's answer is that it should not have a length: hold the
rejected state — a danger edge on the tray, or the word left in place tinted —
until the next input clears it.

**Why that is worth more than tuning 420ms to 260ms.** A persisted state cannot
invert the success/failure ratio, because it has no duration to compare against
success. It removes the defect rather than rebalancing it, and it is what a
reduced-motion user is most likely to be expecting from every other app on their
phone.

**Limit, stated:** every screen here is a FORM-INPUT rejection — a bad email, a
missing field, an invalid date. A word game rejecting a word is not identical:
it is faster, more frequent, and carries no correction the player must make
before continuing. The transferable part is the mechanism (persist, do not
pulse), not the visual weight. A permanent red outline after every wrong guess
would be punishing in a way a signup form never has to worry about.

**Not ruled.** This informs the open motion decision; the operator rules it.

