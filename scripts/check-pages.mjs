/**
 * Every page that is not the game must be readable to its last line.
 *
 * THIS SHIPPED. `globals.css` sets `body { position: fixed; inset: 0; overflow:
 * hidden }`, which is right for the game — a fixed board that must not
 * rubber-band under a thumb, and which check-rail and check-tiles both measure
 * on that assumption. It is applied to every route, so /privacy, /terms,
 * /support and the 404 rendered their full height inside a viewport-sized clip
 * with no scroller anywhere. On a 390x844 phone /privacy is 1546px of content
 * of which 844 could be read, and nothing moved it.
 *
 * The reason nothing caught it is the reason this file is an ENUMERATION rather
 * than a list: every runtime check in this repo drives `/`, the one route where
 * the fixed body is correct. A check that named the four known pages would pass
 * forever, including on the day a fifth ships without a scroller — which is
 * exactly how the fourth one shipped.
 *
 * So: walk the export, take every route that emits an index.html except the
 * game, and assert two things about each at a phone viewport.
 *
 *   1. It can reach its own bottom. Scroll the scroller to its end and check
 *      that the last pixel of <main> is inside the viewport.
 *   2. It is not scrolling the WRONG thing. A page whose body scrolls instead
 *      of its own container behaves differently under an installed PWA and on
 *      iOS Safari, so the container is asserted by name.
 *
 * Run against the built export, with it served:
 *   npm run build && node scripts/check-pages.mjs
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './lib/browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out');

if (!fs.existsSync(path.join(OUT, 'index.html'))) {
  console.error('✗ no out/ — run `npm run build` first');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

/* Every emitted route, discovered rather than listed. `/` is excluded by name
   and with a reason: it is the game, and the fixed body is correct there. */
function routes(dir = OUT, base = '/') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '_next' || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (fs.existsSync(path.join(full, 'index.html'))) out.push(`${base}${e.name}/`);
      out.push(...routes(full, `${base}${e.name}/`));
    }
  }
  /* 404.html is a page a person genuinely lands on, and it is emitted as a file
     rather than a directory, so the walk above cannot see it. */
  if (dir === OUT && fs.existsSync(path.join(OUT, '404.html'))) out.push('/404.html');
  return [...new Set(out)];
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(OUT, p);
  if (!file.startsWith(OUT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end('nf');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

/*
 * Two viewports, both phones, one of them short. The short one is not padding:
 * a page that fits on a 844px screen and not on a 667px one is the case where
 * "it looked fine" and "it works" come apart, and it is the more common device.
 */
const VIEWS = [
  { w: 390, h: 844, label: 'iPhone 14' },
  { w: 360, h: 640, label: 'small Android' },
];

const list = routes();
const browser = await launch({ headless: true });
let bad = 0;
let checked = 0;

for (const route of list) {
  for (const v of VIEWS) {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60_000);
    await page.setViewport({ width: v.w, height: v.h, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 350));

    const seen = await page.evaluate(() => {
      const scroller = document.querySelector('[data-page-scroll]');
      const main = document.querySelector('main');
      if (!main) return { noMain: true };
      const target = scroller ?? document.scrollingElement;
      target.scrollTop = 1e6;
      // Two frames: one to apply, one to settle any smooth-scroll the UA adds.
      return new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const r = main.getBoundingClientRect();
            resolve({
              hasScroller: !!scroller,
              overflow: Math.round(main.scrollHeight - window.innerHeight),
              bottomLeft: Math.round(r.bottom - window.innerHeight),
            });
          })
        )
      );
    });

    checked++;
    const where = `${route.padEnd(11)} ${v.label}`;

    if (seen.noMain) {
      console.log(`✗  ${where}  no <main> — cannot tell what the page is`);
      bad++;
    } else if (!seen.hasScroller) {
      console.log(`✗  ${where}  no [data-page-scroll] — the fixed body clips this page`);
      console.log('   wrap it in <PageScroll>; see src/components/PageScroll.tsx');
      bad++;
    } else if (seen.bottomLeft > 2) {
      /* Scrolled to the end and the content still runs past the fold. */
      console.log(`✗  ${where}  ${seen.bottomLeft}px unreachable below the fold`);
      bad++;
    } else {
      const note = seen.overflow > 0 ? `scrolls ${seen.overflow}px` : 'fits';
      console.log(`✔  ${where}  ${note}, reaches its end`);
    }

    await page.close();
  }
}

await browser.close();
server.close();

if (bad) {
  console.log(`\n✖ ${bad} of ${checked} page/viewport pairs cannot be read to the end.`);
  process.exit(1);
}
console.log(`\n✔ ${list.length} non-game route(s) readable to the last line at ${VIEWS.length} viewports.`);
