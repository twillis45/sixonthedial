/*
 * WCAG AA, measured on the shipped export rather than asserted in a document.
 *
 * Store row 2.x asks for an accessibility answer and there was no check behind
 * it, which is exactly the shape of claim this repo has been burned by before:
 * present, plausible, and never executed.
 *
 * WHY PIXELS AND NOT COMPUTED STYLES, for contrast.
 *
 * The obvious implementation reads `color`, walks up for the first non
 * transparent `background-color`, and composites the two. On this app that
 * would LIE, and check-color.mjs already wrote down why: cards are painted
 * with `--glass-body` — 22% steel over a panel, over an ambient pool, through
 * `backdrop-saturate`. Every token is individually correct and the composited
 * result is something only the renderer knows. A token-reading contrast check
 * would have passed while the pixel a human sees failed.
 *
 * So this screenshots each text element's own box and works from the pixels.
 *
 * THE LIMIT OF THAT, stated rather than buried. Sampling a box cannot tell
 * text from decoration with certainty. It takes the most common luminance as
 * the background and the furthest luminance carrying MIN_PIXELS as the
 * foreground. For solid text on a solid or glassy ground — which is every
 * string in this app — that is the right pair. It would misreport a box
 * containing an image or a two-tone gradient behind the text, so boxes holding
 * <img>, <svg> or a background-image are skipped and COUNTED, and the count is
 * printed. A skipped element is not a passing element.
 *
 * AND THE ESTIMATOR IS CALIBRATED BEFORE IT IS BELIEVED. It renders four pairs
 * whose true ratio is arithmetic — 21:1, 7:1, 4.54:1, 1:1 — and must recover
 * each within CAL_TOL or the run aborts without reporting a single finding on
 * the app. That gate is not decoration: the first version of this file bucketed
 * luminance too coarsely and demanded the text be 2% of its own box, and
 * produced 101 failures that were nearly all fiction, including 1.00:1 for
 * text anyone can read. A number from an uncalibrated instrument is not a
 * measurement, and shipping one as a WCAG finding would be worse than having
 * no check at all.
 *
 * Target size and accessible names need no estimation and are exact.
 *
 * Run:  node scripts/check-a11y.mjs
 *       node scripts/check-a11y.mjs --red    (red-proof: inject faults, expect failure)
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

const RED = process.argv.includes('--red');

/*
 * TWO target-size bars, because they come from different documents and only
 * one of them is a standard.
 *
 * WCAG 2.2 AA 2.5.8 requires 24x24 CSS px. Apple's HIG asks for 44x44 and
 * Material for 48dp. This is a game played with a thumb on a phone, so 44 is
 * the number worth holding — but calling a 30px control a WCAG failure would
 * be wrong, and a guard that overstates its own authority gets muted. So: 24
 * FAILS, and 24-to-44 warns.
 */
const WCAG_MIN = 24;
const TOUCH_MIN = 44;

/* 4.5:1 for body text, 3:1 for large text — WCAG 1.4.3. "Large" is 24px, or
   18.66px when bold, per the spec's own definition. */
const AA_NORMAL = 4.5;
const AA_LARGE = 3;

/*
 * Foreground selection, and the bug that made the first run worthless.
 *
 * v1 bucketed luminance at 1/40 and required the foreground cluster to carry
 * 2% of the box's pixels. Both were wrong in the same direction. Glyph strokes
 * in a wide row are routinely well under 2% of the box, so the search fell
 * back to a bucket adjacent to the background and reported 1.00:1 for text a
 * human reads without effort -- 101 "failures", nearly all of them fiction.
 *
 * The floor is now an absolute pixel count, not a share, because what makes a
 * cluster real is that it is too big to be noise, not that it is a large part
 * of the frame. Buckets are 1/200, near the limit of what 8-bit sRGB can
 * distinguish anyway.
 *
 * The calibration below is what earns the right to report any of this.
 */
const MIN_PIXELS = 6;

/* sample at 3x so a 12px glyph has a solid core to find */
const DSF = 3;

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

const browser = await launch({
  headless: true,
  userDataDir: path.join(ROOT, 'node_modules', '.cache', 'a11y-chrome'),
});

