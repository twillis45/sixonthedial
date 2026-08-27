/*
 * The gate-zero variants must differ in exactly the ways they claim to.
 *
 * The unit tests assert what the PREDICATES return. That is not the same as
 * asserting what a stranger sees, and the whole value of gate zero rests on
 * the second thing: if variant D still shows a teach card, or C shows both its
 * goal screen and the card, the tallies are measuring something other than
 * what they are labelled with — and they will look perfectly reasonable.
 *
 * The safety property is checked first and is the one that matters most: a
 * player with NO parameter must see exactly what shipped. A test rig that
 * changes the default is a live experiment on people who did not agree to be
 * in one.
 *
 * Usage: node scripts/check-gate0.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './lib/browser.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png',
  '.webmanifest':'application/manifest+json', '.ico':'image/x-icon', '.woff2':'font/woff2' };

const TEACH = 'Six letters. Six words. All from the wheel.';
const GOAL = 'Spell six words using only the six letters on the wheel.';

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(OUT, p);
  if (!file.startsWith(OUT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('nf'); return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;
const browser = await launch({ headless: true });

/* what each variant must show, and must not */
const EXPECT = [
  { q: '',        name: 'no parameter (a real player)', teach: true,  goal: false },
  { q: '?g0=a',   name: 'variant A — as it ships',      teach: true,  goal: false },
  { q: '?g0=c',   name: 'variant C — goal first',       teach: false, goal: true  },
  { q: '?g0=d',   name: 'variant D — control',          teach: false, goal: false },
  { q: '?g0=zzz', name: 'a typo, must fall back to A',  teach: true,  goal: false },
];

const fails = [];
for (const e of EXPECT) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  /* a cold profile every time — the teach retires once obeyed, and a warm
     profile would make every variant look like the control */
  const ctx = await browser.createBrowserContext?.() ?? null;
  await page.goto(`${base}/${e.q}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.clear(); } catch (err) { /* private mode */ } });
  await page.goto(`${base}/${e.q}`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 800));

  const seen = await page.evaluate((TEACH, GOAL) => {
    const txt = document.body.innerText;
    return { teach: txt.includes(TEACH), goal: txt.includes(GOAL) };
  }, TEACH, GOAL);

  if (seen.teach !== e.teach) {
    fails.push(`${e.name}: teach card ${seen.teach ? 'PRESENT' : 'absent'}, expected ${e.teach ? 'present' : 'absent'}`);
  }
  if (seen.goal !== e.goal) {
    fails.push(`${e.name}: goal screen ${seen.goal ? 'PRESENT' : 'absent'}, expected ${e.goal ? 'present' : 'absent'}`);
  }
  console.log(`  ${seen.teach === e.teach && seen.goal === e.goal ? '✔' : '✗'}  ${e.name}`);
  await page.close();
  if (ctx) await ctx.close().catch(() => {});
}

await browser.close();
server.close();

if (fails.length) {
  console.log('');
  for (const f of fails) console.log(`  ✗  ${f}`);
  console.log(`\n✖ ${fails.length} gate-zero variant(s) do not show what they claim`);
  process.exit(1);
}
console.log(`\n✔ all ${EXPECT.length} gate-zero paths show exactly what they claim`);
