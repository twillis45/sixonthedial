# ASO — the indexed surface

Board item `m9o`. Its note read: *"The category is crowded and the leaders open
on gameplay inside three seconds. Nothing here has been researched against
actual search terms."*

**Tier 1, run 2026-11-02.** Same discipline as `docs/COMPETITIVE.md`: verify at
source what feeds a live decision, and say plainly what has no instrument. What
was checked matters as much as what was found.

- **Verified at source:** Apple's own statement of what its search indexes; the
  name, subtitle, seller and category of five competitors, read off their live
  App Store pages; and the three Google Suggest phrases already in
  `STORE_READINESS.md`, re-run rather than carried forward.
- **NOT obtained, and not estimated:** **search volume for any term.** There is
  no instrument on this account — see *Instruments* below. Every number in this
  file is a rating count or a result position, never a volume. Nothing here
  says how many people search anything.

## Instruments — what ran, what is dead, what does not exist

| Instrument | State 2026-11-02 | What it can and cannot say |
|---|---|---|
| `developer.apple.com/app-store/search/` | **Live, primary** | Apple's own statement of indexed fields. Authoritative. |
| App Store page scrape (`apps.apple.com`) | **Live, primary** | Exact competitor name + subtitle + seller. Observable fact. |
| iTunes Search API | **Live** | Who Apple returns for a term, and their rating counts → **contest depth**. It is *not* App Store search ranking and it is *not* volume. Throttles after ~6 queries. |
| App Store search hints (`MZSearchHints.woa`) | **DEAD from here** | Responds HTTP 200 with an **empty** `hints` array for every query tried. Apple's own autocomplete would be the best available volume proxy; it returns nothing in this environment. *Empty is not a negative result about the terms.* |
| Google Suggest | **Live** | How people *describe* the genre in web search, ordered by popularity. It is Google web search, **not** App Store search. |
| Ahrefs / keyword volume tools | **Unavailable** | Recorded on the board at `mp1b` since 2026-08-30. Unchanged. |

## The rule that decided this, quoted at source

`developer.apple.com/app-store/search/`, read 2026-11-02:

