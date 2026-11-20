# ⚙️ Operations — GitHub Pages (planned)

> **State:** No live service, deployment or release currently exists. Commands below are release-runbook instructions, not completed actions.

## 🚀 Prerequisites and release

1. The `safesploitOrg/web-tools` repository exists. Push any further reviewed changes only with owner authorisation; do not assume that repository existence authorises deployment.
2. Finish and commit the lockfile; enforce protected `main` and `github-pages` environment approvals.
3. Confirm SFW Profile B+D T2 tests, vulnerabilities, manual browser evidence/exception and owner release authorisation are documented.
4. Set repository **Settings → Pages → Build and deployment → Source: GitHub Actions**. No custom domain; do not add a `CNAME`.
5. From **Actions**, manually dispatch the supplied `pages.yml` workflow on approved `main` revision. `quality` and `security` must pass before `deploy` can start.
6. Verify `https://safesploitorg.github.io/web-tools/` and `/web-tools/sri-hash/` (HTTPS, assets, navigation, SHA reference, copy buttons, errors and size controls), and record the deployed commit SHA and results.
7. Only after verification, separately approve updating `safesploitOrg/overview` to link to Web Tools.

## 🩺 Operational checks

- Basic route availability and HTTPS on both pages.
- A known SHA-384 fixture for `hello` must produce `sha384-WeF0h3dEjGnea4ANejO7+5/xtGPkQ1TDVTvNucZm+pASWjx5+QOXvfX2oT3oKGhP`.
- Ensure JavaScript and CSS under `/web-tools/assets/` load correctly after direct refresh.
- Confirm no telemetry/backend requests and the expected CSP, referrer meta and CORS limitations.
- Review security reports and dependency advisories over time; investigate credible incidents promptly.

## ↩️ Rollback

Identify the previous approved commit/artifact; stop or restrict the faulty public release; restore the verified code via an approved Git operation and re-run the gated manual Pages release. Static pages require no database restore, but incident communication and postmortem may still be necessary.
