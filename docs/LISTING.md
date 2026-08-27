# Store listing copy

Store rows 2.6 and 2.7. Every claim below is paired with the check behind it —
this is a claim ledger, not a draft. A sentence with no check does not ship.

**Two rules from the board, and they bind this document:**

1. **Never "only", "first" or "unique" about the wheel.** Wordscapes is built on
   the letter wheel and leads the category. The internal shorthand for this
   product is "the dial", which makes that sentence one slip away.
2. **The packs are not here to explain Black culture to anybody.** They are made
   for the people in them first. No copy frames them as a lesson, a tour, or an
   introduction.

Character limits are enforced by `scripts/check-listing.mjs`, not by counting in
your head.

---

## Apple App Store

**Name** (≤30)
```
Six on the Dial
```

**Subtitle** (≤30)
```
Six letters. Six words. Daily.
```

**Keywords** (≤100, comma-separated, no spaces — spaces are wasted characters)
```
word game,daily puzzle,anagram,six letters,word search,vocabulary,spelling,brain,offline,no ads
```

**Promotional text** (≤170, changeable without review)
```
A new board every day. Six letters on the dial, six words to find, and a written clue for each one. No ads, no account, nothing tracked.
```

---

## Google Play

**Title** (≤30)
```
Six on the Dial
```

**Short description** (≤80)
```
A daily six-letter word game with hand-written clues. No ads, no account.
```

---

## Full description (≤4000, both stores)

```
Six letters sit on a dial. Every word you need is spelled from those six, and
nothing else.

Six rows to fill, one board a day. Each row carries a clue somebody wrote by
hand — not a definition scraped from a dictionary, but a line about the thing
itself.

WHAT MAKES A BOARD
Every answer comes from the same six letters. That is the whole constraint, and
it is why a board is a puzzle rather than a word list: the letters that spell
the six-letter answer are the letters that spell the three-letter one.

THEMED PACKS
Alongside the daily board there are themed packs — the cookout, the barbershop,
Sunday dinner, 90s R&B, spades, the HBCU yard, and more. The clues in those
packs are researched and written to be recognised by the people they are about.

PLAYED WITH A THUMB
Tap the letters or drag across them; both work, and neither is the "real" way.
Shuffle when the shape stops helping. Spend a hint on a letter, or on a whole
word, when a row will not come.

WHAT IT DOES NOT DO
No account. No sign-in. No advertising. Nothing about your play leaves your
device, because the app has no way to send it — there are no analytics or
advertising libraries in the build at all.

Free to play, every day. Themed packs are sold outright, once, with no
subscription and no timers between boards.
```

---

## The ledger

| Claim | Check |
|---|---|
| "Six letters… every word spelled from those six" | The core rule; `canSpell` in `lib/game.ts`, multiset-based, with LOCUST kept as a named regression case |
| "Six rows to fill, one board a day" | `puzzle.grid.length` is 6; daily rollover at offset 0 |
| "a clue somebody wrote by hand" | 118 boards across 15 declared themes, 14 carrying, every clue authored — `docs/AUTHORING.md` |
| "researched" | `docs/research/CANON.md`, `data/canon.json`; `npm test` fails when a cited clue is edited without its canon entry |
| "Tap the letters or drag across them; both work" | `LetterWheel.tsx` — both first-class; drag geometry guarded by `check:drag` |
| "No account. No sign-in." | No auth exists in the codebase |
| "No advertising… no analytics or advertising libraries in the build at all" | Measured for rows 1.5/1.6: zero tracker SDKs in source or export; **three** runtime dependencies total — `next`, `react`, `react-dom` |
| "Nothing… leaves your device, because the app has no way to send it" | `connect-src 'self'` in the shipped CSP — structural, not a promise |
| "sold outright, once, with no subscription" | Board ruling 3, 2026-08-26 |

## Claims deliberately NOT made

- Anything with **only / first / unique** — see rule 1.
- **Numbers of players, downloads, ratings, or streaks.** There are none.
- **"Loved by"**, "addictive", "you won't put it down" — retention claims with
  no retention data. Gate zero has not been run and cannot speak to day 2.
- **"Learn about Black culture"** or any framing of the packs as instruction.
- **"Accessible"** as a bare adjective. WCAG AA is measured and holds
  (`check:a11y`), but the word invites a promise wider than the check.
