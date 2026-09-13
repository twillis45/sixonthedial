/**
 * The demo, captured — stills at every beat and a clip of the whole run.
 *
 * `docs/DEMO.md` is a script for a person standing in front of another person.
 * This drives that script against the SHIPPED export and records what actually
 * happens, which is worth having for two different reasons:
 *
 *   You get stills to put in a deck or a message without holding a phone.
 *   And the runbook gets checked. A demo script is a set of claims about what
 *   the app does at each beat — the teach card is there, the rank moves off
 *   Novice, the dial turns — and a runbook nobody has executed is exactly as
 *   trustworthy as a check nobody has run. This run asserts the load-bearing
 *   ones and fails rather than recording a demo that does not happen.
 *
 * FRAMES, NOT A SCREENCAST — the same call `capture-video.mjs` documents at
 * length: `page.screencast()` records the compositing surface, which is sized
 * by the OS window and ignores deviceScaleFactor, and it produced a file whose
 * content sat in the top-left corner with black around it. `page.screenshot()`
 * renders the emulated viewport at the scale factor asked for. So: grab stills
 * on a timer while the interaction runs, keep the wall-clock stamp on each, and
 * let ffmpeg's concat demuxer replay the real durations.
 *
 *   npm run build && node scripts/capture-demo.mjs
 *
 * Serves out/ itself on a random port, so there is nothing to start first and
 * nothing to leave running afterwards.
 */
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch } from './lib/browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');
const DEST = path.join(ROOT, 'store', 'demo');

if (!fs.existsSync(path.join(OUT, 'index.html'))) {
  console.error('✗ no out/ — run `npm run build` first');
  process.exit(1);
}

/* The progress key, cleared before every run so the teach card is present.
   Named the same way capture-store.mjs names it, for the same reason: the
   teach retires after the first banked word and that is persisted, so a
   second run in a warm profile silently records a different demo. */
const KEY = 'ngw-wordy/v2';

/* Board 56 is the fixed first board, 24 the second, 2 the one with the
   redacted clues. All three are indexes into data.puzzles, which is what a
   `#play=` link carries — read out of the catalogue rather than typed, so a
   rebuild that moves them fails here instead of recording the wrong board. */
const CATALOGUE = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public', 'data', 'puzzles.json'), 'utf8')
);
const indexOf = (base) => {
  const i = CATALOGUE.puzzles.findIndex((p) => p.base === base);
  if (i < 0) throw new Error(`no board based on "${base}" in the catalogue`);
  return i;
};
/*
 * `#play=` IS 1-BASED. Game.tsx resolves it as `Math.min(n - 1, …)`, so the
 * link for a board at index i is `#play=${i + 1}`. Passing the index straight
 * through loads the board BEFORE the one you asked for, which is the most
 * expensive kind of wrong: it renders a perfectly good board, with a perfectly
 * good clue, and nothing anywhere says you are looking at the wrong one. Caught
 * only by asserting the theme name after navigating.
 */
const INMATE_LINK = indexOf('inmate') + 1;

/** The first-run teach, as `scripts/check-intro.mjs` defines it. It is NOT the
    standing "Tap letters to spell a word" prompt, which never retires — a
    distinction worth keeping, because asserting the wrong one reports a healthy
    teach as broken. */
