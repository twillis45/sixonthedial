/**
 * Merge a staged pack from data/packs/ into data/themes.json.
 *
 * Two deletions happen here and both are deliberate:
 *
 *   1. The theme's existing boards are replaced wholesale. The pack IS the
 *      theme now — keeping the old ones alongside would reintroduce exactly
 *      the padding the pack exists to remove.
 *   2. Donor boards are dropped from other themes. A base is claimed by its
 *      letter-set, so a board can only live in one pack. Every donor board
 *      here was measured at 0-2 on-theme rows for its own theme before it was
 *      taken, so the donor loses its weakest board, not a good one. If that
 *      stops being true, this script should refuse rather than be edited.
 *
 * Nothing is committed. Run `git diff data/themes.json` before believing it.
 */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = (p) => path.join(ROOT, p);

const packPath = process.argv[2] ?? 'data/packs/nineties.json';

/*
 * check-pack is a GATE, not a suggestion.
 *
 * It was advisory, and that is how a board with an unspellable row reached the
 * catalogue: check-pack said `first: not spellable from births`, this script
 * merged the pack anyway, and only a re-run of the checker afterwards caught
 * it. Nothing else would have — `npm test` passed on the broken catalogue,
 * because the ratchet measures on-theme RATE and an unsolvable row is still an
 * on-theme row.
 *
 * Two commands where one had to be remembered in the right order is not a
 * process; it is a trap that fires on whoever is tired. Pass --force only to
 * inspect a diff you have no intention of committing.
 */
if (!process.argv.includes('--force')) {
  const { status } = spawnSync(
    process.execPath,
    [at('scripts/check-pack.mjs'), packPath],
    { stdio: 'inherit' }
  );
  if (status !== 0) {
    console.error(`\nrefusing to merge ${packPath} — fix the problems above.`);
    process.exit(1);
  }
}

const pack = JSON.parse(fs.readFileSync(at(packPath), 'utf8'));
const themes = JSON.parse(fs.readFileSync(at('data/themes.json'), 'utf8'));

const letterKey = (w) => [...w].sort().join('');
const wanted = new Set(pack.boards.map((b) => letterKey(b.base)));
const id = pack.theme.id;

/*
 * REFUSE TO SILENTLY DELETE A SHIPPING BOARD.
 *
 * This script replaces a theme's boards wholesale, which is correct when the
 * pack file is ahead of the catalogue and wrong the moment it is behind. Four
 * pack files are currently behind — measured 2026-08-28: cookout is missing
 * three shipping boards and still carries six that were dropped, and shop,
 * beautysupply and roadtrip carry ten more between them. Running this on
 * cookout today would have deleted three boards authored the same day and
 * resurrected six that were removed on purpose, and the only evidence would
 * have been a large diff nobody reads line by line.
 *
 * The header of this file already says a donor rule that stopped holding
 * should make the script REFUSE rather than be edited. This is that, for the
 * case the header did not cover.
 *
 * It gets its OWN flag rather than riding on --force. --force means "I am
 * bypassing check-pack to look at a diff"; if it also waived data loss, one
 * flag typed for the cheap reason would silently buy the expensive one.
 */
const lost = themes.puzzles.filter(
  (p) => p.theme === id && !wanted.has(letterKey(p.base))
);
if (lost.length && !process.argv.includes('--allow-drops')) {
  console.error(
    `\nrefusing to merge ${packPath} — it would DELETE ${lost.length} ` +
      `shipping board(s) that the pack file does not contain:\n`
  );
  for (const p of lost) console.error(`    ${p.base}  (${p.theme})`);
  console.error(
    `\nThe pack file is behind the catalogue. Add these boards to it, or\n` +
      `pass --allow-drops if losing them is genuinely what you intend.\n`
  );
  process.exit(1);
}

/* Resurrection is the other direction, and it is visible in the diff rather
   than silent — so it warns instead of refusing. */
const shippingKeys = new Set(
  themes.puzzles.filter((p) => p.theme === id).map((p) => letterKey(p.base))
);
const revived = pack.boards.filter((b) => !shippingKeys.has(letterKey(b.base)));
if (revived.length) {
  console.log(
    `  note: ${revived.length} board(s) in the pack are not currently ` +
      `shipping and will be (re)added: ${revived.map((b) => b.base).join(' ')}`
  );
}

const before = themes.puzzles.length;
const droppedDonors = themes.puzzles.filter(
  (p) => p.theme !== id && wanted.has(letterKey(p.base))
);
const droppedOwn = themes.puzzles.filter((p) => p.theme === id);

themes.puzzles = themes.puzzles.filter(
  (p) => p.theme !== id && !wanted.has(letterKey(p.base))
);

for (const b of pack.boards) {
  themes.puzzles.push({
    base: b.base,
    theme: id,
    clues: b.clues,
    prefer: Object.keys(b.clues).filter((w) => w !== b.base),
    scene: b.scene,
  });
}

const t = themes.themes.find((x) => x.id === id);
if (!t) throw new Error(`theme ${id} not found`);
t.name = pack.theme.name;
t.blurb = pack.theme.blurb;
t.category = pack.theme.category;

fs.writeFileSync(at('data/themes.json'), JSON.stringify(themes, null, 1) + '\n');

console.log(`${id} -> "${pack.theme.name}" (${pack.theme.category})`);
console.log(`  replaced ${droppedOwn.length} own boards with ${pack.boards.length}`);
console.log(`  took ${droppedDonors.length} bases from other packs:`);
for (const p of droppedDonors) console.log(`    ${p.base} from ${p.theme}`);
console.log(`  catalogue ${before} -> ${themes.puzzles.length}`);
