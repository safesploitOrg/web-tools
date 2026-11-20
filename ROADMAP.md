# 🗺️ Web Tools — Development Roadmap

> **Updated:** 18 November 2026 — local `v0.1.0` implementation candidate. Design baseline: v0.2. **Not released.**
>
> **Repository target:** `safesploitOrg/web-tools` · **GitHub Pages target:** `https://safesploitorg.github.io/web-tools/` · **No custom domain.**

## 🎯 Scope and principles

- One working utility first: SRI Hash Generator (SHA-256/384/512, HTTPS resource, local file, UTF-8 text).
- Static HTML/CSS/JavaScript under `public/`, relative assets, no backend, database, SPA router or runtime dependencies.
- Preserve separate standalone safesploitOrg tools. Overview integration is only a future link change.
- Maintain SFW v1.1 B+D/T2 security and release constraints; unit tests do **not** substitute for browser E2E.
- Keep Playwright out of initial CI per owner direction. Keep that omission explicitly unresolved until the owner approves a permissible exception or compliant tests exist.

## 🧭 Phase status

| Phase                           | Status                                        | Evidence and remaining work                                                                                   |
| ------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 0 — Design                      | **COMPLETE**                                  | v0.2 plan adopted for local implementation; path and GitHub Pages decisions recorded                          |
| 1 — Foundation                  | **IMPLEMENTED LOCALLY; VERIFICATION PARTIAL** | Catalogue, SRI page, assets, docs, GitHub Actions, scripts. npm-based checks remain unverified                |
| 2 — SRI engine                  | **IMPLEMENTED LOCALLY; TESTS PARTIAL**        | SHA algorithms, URL/file/text adapters, bounded stream, validation, snippets; Node smoke PASS; Vitest NOT RUN |
| 3 — UI and integration          | **IMPLEMENTED LOCALLY; BROWSER TEST BLOCKED** | Tabs, copy, cancellation, responsive styles; browser environment returned `ERR_BLOCKED_BY_ADMINISTRATOR`      |
| 4 — Security review             | **INCOMPLETE / RELEASE BLOCKED**              | Lockfile, formatting, CI execution, general SAST, browser evidence/exception and owner T2 review pending      |
| 5 — Public GitHub Pages release | **NOT AUTHORISED / NOT STARTED**              | Requires explicit release permission, passing gates and manual dispatch on `main`                             |

## 🧱 Phase 1 — Foundation follow-up

- Obtain npm registry access, generate/review and commit `package-lock.json`.
- Apply a canonical `npm run format` pass (locally via `scripts/fix-quality.sh` or by applying the CI repair patch). Run actual ESLint, Prettier, HTML, SVG and Vitest checks, then verify locked `npm ci`. The configuration now reports independent failures, but CI passage has not been observed.
- Observe CI results for the exact revision; confirm every required gate is blocking.

## 🔒 Phase 2 — Hashing engine follow-up

- Run all Vitest reference, boundary, malicious-input and timeout/cancellation tests.
- Validate results against independent OpenSSL/node:crypto values, including zero-length bytes, Unicode and binary.
- Confirm URL success/CORS failure and redirection refusal in a real browser.

## 🖥️ Phase 3 — Browser verification follow-up

- Review mobile/tablet/desktop UI and keyboard access, focus, status announcements, copy failure, cancelled requests, HTML snippet correctness and no unexpected network requests.
- Document Chromium, Firefox and WebKit compatibility as required by SFW. Playwright remains out of initial CI, and the policy gap cannot be labelled a pass.

## 🛡️ Phase 4 — Release-readiness gate

- Enforce complete dependency, secret and SAST checks and triage reported findings by severity, exploitability and exposure.
- Resolve browser-E2E requirement or obtain **explicit, narrow, time-bounded** Section 14 exception, with documented approval and restoration criteria.
- Obtain human project-owner T2 security/release approval for the exact source revision.
- Review actual Pages HTTPS, CSP limitations, environment protection and rollback procedures.

## 🚀 Phase 5 — Controlled publication

With separately authorised action only:

1. Push the reviewed source to `safesploitOrg/web-tools` and configure GitHub Pages to use Actions.
2. Protect `main` and the `github-pages` deployment environment. Run manually approved `workflow_dispatch` only when all checks pass.
3. Verify the live `/web-tools/` and `/web-tools/sri-hash/` routes and exact digest values.
4. Record release SHA, smoke evidence, vulnerability disposition and rollback reference.
5. Separately approve any change to the Overview dashboard.

## 🔭 Future utilities and releases

| Candidate                          | Version        | Notes                                                          |
| ---------------------------------- | -------------- | -------------------------------------------------------------- |
| Verify an existing integrity token | v0.2 candidate | Proper Base64/algorithm validation, direct comparison          |
| SHA checksum calculator            | Later          | Different user-facing result; can share byte-digest primitives |
| URL and Base64 encode/decode       | Later          | Bounded local conversion                                       |
| JSON formatter/validator           | Later          | Never evaluate untrusted JSON as JavaScript                    |
| HTML entity encoder/decoder        | Later          | Render output as text, not parsed HTML                         |
| Tool search/theme                  | When justified | Keep shared shell small until more tools exist                 |

## ✅ Definition of implementation complete vs release complete

- **Local implementation:** Source and documentation exist and dependency-free checks pass — this is the current state.
- **Release-ready:** All applicable SFW security, quality and browser controls are evidenced, including an owner-approved exception only if allowed; known blocking findings are resolved.
- **Released:** Human owner approves the exact SHA, deployment occurs through the gated workflow and post-deploy smoke checks succeed.

None of the last two stages may be inferred from source code existence alone.

## v0.1.1 scoped CI-hardening PR (20 November 2026)

- **Prepared:** Canonical Prettier output, ESLint control-character change, valid HTML, updated Vitest/HTML Validate constraints, and licence-free SHA-256-verified Gitleaks CLI.
- **Still required:** PR CI evidence, human review/commit of the generated lockfile, independent browser verification or a properly approved SFW exception, and separate release approval.
- **Not in scope:** Playwright CI, feature development, merging, public deployment or DNS changes.
