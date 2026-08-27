import { describe, it, expect } from 'vitest';
import {
  gate0From,
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