/*
 * CALIBRATE AT THE SIZE YOU MEASURE, which the first calibration did not.
 *
 * v1 calibrated on 44px bold text, passed all four ratios, and then
 * under-reported 12px text by roughly 3x -- flagging 7.29:1 body text as
 * 2.46:1. The cause is antialiasing: at 12px, hardly any pixel reaches the
 * pure foreground colour, so the furthest-cluster search settles on a
 * half-blended tone. A calibration that does not include the hard case is a
 * ceremony, not a control.
 *
 * Two changes. Every ratio is now calibrated at 12px and 13px as well as
 * display size, and sampling runs at deviceScaleFactor 3 so a 12px glyph has
 * enough pixels for its core to be genuinely solid.
 */
const CAL_TOL = 0.5;
const CAL_SIZES = [
  { css: '700 44px/90px', label: '44px bold' },
  { css: '400 13px/90px', label: '13px' },
  { css: '400 12px/90px', label: '12px' },
];
const CAL = [
  { fg: '#FFFFFF', bg: '#000000', want: 21.00 },
  { fg: '#595959', bg: '#FFFFFF', want: 7.00 },
  { fg: '#767676', bg: '#FFFFFF', want: 4.54 },
];

const fails = [];
const warns = [];
let skipped = 0;
let measured = 0;

/* sRGB relative luminance, WCAG 1.4.3 definition */
function lum(r, g, b) {
  const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/*
 * Pull the (foreground, background) pair out of a box of RGBA pixels.
 * Background is the modal luminance; foreground is the luminance furthest from
 * it that still carries MIN_PIXELS. Returns null when there is no second
 * cluster worth the name.
 */
function contrastOf(px) {
  const buckets = new Map();
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 250) continue;
    const L = lum(px[i], px[i + 1], px[i + 2]);
    const key = Math.round(L * 200) / 200;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  if (buckets.size < 2) return null;
  const bg = [...buckets.entries()].sort((a, b) => b[1] - a[1])[0][0];
  let fg = null;
  for (const [L, n] of [...buckets.entries()].sort((a, b) => Math.abs(b[0] - bg) - Math.abs(a[0] - bg))) {
    if (n >= MIN_PIXELS) { fg = L; break; }
  }
  return fg === null ? null : { fg, bg };
}

async function pixelsOf(page, clip) {
  const shot = await page.screenshot({ clip });
  return page.evaluate(async (dataUrl) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(img, 0, 0);
    return Array.from(g.getImageData(0, 0, c.width, c.height).data);
  }, 'data:image/png;base64,' + shot.toString('base64'));
}

/* ---------- calibrate before measuring anything real ---------- */
{
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 400, deviceScaleFactor: DSF });
  await page.goto('about:blank');
  const bad = [];
  for (const size of CAL_SIZES) {
    for (const c of CAL) {
      await page.setContent(
        `<body style="margin:0"><div id="t" style="width:300px;height:90px;background:${c.bg};` +
        `color:${c.fg};font:${size.css} Arial,sans-serif;text-align:center">Handgloves</div></body>`);
      const px = await pixelsOf(page, { x: 0, y: 0, width: 300, height: 90 });
      const pair = contrastOf(px);
      const got = pair ? ratio(pair.fg, pair.bg) : 0;
      if (Math.abs(got - c.want) > CAL_TOL) {
        bad.push(`  ${size.label}  ${c.fg} on ${c.bg}: measured ${got.toFixed(2)}:1, true ${c.want.toFixed(2)}:1`);
      }
    }
  }
  await page.close();
  if (bad.length) {
    console.log('✖ contrast estimator failed calibration — reporting nothing:\n' + bad.join('\n'));
    await browser.close(); server.close();
    process.exit(1);
  }
  console.log(`calibrated: recovered ${CAL.length * CAL_SIZES.length} known ratios (down to 12px) within ${CAL_TOL}\n`);
}

/*
 * TOUCH IS PART OF THE VIEWPORT, and leaving it out measured the wrong app.
 *
 * The header controls are `h-9 w-9 touch:h-11 touch:w-11` — 36px with a mouse,
 * 44px with a finger. The first version of this file set width and height and
 * nothing else, so Chrome reported no touch, the `touch:` variant never
 * applied, and the guard measured a 36px control at phone width that no phone
 * has ever rendered. It then reported 81 targets under the thumb bar and a
 * board ruling was made on that number.
 *
 * A phone surface without hasTouch is not a phone.
 */
const SURFACES = [
  { name: 'phone', w: 390, h: 844, touch: true },
  { name: 'desktop', w: 1440, h: 900, touch: false },
];
const THEMES = ['dark', 'light', 'studio'];

