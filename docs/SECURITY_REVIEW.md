# Security & data review — stage 5

**Run 2026-08-30. Surface: the web app at `sixonthedial.com`, and the Android
TWA built from it. Facing: PUBLIC, so this checklist is mandatory and full,
not the internal "record the no-ops" variant.**

Backfilled. This gate was never run — the project reached stage 8 with no
recorded gate of any kind, and stage 5 is the one that is mandatory for a
public surface. **The `at` precondition has long passed: the surface has been
live since 2026-08-21.** A late review is worth running; a late review reported
as on-time is not, so it is recorded as a deviation.

The route sweep ran first (`npm run check:routes`), per the skill order.

## 1. Route sweep — enumeration, not a checklist

`scripts/check-routes.mjs`, and it is a guard rather than a paragraph.

61 source files enumerated. **Zero server-execution surfaces**: no route
handler, no `/api`, no middleware, no `use server`, no `getServerSideProps`, no
`next/server` import. PUBLIC allowlist is empty, which is the correct state.

**Why this is a guard and not a formality.** `output: 'export'` already makes
the build fail on a server route, which sounds sufficient. It is not — that
protection vanishes the moment somebody removes the line to try something, and
a static site quietly becoming a server is exactly the change that arrives
without a threat model. The check is independent of the build flag.

Red-proofed both ways: an `/api` route fails it, and a bare `'use server'`
directive in a lib file fails it.

## 2. Data — what the app holds and what leaves

**Nothing leaves the origin.** Four `fetch` sites exist in source; two are dead
code behind `MODERN_UPGRADE_ENABLED = false`, two are the optional sync path
guarded by `isSyncConfigured()`, and `NEXT_PUBLIC_SYNC_URL` is set nowhere.

Verified against the LIVE deployed page, not a local build:

    connect-src 'self'

and the only origin appearing anywhere in the served HTML is
`https://sixonthedial.com`. **Zero third-party runtime origins** — no font CDN
(fonts are local), no ad SDK, no analytics SDK. Three runtime dependencies:
`next`, `react`, `react-dom`.

Storage is `localStorage` only: progress, theme, accent, text scale, haptics,
fullscreen, definition cache. The progress shape carries word lists, reveals,
day keys, cleared ids, streak and freezes — **no identifiers and no timestamps
beyond a local day key.**

The service worker refuses cross-origin traffic outright
(`public/sw.js`: `if (new URL(request.url).origin !== self.location.origin) return;`).

Even were sync enabled, it uploads a PBKDF2(600k)→HKDF opaque id and AES-GCM
ciphertext; the passphrase and key never leave the device.

## 3. PII and the Data Safety declaration

**No personal data is collected, stored or transmitted.** No email, name,
account or device identifier. No geolocation, camera, microphone or contacts.
No fingerprinting.

The only outbound-capable actions are user-initiated and OS-mediated:
`navigator.share`, `clipboard.writeText`/`readText`, and a `mailto:` link on the
support page. The destination is chosen by the person, not the app.

**The Play "Data Not Collected" declaration is supported by the code**, and
`connect-src 'self'` makes it structural rather than a promise. That matters:
the claim is filed with two stores, and this is the check behind it.

## 4. Secrets

No hardcoded credentials. `.gitignore` covered `*.keystore`, `*.jks`, `*.p12`,
`*.pem` and `.env*` **before the Android project existed**. No file of those
types was ever added on any branch. The signing password is read from the macOS
Keychain at build time (`android/build.sh`), never from a file.

The only token-shaped strings in the repo are `${{ github.token }}` — ephemeral,
injected by Actions — and dictionary words in the wordlists.

## 5. Supply chain

`npm audit --omit=dev` → **0 vulnerabilities**. CI actions are pinned to commit
SHAs rather than mutable tags, with `permissions: contents: read`.

**No repository variables and no repository secrets exist**, and the
`github-pages` environment carries neither — checked directly, because a
variable set in the web UI would not appear in the checked-in workflow and
would silently widen `connect-src`. It does not exist.

## 6. Android

The **merged** manifest — what actually ships in the AAB, not the source —
declares exactly one permission: `POST_NOTIFICATIONS`.

App-links verification is guarded separately by `npm run check:assetlinks`,
which fetches the file the way Android does: no redirects followed,
content-type asserted, fingerprints diffed against the repo, and an unreachable
host treated as a failure rather than a pass.

## 7. Admin console

**None exists, and that is recorded rather than skipped.** Doctrine tracks the
admin console as a first-class surface and says it is "under-built precisely
because nothing tracks it as first-class". This product has no backend, no
accounts and no privileged surface, so there is nothing to gate. If one is ever
added it is a new surface and traverses this spine on its own.

## What this review does NOT cover

Stated because a review that lists only what it checked reads as complete when
it is not.

- **No content-level secret scan of git history.** Filename patterns were
  checked across all branches; blob contents were not scanned with
  gitleaks/trufflehog.
- **No penetration testing.** There is no server to test, but the claim here is
  "no attack surface found by enumeration", not "the surface was attacked".
- **The third-party origin check reads the served HTML.** A script that
  constructs a URL at runtime would not appear in it — though `connect-src
  'self'` would block the request regardless, which is why the CSP is the
  load-bearing control and not the origin scan.
- **Dependency audit ran under Node 16** against an engines constraint of
  `>=20.19`. Audit is a lockfile operation and does not need the runtime, but
  the environment is not the declared one.
