# Store readiness — Apple App Store + Google Play

## The entity, for the forms that ask

Both stores and the trademark application ask for the same handful of facts, and
until now they lived in email and a PDF — reconstructed by hand on 2026-08-21,
which is not a thing to repeat under filing pressure.

| | |
|---|---|
| **Legal name** | No Guesswork Systems LLC |
| **Maryland ID** | W26948752 — registered 2026-02-26, good standing |
| **Business address** | 306 W Redwood St, STE 201, Baltimore, MD 21201 |
| **Phone** | 240-782-0827 *(decided 2026-08-21)* |
| **Domain** | sixonthedial.com |
| **Android package** | com.sixonthedial.game |

### D-U-N-S — a record already exists, and its address is wrong

Checked 2026-08-29 against the D&B public business directory. **Do not file a
new request before resolving this.**

A record exists under the exact legal name:

| field | D&B record | this repo's entity block |
|---|---|---|
| Name | NO GUESSWORK SYSTEMS LLC | No Guesswork Systems LLC |
| Address | **5000 Thayer Ctr, Oakland, MD 21550-1139** | 306 W Redwood St STE 201, Baltimore MD 21201 |
| Industry | Business Support Services, NAICS 5614 | a game publisher |
| D-U-N-S | masked — `***********` | — |

**Why the address matters more than it looks.** Apple and Google verify the
name and address you type against the D-U-N-S record. A record saying Oakland
while the application says Baltimore fails verification, and the failure
arrives after the wait rather than before it.

**STATUS 2026-08-29: the address change is STARTED, not confirmed.** Recorded
as in-flight deliberately — this row's neighbour above is a monument to writing
down an intention as a completed fact. It is done when the public record shows
Baltimore, not when the form was submitted. **Re-check the profile before
applying to either store**, because the stores match what they read against
what you type, and a change still propagating reads exactly like a change that
never happened.

**Three things to establish, in this order:**

1. **Is this record even ours?** The name matches exactly and Maryland ID
   `W26948752` is the authoritative check. It may equally be a formation
   service's address picked up by D&B, or a different company.
2. **Reveal the number without paying.** The directory masks it and offers a
   credit report; the free route is *Claim it via D-U-N-S Profile Manager*
   on the company profile page. Claiming is free; the credit report is not.
3. **Correct the address on the record before applying anywhere**, or the
   store verification will not match.

**Timing, corrected.** An earlier note in this session said a D-U-N-S takes
"several business days". Verified on dnb.com 2026-08-29: **free requests take
up to 30 BUSINESS DAYS**; expedited is 8 business days and costs money. D&B
offers dedicated *"I'm a Google Developer"* and *"I'm an Apple developer"*
paths in its request flow. One number serves both stores — this is the longest
pole in the store track and it is not close.

**Deliberately absent, and this repo is PUBLIC:** the EIN and the member's home
address. Both are on file with the IRS — the CP 575 lists the LLC at a home
address rather than the registered agent's — and neither belongs in a
world-readable git history. They are in the LLC folder in Dropbox. Do not add
them here for convenience later; the convenience is the whole failure mode.

**RESOLVED 2026-08-27 — nothing is owed. The lookup completed.**

Maryland Business Express, Department ID `W26948752`:

| field | value |
|---|---|
| Principal Office | 306 W REDWOOD ST, STE 201, BALTIMORE MD 21201 |
| Resident Agent | NORTHWEST REGISTERED AGENTS SERVICE, INC — *same address* |
| Status | ACTIVE · in good standing |
| Formation | 02/26/2026, MD · DOMESTIC LLC |

Three things this settles. **Nothing is owed** — the record already shows the
current Northwest address, which is the first row of the decision table below.
**The Articles DID use Northwest's address** — Principal Office and Resident
Agent are identical, which is the fact the inference below could not check.
And **the home-address exposure does not exist**: the public state record shows
the agent's address, not a member's, so the third row's privacy concern is moot
on the state side.

What remains is a MISMATCH, not an error: the state shows Baltimore, the CP 575
shows a home address. Closing it is Form 8822-B, mail-only, ~4-6 weeks — a
deliberate choice to make the records agree (state, IRS, Stripe, Play), not a
defect to repair.

**Correction, 2026-08-28.** The first version of this paragraph said the
mismatch "matters because payment and store platforms verify against IRS
records, not state ones," and predicted address questions during verification.
Both verifications have since run and neither asked: Stripe activated on the
Baltimore address, and row 3.2 records Play completing identity, organization
and phone verification inside the signup day — with the IRS record still
showing the home address. The disagreement is real; the consequence asserted
for it was not measured, and was wrong.

