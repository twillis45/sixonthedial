/**
 * Store version numbering.
 *
 * Neither store lets you reuse a build number, and the mistake is permanent for
 * that number — you cannot delete it and try again, you can only go up. So the
 * scheme is a function with tests rather than a paragraph in a document that
 * nobody runs.
 *
 * TWO NUMBERS, DOING DIFFERENT JOBS.
 *
 * `versionName` is the human one — semver, shown in both stores, sourced from
 * package.json. It answers "which release is this".
 *
 * `versionCode` is the machine one — a monotonic integer Play orders releases
 * by, and the thing you can never reuse. It is derived from the date:
 *
 *     YYMMDD * 100 + seq        26082600  ->  2026-08-26, first build
 *
 * Date-derived rather than a counter because a counter has to live somewhere,
 * and anywhere it lives can be reset, branched, or lost — CI run numbers reset
 * when a pipeline is recreated, and a committed integer merges badly. A date
 * cannot go backwards without someone noticing.
 *
 * WHY THIS NUMBER MOVES RARELY, which is the part specific to this project.
 * The web layer updates itself: a TWA is a shell around the same origin, so
 * puzzles, clues and UI ship through the service worker. The binary only needs
 * republishing when something in the manifest or intent filter changes — name,
 * icons, start_url, signing. A board or a bug fix never needs a new
 * versionCode. Anyone treating this as a per-deploy number has misunderstood
 * what the wrapper is.
 */

/** Play rejects anything at or above this. */
export const PLAY_MAX_VERSION_CODE = 2_100_000_000;

/** Builds per day the scheme can express. */
export const MAX_SEQ = 99;

export type VersionParts = { year: number; month: number; day: number; seq: number };

/**
 * Build the Play versionCode for a date and same-day sequence.
 *
 * Throws rather than returning something wrong: a bad version code is
 * unrecoverable once published, so failing the build is the cheap outcome.
 */
export function versionCode({ year, month, day, seq }: VersionParts): number {
  if (!Number.isInteger(seq) || seq < 0 || seq > MAX_SEQ) {
    throw new Error(`versionCode: seq must be 0..${MAX_SEQ}, got ${seq}`);
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`versionCode: month must be 1..12, got ${month}`);
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`versionCode: day must be 1..31, got ${day}`);
  }
  /*
   * The two-digit year is why this has a floor and a ceiling. Before 2000 the
   * arithmetic is meaningless, and at 2100 it wraps to 00 and silently starts
   * going BACKWARDS — which is the one failure Play cannot forgive. Refuse
   * both ends rather than emit a number that sorts wrong.
   */
  if (!Number.isInteger(year) || year < 2000 || year > 2099) {
    throw new Error(`versionCode: year must be 2000..2099, got ${year}`);
  }
  const code = ((year % 100) * 10000 + month * 100 + day) * 100 + seq;
  if (code >= PLAY_MAX_VERSION_CODE) {
    throw new Error(`versionCode: ${code} is at or above Play's ceiling`);
  }
  return code;
}

/** The versionCode for a Date, at a given same-day sequence. */
export function versionCodeFor(d: Date, seq = 0): number {
  return versionCode({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), seq });
}

/**
 * Guard a candidate against what has already shipped.
 *
 * Play orders by versionCode and refuses a duplicate, so the only safe move is
 * strictly upward. Two builds on the same day are legal — that is what seq is
 * for — but the second must carry a higher seq, not the same one.
 */
export function isPublishable(candidate: number, published: readonly number[]): boolean {
  if (!Number.isInteger(candidate) || candidate <= 0) return false;
  if (candidate >= PLAY_MAX_VERSION_CODE) return false;
  return published.every((p) => candidate > p);
}
