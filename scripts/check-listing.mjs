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

if (fails.length) {
  console.log('');
  for (const f of fails) console.log(`  ✗  ${f}`);
  console.log(`\n✖ ${fails.length} listing problem(s)`);
  process.exit(1);
}
console.log(`\n✔ ${blocks.filter((b) => LIMITS[b.label]).length} fields fit, and neither board rule is breached`);