> "Search results are based on a number of factors, including text relevance
> (matches for your app's title, subtitle, keywords, and primary category), as
> well as user behavior (downloads, ratings and reviews, and more)."

> "Your primary category and optional secondary category are indexed by our
> search algorithm."

> "Keywords are limited to 100 characters total, with terms separated by commas
> and no spaces."

> **"Don't repeat any words included in your app name, subtitle, or category."**

> "keep in mind that promotional text doesn't affect your app's search ranking
> so it should not be used to display keywords."

**The description is not named as a ranking input anywhere on that page.** Its
only mention is "an accurate description", framed as conversion. So on Apple,
the entire indexed surface is four fields: **name, subtitle, keywords,
category** — 160 characters and a dropdown.

### Google Play is a different shape, and the honest reading is narrower

`support.google.com/googleplay/android-developer/answer/9859152`, read
2026-11-02: title 30, short description 80, full description 4,000. The page
**does not claim** any of the three affects ranking. What it does say is a
warning:

> "Repetitive or irrelevant keyword usage in your app name, short description,
> or full description" can harm the user experience and lead to suspension.

Its only discovery statement is about categories and tags. **This is not
evidence that Play ignores the description** — a help page not claiming
something is not the platform denying it. It is evidence that there is nothing
official to plan against, and that keyword-stuffing the 4,000-character field
carries a stated suspension risk. Treated as: do not stuff it.

## The competitor surface, read off the live pages

| App | Name (≤30) | Subtitle (≤30) | Seller |
|---|---|---|---|
| Wordscapes | `Wordscapes - Word Game` | `Crossword Puzzles Brain Games` | PeopleFun, Inc. |
| CodyCross | `CodyCross: Crossword Puzzles` | `A New Word Game Experience!` | Fanatee, Inc. |
| Words of Wonders | `Words of Wonders: Crossword` | `Word Puzzle & Spelling Game` | FUGO Bilisim (Turkey) |
| Word Cookies | `Word Cookies!®` | `Tasty word puzzle relax game!` | BitMango, Inc. |
| NYT Games | `NYT Games: Wordle & Crossword` | `Word, Number and Logic Puzzles` | The New York Times Company |

Apple primary category verified as **Word** for Wordscapes and NYT Games. For
the other three the public API returns only the top-level `Games`; their
sub-category was not separately confirmed and is not asserted here.

**NYT Spelling Bee has no standalone listing.** `COMPETITIVE.md` lists it as a
row in the field, which is right for mechanics and wrong for ASO: it ships
inside NYT Games. There is no Spelling Bee listing to compete with.

### The finding that matters most, and it is about the name

**Every competitor spends its 30-character name on genre keywords.** `Word
Game`, `Crossword Puzzles`, `Crossword`, `Wordle & Crossword` — the brand is
the first half and the index is the second. `Six on the Dial` is 15 characters
of pure brand and carries **no** genre term at all.

`STORE_READINESS.md` already recorded this as "a mild negative for
discoverability and a positive for distinctiveness". Against the surface above
that reads too gently: on Apple the name is one of only four indexed fields,
and ours spends half its allowance on nothing searchable while every competitor
spends theirs on the category.

This is a **brand decision, not a mechanical fix**, so it is not made here.
What is measured is the room:

| Candidate | Length |
|---|---|
| `Six on the Dial` (current) | 15/30 |
| `Six on the Dial: Word Game` | 26/30 |
| `Six on the Dial: Daily Word` | 27/30 |
| `Six on the Dial - Word Puzzle` | 29/30 |

Fifteen characters are available without touching the brand. **Open question
for the operator.**

## Contest depth per candidate term

iTunes Search API, US, 2026-11-02, top 5 by Apple's own ordering. Rating counts
are Apple's. **This measures how contested a term is, not how often it is
searched.** Three probes stayed throttled and are recorded as not obtained.

| Term | Top result | Ratings at the top | Read |
|---|---|---|---|
| `themed clues` | Mystic Words | **1,186** | **Reachable.** Lowest-contest term found, and it is the differentiator. |
| `anagram` | Anagrams: Find the anagram | **139** | **Reachable.** Top three are 139 / 4,078 / 366. Wordscapes only at #4. |
| `six letter word` | Six (S) | **6** | Essentially uncontested — only 4 results exist. Already covered by name+subtitle. |
| `word game no ads` | Word Puzzle: No Ads, No Wifi! | 5,656 | Reachable at the head. |
| `themed word puzzle` | Crossword Master | 163,437 | Contested at the head, open at the tail (#5 has 3 ratings). |
| `daily word puzzle` | Everyday Puzzles | 33,619 | Contested — NYT #2, Wordle #5 at 845,766. |
| `word wheel` | **Wordscapes** | **1,141,818** | **Unwinnable.** See below. |
| `offline word game` | Word Search Explorer | 861,683 | **Unwinnable** — every top-5 result is 380k–1.1M. |
| `spelling puzzle`, `crossword clue game`, `vocabulary game` | — | — | Throttled. Not obtained. |

**`word wheel` confirms the COMPETITIVE.md ruling rather than challenging it.**
Wordscapes is the #1 result at 1.14M ratings. Rule 1 in `LISTING.md` forbids
*claiming* the wheel; this says the keywords are just as closed. `check-listing`
now fails on a keyword term containing `wheel`, `dial` or `wordscape`.

## Google Suggest, re-verified

All three phrases recorded 2026-08-30 are still live, and the **ordering** is
the useful part — Suggest orders by popularity:

- `word game with` → **#1 `word game with no ads`**, #2 `word game with letters
  in a circle`, #3 `word game with tiles`
- `word game with letters` → #1 `word game with letters in a circle`
- `daily word games like` → #1 `daily word games like wordle`

**`no ads` is the single most-common qualifier people attach to this genre**,
and it is a thing this product structurally is — `connect-src 'self'`, zero
analytics and ad SDKs, filed as Data Not Collected. That is the rare case where
the keyword and the truth are the same fact, so it keeps its place in the field.

`word game with letters in a circle` at #1–2 shows people do search the wheel
by description. Wordscapes owns it. Evidence **for** the ruling.

## What changed in the listing

The committed keyword field was:

```
word game,daily puzzle,anagram,six letters,word search,vocabulary,spelling,brain,offline,no ads
```

Against Apple's own rule, that field repeated `word`, `game`, `daily`, `six`
and `letters` — every one already indexed through the name, subtitle or
category. **24 of 95 characters bought nothing.** It also contained neither
`theme` nor `clue`, so the differentiator `COMPETITIVE.md` ranks second-most
defensible was the one claim not on the indexed surface. `word search` named a
different genre.

It is now:

```
anagram,themed,clue,puzzle,spelling,vocabulary,brain,offline,no ads
```

67 of 100 characters. **The primary category — `Games > Word` — is now written
down in `LISTING.md`**, because Apple indexes it and the duplicate rule cannot
be computed without it. It had never been recorded anywhere in this repository.

`scripts/check-listing.mjs` enforces all of it: no keyword term may repeat a
word from the name, subtitle or category; no term may compete on wheel terms;
`theme` and `clue` must appear somewhere indexed; and the category must be
declared. Red-proofed four ways, each exit 1 — a term repeating an indexed
word, the differentiator dropped, the category removed, and `word wheel` added.

## Open questions, which are not closed by this sweep

1. **The 33 unspent keyword characters.** They are deliberately empty. The
   candidates are the theme names themselves — `cookout`, `barbershop`,
   `spades`, `hbcu` — which are zero-contest and are the only terms where this
   app would rank first. No instrument says anyone searches them, and the board
   rule about the packs makes it a framing call, not a mechanical one.
   **Operator decision.** Filling them with unevidenced genre terms would be
   worse than leaving them.
2. **The name.** Fifteen characters of the only 30-character indexed field are
   unused. Measured above. **Operator decision.**
3. **The subtitle** is 30/30 and spends four of them on a second `Six`, which
   Apple dedupes. It also matches the in-game teach line deliberately, so
   changing it is a brand call rather than an optimisation.
4. **No volume figure exists**, so no term here is ranked by demand — only by
   contest depth. If a volume instrument ever becomes available, this whole
   table should be re-read, because a reachable term nobody searches is worth
   nothing and this sweep cannot tell the difference.
5. **`check:listing` is not in the mutation harness.** Its four red-proofs were
   run by hand. `check:guards` carries 16 mutations and none of them is a
   listing mutation, so this guard is outside the net that `b4s` exists to
   keep honest. Named rather than hidden.

## Limits of this sweep

App Store pages, Apple's own documentation, Apple's public search API and
Google Suggest. It is **not** a volume study, not a ranking-tracker series, and
not a Play Console experiment. It is good enough to stop a third of the keyword
field being spent on words Apple already indexes, to put the differentiator on
the indexed surface, and to say which terms are closed. It is **not** good
enough to say which open term is worth having — that needs volume, and volume
has no instrument here.