The original inference is left below, unedited, because it was stated as a
conclusion when it was a guess, and the correction is worth more than the
tidy version.

---

**The registered agent's address changed; whether anything is owed is UNVERIFIED.**
Northwest bought a new Maryland building and filed the agent-address change with
the state on 2026-04-22. Their notice adds that "if you've opted to use our
address on business filings, an amendment may be needed" — which only bites if
the Articles of Organization used THEIR address. The CP 575 shows the LLC at a
home address, which suggests the filings may not have used Northwest's at all,
in which case their move is irrelevant to this entity and nothing is owed.

I recorded "an amendment is owed" on 2026-08-21 and that was an inference stated
as a conclusion. Attempting to check it, egov.maryland.gov is Turnstile-protected
and JavaScript-driven, and the lookup did not complete — so the question is open,
not answered.

**To settle it:** Business Express → Entity Search → Department ID `W26948752` →
read the Principal Office address.

| record shows | owed |
|---|---|
| 306 W Redwood St, STE 201 | nothing, already current |
| an older Northwest address | Articles of Amendment, ~$25 |
| the member's home address | nothing REQUIRED — but it is a home address on a public state record, and a USPTO filing would put it on a second one |

The third row is the one worth a decision rather than a fix.

**The phone is a separate line from the photography business**, which is the
outcome worth having: 240-232-7847 appears in the portrait business's own
signature and website, and using it here would have tied the game's public
contact to a different company's inbound calls. It also would have been
awkward to unpick, because a number on a filed trademark and in two store
consoles is not a thing anyone changes casually.

Nothing verifies this number from inside the repo — it is a fact about the
world, recorded because both store forms and the trademark application ask for
one. If it ever changes, it changes in three places at once: here, both
developer consoles, and any filing already submitted.

Tracker. Started 2026-08-12. Status values: **BLOCKER** (ships nothing until
fixed) · **TODO** · **DONE** · **DECIDE** (needs a human ruling).

Wordy today is a Next.js static export deployed to GitHub Pages. Neither store
accepts a URL, so everything below assumes a wrapper: **TWA** (Trusted Web
Activity, via Bubblewrap) for Play, **Capacitor** or a WKWebView shell for iOS.

---

## 0. The one that decides whether this is worth starting