const TEACH = 'Six letters. Six words. All from the wheel.';

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(OUT, p);
  if (!file.startsWith(OUT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('nf'); return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}`;

fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });

const wait = (page, ms) =>
  page.evaluate((m) => new Promise((r) => setTimeout(r, m)), ms).catch(() => {});

/* Stills are numbered in the order a person performs them, so the folder reads
   as the runbook does. */
let shotN = 0;
const shots = [];
async function shot(page, name) {
  const file = path.join(DEST, `${String(++shotN).padStart(2, '0')}-${name}.png`);
  await page.screenshot({ path: file });
  shots.push(path.basename(file));
  console.log(`     · ${path.basename(file)}`);
}

/* The assertions. Each one is a sentence docs/DEMO.md says out loud, so a
   failure here means the runbook is wrong — which is the point. */
const failures = [];
async function assert(page, what, fn, arg) {
  let ok = false;
  try { ok = await page.evaluate(fn, arg); } catch { ok = false; }
  console.log(`     ${ok ? '✔' : '✗'} ${what}`);
  if (!ok) failures.push(what);
}

/*
 * BLUR BEFORE TYPING, and this one cost a whole run.
 *
 * Touching a tile leaves DOM focus on that button. `keyboard.press('Enter')`
 * then re-activates the focused BUTTON instead of submitting the word — so
 * every subsequent keystroke piled into the buffer and nothing ever banked. The
 * recording showed all six tiles lit, a buffer reading HATWRM, and 1/6 rows,
 * which looks like a game bug and is not one.
 */
const type = async (page, word, ms = 165) => {
  await page.evaluate(() => document.activeElement?.blur?.());
  for (const ch of word) { await page.keyboard.press(ch); await wait(page, ms); }
  await page.keyboard.press('Enter');
};

/** Click a control by its visible text. DOM clicks, not gestures — no camera
    pause needed, because nothing here holds a pointer down. */
const clickText = (page, re) =>
  page.evaluate((src) => {
    const b = [...document.querySelectorAll('button')]
      .find((x) => new RegExp(src).test((x.textContent ?? '').trim()));
    if (!b) return false;
    b.click();
    return true;
  }, re.source);

/** Click a control by its aria-label — the meta surfaces are labelled, not
    captioned, so this is the handle for the catalogue, rank and rules. */
const clickAria = (page, re) =>
  page.evaluate((src) => {
    const b = [...document.querySelectorAll('button')]
      .find((x) => new RegExp(src, 'i').test(x.getAttribute('aria-label') ?? ''));
    if (!b) return false;
    b.click();
    return true;
  }, re.source);

/** Shut whatever sheet is open, the way capture-store.mjs does. */
async function closeSheet(page) {
  for (let i = 0; i < 3; i++) {
    const open = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
    if (!open) return true;
    const hit = await page.evaluate(() => {
      const b = [...document.querySelectorAll('button')]
        .find((x) => /^\s*(close|done|i.?ve got it|keep looking)\s*$/i.test(x.textContent || ''));
      if (b) { b.click(); return true; }
      return false;
    });
    if (!hit) await page.keyboard.press('Escape');
    await wait(page, 600);
  }
  return !(await page.evaluate(() => !!document.querySelector('[role="dialog"]')));
}

/** Centre points of the dial tiles, by letter — for dragging rather than typing. */
const tilePoints = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('button[aria-label^="Letter "]')].map((b) => {
      const r = b.getBoundingClientRect();
      return {
        L: b.getAttribute('aria-label').match(/Letter (\w)/)[1],
        x: Math.round(r.left + r.width / 2),
        y: Math.round(r.top + r.height / 2),
      };
    })
  );

/*
 * TOUCH, NOT MOUSE, because the viewport is emulating a phone.
 *
 * `capture-video.mjs` traces words with `page.mouse` and is right to — its
 * clips do not set `hasTouch`. This capture does, because a demo of a thumb
 * game recorded with a mouse cursor's event stream is a demo of something else.
 *
 * A CORRECTION, kept because the wrong answer was convincing: when the traced
 * word first failed to bank, the comment here blamed the touch path — synthetic
 * mouse events not reaching a pointer handler, the obvious suspect. That was
 * wrong. Driven on its own, the touch drag banks every time, at both settings
 * of `hasTouch`; what actually breaks it is taking a screenshot while a touch
 * point is down, which is the note on `dragWord` below.
 * The touch path is not implicated in anything. What IS still true, and is
 * board item b4h, is that none of this is a finger: a real one produces
 * coalesced moves and variable pressure, and nothing here tests that.
 */
/*
 * A SCREENSHOT TAKEN MID-GESTURE CANCELS THE GESTURE. Nothing stands in for
 * this one: it is the whole reason the camera has a pause.
 *
 * A traced word banks every time when driven on its own — at both settings of
 * `hasTouch`, at deviceScaleFactor 1 and 2, with either style of wait. Measured,
 * three ways, because the first two explanations were wrong: it is not the touch
 * path, and it is not the grabber being too fast. Yielding between frames did
 * not help, and driving the shutter by hand between touch steps did not help,
 * because both still take a screenshot while a touch point is down. Take none,
 * and it banks.
 *
 * So the gesture runs blind, and the cost is honest: the clip holds its last
 * frame for the ~1.5s of the trace. Better a held frame than a recording of a
 * finger crossing four tiles while the board does nothing, which is what the
 * first four runs produced and which looks exactly like a broken game.
 *
 * The flag alone is not enough — a capture already in flight when it is set
 * still lands, and one frame is all it takes. Hence the settle before starting.
 */
async function dragWord(page, word, cam) {
  const tiles = await tilePoints(page);
  const pts = [...word].map((L) => tiles.find((t) => t.L === L)).filter(Boolean);
  if (pts.length !== word.length) return false;
  cam.paused = true;
  /* Let any in-flight screenshot finish before the gesture starts. Setting the
     flag does not cancel one that is already mid-capture, and that single frame
     was enough. */
  await new Promise((r) => setTimeout(r, 300));
  await page.touchscreen.touchStart(pts[0].x, pts[0].y);
  for (const q of pts.slice(1)) {
    await page.touchscreen.touchMove(q.x, q.y);
    await wait(page, 220);
  }
  await wait(page, 300);
  await page.touchscreen.touchEnd();
  cam.paused = false;
  return true;
}

/**
 * The clue panel cycles clues on tap; it does not show them all at once, and a
 * row chip opens HINT options rather than selecting a clue. So finding a
 * particular clue means tapping the panel until it comes round.
 */
async function clueUntil(page, re, tries = 8) {
  for (let i = 0; i < tries; i++) {
    if (await page.evaluate((src) => new RegExp(src).test(document.body.innerText), re.source)) return true;
    await page.evaluate(() => {
      const panel = [...document.querySelectorAll('button')]
        .find((b) => /tap for the next clue/i.test(b.textContent ?? ''));
      panel?.click();
    });
    await wait(page, 700);
  }
  return page.evaluate((src) => new RegExp(src).test(document.body.innerText), re.source);
}

/* ── the two runs ──────────────────────────────────────────────────────── */

const CLIPS = [
  {
    name: 'demo-path-a',
    what: 'the game: first run, board one solved, board two, the packs',
    size: { width: 390, height: 844, dsf: 2 },
    play: async (page, cam) => {
      await page.evaluateOnNewDocument((k) => {
        try { localStorage.removeItem(k); } catch { /* first run */ }
      }, KEY);
      await page.goto(BASE, { waitUntil: 'networkidle0' });
      await wait(page, 1400);

      /* Beat 1 — the first thing a stranger sees. */
      await assert(page, 'the board opens on Warm-up 1, Sunday Dinner',
        () => /Warm-up 1/.test(document.body.innerText) &&
              /SUNDAY DINNER/i.test(document.body.innerText));
      await assert(page, 'the dial reads AHMRTW',
        () => [...document.querySelectorAll('button[aria-label^="Letter "]')]
                .map((b) => b.getAttribute('aria-label').match(/Letter (\w)/)[1])
                .sort().join('') === 'AHMRTW');
      await assert(page, 'the first-run teach is present',
        (line) => document.body.innerText.includes(line), TEACH);
      await assert(page, 'rank starts at Novice, 0 of 6',
        () => /Novice/.test(document.body.innerText) && /0\/6/.test(document.body.innerText));
      await shot(page, 'first-run');

      /* Beat 2 — open on a three so banking is visible in ten seconds. */
      await type(page, 'HAM');
      await wait(page, 2100);
      await assert(page, 'HAM banks — one row of six',
        () => /1\/6/.test(document.body.innerText));
      await assert(page, 'the teach retires once it has been obeyed',
        (line) => !document.body.innerText.includes(line), TEACH);
      await assert(page, 'and the rank moves off Novice on the first word',
        () => !/^Novice/m.test(document.body.innerText));
      await shot(page, 'ham-banked');

      /*
       * WHAM before anything else, because the board says so.
       *
       * Letters unlock as rows land — `startActive` is 3 and `unlockOrder` is
       * h,a,m,w,t,r — so after HAM the only new letter is W, and a demo that
       * reaches for HAT next is reaching for a tile that is still locked. The
       * runbook had exactly that order and it was written from the answer list
       * rather than from the ladder. The order below is derived from the
       * board's own unlockOrder.
       */
      await type(page, 'WHAM');
      await wait(page, 2000);
      await assert(page, 'WHAM banks — the second unlock is W, not T',
        () => /2\/6/.test(document.body.innerText));

      /* Beat 3 — the same thing with a finger instead of a keyboard. */
      const dragged = await dragWord(page, 'THAW', cam);
      await wait(page, 2200);
      if (!dragged) failures.push('could not trace THAW across the dial');
      await assert(page, 'tracing THAW with a finger banks it, same as tapping',
        () => /3\/6/.test(document.body.innerText) && /THAW/i.test(document.body.innerText));
      await shot(page, 'dragged-thaw');

      /* Beat 4 — the shape changes, the answers do not. */
      const before = (await tilePoints(page)).map((t) => t.L).join('');
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')]
          .find((x) => /shuffle/i.test(x.getAttribute('aria-label') ?? x.textContent ?? ''));
        b?.click();
      });
      await wait(page, 1500);
      const after = (await tilePoints(page)).map((t) => t.L).join('');
      console.log(`     ${before !== after ? '✔' : '✗'} shuffle moves the letters (${before} → ${after})`);
      if (before === after) failures.push('shuffle did not move the letters');
      await shot(page, 'shuffled');

      /* Beat 5 — finish, landing on the word in the scene line. */
      for (const w of ['HAT', 'WARM']) { await type(page, w); await wait(page, 1900); }
      await type(page, 'WARMTH');
      await wait(page, 3200);
      await assert(page, 'the board completes', () => /6\/6/.test(document.body.innerText));
      await assert(page, 'and the cleared sheet names the rank it earned',
        () => /WARM-UP 1 CLEARED/i.test(document.body.innerText));
      await shot(page, 'board-one-complete');

      /* Beat 6 — board one was not a one-off. The cleared sheet offers the next
         rung by name, so the walkthrough takes it rather than reloading. */
      const wentOn = await clickText(page, /Warm-up 2/);
      await wait(page, 2200);
      if (!wentOn) failures.push('no "Warm-up 2" control on the cleared sheet');
      await assert(page, 'board two is The Cookout',
        () => /THE COOKOUT/i.test(document.body.innerText));
      /* DIP first: startActive 3 over unlockOrder d,i,p,t,e,c, so D, I and P
         are the only live tiles. The ladder again. */
      await type(page, 'DIP');
      await wait(page, 2200);
      await assert(page, 'DIP banks on the second board',
        () => /1\/6/.test(document.body.innerText));
      await shot(page, 'board-two');

      /* Beat 7 — the packs, which are the half of the game being sold. */
      await clickAria(page, /Puzzles and themes/);
      await wait(page, 1500);
      await assert(page, 'the catalogue opens on the themed packs',
        () => !!document.querySelector('[role="dialog"]'));
      await shot(page, 'catalogue');
      await closeSheet(page);
      await wait(page, 700);

      /* Beat 8 — the ladder a player is climbing. */
      await clickAria(page, /Rank and progress/);
      await wait(page, 1500);
      await shot(page, 'rank-ladder');
      await closeSheet(page);
      await wait(page, 700);

      /* Beat 9 — the whole rule set on one sheet, which is the answer to
         "how long before I understand this". */
      await clickAria(page, /How to play/);
      await wait(page, 1500);
      await shot(page, 'rules-and-settings');
      await closeSheet(page);
      await wait(page, 900);
    },
  },
  {
    name: 'demo-path-b',
    what: 'the claims: the redacted clue, the press kit, and the policy that now scrolls',
    size: { width: 390, height: 844, dsf: 2 },
    play: async (page, cam) => {
      await page.evaluateOnNewDocument((k) => {
        try { localStorage.removeItem(k); } catch { /* first run */ }
      }, KEY);

      /* The clue that completes itself. A `#play=` link outranks the warm-up
         ladder — and it is 1-based, so the board is asserted by name rather
         than trusted, because the off-by-one renders a real board quietly. */
      await page.goto(`${BASE}/#play=${INMATE_LINK}`, { waitUntil: 'networkidle0' });
      await wait(page, 1700);
      await assert(page, 'the link lands on The Nineties, not the board next door',
        () => /THE NINETIES/i.test(document.body.innerText));

      const foundBlank = await clueUntil(page, /—{3,}/);
      console.log(`     ${foundBlank ? '✔' : '✗'} a clue written around its own answer is on screen`);
      if (!foundBlank) failures.push('no redacted clue reachable on the board');
      await shot(page, 'clue-redacted');

      /*
       * MINE, MINT, then NAME — the ladder again. `startActive` is 4 over
       * unlockOrder m,i,n,e,t,a, so A is the LAST letter to unlock and NAME
       * cannot be spelled until two rows have landed. Typing it first banks
       * nothing and looks, on a recording, exactly like a broken keyboard.
       */
      for (const w of ['MINE', 'MINT']) { await type(page, w); await wait(page, 2000); }
      await type(page, 'NAME');
      await wait(page, 2800);
      await assert(page, 'three rows land on The Nineties board',
        () => /3\/6/.test(document.body.innerText));
      /*
       * PRESS AND HOLD THE SOLVED CHIP. This is not how the runbook described
       * it, and the runbook was written from the code that fills the clue
       * rather than from the screen that shows it.
       *
       * The clue PANEL always shows an unsolved row — solve NAME and it moves
       * straight on to the next question, which is correct behaviour and the
       * opposite of the beat the runbook promised. `fillClue` renders in
       * WordTray's peek: hover on a mouse, press-and-hold on touch, over a
       * solved row chip. So it is a thing you show deliberately, not a thing
       * that happens at you.
       */
      const chip = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')]
          .find((x) => (x.textContent ?? '').trim() === 'NAME');
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      });
      let filled = false;
      if (chip) {
        /* Same reason as the drag: the hold is a timed pointer sequence, and a
           free-running shutter delivers it as a tap. */
        cam.paused = true;
        await new Promise((r) => setTimeout(r, 300));
        await page.touchscreen.touchStart(chip.x, chip.y);
        await wait(page, 1200);
        filled = await page.evaluate(() => /Say My NAME/i.test(document.body.innerText));
        await shot(page, 'clue-filled');
        await page.touchscreen.touchEnd();
        cam.paused = false;
      } else {
        await shot(page, 'clue-filled');
      }
      console.log(`     ${filled ? '✔' : '✗'} holding the solved NAME chip shows its clue, blank filled`);
      if (!filled) failures.push('press-and-hold on a solved row did not fill the clue');

      /* The press kit. */
      await page.goto(`${BASE}/press/`, { waitUntil: 'networkidle0' });
      await wait(page, 900);
      await assert(page, 'the press kit leads with the honest status',
        () => /Not released on the App Store or Google Play/i.test(document.body.innerText));
      await shot(page, 'press-top');

      await page.evaluate(() => {
        const s = document.querySelector('[data-page-scroll]');
        if (s) s.scrollTop = 1400;
      });
      await wait(page, 1200);
      await shot(page, 'press-factsheet');

      /* The policy that could not be scrolled until 2026-09-13. This is the
         b3k proof, and it is the one worth having on camera. */
      await page.goto(`${BASE}/privacy/`, { waitUntil: 'networkidle0' });
      await wait(page, 900);
      await shot(page, 'privacy-top');

      await page.evaluate(() => {
        const s = document.querySelector('[data-page-scroll]');
        if (s) s.scrollTo({ top: 1e6, behavior: 'smooth' });
      });
      await wait(page, 2200);
      await assert(page, 'the privacy policy reaches its own last line',
        () => {
          const main = document.querySelector('main');
          return !!main && main.getBoundingClientRect().bottom - window.innerHeight <= 2;
        });
      await shot(page, 'privacy-bottom');
      await wait(page, 900);
    },
  },
];

