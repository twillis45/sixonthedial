# Deferred at promotion — 2026-08-30

Surface: **sixonthedial.com** · facing: internal → **public** · platform: web
(plus an Android TWA, not yet submitted)

**Run retroactively.** The surface has been public since 2026-08-21 and
`promote-surface` never fired. This file exists because the skill's own rule is
that a deferral without a committed file was dropped, not deferred — and that
applies just as much when the file is written late.

## Gates 1, 2 and 4 — closed, and the reason is structural

This surface is unusually well placed for promotion, and it is worth naming why
rather than taking credit for it: **there is no server.** Static export, no
backend, no accounts, no roles, no database, no shared data store.

| Gate | State |
|---|---|
| **1 — server-side authorization** | **N/A, enumerated.** No routes, no roles, no queries. `npm run check:routes` enumerates 61 source files and asserts zero server-execution surfaces; a new one fails it. The class of failure this gate protects against cannot occur because there is nothing to authorize. |
| **2 — secrets and error surface** | **Closed.** No secrets in source or git history; signing password read from the macOS Keychain. Everything here is a client bundle by definition, and the only public env var is unset. No sessions, no cookies, no login, so nothing to expire or rate-limit. No third-party API key — zero third-party runtime origins. |
| **4 — reversibility** | **Closed.** No database to restore; per-device `localStorage` only, with an export/restore path covered by tests. Rollback is `git revert` plus a Pages deploy, and navigation is network-first with `no-store`, so one online load takes it. Neither store can roll a release back — the web layer IS the rollback, recorded in STORE_READINESS 3.7. |

## Gate 3 — the half that passes, and the half that has never run

**Mechanically it passes.** Walked on the live site in a clean browser profile,
2026-08-30: the teach card renders, empty states render (0/6 rows, Novice,
0 bonus, `localStorage` genuinely empty), one word advances progress and retires
the teach, and there are **zero console errors**.

**That proves the app does not break for a stranger. It proves nothing about
whether a stranger understands it** — and that is the actual content of this
gate. `docs/gate0.html` exists to answer it, is frozen, and **has never run**.

This is the promotion risk. Not authorization, not secrets — comprehension.

## The deferrals, each with the risk being accepted

- [ ] **Gate zero — twelve strangers, four first-runs.** No date.
      *Risk accepted:* the surface went public before anyone verified a
      stranger can work out what to do. Bounded only by the fact that no money
      has changed hands YET — not by the product being free. **It is not free.**
      Sitting 3 records the operator instruction as *"it has to be paid"*, and
      the Play form is set to Paid deliberately, because free→paid cannot be
      undone after publish while paid→free can. The bound is a timing accident,
      not a property of the product, and it disappears the moment the listing
      goes live.

- [ ] **One real community reader per pack.** No date.
      *Risk accepted:* 21 boards shipped 2026-08-28 have never been read by
      anyone from the communities they describe. This is the promote-surface
      principle applied to content rather than code — the catalogue's quality is
      evidence from its author, and a real reader is the second user. Bounded
      only by no money having changed hands yet. **This is a paid product**, so
      the acceptable window is short: unreviewed cultural content is a very
      different exposure once someone has paid for it.

- [ ] **Content-level secret scan of git history.** No date.
      *Risk accepted:* filename patterns were swept across all branches and no
      `.env`, keystore, pem or p12 was ever added. Blob contents were not
      scanned with gitleaks or trufflehog. Low likelihood given the above; the
      residual is a secret pasted inline into an ordinary source file.

## Not deferrals — already closed, recorded so they are not re-litigated

- **Accessibility.** WCAG AA holds across six surface/theme combinations
  (`check:a11y`), and the guard itself was found lying on 2026-08-29 and fixed.
  This was going to be recorded as a deferral until the instrument was
  corrected; it is not one.
- **Responsive/mobile.** Held across 19 viewports (`check:tiles`, `check:rail`).
- **Onboarding UI.** The teach card exists and retires when obeyed
  (`check:intro`). Whether it *works* is gate zero, above.
- **Permissions model, 2FA, password reset, load testing.** All N/A — no
  accounts, no server.

## Platform

**CORRECTION 2026-08-30.** An earlier version of this file twice bounded a
risk with the phrase "free, web-only". That was wrong. The product is paid by
operator ruling; only the current web build is unpaywalled, and that is a
distribution state rather than a model. Both bounds are restated above, and the
original wording is named here rather than quietly replaced — a risk accepted
on a false premise was not accepted.

Web ships on our schedule. **Android does not.** Play review is a multi-day
pipeline with rejection risk, and the account is Personal rather than an
organization, which adds the 12-testers-for-14-days closed-testing requirement.
Compressing the gates to fit a date is not available on that side.