| # | Item | Status | Note |
|---|---|---|---|
| 0.1 | **Apple Guideline 4.2 — minimum functionality** | **BLOCKER · DECIDE** | *"a repackaged website gets rejected."* A WKWebView wrapper around a web game is the single most-rejected shape on iOS. Needs native surface to survive: offline-first (have it), home-screen widget, Game Center, haptics, share sheet, push. **Decide before building anything else** — this determines whether iOS is a wrapper or a real client. **Intent stated 2026-08-15: all three surfaces are wanted (web + Play + App Store).** That settles *whether*, not *what shape* — see the audit in 0.4. |
| 0.2 | Google Play — repackaged-web is fine via TWA | TODO — **gated by 0.3** | Play accepts TWA. Play's equivalent risk is low. **Ship Android first** is the obvious sequencing — but it cannot start until 0.3 is closed. |
| 0.3 | **A custom domain is a hard prerequisite for TWA** | **CLOSED 2026-08-21** | A TWA proves it owns its web content with a Digital Asset Links file at **`https://<domain>/.well-known/assetlinks.json` — the ORIGIN root, not the app's sub-path.** Today the app is served from `https://twillis45.github.io/sixonthedial/` (confirmed via the Pages API; `cname` is null, no `public/CNAME`). That well-known path belongs to the *`twillis45.github.io` user-pages repo*, not this one, so this repo structurally cannot publish it. `github.io` is also on the Public Suffix List, which is not a domain to anchor app identity to. Unverified, a TWA falls back to Custom-Tab UI **with a visible address bar** — which is precisely the "repackaged website" read we are trying to avoid, on the store that was supposed to be the easy one. Buy the domain and point Pages at it; it is cheap and it unblocks Play, iOS universal links, and the `start_url`/`id` migration the manifest already anticipates. **2026-08-21: `sixonthedial.com` is registered** at Cloudflare Registrar, on Cloudflare DNS. What remains is mechanical and is NOT done yet: point A records at the Pages IPs, set the custom domain on the repo, and land `public/CNAME` — which is what flips `NEXT_PUBLIC_BASE_PATH` to the root and makes `/.well-known/assetlinks.json` an origin-root path this repo can actually publish. Until those three land, the TWA argument in this row still stands. **DONE, verified live:** `https://sixonthedial.com/` serves the app (200, assets from the root), `www` 301s to it, and **`https://sixonthedial.com/.well-known/assetlinks.json` returns 200 from the ORIGIN ROOT** — the path this repo structurally could not publish on `github.io`, because it belonged to the user-pages repo. The three defensive domains 301 to the canonical one with paths preserved. What remains for the TWA is not a domain problem: **both placeholders are now filled.** Package `com.sixonthedial.game` and the Play-managed app signing SHA-256, taken from the console's **Classical key** on 2026-08-27 — not the post-quantum key beside it, which Android's app-link verification does not consume, and not the upload key. The package name is settled: `com.sixonthedial.game`. **2026-08-21 follow-up:** the package name is filled in — `com.sixonthedial.game`, which was never in doubt because an Android package segment cannot begin with a digit. The fingerprint is the only unknown left and cannot exist until the app is created in Play Console. `src/lib/assetlinks.test.ts` now holds the file to exactly two legal states — the honest placeholder, or 32 colon-separated uppercase hex pairs — because the failure this file has is not being missing. It is being present, valid JSON, correctly served, and wrong in one character: Android does not error on a mismatch, it silently falls back to Custom Tab UI **with a visible address bar**, which is the exact "repackaged website" read this whole effort exists to avoid. Red-proofed against the two most likely wrong values: a SHA-1 from the adjacent Play Console screen (20 pairs) and lowercase hex. Live file verified: 200, `content-type: application/json`, valid JSON. |
| 0.4 | **What native surface already exists** | note, 2026-08-15 | Audited against the source, because the 4.2 argument turns on it and the tracker had never written it down. Present today, in the web app: real iOS **Taptic haptics** (`lib/feedback.ts` — the iOS 18 hidden `<input switch>` trick, since Safari exposes no haptic API, with an 8-signal rhythm vocabulary designed to be legible with the screen off), synthesized **WebAudio** with a limiter on the bus, **share sheet** via `navigator.share` with clipboard fallback, **offline-first** service worker, `display: 'fullscreen'` with maskable icons, and **optional end-to-end-encrypted sync** with no account and no server-readable progress (`lib/sync.ts`). This is materially more than a webview around a page — but 4.2 is judged on the **binary**, and none of it is native code. |

---

## 1. Legal and policy — needed by BOTH stores

