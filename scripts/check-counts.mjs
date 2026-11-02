/**
 * The catalogue counts in prose, held to the catalogue.
 *
 * This is the THIRD time these numbers have drifted, and the third time is why
 * this file exists rather than another correction commit:
 *
 *   2026-09-03 — HANDOFF claimed 373 tests against a suite of 376.
 *   2026-09-13 — HANDOFF claimed 520 puzzles, which is the number in the build
 *                command, not the number in the catalogue. It is 518.
 *   2026-11-02 — five living documents at once. AGENTS.md told every future
 *                session the paid half was "300 puzzles across 15 themes" when
 *                it is 141 boards across 17. README offered 240 puzzles and 22
 *                tests. LISTING.md — the CLAIM LEDGER, the document that binds
 *                every outbound sentence — said 118 boards across 15 themes.
 *
 * None of those were caught by anything. `layout.tsx` already states the rule
 * for shipped metadata ("The counts are COUNTED, not typed") and `check-press`
 * enforces it for the press page, but prose was unguarded, and prose is where
 * a journalist, a store reviewer and the next session all read the number.
 *
 * WHY THIS IS AN ALLOWLIST AND NOT A PATTERN MATCH. Half the number-and-noun
 * pairs in these documents are HISTORY, and deliberately so: "it was 395 boards
 * once, and commit 3b69733 condemned it" is the single most important sentence
 * in the handoff. A check that demanded every count equal today's would delete
 * the project's memory of its own worst day. So every historical figure is
 * listed below WITH ITS REASON — the same public-allowlist discipline
 * `check-routes.mjs` uses, where an entry may exist only with a written
 * justification, and a new unexplained number fails.
 *
 *   node scripts/check-counts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* ── measured, never typed ─────────────────────────────────────────────── */
const themes = JSON.parse(read('data/themes.json'));
const catalogue = JSON.parse(read('public/data/puzzles.json'));
const TRUTH = {
  puzzles: catalogue.puzzles.length,
  boards: themes.puzzles.length,
  themes: new Set(themes.puzzles.map((p) => p.theme)).size,
};
/* A pack IS a theme — two words for one thing, and the docs use both. Aliased
   rather than counted separately so they cannot drift apart from each other. */
TRUTH.packs = TRUTH.themes;

/*
 * LIVING documents only.
 *
 * Deliberately absent: docs/REVIEW_*, docs/READINESS_AUDIT_*, PLAYER_BOARD.md
 * and PROMOTION-DEFERRED.md. Those are dated snapshots of what was true on a
 * day, and "updating" one would be falsifying a record rather than correcting
 * a claim. If a snapshot is wrong it gets a correction NOTE, not a new number.
 */
const LIVING = [
  'AGENTS.md',
  'README.md',
  'docs/HANDOFF.md',
  'docs/LISTING.md',
  'docs/COMPETITIVE.md',
  'docs/DEMO.md',
  'docs/STORE_READINESS.md',
  'docs/OUTREACH.md',
  'docs/AUTHORING.md',
  'docs/PACK_PIPELINE.md',
  'docs/OBSERVING.md',
  'docs/CULTURAL_BOARD.md',
];

/*
 * History, each with the reason it is not today's number. An entry here is a
 * claim that the figure is deliberately historical — so if one of these lines
 * is ever rewritten into a present-tense claim, this file is where somebody
 * has to come and argue for it.
 */
const HISTORY = [
  { file: 'docs/HANDOFF.md', n: 395, noun: 'boards',
    why: 'the condemned catalogue — 291 of 395 had fewer than two on-theme rows. The sentence exists to stop anyone treating 395 as a target.' },
  { file: 'docs/HANDOFF.md', n: 45, noun: 'boards',
    why: 'the anagram-collision repair: 45 boards expanded into 118, and produced LOCUST, kept as a named regression case.' },
  { file: 'docs/HANDOFF.md', n: 218, noun: 'boards',
    why: 'the catalogue size the old $16.99 / $29.99-yr pricing was set against. Named so the price is not reused against a different catalogue.' },
  { file: 'docs/STORE_READINESS.md', n: 218, noun: 'boards',
    why: 'same figure, same reason — row 4.1 ties the approved pricing to the catalogue it was approved for.' },
  { file: 'docs/STORE_READINESS.md', n: 14, noun: 'packs',
    why: 'row 1.10, the community-reader blocker, as written when there were 14 packs. The blocker is per-pack and still unmet for every one of them.' },
  { file: 'docs/STORE_READINESS.md', n: 39, noun: 'boards',
    why: 'row 1.10 again — the count at the time the reader budget was set.' },
  { file: 'docs/CULTURAL_BOARD.md', n: 96, noun: 'puzzles',
    why: 'a FLOOR the bench proposes content toward, not a measurement of the catalogue.' },
];

/*
 * Number, then at most three adjectives, then the noun. The stopword guard is
 * load-bearing: without it "$150 for the packs" and "140 that the packs" both
 * read as count claims, and a check that cries about a price is a check people
 * learn to ignore.
 */
const RE =
  /\b(\d{2,4})\s+((?:(?!the\b|for\b|that\b|of\b|in\b|and\b|to\b)[a-z][a-z-]*\s+){0,3}?)(puzzles|boards|themes|packs)\b/gi;

const wrong = [];
const unexplained = [];
let checked = 0;
let historical = 0;

for (const file of LIVING) {
  if (!fs.existsSync(path.join(ROOT, file))) continue;
  read(file).split('\n').forEach((line, i) => {
    for (const m of line.matchAll(RE)) {
      const n = Number(m[1]);
      const noun = m[3].toLowerCase();
      const where = `${file}:${i + 1}`;
      checked++;

      if (n === TRUTH[noun]) continue;

      const excused = HISTORY.find(
        (h) => h.file === file && h.n === n && h.noun === noun
      );
      if (excused) { historical++; continue; }

      /* Wrong by the measured value, and nobody has said why. */
      (TRUTH[noun] ? wrong : unexplained).push(
        `${where}  "${m[1]} ${m[2]}${m[3]}" — the catalogue has ${TRUTH[noun]} ${noun}`
      );
    }
  });
}

console.log(
  `measured: ${TRUTH.puzzles} puzzles · ${TRUTH.boards} boards · ${TRUTH.themes} themes`
);
console.log(
  `${checked} count claim(s) across ${LIVING.length} living document(s); ${historical} recorded as history`
);

const bad = [...wrong, ...unexplained];
if (bad.length) {
  console.log(`\n✖ ${bad.length} count claim(s) disagree with the catalogue:\n`);
  for (const b of bad) console.log(`  ${b}`);
  console.log(
    '\n  Correct the prose, or — if the figure is deliberately historical —\n' +
    '  add it to HISTORY in this file WITH THE REASON it is not today\'s number.'
  );
  process.exit(1);
}
console.log('\n✔ every count claim in the living documents matches the catalogue');
