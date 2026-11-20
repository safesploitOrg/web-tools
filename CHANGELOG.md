# 📝 Changelog

All notable changes to Web Tools will be documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
- Repository and Pages deployment are not yet created or published.

## Version history

No version has been released or tagged. `v0.1.0` is a proposed first release, **not** a claim of deployment on 18 November 2026.
