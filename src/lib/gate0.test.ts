import { describe, it, expect } from 'vitest';
import {
  gate0From,
  hasGate0Param,
  GATE0_NO_FLASH,
  showsTeachCard,
  showsGoalFirst,
  solvesFirstRow,
  GATE0_VARIANTS,
} from './gate0';

describe('gate0From', () => {
  it('defaults to the shipping experience when no parameter is present', () => {
    expect(gate0From('')).toBe('a');
    expect(gate0From('?')).toBe('a');
    expect(gate0From('?other=1')).toBe('a');
  });

  it('reads each variant', () => {
    expect(gate0From('?g0=a')).toBe('a');
    expect(gate0From('?g0=b')).toBe('b');
    expect(gate0From('?g0=c')).toBe('c');
    expect(gate0From('?g0=d')).toBe('d');
  });

  it('tolerates case and surrounding space', () => {
    /* Typed on a phone, in a hallway, between strangers. */
    expect(gate0From('?g0=B')).toBe('b');
    expect(gate0From('?g0=%20c%20')).toBe('c');
  });

  it('falls back to the shipping experience on anything unrecognised', () => {
    /* The failure being prevented is a blank screen in front of a stranger:
       a typo must degrade to something legitimate to show someone. */
    expect(gate0From('?g0=bb')).toBe('a');
    expect(gate0From('?g0=')).toBe('a');
    expect(gate0From('?g0=%00')).toBe('a');
    expect(gate0From('?g0=<script>')).toBe('a');
  });

  it('survives a malformed query string', () => {
    expect(gate0From('%%%')).toBe('a');
  });

  it('takes the first value when the parameter is repeated', () => {
    expect(gate0From('?g0=d&g0=a')).toBe('d');
  });
});

describe('what each variant shows', () => {
  it('a is the shipping experience — teach card, no goal screen, no auto-solve', () => {
    expect(showsTeachCard('a')).toBe(true);
    expect(showsGoalFirst('a')).toBe(false);
    expect(solvesFirstRow('a')).toBe(false);
  });

  it('b keeps the teach card and adds the solved row', () => {
    expect(showsTeachCard('b')).toBe(true);
    expect(solvesFirstRow('b')).toBe(true);
  });

  it('c moves the goal ahead of the board instead of onto it', () => {
    expect(showsGoalFirst('c')).toBe(true);
    expect(showsTeachCard('c')).toBe(false);
  });

  it('d is the control and shows nothing at all', () => {
    expect(showsTeachCard('d')).toBe(false);
    expect(showsGoalFirst('d')).toBe(false);
    expect(solvesFirstRow('d')).toBe(false);
  });

  it('exactly one variant solves a row, and exactly one states the goal first', () => {
    /* If two variants did the same thing the comparison would be meaningless,
       and nothing else in the suite would notice. */
    expect(GATE0_VARIANTS.filter(solvesFirstRow)).toEqual(['b']);
    expect(GATE0_VARIANTS.filter(showsGoalFirst)).toEqual(['c']);
  });

  it('the control differs from the shipping variant in exactly one way', () => {
    /* d exists to price the teach card. If it differed in more than the teach,
       a gap between a and d could not be attributed to the card. */
    expect(showsGoalFirst('d')).toBe(showsGoalFirst('a'));
    expect(solvesFirstRow('d')).toBe(solvesFirstRow('a'));
    expect(showsTeachCard('d')).not.toBe(showsTeachCard('a'));
  });
});

describe('hasGate0Param', () => {
  /*
   * The ladder swap keys off presence, not variant, so that A meets the same
   * board as B/C/D. A typo is still a run — the operator is standing in front
   * of someone — so `?g0=B` degrades to variant A but must NOT fall back to
   * the shipping board, or A is silently compared against a different puzzle.
   */
  it('is false for a real player', () => {
    expect(hasGate0Param('')).toBe(false);
    expect(hasGate0Param('?utm=x')).toBe(false);
  });

  it('is true for every run, including a typo that degrades to A', () => {
    for (const q of ['?g0=a', '?g0=b', '?g0=c', '?g0=d', '?g0=B', '?g0=zzz', '?g0=']) {
      expect(hasGate0Param(q)).toBe(true);
    }
  });

  it('agrees with gate0From on the shipping default', () => {
    expect(gate0From('?g0=zzz')).toBe('a');
    expect(hasGate0Param('?g0=zzz')).toBe(true);
  });
});

describe('GATE0_NO_FLASH', () => {
  /* It runs on EVERY page load, before paint, for every player. It must be
     inert without the parameter and it must never throw. */
  const run = (search: string) => {
    const html: { dataset: Record<string, string> } = { dataset: {} };
    new Function('location', 'document', GATE0_NO_FLASH)(
      { search },
      { documentElement: html }
    );
    return 'g0Pending' in html.dataset;
  };

  it('leaves a real player alone', () => {
    expect(run('')).toBe(false);
    expect(run('?play=12')).toBe(false);
  });

  it('curtains every gate-zero run', () => {
    expect(run('?g0=a')).toBe(true);
    expect(run('?g0=d')).toBe(true);
  });
});
