/*
 * The share card has to survive the place it gets pasted.
 *
 * The marketing roadmap's stage-1 thesis is that this product grows on the
 * share loop, because every paid door is closed by ruling: no ads, no UA. That
 * makes `shareText()` the single marketing surface with distribution built
 * into it — and it had never been measured against the one channel with a hard
 * limit.
 *
 * WHY X'S RULES AND NOT A CHARACTER COUNT. X weighs a card differently from
 * `String.length` in two ways that both matter here, and getting either wrong
 * flips the verdict:
 *
 *   - every emoji counts as TWO. The staircase is 27 squares on a full clear,
 *     so it costs 54, not 27.
 *   - every URL counts as exactly 23 no matter how long it is. Measuring the
 *     literal URL said the card was 288 and over the limit; it is not, and
 *     "shorten the domain" would have bought nothing.
 *
 * WHAT THIS ASSERTS, and it is deliberately today's corpus rather than a
 * hypothetical: every clue that ships, on a full clear, must fit. That catches
 * the regression that will actually happen — somebody writes a clue eight
 * characters longer than the current record and nothing says a word.
 *
 * WHAT IT ALSO REPORTS, because a guard that only says PASS hides the real
 * finding: the headroom, and when it runs out. Today the worst card is 279 of
 * 280. It breaks when the day number reaches four digits or a streak reaches
 * three — roughly three years in — and it breaks for the players with the
 * longest streaks, who are exactly the people most likely to paste it.
 *
 * Usage: node scripts/check-share.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { shareText } from '../src/lib/game.ts';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const X_LIMIT = 280;
const URL_WEIGHT = 23;

/** X's own weighting, not String.length. */
function weigh(card) {
  const withoutUrl = card.replace(/https?:\/\/\S+/g, '');
  const emoji = (withoutUrl.match(/[\u{1F7E6}-\u{1F7EB}⬛]/gu) ?? []).length;
  return [...withoutUrl].length + emoji + (/https?:\/\//.test(card) ? URL_WEIGHT : 0);
}

/* A full clear is the worst case AND the case worth sharing, so it is the one
   measured. A partial board is strictly shorter. */
const FULL_CLEAR = [
  [6, true, true], [5, true, false], [5, true, false],
  [4, true, false], [4, true, false], [3, true, false],
].map(([length, solved, isBase]) => ({ length, solved, isBase }));

const themes = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'themes.json'), 'utf8')
).themes;
const nameOf = Object.fromEntries(themes.map((t) => [t.id, t.name]));

const card = (clue, theme, over = {}) =>
  shareText({
    theme, clue, rank: 'Complete', score: 26, bonusFound: 4,
    streak: 30, dayNumber: 205, escalating: true,
    tiles: FULL_CLEAR, url: 'https://sixonthedial.com', ...over,
  });

const fails = [];
let measured = 0;
let worst = { w: 0 };

const PACKS = path.join(ROOT, 'data', 'packs');
for (const file of fs.readdirSync(PACKS).filter((f) => f.endsWith('.json'))) {
  const pack = JSON.parse(fs.readFileSync(path.join(PACKS, file), 'utf8'));
  const theme = nameOf[pack.theme.id] ?? pack.theme.name;
  for (const board of pack.boards ?? []) {
    for (const [row, clue] of Object.entries(board.clues)) {
      const w = weigh(card(clue, theme));
      measured += 1;
      if (w > X_LIMIT) fails.push(`${w}/${X_LIMIT} — ${theme}/${board.base}/${row}`);
      if (w > worst.w) worst = { w, theme, base: board.base, clue };
    }
  }
}

console.log(`measured ${measured} share cards on a full clear, at X's weighting\n`);

if (fails.length) {
  for (const f of fails.slice(0, 10)) console.log(`  ✗  ${f}`);
  console.log(`\n✖ ${fails.length} card(s) exceed X's ${X_LIMIT}-character limit`);
  console.log('   The clue is the lead and should not be truncated — shorten the clue,');
  console.log('   or rule on what the card drops when it is over budget.');
  process.exit(1);
}

console.log(`  ✔  every card fits — worst is ${worst.w}/${X_LIMIT}, ${worst.theme}/${worst.base}`);
console.log(`     "${worst.clue}"`);

/*
 * The headroom, reported every run so it cannot quietly disappear. These are
 * not failures — they are dates.
 */
const longestTheme = themes.map((t) => t.name).sort((a, b) => b.length - a.length)[0];
const futures = [
  ['a 4-digit day number (~year 3)', { dayNumber: 1205 }],
  ['a 3-digit streak (~year 1 for a daily player)', { streak: 365 }],
  ['both, on the longest theme name shipped', { dayNumber: 1205, streak: 365, theme: longestTheme }],
];
console.log(`\n  headroom: ${X_LIMIT - worst.w} character(s) today`);
for (const [label, over] of futures) {
  const w = weigh(card(worst.clue, over.theme ?? worst.theme, over));
  console.log(`  ${w > X_LIMIT ? '!' : ' '}  ${String(w).padStart(3)}/${X_LIMIT}  ${label}`);
}
console.log('\n  Cards break for long-streak players first, who are the most likely to');
console.log('  paste one. That is a ruling to make, not a bug to fix quietly.');