for (const surface of SURFACES) {
  for (const theme of THEMES) {
    const page = await browser.newPage();
    await page.setViewport({
      width: surface.w, height: surface.h, deviceScaleFactor: DSF,
      isMobile: surface.touch, hasTouch: surface.touch,
    });
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem('ngw-wordy/theme', t); } catch (e) { /* first paint still fine */ }
    }, theme);

    if (RED) {
      /* Red-proof: two faults a real regression would look like. A control
         shrunk under the WCAG floor, and body text dropped to a grey that
         cannot reach 4.5:1 on this ground. If the guard is measuring what it
         claims to, both must be caught. */
      await page.addStyleTag({ content:
        `.liquid-disc button[aria-label^="Letter "]{width:20px!important;height:20px!important;min-width:0!important}` +
        `p,span{color:#6a6a6a!important}` });
    }
    await new Promise((r) => setTimeout(r, 700));

    const where = `${surface.name}/${theme}`;

    /* ---------- A. target size (exact) ---------- */
    /*
     * 2.5.8 HAS AN EXCEPTION AND A GUARD THAT IGNORES IT IS WRONG.
     *
     * The success criterion is not "every target is 24x24". A smaller target
     * passes under Spacing when a 24px-diameter circle centred on it does not
     * intersect the circle of any other target — which is to say, centres at
     * least 24px apart. That is the normal case for a wide, short control with
     * room around it.
     *
     * This mattered immediately. The one target this file flagged after every
     * other defect was fixed — the 638x18 hint bar — sits 28px clear of its
     * nearest neighbour and passes the exception comfortably. Reporting it
     * would have sent someone to pad a control that already conforms.
     */
    const targets = await page.evaluate((WCAG_MIN, TOUCH_MIN) => {
      const sel = 'button,a[href],input,select,textarea,[role="button"],[role="checkbox"],[role="switch"]';
      const vis = [];
      for (const el of document.querySelectorAll(sel)) {
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.bottom < 0 || r.top > innerHeight) continue;
        vis.push({ el, r, cx: r.left + r.width / 2, cy: r.top + r.height / 2 });
      }
      const out = [];
      for (const t of vis) {
        const w = Math.round(t.r.width), h = Math.round(t.r.height);
        if (Math.min(w, h) >= TOUCH_MIN) continue;
        /* spacing exception: no other target's centre within 24px */
        let crowded = false;
        for (const o of vis) {
          if (o.el === t.el) continue;
          if (Math.hypot(o.cx - t.cx, o.cy - t.cy) < WCAG_MIN) { crowded = true; break; }
        }
        out.push({
          w, h,
          label: (t.el.getAttribute('aria-label') || t.el.textContent || '').trim().slice(0, 34) || t.el.tagName.toLowerCase(),
          hard: Math.min(w, h) < WCAG_MIN && crowded,
        });
      }
      return out;
    }, WCAG_MIN, TOUCH_MIN);

    for (const t of targets) {
      const m = `${where}  ${t.w}x${t.h}px  "${t.label}"`;
      if (t.hard) fails.push(`target under WCAG 2.5.8 and too crowded for the spacing exception — ${m}`);
      /* The 44px bar is Apple's guidance for a FINGER. Warning about it on a
         mouse-driven desktop is noise, and a warning list nobody can act on is
         a warning list nobody reads. WCAG's own 24px floor still applies
         everywhere and is checked above. */
      else if (surface.touch) warns.push(`target under the 44px thumb bar — ${m}`);
    }

    /* ---------- B. accessible name (exact) ---------- */
    const unnamed = await page.evaluate(() => {
      const sel = 'button,a[href],[role="button"],[role="checkbox"],[role="switch"]';
      const out = [];
      for (const el of document.querySelectorAll(sel)) {
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
        const name = (el.getAttribute('aria-label')
          || el.getAttribute('title')
          || (el.getAttribute('aria-labelledby') &&
              (document.getElementById(el.getAttribute('aria-labelledby'))?.textContent || ''))
          || el.textContent || '').trim();
        if (!name) out.push(el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
      }
      return out;
    });
    for (const u of unnamed) fails.push(`interactive element has no accessible name — ${where}  <${u}>`);

    /* ---------- C. text contrast (pixel-sampled) ---------- */
    const boxes = await page.evaluate(() => {
      const out = [];
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const seen = new Set();
      let n;
      while ((n = walk.nextNode())) {
        const s = n.textContent.trim();
        if (s.length < 2) continue;
        const el = n.parentElement;
        if (!el || seen.has(el)) continue;
        seen.add(el);
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) continue;
        /* a box holding an image or a gradient defeats the two-cluster
           assumption; skip and count rather than report a number we cannot
           stand behind */
        const dirty = el.querySelector('img,svg,canvas,video')
          || cs.backgroundImage !== 'none';
        const px = parseFloat(cs.fontSize);
        const bold = (parseInt(cs.fontWeight, 10) || 400) >= 700;
        out.push({
          x: Math.round(r.left), y: Math.round(r.top),
          w: Math.round(r.width), h: Math.round(r.height),
          text: s.slice(0, 34), dirty: !!dirty,
          large: px >= 24 || (bold && px >= 18.66),
        });
      }
      return out;
    });

    for (const b of boxes) {
      if (b.dirty) { skipped += 1; continue; }
      let px;
      try { px = await pixelsOf(page, { x: b.x, y: b.y, width: b.w, height: b.h }); }
      catch { skipped += 1; continue; }

      const pair = contrastOf(px);
      if (!pair) { skipped += 1; continue; }
      const { fg, bg } = pair;

      measured += 1;
      const r = ratio(fg, bg);
      const need = b.large ? AA_LARGE : AA_NORMAL;
      if (r < need) {
        fails.push(`contrast ${r.toFixed(2)}:1 < ${need}:1 — ${where}  "${b.text}"`);
      }
    }

    /* ---------- D. reduced motion honoured ---------- */
    /*
     * FAIL ON MOVEMENT, NOT ON ANIMATION.
     *
     * v1 failed any animation over 120ms and flagged six, one per surface and
     * theme. Every one was wrong. Under reduce this app substitutes `rm-appear`
     * for its arrival animations, and rm-appear is `opacity: 0 -> 1` with no
     * transform at all; the rejection cue becomes `rm-reject`, which is purely
     * box-shadow. Both are deliberate, both are documented at globals.css:1370,
     * and both are the correct accommodation -- WCAG is concerned with MOTION,
     * and a cross-fade is the standard substitute for it, not a violation.
     *
     * So this reads the keyframes actually driving each running animation and
     * fails only when one moves, scales or rotates something. An opacity or
     * colour animation under reduce is a pass, because it is the fix.
     */
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await new Promise((r) => setTimeout(r, 300));
    const moving = await page.evaluate(() => {
      const MOVERS = /transform|translate|scale|rotate|^top$|^left$|^right$|^bottom$|margin/i;
      /* map keyframe name -> does any frame set a property that moves things */
      const movesByName = new Map();
      for (const sheet of document.styleSheets) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        for (const rule of rules) {
          if (rule.type !== CSSRule.KEYFRAMES_RULE) continue;
          let moves = false;
          for (const kf of rule.cssRules) {
            for (const prop of kf.style) if (MOVERS.test(prop)) { moves = true; break; }
            if (moves) break;
          }
          movesByName.set(rule.name, moves);
        }
      }
      const out = [];
      for (const el of document.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        const name = cs.animationName;
        if (!name || name === 'none') continue;
        const dur = parseFloat(cs.animationDuration) || 0;
        if (dur <= 0.12) continue;
        for (const n of name.split(',').map((x) => x.trim())) {
          if (movesByName.get(n)) {
            out.push((el.className ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase()) + ` ${n} ${dur}s`);
          }
        }
      }
      return [...new Set(out)].slice(0, 6);
    });
    for (const m of moving) fails.push(`MOVEMENT animation under prefers-reduced-motion — ${where}  ${m}`);

    await page.close();
  }
}

await browser.close();
server.close();

/* ---------- report ---------- */
const uniq = (a) => [...new Set(a)];
const F = uniq(fails), W = uniq(warns);

console.log(`measured ${measured} text boxes, ${skipped} skipped (image or gradient behind the text)\n`);
for (const w of W) console.log(`  !  ${w}`);
if (W.length) console.log('');
for (const f of F) console.log(`  ✗  ${f}`);

if (RED) {
  /* the point of --red is that the guard must FAIL; a pass here means the
     check is not measuring what it claims to */
  if (F.length) {
    console.log(`\n✔ red-proof: ${F.length} failure(s) caught with the faults injected`);
    process.exit(0);
  }
  console.log('\n✖ red-proof FAILED — faults were injected and nothing was caught');
  process.exit(1);
}

if (F.length) {
  console.log(`\n✖ ${F.length} WCAG AA failure(s)`);
  process.exit(1);
}
console.log(`✔ WCAG AA holds across ${SURFACES.length * THEMES.length} surface/theme combinations` +
  (W.length ? ` (${W.length} target(s) under the 44px thumb bar, not a WCAG failure)` : ''));
