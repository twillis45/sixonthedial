/*
 * Sweep the clue corpus for anything a rating questionnaire asks about.
 *
 * The board ruled Everyone / 4+ on 2026-08-26, and ruled it PROVISIONAL,
 * because the reasoning rested on a claim nobody had checked: that adult
 * SETTINGS — the barbershop, spades, 90s R&B — are not adult CONTENT. That is
 * almost certainly true and it was still only an assertion.
 *
 * WHAT THIS IS ACTUALLY FOR, which is not what it first looks like.
 *
 * It is not a profanity filter. The corpus is hand-authored and nobody is
 * smuggling slurs into a barbecue clue. The real exposure is the opposite
 * shape: perfectly innocent food and music vocabulary that reads differently
 * with the context stripped off. The first board in the cookout pack has the
 * base `breast`. It is a chicken breast. An automated store scan does not know
 * that, and neither does a reviewer skimming a word list at speed.
 *
 * Both stores also ask direct yes/no questions — does the app reference
 * alcohol, tobacco, gambling, violence — and answering them from memory about
 * 118 boards is how a wrong answer gets filed. A wrong answer on a rating form
 * is not a bug report, it is a policy violation.
 *
 * So this REPORTS, with the full clue as context, and does not fail a build.
 * Every hit here needs a human to rule it, and the point is that the human is
 * ruling on a list rather than on a memory.
 *
 * Usage: node scripts/check-rating.mjs [--terse]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKS = path.join(ROOT, 'data', 'packs');

/*
 * Grouped by the question a store actually asks, not by how rude a word is.
 * Terms are deliberately broad — a false positive costs one line of reading,
 * and a false negative costs a mis-filed rating.
 */
const CATEGORIES = [
  { k: 'alcohol', q: 'References to alcohol?',
    terms: ['beer','wine','liquor','whiskey','bourbon','vodka','rum','gin','cognac','hennessy','brandy','champagne','spiked','drunk','tipsy','bar tab','moonshine','malt','forty','brew'] },
  { k: 'tobacco', q: 'References to tobacco or drugs?',
    terms: ['cigarette','cigar','tobacco','blunt','joint','weed','smoke break','newport'] },
  { k: 'gambling', q: 'Simulated gambling?',
    terms: ['bet','wager','stakes','gamble','pot odds','ante','payout','hustle','numbers game'] },
  { k: 'violence', q: 'Violence or threats?',
    terms: ['shot','shoot','gun','knife','stab','beat down','fight','jump him','whoop','belt','switch'] },
  { k: 'anatomy', q: 'Reads as sexual content out of context',
    terms: ['breast','thigh','butt','rump','loin','crack','strip','naked','bottom'] },
  { k: 'profanity', q: 'Profanity or crude humour?',
    terms: ['damn','hell','ass','crap','piss','bastard','bitch'] },
];

const TERSE = process.argv.includes('--terse');

/* Whole-word match, so `bet` does not fire on `better` and `ass` does not fire
   on `glasses` — which is the difference between a list somebody reads and a
   list somebody mutes. */
const rx = (t) => new RegExp(`(^|[^a-z])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i');

const hits = [];
let boards = 0, strings = 0;

for (const file of fs.readdirSync(PACKS).filter((f) => f.endsWith('.json'))) {
  const pack = JSON.parse(fs.readFileSync(path.join(PACKS, file), 'utf8'));
  for (const board of pack.boards ?? []) {
    boards += 1;
    const fields = [
      { where: 'base', text: board.base ?? '' },
      { where: 'scene', text: board.scene ?? '' },
      ...Object.entries(board.clues ?? {}).map(([w, c]) => ({ where: `clue:${w}`, text: String(c) })),
      ...Object.keys(board.clues ?? {}).map((w) => ({ where: 'answer', text: w })),
    ];
    for (const f of fields) {
      if (!f.text) continue;
      strings += 1;
      for (const cat of CATEGORIES) {
        for (const term of cat.terms) {
          if (rx(term).test(f.text)) {
            hits.push({ cat: cat.k, term, pack: pack.theme?.id ?? pack.theme?.name ?? file.replace('.json',''), base: board.base, where: f.where, text: f.text });
          }
        }
      }
    }
  }
}

console.log(`swept ${boards} boards, ${strings} strings, across ${fs.readdirSync(PACKS).filter((f)=>f.endsWith('.json')).length} packs\n`);

if (!hits.length) {
  console.log('no terms matched — file the rating questionnaire as Everyone / 4+');
  process.exit(0);
}

for (const cat of CATEGORIES) {
  const mine = hits.filter((h) => h.cat === cat.k);
  if (!mine.length) continue;
  console.log(`\n${cat.q.toUpperCase()}  [${cat.k}]  — ${mine.length} hit(s)`);
  const byTerm = {};
  for (const h of mine) (byTerm[h.term] ??= []).push(h);
  for (const [term, list] of Object.entries(byTerm)) {
    console.log(`\n  "${term}" × ${list.length}`);
    for (const h of (TERSE ? list.slice(0, 2) : list)) {
      console.log(`    ${h.pack}/${h.base} · ${h.where}`);
      if (!TERSE) console.log(`      ${h.text}`);
    }
    if (TERSE && list.length > 2) console.log(`    …and ${list.length - 2} more`);
  }
}

const inProse = hits.filter((h) => h.where.startsWith('clue') || h.where === 'scene');
const asAnswer = hits.filter((h) => h.where === 'answer' || h.where === 'base');
console.log(`\n${hits.length} hit(s): ${inProse.length} in authored prose, ${asAnswer.length} as a word on the wheel.`);
console.log('Those are different questions. Prose is something somebody WROTE and can rewrite.');
console.log('A word on the wheel is a dictionary word the base happens to spell — it is the');
console.log('English language, not a reference, and removing it means rebuilding the board.');
console.log('This reports and never fails a build — a false positive here costs one line of reading.');
