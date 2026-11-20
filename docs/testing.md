# 🧪 Test strategy and verification record

> **Candidate:** `v0.1.0` implementation, 18 November 2026. These results describe only commands **actually run** in this authoring environment, not GitHub CI.

## 🧭 Required gates

| Check                                     | Local status                       | CI policy / next step                                                                                    |
| ----------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Node independent hashing + negative smoke | **PASS**                           | `npm run test:smoke`                                                                                     |
| Static relative link/module path checks   | **PASS**                           | `npm run check:routes`                                                                                   |
| Narrow unsafe-API/obvious-secret check    | **PASS**                           | `npm run check:security`; not a full SAST/secret scanner                                                 |
| `node --check` on JS modules              | Pending final run                  | Local source syntax check                                                                                |
| Vitest reference/negative tests           | **NOT RUN**                        | Blocking `npm test` in CI after lockfile generation                                                      |
| Prettier formatting                       | **NOT RUN**                        | Blocking `npm run format:check` in CI                                                                    |
| ESLint                                    | **NOT RUN**                        | Blocking `npm run lint:js` in CI                                                                         |
| HTML Validate                             | **NOT RUN**                        | Blocking `npm run lint:html` in CI                                                                       |
| npm dependency audit                      | **NOT RUN**                        | Blocking `npm audit --audit-level=high` in CI                                                            |
| Gitleaks history secret scanning          | **NOT RUN**                        | Blocking pinned action in CI                                                                             |
| Comprehensive SAST                        | **NOT RUN**                        | Still to select, implement and enforce; narrow local check does not substitute                           |
| Playwright Chromium/Firefox/WebKit in CI  | **NOT RUN, intentionally omitted** | Unmet SFW Profile B requirement, exception/validation pending                                            |
| Browser smoke/manual accessibility        | **NOT VERIFIED**                   | The test browser returned `ERR_BLOCKED_BY_ADMINISTRATOR` for localhost and file URLs in this environment |
| Deployed HTTPS/Pages smoke                | **NOT RUN**                        | No deployment or approval                                                                                |

## ✅ Commands executed

```text
node scripts/smoke-node.mjs
  PASS — 12 independent digest comparisons (SHA-256/384/512 x 4 data sets)
  PASS — URL, file, size and safe-output smoke cases

node scripts/check-routes.mjs
  PASS — local catalogue/SRI references and JS import paths resolve

node scripts/check-security.mjs
  PASS — narrow unsafe-API and obvious-secret signature checks
```

The browser access attempt was **blocked**, not successful; neither Playwright nor Chromium has been configured into repository CI. No local dependency installation or npm audit could run because npm registry DNS resolution was unavailable. These are **NOT RUN**, not a passing validation.

## 📋 Local verification after dependencies are available

```bash
npm install --package-lock-only --ignore-scripts  # Only if the committed lock is missing
npm ci --ignore-scripts --no-fund
npm run format                   # Review formatter output before committing
npm run check                    # Must pass on the exact final revision
npm audit --audit-level=high
```

Review any new lockfile and the dependency audit before release; do not waive failures or make required checks informational. CI must use `npm ci` against a reviewed committed lockfile. Add a general-purpose SAST tool before claiming full release security gates.

## 🖥️ Required browser tests before public release

The selected approach excludes Playwright from **CI initially**, at the owner's request. Record the SFW Section 14 exception or reinstate required coverage; implementation authorisation alone is not an exception approval.

For the manual/browser review, verify at least: desktop 1440×900, tablet 768×1024, mobile 390×844; keyboard navigation/focus; 200% zoom/reduced motion; generated script and stylesheet snippets; SHA-256/384/512; HTTPS CORS success, CORS/redirect refusal, timeout/cancel, oversized files and streaming inputs; clipboard fallback; no unintended network requests; `http://localhost/` preview and actual `/web-tools/` Pages routes. Chromium critical journeys and Firefox/WebKit release compatibility evidence remain required under the adopted SFW standard unless an appropriate documented exception is approved.

## 🚫 Unmet exception status

The omission of Playwright in CI has been requested, **but no Section 14 waiver is recorded**. A potential exception needs: named owner, tracking issue, approval date, scope and rationale, expiry/review date, compensating verification, residual risk, restoration criteria and owner decision. Selected T2 public release separately requires human project-owner sign-off. Both remain pending.

### Dependency lockfile bootstrap limitation

If `package-lock.json` is missing, CI temporarily resolves and generates one
for its validation jobs. This is a provisional compatibility path, **not**
a release-acceptable SFW exception. Generate and commit the lockfile using
`bash scripts/relock.sh`; then remove the fallback and restore setup-node npm
caching. No network-dependent package installation or audit was verified in
the offline authoring environment.

## 20 November 2026: formatting gate hardening

The supplied CI log showed Prettier exit 2: `.svg` input has no inferred parser, and many checked source files were not formatted. This revision moves SVG validation to `npm run check:svg` with XML parsing and negative tests; `npm run format:check` remains blocking for HTML, CSS, JS, JSON and Markdown.

The quality job now executes the independent gates separately with explicit post-install conditions; failed gates still make the job fail and block manual Pages deployment. When only formatting fails, a _diagnostic_ `web-tools-prettier-repair` patch is generated by Prettier and offered for review and application. The lockfile artefact also uploads after earlier quality failures.

**Observed in the current offline authoring environment:**

| Check                                                 | Result                                           | Evidence                                                 |
| ----------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| Five SVG parser/malicious-input tests                 | **PASS**                                         | `npm run check:svg` (Python unittest)                    |
| Both public SVG assets                                | **PASS**                                         | `npm run check:svg` (XML / reference policy)             |
| Static relative routes/imports                        | **PASS**                                         | `npm run check:routes`                                   |
| Narrow static security checks                         | **PASS**                                         | `npm run check:security`                                 |
| Twelve independent digest comparisons and smoke cases | **PASS**                                         | `npm run test:smoke`                                     |
| GitHub Actions YAML                                   | **Parsed locally**                               | Python YAML parser; no live Actions run                  |
| Prettier source formatting                            | **NOT RUN / still requires one-time autoformat** | npm registry unavailable locally                         |
| ESLint, HTML Validate, Vitest, npm audit, Gitleaks    | **NOT RUN**                                      | Dependencies/CI access unavailable                       |
| Playwright browser tests                              | **NOT RUN**                                      | Intentionally not in CI; unresolved SFW verification gap |

Before claiming release readiness, apply a canonical `npm run format` pass to the source, commit the output, commit a reviewed lockfile, and verify all CI gates. The above subset is not a clean release report.

## CI hardening verification — 20 November 2026

Previous Actions run #3 (`44740888931`) failed on Prettier, ESLint, HTML validation, dependency audit and Gitleaks Action licensing. The generated `web-tools-prettier-repair` patch has been applied to the v0.1.1 source candidate. The source also corrects the control-character validator and invalid HTML markup, updates development dependency requirements, and replaces the licensed Action with a pinned standalone CLI scan.

Before a PR, Node smoke, route, source-security and Python SVG tests passed locally. Npm-based checks remain **NOT RUN locally** because the registry cannot resolve from the authoring environment. The new PR's GitHub Actions results are the authoritative evidence for Prettier, ESLint, HTML Validate, Vitest, npm audit and secret scanning. The resolved lockfile must still be separately reviewed and committed. Browser E2E and owner release sign-off remain open.
