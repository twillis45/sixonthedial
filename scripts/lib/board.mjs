/*
 * READ THE BOARD. DO NOT NAME IT.
 *
 * This module exists because one mistake has now been made three times in this
 * repository, and the third time it reached a store submission asset.
 *
 * A script that drives the game needs to know what to type. The obvious way is
 * to write the words down beside a comment naming the board — and that works
 * perfectly until the ladder serves a different board, at which point the
 * script types words the dial cannot spell and keeps running:
 *
 *   check-intro   typed a CRAFTY word after CRAFTY stopped being board one.
 *                 It went RED and was noticed the same day.
 *   check-rail    typed nineteen CRAFTY words for two months. Three banked,
 *                 no rows. It reported GREEN the whole time (`b4s`).
 *   capture-video typed CRAFTY, CRY, FAT, TRAY into the App Store submission
 *                 master, where all four are REJECTED, and traced a drag
 *                 across two tiles that are not on the dial. Every assertion
 *                 on that file is about resolution, H.264 level, bitrate,
 *                 duration and audio channels — so a video of the game
 *                 failing passed every check and was shippable.
 *
 * The b1i ruling moved board one from CRAFTY to WARMTH on 2026-08-28. All
 * three were written before it and none of them noticed.
 *
 * `scripts/lib/browser.mjs` is the precedent: it exists because four scripts
 * resolved Puppeteer four different ways and the checks holding the strongest
 * claims were the ones CI could not run. Same shape, same answer — one
 * implementation, imported.
 *
 * So: match the letters that are actually on the dial against the catalogue
 * the app actually serves, and derive the typing order from the board's own
 * unlock ladder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

let cache = null;
/** `public/data/puzzles.json` — the BUILT file the app serves, not the sources. */
export function catalogue() {
  if (!cache) {
    cache = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'public', 'data', 'puzzles.json'), 'utf8'),
    );
  }
  return cache;
}

const key = (letters) => [...letters].map((c) => c.toLowerCase()).sort().join('');

/**
 * MULTISET containment, not set containment.
 *
 * A board may carry a doubled letter, so a `Set` would say CHURCH is spellable
 * from four distinct tiles. This is the same rule the game's own `canSpell`
 * applies: each tile is consumed once.
 *
 * `pool` is the list of ACTIVE letters, one entry per tile. An earlier version
 * padded it to six copies of every letter, which made this check decorative —
 * it would have accepted HAHAHA off a single H, emitting words the board then
 * rejected, so the count reported was not the count typed.
 */
export function spellable(word, pool) {
  const left = [...pool].map((c) => c.toLowerCase());
  return [...word.toLowerCase()].every((ch) => {
    const i = left.indexOf(ch);
    if (i < 0) return false;
    left.splice(i, 1);
    return true;
  });
}

/** The board whose six letters are the ones on the dial right now. */
export function boardFor(letters) {
  const k = key(letters);
  return catalogue().puzzles.find((p) => key(p.letters) === k);
}

/** A board by its catalogue id, for a script that wants a FIXED board. */
export function boardById(id) {
  return catalogue().puzzles.find((p) => p.id === id);
}

/**
 * Read the six letters off the live dial.
 *
 * The buttons carry `aria-label="Letter X"`, which is the accessible name the
 * a11y check already relies on, so this reads the same surface a screen reader
 * does rather than a class name that can be restyled away.
 */
export async function dialLetters(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('button[aria-label^="Letter "]')]
      .map((b) => b.getAttribute('aria-label').match(/Letter (\w)/)[1]),
  );
}

/**
 * Every grid row, in an order the board will actually accept.
 *
 * ROWS UNLOCK LETTERS. `startActive` letters are live at the start and one more
 * opens per row landed, in `unlockOrder`. So a list in the wrong order banks
 * nothing however correct its spelling — which is why deriving the order
 * matters as much as deriving the words.
 *
 * Returns uppercase words, ready to type.
 */
export function rowOrder(board) {
  const order = board.unlockOrder.map((c) => c.toLowerCase());
  const rows = board.grid.map((w) => w.toLowerCase());
  const out = [];
  /*
   * The bound is fixed BEFORE the loop. Written as `solved < rows.length` it
   * would be re-read against an array the body splices, and the target would
   * fall by one every iteration and meet the counter halfway — three rows of
   * six on WARMTH. That bug shipped in check-rail's first repair and is the
   * reason this is a named constant.
   */
  const total = rows.length;
  for (let solved = 0; solved < total; solved++) {
    const active = order.slice(0, board.startActive + solved);
    const i = rows.findIndex((w) => spellable(w, active));
    if (i < 0) break;
    out.push(rows.splice(i, 1)[0]);
  }
  return out.map((w) => w.toUpperCase());
}

/**
 * Rows AND bonus words, interleaved as the letters open up, for a script that
 * wants the board played rather than merely advanced.
 *
 * `stopShort` leaves the last row unsolved, and it defaults to true because
 * COMPLETING THE BOARD ENDS THE SESSION: the completion sheet takes over and no
 * further word is accepted. Solving all six first banked 6/6 rows and then
 * exactly 4 bonus words of 29, because the other 25 were typed at a finished
 * board.
 */
export function bankOrder(board, { stopShort = true } = {}) {
  const order = board.unlockOrder.map((c) => c.toLowerCase());
  const rows = board.grid.map((w) => w.toLowerCase());
  const bonus = (board.bonus ?? []).map((w) => w.toLowerCase());
  const sent = new Set();
  const out = [];

  const bankBonus = (active) => {
    for (const w of bonus) {
      if (!sent.has(w) && spellable(w, active)) { out.push(w); sent.add(w); }
    }
  };

  bankBonus(order.slice(0, board.startActive));
  const total = stopShort ? rows.length - 1 : rows.length;
  for (let solved = 0; solved < total; solved++) {
    const active = order.slice(0, board.startActive + solved);
    const i = rows.findIndex((w) => spellable(w, active));
    if (i < 0) break;
    out.push(rows.splice(i, 1)[0]);
    bankBonus(order.slice(0, board.startActive + solved + 1));
  }
  return out.map((w) => w.toUpperCase());
}
