# 📝 Changelog

All notable changes to Web Tools will be documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

### v0.1.1 — CI quality and security hardening (20 November 2026)

- Apply the actual Prettier repair patch from GitHub Actions across HTML, CSS, JavaScript, tests and documentation; retain formatting as a blocking gate.
- Replace the invalid control-character regex with equivalent code-point validation, covered by added control-character rejection vectors.
- Correct HTML DOCTYPE casing and remove the invalid label on a presentational tool card without suppressing validation rules.
- Upgrade Vitest to `^5.1.1` and HTML Validate to `^11.21.1` to remediate the previously reported vulnerable transitive dependency chains.
- Replace the organisation-licensed `gitleaks-action` with the stand-alone Gitleaks CLI `v8.30.1`, pinned and SHA-256 verified, scanning complete Git history as a blocking security gate.
- Increment the source candidate version to `0.1.1`, retain independent CI checks and preserve manual-release gates; Playwright remains outside CI with its SFW exception unapproved.

**Dependency-lock gap:** npm registry resolution is unavailable in the authoring environment. CI temporarily generates and uploads a resolved `package-lock.json`; the file must be reviewed and committed before any release. A CI bootstrap lock is not a reproducible committed dependency lock.

**Release status:** Not released; this approval covers a draft PR only, not merging or deploying.

### CI quality hardening (20 November 2026)

- Keep Prettier formatting a blocking CI check. Remove unsupported `*.svg` files from its glob rather than suppressing formatter errors.
- Add `check:svg` with Python standard-library XML parsing and five positive/negative security regression tests for SVG assets.
- Define a shared Prettier configuration to standardise quoting, line width and line endings.
- Split the GitHub Actions quality job into independently enforced format, ESLint, HTML, SVG, route, security, Vitest and smoke steps, allowing the full failure set to be reported.
- On a Prettier failure, publish a downloadable `web-tools-prettier-repair` patch without turning the failing gate into a pass.
- Upload the temporary `web-tools-package-lock` artefact even if subsequent quality checks fail.
- Add `scripts/fix-quality.sh` for one-time local autoformat followed by the unchanged blocking checks and dependency audit.

**Verification gap:** npm registry access is blocked in the authoring environment, so the full Prettier pass and dependency-based checks remain unverified. After applying this revision, run the local helper or download and apply the proposed formatting patch from CI; the original source still needs a canonical formatter pass.

### CI / dependency locking

- Add `scripts/relock.sh` to generate, verify and locally test the complete `package-lock.json`, ready for review and commit.
- Avoid the `setup-node` npm-cache lockfile failure by allowing a **temporary, explicitly warned** missing-lock bootstrap in quality/security jobs.
- Export the resolved `package-lock.json` as a downloadable GitHub Actions artefact for review/commit.
- Block Pages releases until a real, non-empty `package-lock.json` is committed; CI bootstrap is not a substitute for a committed dependency lock.

### Added

- New browser-first catalogue and shared responsive layout for the planned GitHub Pages `/web-tools/` project site.
- SRI Hash Generator with SHA-256, SHA-384 and SHA-512; remote HTTPS/CORS, local-file and UTF-8 text inputs.
- Optional JavaScript/Stylesheet HTML snippet output and accessible copying controls.
- Source validation, stream size cap, timeout, cancellation and redirect refusal with safe error messages.
- Unit/reference/negative test suites, dependency-free smoke checks, static path validation and security checks.
- Project documentation, SFW v1.1 policy integration, threat model and a guarded manual GitHub Pages release workflow.

### Changed

- Match the Overview footer across both Web Tools pages: dynamic JavaScript copyright year, safesploitOrg credit and a GitHub repository icon/link.
- Remove redundant Tools/All tools and Source links from the header; the brand link and SRI breadcrumb continue to navigate home.

### Known limitations

- Candidate has **not** completed Vitest, formatter, linter, HTML, registry audit or CI verification in the initial authoring environment.
- No Playwright browser job in CI; the outstanding SFW browser-verification requirement must be resolved before public release.
- The GitHub repository now exists, but a successful Pages deployment and formal release approval are not verified.

## Version history

No version has been released or tagged. `v0.1.0` is a proposed first release, **not** a claim of deployment on 18 November 2026.