/* ── run them ──────────────────────────────────────────────────────────── */

const made = [];
for (const clip of CLIPS) {
  console.log(`\n  ${clip.name} — ${clip.what}`);
  const browser = await launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60_000);
  await page.setViewport({
    width: clip.size.width, height: clip.size.height,
    deviceScaleFactor: clip.size.dsf, isMobile: true, hasTouch: true,
  });
  /* Dark is the shipped default when the OS has no opinion; ask for it rather
     than inheriting whatever the runner happens to be set to, which is the
     defect check:settings was caught by. */
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);

  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sixdial-demo-'));
  const stamps = [];
  let grabbing = true;
  const started = Date.now();
  /* The shutter, shared with the gesture helpers so they can stop the loop and
     drive it by hand for the duration of a touch sequence. */
  const cam = {
    paused: false,
    async grab() {
      const file = path.join(frameDir, `f${String(stamps.length).padStart(5, '0')}.png`);
      try { await page.screenshot({ path: file, optimizeForSpeed: true }); }
      catch { return false; }
      stamps.push({ file, at: Date.now() - started });
      return true;
    },
  };
  /*
   * THE GRABBER HAS TO YIELD, or it eats the gestures it is filming.
   *
   * Screenshotting flat-out starves input dispatch: a traced word that banks
   * reliably on its own silently banked NOTHING while the loop ran, three runs
   * in a row, with a clean dial and no error — the recording showed a finger
   * crossing four tiles and a board that did not move. The drag is not the
   * fragile part; the camera was.
   *
   * 60ms between frames is ~12fps of capture, which the concat demuxer replays
   * at real durations anyway, and it leaves the event loop enough room to
   * deliver a touch sequence in order.
   */
  const grabber = (async () => {
    while (grabbing) {
      if (!cam.paused) { if (!(await cam.grab())) break; }
      await new Promise((r) => setTimeout(r, 60));
    }
  })();

  await clip.play(page, cam);
  grabbing = false;
  await grabber;

  if (stamps.length < 2) {
    console.log(`  ✗ ${clip.name} — only ${stamps.length} frame(s)`);
    failures.push(`${clip.name} recorded nothing`);
    await page.close(); await browser.close();
    fs.rmSync(frameDir, { recursive: true, force: true });
    continue;
  }

  const gaps = stamps.slice(1).map((s, i) => (s.at - stamps[i].at) / 1000);
  const median = gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
  const list = path.join(frameDir, 'frames.txt');
  fs.writeFileSync(
    list,
    stamps.map((s, i) => `file '${s.file}'\nduration ${(gaps[i] ?? median).toFixed(4)}`).join('\n') +
      `\nfile '${stamps.at(-1).file}'\n`
  );
  await page.close();
  await browser.close();

  const mp4 = path.join(DEST, `${clip.name}.mp4`);
  /* yuv420p and the even-dimension filter are not decoration: an odd pixel
     dimension makes H.264 fail outright, and without the pixel format
     QuickTime opens a black frame rather than an error. */
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', list,
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p',
    '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-r', '30', mp4],
    { stdio: 'pipe' });
  fs.rmSync(frameDir, { recursive: true, force: true });

  const secs = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
      '-of', 'csv=p=0', mp4], { encoding: 'utf8' }).trim()
  );
  made.push({ name: clip.name, mp4, secs, bytes: fs.statSync(mp4).size, frames: stamps.length });
  console.log(`  ✔ ${clip.name}  ${secs.toFixed(1)}s  ${(fs.statSync(mp4).size / 1024 / 1024).toFixed(1)}MB  ${stamps.length} frames`);
}

