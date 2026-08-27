import { describe, it, expect } from 'vitest';
import {
  resolveEntitlement,
  rememberStoreAnswer,
  ownsPack,
  EMPTY_CACHE,
  OFFLINE_GRACE_MS,
} from './entitlement';

const NOW = 1_800_000_000_000;
const confirmed = (owned: string[], at = NOW) => ({ owned, confirmedAt: at });

describe('a live store answer is authoritative', () => {
  it('grants what the store says is owned', () => {
    const r = resolveEntitlement({ reachable: true, owned: ['cookout'] }, EMPTY_CACHE, NOW);
    expect(r.source).toBe('store');
    expect(ownsPack(r, 'cookout')).toBe(true);
  });

  it('TAKES AWAY what the store no longer reports — a refund must land', () => {
    /* The cache says owned, the store says no. The store wins. Without this, a
       refunded purchase is free content forever. */
    const r = resolveEntitlement({ reachable: true, owned: [] }, confirmed(['cookout']), NOW);
    expect(r.source).toBe('store');
    expect(ownsPack(r, 'cookout')).toBe(false);
  });

  it('ignores a forged cache entirely when the store is reachable', () => {
    const forged = confirmed(['cookout', 'rnb90s', 'church']);
    const r = resolveEntitlement({ reachable: true, owned: ['cookout'] }, forged, NOW);
    expect(r.owned).toEqual(['cookout']);
  });
});

describe('an unreachable store falls back to the cache, carefully', () => {
  it('grants NOTHING from a cache the store never confirmed — the forgery case', () => {
    /* Somebody opens devtools and writes {owned:["cookout"],confirmedAt:0}.
       This is the single case this module exists to refuse. */
    const forged = { owned: ['cookout'], confirmedAt: 0 };
    const r = resolveEntitlement({ reachable: false }, forged, NOW);
    expect(r.source).toBe('unconfirmed');
    expect(r.owned).toEqual([]);
  });

  it('keeps a confirmed pack working offline, inside the window', () => {
    const r = resolveEntitlement(
      { reachable: false },
      confirmed(['cookout'], NOW - OFFLINE_GRACE_MS + 60_000),
      NOW
    );
    expect(r.source).toBe('cache');
    expect(ownsPack(r, 'cookout')).toBe(true);
  });

  it('expires a confirmed pack once the window passes', () => {
    const r = resolveEntitlement(
      { reachable: false },
      confirmed(['cookout'], NOW - OFFLINE_GRACE_MS - 1),
      NOW
    );
    expect(r.source).toBe('expired');
    expect(r.owned).toEqual([]);
  });

  it('refuses a cache confirmed in the FUTURE rather than trusting it forever', () => {
    /* A device whose clock jumped forward, or was set forward on purpose,
       would otherwise produce a negative age that passes every upper bound and
       never expires. */
    const r = resolveEntitlement({ reachable: false }, confirmed(['cookout'], NOW + 86_400_000), NOW);
    expect(r.source).toBe('expired');
    expect(r.owned).toEqual([]);
  });

  it('grants nothing from an empty cache', () => {
    const r = resolveEntitlement({ reachable: false }, EMPTY_CACHE, NOW);
    expect(r.owned).toEqual([]);
  });
});

describe('remembering a store answer', () => {
  it('records what the store said, with the time', () => {
    const next = rememberStoreAnswer({ reachable: true, owned: ['texas'] }, EMPTY_CACHE, NOW);
    expect(next).toEqual({ owned: ['texas'], confirmedAt: NOW });
  });

  it('does NOT refresh the timestamp when the store is unreachable', () => {
    /* If an unreachable answer bumped confirmedAt, the grace window would renew
       itself on every launch while offline and would never expire — which
       silently deletes rule 3's expiry. */
    const old = confirmed(['texas'], NOW - 1000);
    expect(rememberStoreAnswer({ reachable: false }, old, NOW)).toEqual(old);
  });

  it('an offline launch cannot extend the window', () => {
    let cache = confirmed(['texas'], NOW - OFFLINE_GRACE_MS + 1000);
    for (let i = 0; i < 50; i += 1) {
      cache = rememberStoreAnswer({ reachable: false }, cache, NOW + i * 1000);
    }
    const r = resolveEntitlement({ reachable: false }, cache, NOW + OFFLINE_GRACE_MS);
    expect(r.source).toBe('expired');
  });
});

describe('the returned list cannot be used to mutate state', () => {
  it('does not hand back the caller’s own array', () => {
    const owned = ['cookout'];
    const r = resolveEntitlement({ reachable: true, owned }, EMPTY_CACHE, NOW);
    expect(r.owned).not.toBe(owned);
    (r.owned as string[]).push('church');
    expect(owned).toEqual(['cookout']);
  });
});
