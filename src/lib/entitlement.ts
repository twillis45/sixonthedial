/**
 * Who owns which pack.
 *
 * Board ruling 3 (2026-08-26) sells themed packs outright, and named the defect
 * in the same breath: entitlement cannot live in localStorage, because a player
 * can edit it. `storage.ts` had already reached the same conclusion from the
 * other direction — the player bench's paying seats "would not trust a purchase
 * to it either."
 *
 * THE STORE IS THE LEDGER. NOT THIS DEVICE.
 *
 * The instinct is to validate a receipt, which means a server, which means
 * network calls, which would end `connect-src 'self'` and with it the privacy
 * position both store forms are already filed on. That trade is not worth
 * making for a one-time unlock.
 *
 * It is also unnecessary. Play Billing and StoreKit both answer the question
 * directly: *what does this account own?* That answer is authoritative, it
 * survives a reinstall and a new phone, and it costs no server. So this module
 * never stores an entitlement as truth. It stores the last thing the STORE
 * said, with the time it said it, and treats that as a cache with an expiry —
 * never as a grant.
 *
 * The three rules that follow, and the failure each one prevents:
 *
 * 1. **A live store answer always wins**, in both directions. Editing the cache
 *    to claim a pack buys access only until the store is next reachable, which
 *    on a normal phone is seconds.
 * 2. **A cache that the store has never confirmed grants nothing.** This is the
 *    forgery case. Anything else means writing one key in devtools is a
 *    purchase.
 * 3. **A confirmed cache keeps working while the store is unreachable**, for a
 *    bounded window. Without this, a plane, a tunnel or a Play outage locks a
 *    pack somebody paid for — and punishing a paying player for being offline
 *    is worse than the forgery this is guarding against.
 */

export type PackId = string;

/** What the store said, when we could reach it. */
export type StoreAnswer =
  | { reachable: true; owned: readonly PackId[] }
  | { reachable: false };

/** The last store answer, remembered on device. Never authority by itself. */
export type EntitlementCache = {
  /** Packs the store confirmed at `confirmedAt`. */
  owned: readonly PackId[];
  /** Epoch ms of the last successful store answer. 0 means never. */
  confirmedAt: number;
};

export const EMPTY_CACHE: EntitlementCache = { owned: [], confirmedAt: 0 };

/**
 * How long a confirmed cache keeps working with no store answer.
 *
 * Thirty days rather than a day or a year. A day punishes anyone who plays on
 * a commute; a year means a refunded purchase stays playable long enough that
 * the refund is free content. Thirty days is longer than any realistic outage
 * and shorter than a billing cycle.
 */
export const OFFLINE_GRACE_MS = 30 * 24 * 60 * 60 * 1000;

export type Resolution = {
  owned: readonly PackId[];
  /** Why the caller can, or cannot, trust this. */
  source: 'store' | 'cache' | 'expired' | 'unconfirmed';
};

/**
 * Decide what is unlocked right now.
 *
 * Pure on purpose: no clock, no storage, no SDK. Everything that could make
 * this untestable is a parameter, because the cases that matter — a forged
 * cache, an expired one, a refund — are precisely the ones nobody can produce
 * on demand in a browser.
 */
export function resolveEntitlement(
  store: StoreAnswer,
  cache: EntitlementCache,
  now: number
): Resolution {
  /* Rule 1: a live answer wins, including when it takes something away. A
     refund or a chargeback removes the pack on the next launch. */
  if (store.reachable) {
    return { owned: [...store.owned], source: 'store' };
  }

  /* Rule 2: never confirmed is never owned. This is the forgery case, and it
     is the whole reason this module exists rather than a boolean in storage. */
  if (cache.confirmedAt <= 0) {
    return { owned: [], source: 'unconfirmed' };
  }

  /* A clock that has gone backwards — a timezone change, a manually set date,
     or a device that lost its battery — must not be readable as "confirmed in
     the future" and therefore permanently valid. Treat it as expired. */
  const age = now - cache.confirmedAt;
  if (age < 0 || age > OFFLINE_GRACE_MS) {
    return { owned: [], source: 'expired' };
  }

  /* Rule 3: inside the window, the last confirmed answer stands. */
  return { owned: [...cache.owned], source: 'cache' };
}

/** Convenience for the common question. */
export function ownsPack(res: Resolution, pack: PackId): boolean {
  return res.owned.includes(pack);
}

/**
 * Fold a store answer into the cache.
 *
 * Only a reachable answer updates anything. An unreachable store must not
 * refresh `confirmedAt`, or the grace window would renew itself forever while
 * offline and rule 3 would have no expiry at all.
 */
export function rememberStoreAnswer(
  store: StoreAnswer,
  cache: EntitlementCache,
  now: number
): EntitlementCache {
  if (!store.reachable) return cache;
  return { owned: [...store.owned], confirmedAt: now };
}
