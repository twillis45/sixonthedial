/**
 * Stage the press-kit images into public/ before `next build` reads it.
 *
 * The composites live in `store/marketing/` because that is where every other
 * store artefact lives, and they are committed there (the `flat-*` and
 * `mockup-*` files are the two exceptions to the marketing .gitignore, because
 * nothing regenerates the hand-composited ones). The press page needs them
 * SERVED, which on a static export means they have to sit under `public/`.
 *
 * Copying rather than committing a second copy: `public/press/` is ignored, so
 * git holds one copy of a 5 MB set instead of two, and the two can never drift
 * apart into "which one did the page ship?".
 *
 * This runs FIRST in `npm run build`. If it did not, `next build` would emit a
 * press page whose every image 404s and nothing would say so — which is the
 * failure mode the check at the other end (`npm run check:press`) exists for.
 *
 *   node scripts/build-press.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'store', 'marketing');
const DEST = path.join(ROOT, 'public', 'press');
const KIT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'press-kit.json'), 'utf8'));

/* Both variants of every shot: the flat composite the page renders, and the
   framed mockup it offers underneath. A press kit that shows one and hides the
   other is a gallery, not a kit. */
const wanted = KIT.shots.flatMap((s) => [s.flat, s.framed]);

const missing = wanted.filter((f) => !fs.existsSync(path.join(SRC, f)));
if (missing.length) {
  console.error('build-press: named in data/press-kit.json, absent from store/marketing:');
  for (const m of missing) console.error(`  ${m}`);
  console.error('The press page would ship with dead images. Failing the build.');
  process.exit(1);
}

fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });

let bytes = 0;
for (const f of wanted) {
  const from = path.join(SRC, f);
  fs.copyFileSync(from, path.join(DEST, f));
  bytes += fs.statSync(from).size;
}

console.log(
  `build-press: ${wanted.length} images → public/press/ (${(bytes / 1024 / 1024).toFixed(1)} MB)`
);
