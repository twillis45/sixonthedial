/**
 * The press page is the one page written for somebody who will quote it.
 *
 * Every other surface in this project is read by a player, who finds out within
 * a minute whether it was true. The press page is read by a journalist, who
 * copies a number into an article and never comes back. A stale figure there
 * does not become wrong quietly — it becomes wrong in somebody else's byline,
 * with this project's name on it.
 *
 * So it gets a check, and the check asserts four different kinds of thing:
 *
 *   1. THE IMAGES EXIST IN THE EXPORT. `scripts/build-press.mjs` stages them
 *      out of store/marketing before `next build` reads public/. If that step
 *      is ever dropped from the build, the page still renders perfectly and
 *      every image 404s, and nothing else in the repo would say so.
 *
 *   2. THE NUMBERS MATCH THEIR SOURCES. The page counts them at build time
 *      rather than typing them, which is the rule layout.tsx already states —
 *      but "counted" only holds until somebody writes a nicer sentence with a
 *      literal in it. This re-derives them from data/themes.json and
 *      public/data/puzzles.json and reads them back out of the rendered HTML.
 *
 *   3. THE TWO BOARD RULES SURVIVE. docs/LISTING.md binds all outbound copy:
 *      never "only/first/unique" about the wheel, and never frame the packs as
 *      instruction. Both are one careless adjective away at all times, and this
 *      page is the one that invites the adjective.
 *
 *   4. NOTHING IS PROMISED THAT IS NOT DECIDED. No price, because the business
 *      model is an open board item; no store links, because neither store build
 *      has been submitted. A press page that lists an App Store link before
 *      there is one is the single most expensive sentence on the site.
 *
 *   node scripts/check-press.mjs      (after npm run build)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const PAGE = path.join(OUT, 'press', 'index.html');

const fail = [];
const ok = [];
const note = (pass, msg) => (pass ? ok : fail).push(msg);

if (!fs.existsSync(PAGE)) {
  console.error('✗ no out/press/index.html — run `npm run build` first.');
  process.exit(1);
}

const html = fs.readFileSync(PAGE, 'utf8');
/* Tags out, entities in: the assertions below are about words a reader sees,
   and a class name or an href must not be able to satisfy one of them. */
const text = html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#x27;|&rsquo;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/&[a-z]+;/g, ' ')
  .replace(/\s+/g, ' ');

/* ── 1. every image the page references reached the export ─────────────── */
const kit = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'press-kit.json'), 'utf8'));
const referenced = [...html.matchAll(/(?:src|href)="([^"]*\/press\/[^"]+\.png)"/g)].map(
  (m) => m[1]
);
const unique = [...new Set(referenced)];
note(
  unique.length === kit.shots.length * 2,
  `${unique.length} press images referenced; data/press-kit.json declares ${kit.shots.length * 2}`
);
for (const url of unique) {
  const rel = url.replace(/^.*\/press\//, '');
  note(
    fs.existsSync(path.join(OUT, 'press', rel)),
    `image served: press/${rel}`
  );
}

/* ── 2. the counts agree with the files that define them ───────────────── */
const themes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'themes.json'), 'utf8'));
const puzzles = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public', 'data', 'puzzles.json'), 'utf8')
);
const want = {
  'themed boards': themes.puzzles.length,
  packs: new Set(themes.puzzles.map((p) => p.theme)).size,
  puzzles: puzzles.puzzles.length,
};
/*
 * Read the sentence, not three numbers found anywhere on the page: the fact
 * sheet says "N puzzles, of which M are themed boards across P packs", so the
 * three have to appear in that order and in that relationship or the claim is
 * not the one being checked.
 */
const claim = text.match(
  /(\d+) puzzles, of which (\d+) are themed boards across (\d+) packs/
);
if (!claim) {
  fail.push('the catalogue sentence is missing or reworded — nothing to check the counts against');
} else {
  note(Number(claim[1]) === want.puzzles, `catalogue total ${claim[1]} = puzzles.json ${want.puzzles}`);
  note(
    Number(claim[2]) === want['themed boards'],
    `themed boards ${claim[2]} = themes.json ${want['themed boards']}`
  );
  note(Number(claim[3]) === want.packs, `packs ${claim[3]} = themes.json ${want.packs}`);
}

/* ── 3. the two board rules ────────────────────────────────────────────── */
/*
 * Rule 1 is about a CLAIM, not a word. "first" appears innocently — "made for
 * the people in them first" is the second rule's own phrasing — so matching the
 * bare word would fail this page for obeying the other rule it is bound by.
 * What is forbidden is the superlative attached to the input mechanism, within
 * a short span of it.
 */
const WHEEL = /(only|first|unique|the one and only)[^.]{0,40}\b(dial|wheel)\b|\b(dial|wheel)\b[^.]{0,40}(is the only|the first|is unique)/i;
const hit = text.match(WHEEL);
note(!hit, hit ? `rule 1: superlative attached to the dial — "${hit[0].trim()}"` : 'rule 1: no superlative on the dial');

const LESSON = /\b(learn about|teaches?|educational|introduction to|primer on|lesson in)\b[^.]{0,60}\b(black|culture|cultural)\b/i;
const lhit = text.match(LESSON);
note(!lhit, lhit ? `rule 2: the packs framed as instruction — "${lhit[0].trim()}"` : 'rule 2: the packs are not framed as instruction');

/* ── 4. nothing promised that is not decided ───────────────────────────── */
const price = text.match(/\$\s?\d/);
note(!price, price ? `a price appears ("${price[0]}") — the business model is an open board item` : 'no price stated');

const STORE_LINK = /apps\.apple\.com|itunes\.apple\.com|play\.google\.com\/store/i;
const shit = html.match(STORE_LINK);
note(!shit, shit ? `a store link appears (${shit[0]}) — neither build has been submitted` : 'no store links');

/* The status block is the reason this page is publishable at all. If it goes,
   the page becomes a pitch for an unreleased app. */
note(
  /Not released on the App Store or Google Play/i.test(text),
  'the status block still says the store versions are unreleased'
);

/*
 * The reader disclosure, which is the one sentence on this page most likely to
 * be quietly dropped as "negative". docs/CULTURAL_BOARD.md draws the line the
 * whole project is bound by — the bench is structured perspective, NOT
 * community consultation — and a journalist writing about the cultural claim
 * will otherwise reasonably assume the second. The disclosure comes off this
 * page when the readers have actually happened (board item s5i), and not before.
 */
note(
  /not community consultation/i.test(text),
  'the bench-is-not-consultation limit is still disclosed'
);

/* ── report ────────────────────────────────────────────────────────────── */
for (const o of ok) console.log(`✔  ${o}`);
for (const f of fail) console.log(`✗  ${f}`);

if (fail.length) {
  console.log(`\n✖ ${fail.length} of ${ok.length + fail.length} press-page assertions failed.`);
  process.exit(1);
}
console.log(`\n✔ the press page says what its sources say (${ok.length} assertions).`);
