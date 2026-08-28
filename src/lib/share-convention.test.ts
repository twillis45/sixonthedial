import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { shareText } from './game';

/**
 * The share card against the convention Wordle set — not against a length.
 *
 * `check-share.mjs` already holds the one hard limit (X counts an emoji as two
 * and a URL as exactly 23, so the staircase costs 54 and the link costs 23).
 * That is the channel constraint. It says nothing about whether the card WORKS,
 * and the marketing roadmap rests the entire growth thesis on this one surface:
 * every paid door is closed by ruling — no ads, no UA — so the share loop is
 * the distribution.
 *
 * The three properties below are the ones the tracker item named, turned into
 * assertions and run over every themed board that ships rather than over one
 * hand-picked example. A card that works for BARBECUE and breaks for THE GYM
 * is not a card that works.
 */
const file = JSON.parse(
  readFileSync(path.join(process.cwd(), 'public', 'data', 'puzzles.json'), 'utf8')
) as {
  puzzles: {
    base: string; grid: string[]; maxScore: number;
    clues: Record<string, string>; theme: { name: string } | null;
  }[];
};

const themed = file.puzzles.filter((p) => p.theme);

const cardFor = (p: (typeof themed)[number]) =>
  shareText({
    theme: p.theme!.name,
    clue: p.clues[p.grid[1]] ?? p.clues[p.base],
    rank: 'Curator',
    score: p.maxScore,
    tiles: p.grid.map((w, i) => ({ length: w.length, solved: true, isBase: i === 0 })),
    bonusFound: 3,
    streak: 4,
    dayNumber: 205,
    escalating: true,
    url: 'https://sixonthedial.com',
  });

describe('the share card holds the convention, not just the character limit', () => {
  it('has a corpus to audit at all', () => {
    expect(themed.length).toBeGreaterThan(50);
  });

  it('leads with the clue, because a feed shows the first lines and nothing else', () => {
    /*
     * The clue is the one asset here nobody else can generate. A shape-only
     * card was tried and rejected on exactly that ground: it meant the clues
     * never left the app. So the line under the heading must be the quoted
     * clue, not the score — a reader scanning past should meet a question.
     */
    const bad = themed
      .filter((p) => !cardFor(p).split('\n')[1]?.startsWith('"'))
      .map((p) => p.base);
    expect(bad, `${bad.length} cards do not lead with the clue`).toEqual([]);
  });

  it('carries rank, streak and the shared referent', () => {
    /*
     * The referent is why two strangers know they solved the same board. It
     * shipped once as a day number, was deleted because warm-up players posted
     * "#1" against everyone else's "#205", and came back restricted to the
     * daily. Rank and streak are the only progress that travels.
     */
    const c = cardFor(themed[0]);
    expect(c).toContain('#205');
    expect(c).toContain('Curator');
    expect(c).toContain('4-day streak');
    expect(c).toContain('escalating wheel');
  });

  it('the share card never leaks an answer through the CLUE', () => {
    /*
     * The staircase carries two facts per row — length, and whether it was
     * filled — and both are visible on the empty board. The clue is the risk,
     * because it is authored prose.
     *
     * AUTHORING.md has said "don't leak another row's answer inside a clue"
     * since it was written, and NOTHING checked it. Measured 2026-08-28: 20
     * boards did. Most are harmless prepositions — "paid for OUT of pocket"
     * on a board carrying OUT — but the clue for garden/pilots opened "The
     * pot," on a board whose row is POT, which hands over an answer to the one
     * person the card exists to recruit.
     *
     * This asserts the SHARED clue only. The card quotes one clue, so that is
     * the one that can spoil a stranger, and it is a bar the corpus can hold
     * today. The other seventeen are ratcheted below rather than declared
     * fine, because fixing them is a content pass and pretending they are not
     * there is how a rule stays unenforced for another month.
     */
    const leaks: string[] = [];
    for (const p of themed) {
      const shared = p.grid[1];
      const clue = p.clues[shared] ?? p.clues[p.base];
      for (const w of p.grid) {
        if (w === shared) continue;
        if (new RegExp(`\\b${w}\\b`, 'i').test(clue)) {
          leaks.push(`${p.base}: the quoted clue contains the answer "${w}"`);
        }
      }
    }
    expect(leaks, `${leaks.length} share cards spoil their own board`).toEqual([]);
  });

  it('does not let the corpus-wide clue leak grow past today', () => {
    /*
     * A ratchet, in the shape catalogue.test.ts already uses. It was 20 when
     * the audit first measured it, then 17, and the content pass on
     * 2026-08-28 took it to ZERO — every clue that named another row on its
     * own board was rewritten.
     *
     * Kept at 0 rather than deleted. The rule is easy to break by accident
     * (a clue for BIND that says "nil bid" reads perfectly and gives away two
     * rows), it went unenforced for the entire life of the corpus, and a
     * ratchet at zero is the cheapest thing that stops it coming back.
     */
    const authored = JSON.parse(
      readFileSync(path.join(process.cwd(), 'data', 'themes.json'), 'utf8')
    ) as { puzzles: { base: string; clues: Record<string, string> }[] };
    let n = 0;
    for (const p of authored.puzzles) {
      const rows = Object.keys(p.clues);
      for (const [w, clue] of Object.entries(p.clues)) {
        for (const other of rows) {
          if (other !== w && new RegExp(`\\b${other}\\b`, 'i').test(clue)) n++;
        }
      }
    }
    expect(n, 'clues naming another row on the same board').toBe(0);
  });

  it('the product name and pack names DO collide, and that is accepted', () => {
    /*
     * Recorded rather than fixed, because the fix is absurd. "Six on the Dial"
     * spoils DIAL on rnb90s/derail; "The Card Table" spoils CARD on
     * spades/cradle; "The Road Trip" spoils ROAD on roadtrip/roadie. In every
     * case the colliding word is the pack's own best on-theme row — refusing
     * it would gut the pack to protect one board, and renaming the game to
     * dodge a six-letter row is not a trade anybody would make.
     *
     * The test exists so the class stays visible and countable. If it starts
     * failing, a NEW collision appeared and somebody should look at it.
     */
    const known = ['derail', 'cradle', 'roadie'];
    const found = themed
      .filter((p) => {
        const head = `Six on the Dial #205 — ${p.theme!.name} · Curator`;
        return p.grid.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(head));
      })
      .map((p) => p.base);
    expect(found.sort()).toEqual(known.sort());
  });

  it('survives a group chat without wrapping into nonsense', () => {
    /*
     * A chat bubble is narrow. The staircase rows are short by construction,
     * so the risk is the heading and the quoted clue — and the clue is the one
     * an editor can lengthen without noticing. 90 characters is the point at
     * which a line starts wrapping twice in a phone-width bubble; the record
     * today is reported so a regression is visible rather than merely caught.
     */
    let worst = { base: '', len: 0 };
    for (const p of themed) {
      for (const line of cardFor(p).split('\n')) {
        if (line.length > worst.len) worst = { base: p.base, len: line.length };
      }
    }
    expect(worst.len, `longest line is ${worst.len} chars, on ${worst.base}`).toBeLessThanOrEqual(90);
  });
});
