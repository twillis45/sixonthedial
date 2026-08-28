/*
 * assetlinks.json is the file that decides whether the Android app shows an
 * address bar.
 *
 * A TWA proves it owns its web content by matching its signing certificate
 * against this file at the ORIGIN ROOT. If the match fails, Android does not
 * error — it silently falls back to Custom Tab UI **with a visible address
 * bar**, which is precisely the "repackaged website" read the whole store
 * effort exists to avoid. Nobody gets told. The app just looks cheap.
 *
 * So the failure this guards is not a missing file. It is a file that is
 * PRESENT, valid JSON, served with the right content type, and wrong in one
 * character. That is invisible until a reviewer opens the app.
 *
 * Three legal states, and nothing in between:
 *   1. UNBUILT   — a single fingerprint that is the literal placeholder. No
 *                  app exists yet, so nothing can match, and that is honest.
 *   2. WIRED     — the Play App Signing fingerprint alone. What Play-installed
 *                  users verify against, because Google re-signs the upload
 *                  with that key before distributing it.
 *   3. TESTABLE  — Play App Signing PLUS the local upload key. A sideloaded
 *                  build carries the UPLOAD signature, not the Play one, so
 *                  with state 2 alone every hand-installed test build shows
 *                  the address bar and looks broken. That wasted a debugging
 *                  session on 2026-08-27 before the cause was understood: the
 *                  app was correct and the manifest was correct, and the only
 *                  wrong thing was which certificate the file vouched for.
 *
 * A half-filled file — a truncated hash, lowercase, spaces, a SHA-1 from the
 * wrong screen in Play Console — is the state this test exists to make
 * impossible. Note that the shape check runs over EVERY fingerprint. It once
 * checked only index 0, which was safe only because a length assertion capped
 * the list at one; the moment a second entry became legal, that made index 1
 * a hole exactly the size of the bug this file is about.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const PLACEHOLDER = 'REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT';
const SHA256_SHAPE = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;
const raw = readFileSync(new URL('../../public/.well-known/assetlinks.json', import.meta.url), 'utf8');

describe('assetlinks.json', () => {
  const doc = JSON.parse(raw) as Array<{
    relation: string[];
    target: { namespace: string; package_name: string; sha256_cert_fingerprints: string[] };
  }>;
  const fingerprints = () => doc[0].target.sha256_cert_fingerprints;
  const isUnbuilt = () => fingerprints().length === 1 && fingerprints()[0] === PLACEHOLDER;

  it('is a non-empty array of statements', () => {
    expect(Array.isArray(doc)).toBe(true);
    expect(doc.length).toBeGreaterThan(0);
  });

  it('delegates URL handling to an android_app', () => {
    expect(doc[0].relation).toContain('delegate_permission/common.handle_all_urls');
    expect(doc[0].target.namespace).toBe('android_app');
  });

  /*
   * The package name must match the domain, because a mismatch is the other
   * silent failure: Android looks for the statement belonging to the package
   * that is asking, finds none, and falls back. `com.sixonthedial.game` and
   * not `com.6onthedial.game` — an Android package segment cannot begin with
   * a digit, so the spelled form was always the identity. See
   * docs/DOMAIN_MIGRATION.md.
   */
  it('names the package that actually ships', () => {
    expect(doc[0].target.package_name).toBe('com.sixonthedial.game');
    expect(doc[0].target.package_name.split('.').some((seg) => /^\d/.test(seg))).toBe(false);
  });

  /*
   * At most two: Play App Signing, and the upload key for sideload testing.
   * A third means someone pasted rather than replaced — most likely a rotated
   * upload key whose predecessor was never removed, which quietly keeps a
   * retired certificate trusted for the origin.
   */
  it('carries one or two fingerprints, with no duplicates', () => {
    const fps = fingerprints();
    expect(fps.length).toBeGreaterThanOrEqual(1);
    expect(fps.length, 'only Play App Signing and the upload key belong here').toBeLessThanOrEqual(2);
    expect(new Set(fps).size, 'duplicate fingerprint').toBe(fps.length);
  });

  /*
   * THE ONE THAT MATTERS. Either the honest placeholder standing alone, or
   * every entry in the exact shape Play App Signing emits. Never anything else.
   */
  it('is either an honest placeholder or a well-formed SHA-256, for every entry', () => {
    if (isUnbuilt()) return; // unbuilt, and saying so
    for (const fp of fingerprints()) {
      // The placeholder is honest only as the sole entry. Alongside a real
      // fingerprint it is a half-finished edit wearing a complete one.
      expect(fp, 'placeholder is only legal on its own').not.toBe(PLACEHOLDER);
      expect(fp, 'fingerprint must be 32 colon-separated uppercase hex pairs').toMatch(SHA256_SHAPE);
      // A SHA-1 is 20 pairs and lives one screen away in Play Console. It is
      // the single easiest wrong value to paste in.
      expect(fp.split(':')).toHaveLength(32);
    }
  });

  it('has no placeholder left anywhere once a fingerprint is real', () => {
    if (isUnbuilt()) return;
    expect(raw).not.toContain('REPLACE_WITH_');
  });
});
