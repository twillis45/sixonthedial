import { describe, it, expect } from 'vitest';
import {
  versionCode,
  versionCodeFor,
  isPublishable,
  PLAY_MAX_VERSION_CODE,
  MAX_SEQ,
} from './version';

describe('versionCode', () => {
  it('encodes the date the way the scheme documents', () => {
    expect(versionCode({ year: 2026, month: 8, day: 26, seq: 0 })).toBe(26082600);
    expect(versionCode({ year: 2026, month: 8, day: 26, seq: 1 })).toBe(26082601);
  });

  it('pads single-digit months and days so ordering survives', () => {
    /* The failure this catches: 2026-1-5 encoded as 2615xx would sort ABOVE
       2026-08-26. Zero-padding is what makes lexical and numeric order agree. */
    expect(versionCode({ year: 2026, month: 1, day: 5, seq: 0 }))
      .toBeLessThan(versionCode({ year: 2026, month: 8, day: 26, seq: 0 }));
    expect(versionCode({ year: 2026, month: 1, day: 5, seq: 0 })).toBe(26010500);
  });

  it('increases strictly with time', () => {
    const days = [
      { year: 2026, month: 8, day: 26, seq: 0 },
      { year: 2026, month: 8, day: 26, seq: 1 },
      { year: 2026, month: 8, day: 27, seq: 0 },
      { year: 2026, month: 9, day: 1, seq: 0 },
      { year: 2027, month: 1, day: 1, seq: 0 },
    ];
    const codes = days.map(versionCode);
    for (let i = 1; i < codes.length; i += 1) {
      expect(codes[i]).toBeGreaterThan(codes[i - 1]);
    }
  });

  it('stays under Play’s ceiling even at the end of the scheme', () => {
    expect(versionCode({ year: 2099, month: 12, day: 31, seq: MAX_SEQ }))
      .toBeLessThan(PLAY_MAX_VERSION_CODE);
  });

  it('refuses a year that would wrap and start counting backwards', () => {
    /* 2100 % 100 === 0, which produces a SMALLER code than 2099 and is the one
       failure Play cannot forgive. It must throw, not encode. */
    expect(() => versionCode({ year: 2100, month: 1, day: 1, seq: 0 })).toThrow();
    expect(() => versionCode({ year: 1999, month: 1, day: 1, seq: 0 })).toThrow();
  });

  it('refuses an out-of-range sequence rather than overflowing into the date', () => {
    expect(() => versionCode({ year: 2026, month: 8, day: 26, seq: MAX_SEQ + 1 })).toThrow();
    expect(() => versionCode({ year: 2026, month: 8, day: 26, seq: -1 })).toThrow();
  });

  it('refuses an impossible month or day', () => {
    expect(() => versionCode({ year: 2026, month: 13, day: 1, seq: 0 })).toThrow();
    expect(() => versionCode({ year: 2026, month: 0, day: 1, seq: 0 })).toThrow();
    expect(() => versionCode({ year: 2026, month: 8, day: 32, seq: 0 })).toThrow();
  });

  it('versionCodeFor reads a Date in local time', () => {
    expect(versionCodeFor(new Date(2026, 7, 26), 3)).toBe(26082603);
  });
});

describe('isPublishable', () => {
  it('accepts a code above everything already published', () => {
    expect(isPublishable(26082601, [26082600, 26010500])).toBe(true);
  });

  it('rejects reuse, which is the unrecoverable mistake', () => {
    expect(isPublishable(26082600, [26082600])).toBe(false);
  });

  it('rejects going backwards even by one', () => {
    expect(isPublishable(26082599, [26082600])).toBe(false);
  });

  it('accepts a second build on the same day at a higher seq', () => {
    const first = versionCode({ year: 2026, month: 8, day: 26, seq: 0 });
    const second = versionCode({ year: 2026, month: 8, day: 26, seq: 1 });
    expect(isPublishable(second, [first])).toBe(true);
  });

  it('treats an empty history as publishable', () => {
    expect(isPublishable(26082600, [])).toBe(true);
  });

  it('rejects nonsense', () => {
    expect(isPublishable(0, [])).toBe(false);
    expect(isPublishable(-1, [])).toBe(false);
    expect(isPublishable(1.5, [])).toBe(false);
    expect(isPublishable(PLAY_MAX_VERSION_CODE, [])).toBe(false);
  });
});