| # | Item | Status | Note |
|---|---|---|---|
| 1.1 | Privacy policy, publicly hosted | **DONE 2026-08-16** | Read against the code rather than taken on trust, and it holds. Two things were wrong and are fixed. (a) The page claimed Wordy "makes no network requests to anyone once the page has loaded" — literally false: it fetches its own `/data/definitions.json` and the worker fetches its own assets. The claim now says what is actually true and is still the strong version — no requests to any *third party*, only its own files from the address you loaded it from. An untrue sentence is a liability precisely because the rest of this posture is genuinely excellent. (b) The date read `10 August 2026`; house style is US format. |
| 1.2 | Terms of service | **DONE 2026-08-16** | `/terms` read; no claims that contradict the code. Date format corrected. |
| 1.3 | Support URL / contact | **DONE 2026-08-16** | `/support` read; reachable channel present, and it carries the WordNet notice required by 1.9. Date format corrected. |
| 1.4 | **COPPA / age gate** | **TODO** | The board's privacy seat: *"a word game will attract children whether or not it is aimed at them."* Decide the target age band before the rating questionnaires, because both stores ask and the answer changes obligations. |
| 1.5 | Apple privacy nutrition labels | **ANSWERED 2026-08-16 — file as "Data Not Collected"** | Measured, not assumed. Zero analytics/tracker SDKs in source or export (searched gtag, GA, GTM, Segment, Mixpanel, Amplitude, PostHog, Sentry, Bugsnag, Firebase, Meta, Hotjar, Plausible, DoubleClick — the only hit was a code comment). Three runtime dependencies total: `next`, `react`, `react-dom`. Four `fetch` sites exist and none reach a third party in a shipped build: two are the optional sync, which is off unless `NEXT_PUBLIC_SYNC_URL` is set and the deploy never sets it; one is same-origin `/data/definitions.json`; the fourth is `api.dictionaryapi.dev` behind `MODERN_UPGRADE_ENABLED = false`, disabled deliberately and documented in `definitions.ts`. The shipped CSP is the backstop and makes it structural rather than a promise: **`connect-src 'self'`**. |
| 1.6 | Play Data Safety form | **ANSWERED 2026-08-16 — "No data collected"** | Same measurement as 1.5, and it must stay in step with it. On-device `localStorage` keys (progress, streak, hints, theme, accent, reading mode, fullscreen) are **storage, not collection** — nothing transmits them. |
| 1.7 | Content rating (IARC via Play, Apple age rating) | **ANSWERED 2026-08-26 — Everyone / 4+** | Word game, no violence. Check the wordlist question below first. |
| 1.8 | **ENABLE1 wordlist license** | **DONE 2026-08-14 — one question left for the attorney** | Recorded in `data/enable1.PROVENANCE.md`. What ships is ENABLE 1.x, 172,823 words, sha256 `3f161302…`, byte-identical to the widely mirrored copy — re-downloaded and compared on the day. The project's own readme releases it: *"The ENABLE master word list, WORD.LST, is herewith formally released into the Public Domain."* Three things stay soft and are written down rather than smoothed over: the permission is not IN the file (172,823 bare words, no header, no notice), the readme quoted is the ENABLE2K edition and describes a later revision of the same master list, and a public-domain dedication is a claim about a jurisdiction — some do not let an author abandon copyright, and neither store limits distribution by territory. A hash cannot close that last one; ask the attorney already reading the filing whether a CC0 fallback is wanted. `src/lib/content.test.ts` asserts the hash and the count, so the vetted file is the file that ships. |
| 1.9 | WordNet definitions license | **DONE 2026-08-14** | Correction to this row's first version: attribution WAS already present on `/support`, crediting WordNet 3.1 and ENABLE. The real gap was narrower — the licence grants permission "provided that you agree to comply with the following copyright notice and statements, including the disclaimer, and that the same appear on ALL copies". A summary does not satisfy that. The copyright notice, the AS-IS disclaimer and the name-use clause are now reproduced on `/support`. Bundled data confirmed as WordNet 3.1 (`wordnet-db@3.1.14`), so the version claim on that page was already correct. |
| 1.10 | Cultural content review | **BLOCKER — everything but the hiring is now done** | `AGENTS.md`: *"a real reader is budgeted per pack before anything ships commercially."* Still has not happened for ANY pack, and store release is the definition of commercial — so this stays a blocker and stays the only thing that moves the readiness audit off 2/10. What changed 2026-08-17: the row is no longer waiting on preparation. **Packets are built for all 14 packs** (`node scripts/reader-packet.mjs --all`), each carrying every board and clue, the questions research could not settle, and ⚑ marks on clues with a citation behind them. **`docs/research/COMMISSIONING.md`** carries the rest: why three packs and which (cookout, rnb90s, church — 39 boards, 234 clues, a 1.3-month daily rotation), one reader per pack and explicitly not one reader for all three, who to look for per pack, the ask ready to send, and what happens to each class of finding. Remaining work is hiring three people and paying them. |
| 1.11 | Trademark sweep on the NAME, and on theme + clue text | **PARTIAL 2026-08-16 — knockout done, clearance owed** | Two separate jobs; only the first has moved. **The name:** run on USPTO's live search, with a control query to prove the syntax returned results at all. `WM:"six on the dial"` → **0 results** (stopwords drop, so this searched marks containing both *six* and *dial*, live and dead). Control `WM:"wordy"` → 37, which also settles the old name: **WORDY is LIVE/PENDING in Class 009 for "downloadable software in the nature of a mobile application", owned by Wordy Plus LLC** — the exact goods this app is. That is a knockout search, **not clearance**: it does not cover confusingly-similar marks, common-law rights, or state registrations, and it is not a legal opinion. Send it to the attorney already engaged on 1.8 — one engagement, two questions. **Do not buy the domain until this closes**; the point of clearing first is not to pay for an asset that must be abandoned. **Clue text:** untouched. Clues name real records, artists and brands; nominative reference is normally fine, but the pass is still owed. |

---

## 2. Store listing assets