server.close();

/*
 * THE WALKTHROUGH — both parts as one file.
 *
 * The two clips are separately useful: path A is what you send someone who
 * might play it, path B is what you send someone who wants to know whether the
 * claims hold. But the thing most often actually wanted is "the demo", once,
 * end to end, and asking somebody to play two files in the right order is a
 * worse artifact than one that already is in the right order.
 *
 * Stream copy rather than re-encode: both parts come out of the same encoder
 * settings at the same dimensions, so there is nothing to normalise and a
 * re-encode would only cost a generation of quality.
 */
if (made.length === CLIPS.length) {
  const list = path.join(DEST, 'walkthrough.txt');
  fs.writeFileSync(list, made.map((m) => `file '${m.mp4}'`).join('\n') + '\n');
  const walk = path.join(DEST, 'demo-walkthrough.mp4');
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', walk],
    { stdio: 'pipe' });
  fs.rmSync(list, { force: true });
  const secs = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
      '-of', 'csv=p=0', walk], { encoding: 'utf8' }).trim()
  );
  /* A concat that silently drops a part still produces a playable file, so the
     joined duration is checked against the sum of what went in. */
  const want = made.reduce((n, m) => n + m.secs, 0);
  if (Math.abs(secs - want) > 1.5) {
    console.log(`\n✗ walkthrough is ${secs.toFixed(1)}s but its parts total ${want.toFixed(1)}s`);
    failures.push('the joined walkthrough lost a part');
  } else {
    made.push({ name: 'demo-walkthrough', mp4: walk, secs, bytes: fs.statSync(walk).size });
  }
}

console.log(`\n${shots.length} still(s) and ${made.length} clip(s) → store/demo/`);
for (const m of made) console.log(`  ${m.name}.mp4  ${m.secs.toFixed(1)}s`);

if (failures.length) {
  console.log(`\n✖ ${failures.length} beat(s) in docs/DEMO.md did not happen as written:`);
  for (const f of failures) console.log(`    ${f}`);
  console.log('  The runbook is the thing to fix, not this script.');
  process.exit(1);
}
console.log('\n✔ every beat in the runbook happened as written');
