/**
 * Gate-zero variant selection.
 *
 * Gate zero asks whether a stranger can work out what to do without being
 * told, and it compares four first-runs to find out. Three of them do not
 * exist in the shipped product, so they live here — behind a URL parameter,
 * off by default, changing nothing for a real player.
 *
 * WHY A URL PARAMETER AND NOT A BUILD FLAG. The operator switches variant
 * between strangers, in a hallway, on one phone. Editing source or rebuilding
 * between people is how a run gets mislabelled, and a mislabelled run is worse
 * than a missing one because it still gets counted.
 *
 * THE DEFAULT IS 'a' AND 'a' IS EXACTLY WHAT SHIPS. That is the whole safety
 * property here: an ordinary player, with no parameter, must be on a code path
 * indistinguishable from the one that existed before this file. Anything else
 * turns a test rig into a live experiment on people who did not agree to be in
 * one.
 */

export type Gate0Variant = 'a' | 'b' | 'c' | 'd';

export const GATE0_PARAM = 'g0';
export const GATE0_VARIANTS: Gate0Variant[] = ['a', 'b', 'c', 'd'];

export const GATE0_LABEL: Record<Gate0Variant, string> = {
  a: 'As it ships — the teach card',
  b: 'A first row solved for them',
  c: 'The goal before the board',
  d: 'Control — no teach at all',
};

/**
 * Parse a variant from a query string.
 *
 * Anything unrecognised falls back to 'a' rather than throwing, because the
 * failure this protects against is a typo in a hallway: `?g0=B` or `?g0=bb`
 * must not produce a blank screen in front of a stranger. It degrades to the
 * shipping experience, which is always a legitimate thing to show someone.
 */
export function gate0From(search: string): Gate0Variant {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(search).get(GATE0_PARAM);
  } catch {
    return 'a';
  }
  if (raw === null) return 'a';
  const v = raw.trim().toLowerCase();
  return (GATE0_VARIANTS as string[]).includes(v) ? (v as Gate0Variant) : 'a';
}

/** Whether the shipping teach card should render for this variant. */
export function showsTeachCard(v: Gate0Variant): boolean {
  return v === 'a' || v === 'b';
}

/** Whether the goal is stated on its own, before the board is shown. */
export function showsGoalFirst(v: Gate0Variant): boolean {
  return v === 'c';
}

/** Whether the first row should be solved for the player, unprompted. */
export function solvesFirstRow(v: Gate0Variant): boolean {
  return v === 'b';
}

/**
 * Whether a gate-zero run is in progress at all, variant aside.
 *
 * The ladder swap keys off this rather than off the variant, because A must
 * face the SAME board as B, C and D or the comparison measures the board
 * instead of the first-run. A typo'd `?g0=B` degrades to variant A but is
 * still a run, so it swaps too — the operator is standing in front of someone.
 */
export function hasGate0Param(search: string): boolean {
  try {
    return new URLSearchParams(search).get(GATE0_PARAM) !== null;
  } catch {
    return false;
  }
}

/**
 * Hold the first paint during a gate-zero run, and ONLY during one.
 *
 * The board a gate-zero player meets is decided from `location.search`, which
 * does not exist at export time — so the prerendered HTML always carries the
 * shipping board, and the swap lands about a second after hydration. Measured:
 * the wheel read AHMRTW, then became KNRSTU while the page sat there.
 *
 * A board that changes under a stranger in the first second is not a neutral
 * artifact of static export. It is the exact window gate zero exists to
 * measure, and every Miss recorded in it would be unreadable.
 *
 * So the run is curtained until React has the real value. A player with no
 * `g0` parameter never enters this branch, never gets the attribute, and
 * paints on the very first frame exactly as before.
 */
export const GATE0_NO_FLASH = `try{if(new URLSearchParams(location.search).has('${GATE0_PARAM}'))document.documentElement.dataset.g0Pending=''}catch(e){}`;