| # | Item | Status | Note |
|---|---|---|---|
| 2.1 | App icon — 1024×1024 (iOS), 512×512 (Play) | **DONE 2026-08-16** | Confirmed the suspicion in this row's first version: the script emitted PWA sizes only (192, 512, maskable pair, 180). Play's 512 was already covered by `icon-512.png`; **Apple's 1024 was missing entirely.** `build-icons.py` now also emits `store/app-store-icon-1024.png` — verified 1024×1024, mode RGB, **no alpha**, which App Store Connect rejects. Written outside `public/` on purpose: store art is uploaded, never served, and `public/` is the deploy artifact. Note the repo's Pillow is an x86_64 build on an arm64 machine and `npm run icons` fails on `import PIL`; that is a pre-existing environment problem, not a script one. |
| 2.2 | Play feature graphic 1024×500 | **DONE 2026-08-17** | Play-only, required. `node scripts/build-feature-graphic.mjs` → `store/play-feature-graphic.png`, verified 1024×500 and PNG color type 2 (**no alpha** — Play rejects it, same rule as 2.1). Built from the committed wordmark and dial mark rather than hand-laid text, so it regenerates when the brand does. The marks are mostly padded ground and the wordmark paints its own background rect, which defeats `getBBox()`; the script names the measured ink bounds as constants and derives every offset from them, so sizing is stated once (560px wordmark, 68px margin) instead of hand-tuned the way `build-og.mjs` had to be. **One constraint deliberately not met:** if a promo video is ever attached, Play overlays a play button over the center, which lands on "dial" and the tagline. Clearing that band would cap the wordmark near 390px — not worth it for a video that does not exist. Attaching one means re-running with a shorter tagline. |
| 2.3 | iPhone screenshots (6.7" and 6.5" required) | **DONE 2026-08-17** | `node scripts/capture-store.mjs` shoots six surfaces (board, solving, themes, progress, rules, light) at all three Apple sizes — 1290×2796 (6.7"), 1242×2688 (6.5"), 1320×2868 (6.9") — 18 files in `store/screenshots/`, dimensions asserted from the PNG header at capture time. The script also refuses to ship a shot of a failed board, which is how the hardcoded-word bug was caught. |
| 2.4 | iPad screenshots | TODO | Only if the iOS build declares iPad support. Cheaper to ship iPhone-only first. |
| 2.5 | Play phone/tablet screenshots (2–8) | **DONE for phone 2026-08-17** | Same source: six 1080×1920 phone shots in `store/screenshots/`, inside Play's 2–8 range. Tablet shots are still unshot and stay optional until the build declares tablet support — same reasoning as 2.4. |
| 2.6 | Description, subtitle, keywords | TODO | |
| 2.7 | Privacy-policy URL in both listings | TODO | Points at 1.1. |

---

## 3. Build and release engineering

| # | Item | Status | Note |
|---|---|---|---|
| 3.1 | Apple Developer Program — $99/yr | TODO | Enrollment can take days. Start early. |
| 3.2 | Google Play Developer — $25 once | **PAID, BUT NOT WHAT THIS ROW CLAIMED** | **CORRECTED 2026-08-29 from the console.** This row read *"DONE — Organization account, `No Guesswork Systems LLC`"* and reasoned at length about why Organization was the right call. **The account is PERSONAL.** Console: Account type `Personal`, ID `8527330358555903551`, Developer name `No Guesswork Systems` (no LLC), Account owner `toddswillis@gmail.com`, Legal name `TODD STEWART WILLIS`, Address `6211 Dimrill Ct, Fort Washington MD 20744` — **the member's home address**, taken from the personal Google payments profile. Three consequences, and this row's own text names two of them: **(1)** the 12-testers-for-14-days closed-testing rule applies to personal accounts created after Nov 2023 — this account was created 2026-08-27, so it applies, and the two weeks this row claimed to save are owed. **(2)** *"an individual account cannot be converted later without support"* — written here as the reason to choose Organization, now the position we are in. **(3)** the entity block above deliberately keeps the member's home address out of a public repo, and a personal account publishes developer name and address on the listing — reintroducing exactly the exposure the registered-agent address was chosen to avoid. The verified phone `(240) 782-0827` still matches the entity block. **Nothing has been published**, so this is the cheapest moment it will ever be to fix. |
| 3.3 | Play target API level | TODO | Play enforces a rolling minimum; check the current deadline at build time. |
| 3.4 | Version + build numbering scheme | **ANSWERED 2026-08-26** | Neither store lets you reuse a build number, and the mistake is permanent for that number — you cannot delete it and retry, only go up. So the scheme is a tested function, not a paragraph: `src/lib/version.ts`, 14 tests. **`versionName`** is semver from `package.json`, the human-facing string. **`versionCode`** is `YYMMDD * 100 + seq` — `26082600` is the first build on 2026-08-26. Date-derived rather than a counter because every place a counter could live can be reset, branched or lost: CI run numbers reset when a pipeline is recreated, and a committed integer merges badly. The function throws rather than encodes at both ends of its range — below 2000 the arithmetic is meaningless, and **at 2100 the two-digit year wraps to 00 and the code starts going BACKWARDS**, which is the one failure Play cannot forgive. `isPublishable()` holds a candidate strictly above everything already shipped. **What is specific to this product:** the web layer updates itself, so this number moves RARELY — only when the manifest or intent filter changes (name, icons, `start_url`, signing). A board or a bug fix never needs a new `versionCode`, and anyone treating it as a per-deploy number has misunderstood the wrapper. See 3.6. |
| 3.5 | Crash reporting | TODO | There is none today. A store build without it is blind. |
| 3.6 | **PWA update path inside a wrapper** | **ANSWERED 2026-08-21** | **Which layer updates: the web layer, by itself.** A TWA is a thin Android shell around the same origin, so game content, puzzles and UI ship through the service worker exactly as they do on the web. The binary only needs republishing for things that live in the manifest or the intent filter — name, icons, `start_url`, signing — never for a board or a fix. **How a user escapes a bad cache: they do not have to.** Navigation is network-first with `cache: 'no-store'` (`sw.js`), which is stronger than it sounds: a bare `fetch()` still consults the HTTP cache, and GitHub Pages sends `max-age` on HTML, so "network-first" would otherwise quietly degrade to "whatever the browser kept" — the exact staleness 5.1 was. With `no-store`, any online navigation returns the current document, which references the current build-hashed assets. A bad cached build cannot survive one online load. **The cache itself is swept, not accumulated:** `CACHE` is the build id, `activate` deletes every key that is not the current one, then `clients.claim()`, and the client reloads on `controllerchange` — but only when `hadController` was already true, so a first-ever visit does not flash. **Residual risk, stated rather than hidden:** a service worker that threw during `install` would leave the previous worker in place, which is the safe failure — the player keeps a working older build rather than a broken new one. The case with no automatic escape is a worker that installs successfully and is itself broken; `skipWaiting()` plus the version sweep means the NEXT deploy replaces it without user action, so the exposure is one deploy cycle, not permanent. Verified live at 5.1. |
| 3.7 | Staged rollout + rollback plan | **ANSWERED 2026-08-26** | **Start with the fact that is usually got wrong: neither store can roll a release back.** Play can HALT a staged rollout, and both stores can be given a *higher* version — but a published build is never withdrawn to a previous one, and users who already took the update keep it. Planning around a rollback button that does not exist is the actual risk here. **What that leaves is the strong position:** the web layer is the rollback. A TWA is a shell around the same origin, so puzzles, clues, UI and fixes ship through the service worker, and reverting a bad content or logic change is `git revert` plus a Pages deploy. Navigation is network-first with `cache: 'no-store'`, so one online load takes the reverted build — see 3.6 and 5.1. **The binary is the part with no undo**, which is another reason 3.4's number moves rarely: the less often you ship a binary, the less often you are exposed to the thing that cannot be reversed. **Rollout:** Play staged rollout starting small, held for at least one full daily-puzzle cycle before widening, because this game's core loop is once per day and a bug in daily rollover is invisible inside an hour. Halt rather than widen on any crash-rate move — which needs 3.5, and there is no crash reporting today, so the first release is being watched with nothing but store reviews. That gap is worth closing before rollout, not after. |

---

## 4. Monetization — only if the paid packs ship

| # | Item | Status | Note |
|---|---|---|---|
| 4.1 | **Digital goods MUST use IAP / Play Billing** | **BLOCKER if paid** | Approved pricing is $16.99 / $29.99-yr for 218 boards. Taking that any other way in-app is an instant rejection on both stores. |
| 4.2 | Restore purchases | TODO | Apple requires it explicitly. |
| 4.3 | Receipt validation | TODO | Today all state is localStorage, which a user can edit. Entitlement cannot live there. |
| 4.4 | Price tiers, tax, payouts | TODO | |
| 4.5 | Subscription terms shown before purchase | TODO | Both stores check the wording. |

---

## 5. Findings from the 2026-08-12 smoke test that block or endanger release

| # | Item | Status | Note |
|---|---|---|---|
| 5.1 | Service worker served a stale build | **CLOSED 2026-08-27 — full transition observed in production** | Every half of this row is now watched rather than reasoned. A tab controlled by `wordy-ede46bda935c` sat open while the tailgate deploy moved production to `wordy-7363ed1e0c46`. On a NATURAL navigation — what a returning player does — the browser's update check found the new worker, it installed and activated, the activate-time sweep left `caches.keys()` at **exactly one entry at the new stamp**, `controllerchange` fired, and **the document reloaded itself**: `navigation.type` reads `reload` on a tab nobody touched. The earlier non-fire (2026-08-27, first attempt) is explained — a `registration.update()` forced from an isolated execution context does not exercise the app's listener the way a real navigation does, which is a fact about the test rig, not the fix. Two test-procedure corrections stand recorded: an idle tab never checks for a worker update, so "leave it open and it reloads" cannot pass as written; and a hard refresh nulls the controller and correctly suppresses the reload (5.1a). The working procedure is: open tab → deploy lands → navigate once → the tab does the rest by itself. |
| 5.1a | I twice reported 5.1 as unfixed when it was working | note | Worth recording as a testing lesson, not a code one. I verified by unregistering the worker and clearing caches, which leaves `navigator.serviceWorker.controller` null — so `hadController` is false and the auto-reload is *correctly* suppressed. The test method defeated the fix and I read that as the fix failing. A hard refresh cannot verify a soft-refresh path. |
| 5.2 | First-run stall offer fired at 39s with zero interaction | **FIXED 2026-08-12** | Measured on the production export: a brand-new player who had touched nothing was told "Stuck? I'll open the 3-letter one. Costs 3 hints. You have 3." The clock now starts on first action. Would have read badly to a reviewer and is a Grandmother-veto condition. |
| 5.3 | ~~No first-run explainer appears~~ | **RETRACTED 2026-08-14** | The finding was wrong, and wrong because it was looked at rather than measured. Probed on the production export at 390×844, cold profile: the teach ("Six letters. Six words. All from the wheel.") IS shown, and is gone after one banked word with `seenIntro` true. It is also demonstrably a decision — `storage.ts` names the flag, `backup.ts` carries it through a device change, and `Game.tsx` records the ruling that the teach "should end by being acted on rather than by being clicked away". `npm run check:intro` asserts both halves and was red-proofed. Nothing here to decide. |
| 5.4 | ~~React hydration mismatch on every page load~~ | **FIXED 2026-08-14** | Root cause was one call in a render body: `fullscreenSupported()` answers `false` on the server and `true` in a browser, so `{fullscreenSupported() && <button/>}` put a header button in the client tree that the prerendered HTML did not have. React could not reconcile the header and regenerated the whole tree — the prerender was being built and thrown away on every load. Now read through `useSyncExternalStore` with a server snapshot of `false`, which is what that hook is for: hydrate matching the HTML, then re-render with the real answer. Verified: absent from the served HTML, present in the DOM after mount on a browser that supports it, and the button still works. Gated by `npm run check:hydration` — red-proofed, 3 of 3 loads failed before the fix. |

---


## 6. Marketing & promotion — the roadmap

Per `~/.claude/PATH-TO-PRODUCTION.md`, this track **starts at stage 2, not after
Deploy: positioning shapes the product.** It is late here, and the lateness has
already cost something — the board ruled the business model on 2026-08-26, after
the app was built, and that ruling closed every paid channel. Had it been asked
at stage 2 the answer would have been the same, but the capture pipeline would
have been built for a share loop rather than for store screenshots.

**Four phases, each with an exit condition rather than a date.** A date is a
wish; an exit condition is a thing you can hold up and check. Nothing in phase
N+1 starts until phase N's condition is met, and the conditions are deliberately
things other people do, because that is what this product is actually waiting
on.

### The constraint that shapes all four

**Marketing here is blind by design.** `connect-src 'self'`, zero analytics, no
ad SDKs, and GitHub Pages keeps no logs — so no UTM lands anywhere, no share is
counted, no visit is attributable. The only instruments that will ever exist are
**the store consoles and the reviews.**

That is the privacy position working, not a gap in it, and it is filed with both
stores as "Data Not Collected". Every phase below is written to be judged by
installs, ratings and read reviews, or by nothing. Any proposal that needs a
pixel is not a marketing decision — it reopens board ruling 2 and drags Play's
Families policy in with it.

### Phase 1 — Prove the thing is legible *(now)*

Positioning cannot be written for a product nobody has understood. Everything
here is about establishing that a stranger gets it.

- Gate zero: twelve strangers, four first-runs, kill rule frozen at 60% Read.
- The share text audited as the growth engine — **done 2026-08-28**, and by
  `share-convention.test.ts` rather than `check:share`. Correcting the citation
  because it mattered: `check:share` only ever held the X character limit, so
  this line claimed an audit that had not happened. The real one found the card
  spoiling its own boards.
- Press kit assembled on the domain from assets that already exist.

**Exit condition:** gate zero has run and passed, or it has failed and the
onboarding has been rebuilt once. Not "we ran it" — a scored result, on the
page, against a threshold written before anyone was tested.

### Phase 2 — Earn the right to describe it *(blocked on readers)*

The packs are the differentiator, and describing them in public before a
community reader has seen them is the one marketing move this project has
explicitly forbidden itself.

- One paid reader per pack, starting with cookout and nineties.
- Listing copy final — **drafted**, `LISTING.md`, every sentence carrying its
  check.
- The framing rule holds everywhere: the packs are made for the people in them
  first, never pitched as a lesson for anybody else.

**Exit condition:** every pack that appears in launch copy has had a reader, and
their findings are recorded — including the ones that changed a clue. A reader
who rejects a pack is the system working, not a setback.

### Phase 3 — Ship into a channel that can be measured *(blocked on accounts)*

- Play staged rollout, held at least one full daily cycle, because a bug in
  daily rollover is invisible inside an hour.
- Launch-week cuts from the existing capture pipeline, per placement.
- Outreach: word-game communities, category press, and — under the framing rule
  — outlets that cover Black culture and tech.

**Exit condition:** the app is listed, the rollout is past its first widening
without a halt, and the console is showing impressions against real keywords.
That is the first ASO instrument this project will ever possess; everything
about keywords before it is reasoned rather than researched, and `LISTING.md`
says so.

### Phase 4 — Iterate on evidence, or stop *(blocked on phase 3)*

- ASO iterated on observed ranks, not guessed ones.
- Pack pricing set with evidence — the portfolio's ten-send discipline applies,
  and no price ships on taste.
- Weekly: two numbers from the console, and every review read. With no crash
  reporting by ruling 4 and no analytics by design, **reviews are the only
  user-research channel this product will ever have.** The cadence, the log
  table and the act-or-ignore thresholds are written down in
  `docs/OBSERVING.md` — a dashboard nobody owns is the failure mode, so it is
  a file rather than an intention.

**Exit condition:** either the numbers justify continuing, or they do not and
the wind-down is deliberate rather than a slow fade. What transfers is recorded
either way — the capture pipeline, the claim-ledger listing check, the gate-zero
protocol and the self-publishing tracker all came from the Snug and Spades
sessions and went back improved. That is what makes an outcome an asset instead
of an ending.

## Suggested order

Revised 2026-08-15, now that all three surfaces are wanted.

1. **Clear the name (1.11), then buy the domain (0.3).** The domain is still the
   smallest action with the largest unblock — it gates Play, iOS universal links,
   and moving off the Pages sub-path — but clearance now comes first. The
   knockout search is clean and the review board declined to bless the name on a
   knockout alone, which is the right call: a domain bought ahead of clearance is
   an asset that may have to be abandoned. One attorney engagement covers this
   and the 1.8 question together.
2. **Start the two enrollments (3.1, 3.2).** Apple is $99/yr, Play is $25 once,
   and both take real calendar time for identity verification. They are pure
   waiting, so they should be waiting in the background from day one.
3. **Confirm 5.1 on the live deploy.** Half done 2026-08-17: all three fixes are
   confirmed present in the deployed artifact. The remaining half needs a deploy
   in flight — hold a tab open across the next merge and watch it reload itself.
4. **Clear 1.10 (cultural reader).** The one hard blocker that is nobody's
   opinion and that no amount of engineering closes. Store release is the
   definition of commercial ship, and it has not happened for ANY pack. It gates
   release on *every* surface, so it should be running in parallel from now.
5. **Ship Android via TWA.** Cheapest, likeliest to pass, and it proves the
   release pipeline end to end before iOS raises the stakes.
6. **Then iOS, and not as a bare wrapper** — see 0.1 and 0.4. The web app
   already has haptics, share, offline and fullscreen; what it does not have is
   native code, and 4.2 is judged on the binary.
7. Licence work is done — 1.9 (WordNet notice) and 1.8 (ENABLE provenance) are
   both recorded. One question rides along to the attorney: whether a 1997 US
   public-domain dedication wants a CC0 fallback for territories that do not
   recognize abandonment.
8. Only then decide paid (section 4), because IAP is most of the remaining work
   — and note 4.3 forces a native layer on iOS regardless of what 0.1 decides.
