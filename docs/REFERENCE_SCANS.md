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

## What has NOT been scanned, and would be worth one

**Reduced-motion rejection feedback.** `docs/MOTION_STUDY.md` (2026-08-30) found
the success/failure timing ratio inverts under `prefers-reduced-motion` —
success 160ms, rejection 420ms — and left three options for a ruling. **How
other apps signal rejection without movement is a genuine open question**, it is
a general app pattern rather than a word-game mechanic, and it is therefore one
Mobbin can actually answer.

One intent, narrow, feeding a decision that is currently unmade. That is the
next scan worth running, and the first one on this list that would not be
looking for permission after the fact.
