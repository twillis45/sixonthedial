/*
 * Store copy must fit the field it goes in, and the field is unforgiving.
 *
 * Apple truncates a subtitle at 30 characters with no warning at submission
 * time; Play refuses an over-length short description outright. Counting in
 * your head is how a listing ships with a sentence cut mid-word, and nobody
 * notices until it is live and a review cycle away from fixable.
 *
 * It also enforces the two rules the board bound this copy with, because those
 * are the ones a later edit would breach without meaning to: no "only/first/
 * unique" about the wheel, and no framing of the packs as a lesson.
 *
 * Usage: node scripts/check-listing.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const md = fs.readFileSync(path.join(ROOT, 'docs', 'LISTING.md'), 'utf8');

/* pull every fenced block in order, paired with the heading above it */
const blocks = [];
const re = /\*\*(.+?)\*\*[^\n]*\n```\n([\s\S]*?)\n```/g;
let m;
while ((m = re.exec(md))) blocks.push({ label: m[1], text: m[2] });
const full = md.match(/## Full description[^\n]*\n\n```\n([\s\S]*?)\n```/);
if (full) blocks.push({ label: 'Full description', text: full[1] });

const LIMITS = {
  'Name': 30, 'Subtitle': 30, 'Keywords': 100, 'Promotional text': 170,
  'Title': 30, 'Short description': 80, 'Full description': 4000,
};

const fails = [];
for (const b of blocks) {
  const limit = LIMITS[b.label];
  if (!limit) continue;
  const n = [...b.text].length;           // count characters, not UTF-16 units
  const ok = n <= limit;
  console.log(`  ${ok ? '✔' : '✗'}  ${b.label.padEnd(18)} ${String(n).padStart(4)}/${limit}`);
  if (!ok) fails.push(`${b.label} is ${n} characters, limit ${limit}`);
}

/* the two board rules */
const body = blocks.map((b) => b.text).join('\n').toLowerCase();
const BANNED = [
  { rx: /\b(only|first|unique)\b[^.]{0,40}\b(wheel|dial)\b/, why: 'claims the wheel is only/first/unique — Wordscapes is built on it' },
  { rx: /\b(wheel|dial)\b[^.]{0,40}\b(only|first|unique)\b/, why: 'claims the wheel is only/first/unique — Wordscapes is built on it' },
  { rx: /\b(learn|discover|explore|teaches?|introduction to)\b[^.]{0,30}\bculture\b/, why: 'frames the packs as instruction about culture' },
];
for (const b of BANNED) if (b.rx.test(body)) fails.push(`copy ${b.why}`);

/*
 * APPLE'S OWN RULE ABOUT THE KEYWORD FIELD, which this listing broke.
 *
 * developer.apple.com/app-store/search/, verified at source 2026-11-02:
 *
 *   "Search results are based on a number of factors, including text relevance
 *    (matches for your app's title, subtitle, keywords, and primary category)"
 *   "Your primary category and optional secondary category are indexed by our
 *    search algorithm."
 *   "Don't repeat any words included in your app name, subtitle, or category."
 *
 * So name, subtitle, category and keywords are ONE pool. A word already in the
 * first three buys nothing in the fourth — it just spends characters out of a
 * hard 100. As committed, 33 of 95 characters went on `word`, `game`, `daily`,
 * `six` and `letters`, every one of them already indexed: a third of the field
 * bought nothing. Nobody had counted, because the only thing checked here was
 * whether the field FIT.
 *
 * The category had to be written down before this could be computed at all,
 * which is why LISTING.md now carries it as a field.
 *
 * Apple stems plurals, so `letters` in the subtitle covers `letter` in the
 * keywords. The stemmer below is deliberately crude — it only has to catch the
 * plural forms that actually appear in a 30-character subtitle, and a crude
 * rule that flags a real duplicate beats a clever one nobody can audit.
 */
const field = (label) => blocks.find((b) => b.label === label)?.text ?? '';
const stem = (w) =>
  w.endsWith('ies') ? w.slice(0, -3) + 'y'
  : w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1)
  : w;
const wordsOf = (s) => (s.toLowerCase().match(/[a-z]+/g) ?? []).map(stem);

const kw = field('Keywords');
if (kw) {
  const indexed = new Set([
    ...wordsOf(field('Name')),
    ...wordsOf(field('Subtitle')),
    ...wordsOf(field('Primary category')),
  ]);
  if (!field('Primary category')) {
    fails.push(
      'LISTING.md declares no Primary category — Apple indexes it, so the ' +
      'keyword field cannot be checked for duplicates without it',
    );
  }
  let wasted = 0;
  for (const term of kw.split(',')) {
    const dup = term.split(/\s+/).filter((w) => indexed.has(stem(w.toLowerCase())));
    if (dup.length) {
      wasted += dup.join(' ').length;
      fails.push(
        `keyword term "${term}" repeats ${dup.map((d) => `"${d}"`).join(' and ')} ` +
        `— already indexed via the name, subtitle or category`,
      );
    }
  }
  if (wasted) fails.push(`${wasted} of ${kw.length} keyword characters bought nothing`);

  /*
   * And the rule the board bound this copy with, read the other way round.
   *
   * Rule 1 forbids claiming the wheel. It does NOT stop somebody reaching for
   * wheel KEYWORDS, which is a different and more expensive mistake: measured
   * 2026-11-02, Wordscapes is the #1 App Store result for `word wheel` with
   * 1,141,818 ratings. Those characters would be spent losing.
   */
  for (const term of kw.split(',')) {
    if (/\b(wheel|dial|wordscape)/i.test(term)) {
      fails.push(`keyword term "${term}" competes on wheel terms Wordscapes owns`);
    }
  }

  /*
   * The differentiator has to be ON the indexed surface.
   *
   * COMPETITIVE.md ranks the cited themed clues as the second most defensible
   * thing about this product, and measured 2026-11-02 `themed clues` is a
   * REACHABLE term — the top App Store result for it carries 1,186 ratings,
   * three orders of magnitude off the wheel terms. As committed, neither
   * "theme" nor "clue" appeared in the name, the subtitle or the keywords:
   * the one claim worth ranking for was the one claim not indexed.
   */
  const surface = [field('Name'), field('Subtitle'), kw].join(' ').toLowerCase();
  for (const need of ['theme', 'clue']) {
    if (!surface.includes(need)) {
      fails.push(`no indexed field carries "${need}" — the differentiator is unsearchable`);
    }
  }
}

if (fails.length) {
  console.log('');
  for (const f of fails) console.log(`  ✗  ${f}`);
  console.log(`\n✖ ${fails.length} listing problem(s)`);
  process.exit(1);
}
const n = blocks.filter((b) => LIMITS[b.label]).length;
console.log(
  `\n✔ ${n} fields fit, neither board rule is breached, and no keyword ` +
  `character is spent on a word the name, subtitle or category already indexes`,
);
