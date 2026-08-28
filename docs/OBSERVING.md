# Observing — the weekly half hour

The whole instrument panel for this product is **two numbers and the reviews**,
read once a week. This file exists because the failure mode of a dashboard is
not a wrong number, it is **nobody opening it**, and a cadence that lives in
somebody's head is a cadence that stops the first busy week.

## Why it is this small, and why that is not a gap

`connect-src 'self'`, zero analytics, no ad SDKs, and GitHub Pages keeps no
logs. No UTM lands anywhere, no share is counted, no visit is attributable.
There is no crash reporting either — ruling 4, deliberately, because a
third-party reporter reverses two board rulings and breaks a filed privacy
claim.

That is the privacy position working. It is filed with both stores as **Data
Not Collected**, and every number below has to be judged knowing that the
alternative was not "more data", it was a different product.

**The consequence nobody should have to rediscover:** reviews are not a
sentiment channel here. They are the *only* user-research channel this product
will ever have, and they are also the crash reporter. A review that says "won't
open on my phone" is the incident report. There is no second source.

## The cadence

**Monday, before anything else, thirty minutes.** Pick a day and keep it; the
specific day matters less than the fact that it never moves.

1. **Installs** — Play Console → Statistics; App Store Connect → App Analytics.
2. **Rating** — the average AND the count. The count is the one that matters
   early: a 5.0 from three people is not a rating, it is three people.
3. **Every review, read in full.** Not skimmed, not summarised by the console's
   own sentiment widget. Every one.

Append to the log below in the same sitting. **The consoles show a rolling
window and will not remember the trend for you** — that is the entire reason
this file has a table in it rather than a link.

## The log

| Week of | Installs (total) | New this week | Rating | # ratings | Reviews read | What changed |
|---|---|---|---|---|---|---|
| _not started — no store listing is live yet_ | | | | | | |

## What each signal can and cannot answer

| Signal | Answers | Does NOT answer |
|---|---|---|
| Installs | Whether the listing converts a store visit | Where anybody came from. Nothing is attributable. |
| Rating average | Whether the people who finished are satisfied | Anything, below ~20 ratings. Treat it as noise until then. |
| Rating count | Whether enough people care to say so | Whether the silent majority liked it |
| Reviews | Why. Bugs, confusions, the words real players use | How common the problem is — one review is one person |

**The trap:** a low install count with a high rating reads as success and is
usually a distribution failure. A high install count with a falling rating is
the opposite, and it is the more urgent one.

## What triggers an action, and what is noise

Written before there is data, so it cannot be rationalised after.

- **Any review reporting the app does not open, or shows an address bar** —
  act immediately. That is the TWA verification failure, it is silent by
  design, and it is what `npm run check:assetlinks` exists to catch. Run it
  first; the cause is far more often the served file than the app.
- **Two or more reviews naming the same confusion** — that is the gate-zero
  signal arriving late. It goes to the onboarding, not to the copy.
- **Any review about a clue being wrong** — treat as a factual claim, check it
  against `data/canon.json`, and fix the canon entry in the same change. A
  clue is a factual claim wearing a joke.
- **Rating average moving on fewer than 20 ratings** — noise. Record it, do
  nothing.
- **A flat install week** — noise on its own. Three flat weeks is a finding.

## What this is not

It is not a growth dashboard and it cannot become one without reopening board
ruling 2. If a question needs a pixel to answer, the answer is that the
question does not get answered — not that the pixel gets added.
