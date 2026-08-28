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
  /* a gate-zero URL is curtained until its board is ready (see GATE0_NO_FLASH),
     and innerText reads empty through the curtain — so wait for the lift, not
     for a guessed number of milliseconds */
  await page.evaluate(async () => {
    const visible = () => !('g0Pending' in document.documentElement.dataset)
      && getComputedStyle(document.body).visibility !== 'hidden';
    for (let i = 0; i < 200 && !visible(); i++) await new Promise((r) => setTimeout(r, 25));
  });
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

/*
 * Variant B has properties the others do not, and one of them is the kind that
 * breaks quietly: it must cost NOTHING. revealWord prices a whole word at
 * COST_WORD, so if the free path ever regresses to a real charge, B's player
 * starts the game with an emptied wallet, every later comparison against A is
 * invalid, and the board still looks completely normal.
 */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.clear(); } catch (err) { /* private mode */ } });
  await page.goto(`${base}/?g0=b`, { waitUntil: 'domcontentloaded' });
  /* the scripted reveal starts once the board is real — clock it from the
     curtain lift, not from navigation */
  await page.evaluate(async () => {
    const visible = () => !('g0Pending' in document.documentElement.dataset)
      && getComputedStyle(document.body).visibility !== 'hidden';
    for (let i = 0; i < 200 && !visible(); i++) await new Promise((r) => setTimeout(r, 25));
  });
  await new Promise((r) => setTimeout(r, 2600));

  const b = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('button[aria-label^="Row "]')]
      .map((el) => el.getAttribute('aria-label'));
    let spent = null, revealed = 0;
    try {
      const p = JSON.parse(localStorage.getItem('ngw-wordy/v2') || '{}');
      spent = p.spent ?? null;
      revealed = Object.values(p.reveals || {}).reduce((a, r) => a + ((r && r.words) || []).length, 0);
    } catch (err) { /* private mode */ }
    return { rows, spent, revealed, caption: /all from the wheel\. That is one row/.test(document.body.innerText) };
  });

  const solved = b.rows.filter((r) => /, done$/.test(r || '')).length;
  const ok = (m, cond) => { console.log(`  ${cond ? '\u2714' : '\u2717'}  ${m}`); if (!cond) fails.push(`variant B: ${m}`); };
  ok('variant B — solves exactly one row, unprompted', solved === 1);
  ok('variant B — the row was revealed, not guessed', b.revealed === 1);
  ok('variant B — names what happened', b.caption === true);
  ok('variant B — charged nothing for it', b.spent === 0);
  await page.close();
}

/*
 * The ladder swap, which is the whole reason the run is worth doing.
 *
 * Sitting 2's ruling: a Miss on a themed board cannot be told apart from a Miss
 * on the mechanic, and those need opposite fixes. So every variant — A included
 * — must meet the general board, or A is being compared against a different
 * puzzle and the tallies mean nothing.
 *
 * Asserted the way the nine measurement defects taught: the ladder must EXIST
 * and must DIFFER from the shipping one before anything is called green.
 * Absence and success look identical to a naive query.
 */
{
  const data = JSON.parse(fs.readFileSync(path.join(OUT, 'data', 'puzzles.json'), 'utf8'));
  const ok = (m, cond) => { console.log(`  ${cond ? '\u2714' : '\u2717'}  ${m}`); if (!cond) fails.push(m); };

  const g0 = data.gate0Starters;
  ok('the gate-zero ladder exists in the built file', Array.isArray(g0) && g0.length > 0);
  const shipBase = data.puzzles[data.starters[0]]?.base;
  const g0Base = g0 && data.puzzles[g0[0]]?.base;
  ok('it is a different first board from the shipping ladder', !!g0Base && g0Base !== shipBase);

  const letters = (b) => [...b].sort().join('');
  for (const q of ['?g0=a', '?g0=b', '?g0=c', '?g0=d']) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { try { localStorage.clear(); } catch (err) { /* private mode */ } });
    await page.goto(`${base}/${q}`, { waitUntil: 'domcontentloaded' });
    /*
     * The FIRST board the stranger can see, not the one that settles.
     * A fixed wait would have passed the version of this that showed the
     * shipping board for a second and then swapped it — measured, and the
     * reason the head script exists. So: poll until the curtain lifts, and
     * read the wheel at that instant.
     */
    const seen = await page.evaluate(async () => {
      const read = () => [...document.querySelectorAll('[aria-label^="Letter "]')]
        .map((el) => el.getAttribute('aria-label').slice(7, 8).toLowerCase())
        .sort().join('');
      const visible = () => !('g0Pending' in document.documentElement.dataset)
        && getComputedStyle(document.body).visibility !== 'hidden';
      for (let i = 0; i < 200 && !visible(); i++) await new Promise((r) => setTimeout(r, 25));
      return { curtained: !visible(), wheel: read() };
    });
    ok(`${q} was curtained until its board was ready`, seen.curtained === false);
    ok(`${q} shows the general board (${g0Base}) on the first visible frame`, seen.wheel === letters(g0Base));
    await page.close();
  }

  /* and a real player, with no parameter, must NOT have been moved */
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.clear(); } catch (err) { /* private mode */ } });
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 900));
  const seen = await page.evaluate(() =>
    [...document.querySelectorAll('[aria-label^="Letter "]')]
      .map((el) => el.getAttribute('aria-label').slice(7, 8).toLowerCase())
      .sort().join('')
  );
  ok(`no parameter still lands on the shipping board (${shipBase})`, seen === letters(shipBase));
  await page.close();
}

await browser.close();
server.close();

if (fails.length) {
  console.log('');
  for (const f of fails) console.log(`  ✗  ${f}`);
  console.log(`\n✖ ${fails.length} gate-zero variant(s) do not show what they claim`);
  process.exit(1);
}
console.log(`\n✔ all four variants show exactly what they claim (${EXPECT.length} paths + 4 checks on B + the ladder swap)`);
