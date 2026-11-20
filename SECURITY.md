# 🔐 Security Policy

> **Status:** `v0.1.0` candidate, not publicly released. SFW v1.1 **Profile B+D**, change risk **T2**. No AI-generated release approval, no SFW browser-E2E exception or public deployment has been granted.

## 🧭 Security model

- **Trust boundary:** All user inputs (file content, source text and URLs) are untrusted. Hashing preserves raw input bytes; none are executed or interpolated into live HTML.
- **Local-first:** Text and selected files remain on the user's browser. No backend, accounts, analytics, session storage or stored history.
- **Remote mode:** The user's browser contacts the explicitly supplied HTTPS resource with `credentials: omit`, `referrerPolicy: no-referrer`, CORS mode and redirects disabled. The target host can observe the request; hostname resolution is still controlled by the browser and network.
- **Resource caps:** 20 MiB maximum actual bytes received/read, 15-second remote timeout, user cancellation for remote fetches.
- **Cryptography:** Native Web Crypto SHA-256/384/512. The output binds bytes to a token; it does **not** certify code origin or safety.
- **Deployment:** No custom domain. GitHub Pages provides HTTPS, but does not offer arbitrary response-header CSP configuration. A restricted meta-CSP is only partial protection.

## 🚨 Vulnerability reporting

Until a repository security-advisory channel is configured, report vulnerabilities privately to the project owner through an appropriate established safesploitOrg contact. **Do not post reproduction details for exploitable issues in public tickets** before coordinated triage. No unverified security contact address is published here.

## ⚠️ Known limitations and residual risks

| Risk | Current position |
| --- | --- |
| CORS failures and opaque responses | Browser refuses to expose bytes; download a trusted file and hash it locally instead |
| Redirected CDN URLs | Redirects are blocked to avoid unintentionally contacting another host |
| DNS names resolving to private addresses | The validator cannot reliably resolve/prevent this; user-initiated URL fetch still has residual private-network request risk |
| Source changing after hashing | Use immutable, versioned URLs; do not assume the same bytes will be served later |
| Browser-specific or personalised responses | Token might not match another browser or client |
| Browser request with query token | Query strings can contain sensitive values; the target host sees the full URL, and no application logs are retained |
| Clipboard permissions | Manual select/copy fallback is available |
| GitHub Pages HTTP headers | Meta-CSP cannot provide all response-header protections |
| Browser E2E omitted from CI | Known **unmet SFW requirement**; release status not yet approved |
| Dependency-based checks unavailable locally | `npm ci`, Vitest, lint, HTML, audit and secret scanning have not been independently verified |

## 🧪 Release controls

CI is designed to fail on lint, formatting, tests, route checks, npm audit at high severity and Gitleaks findings. The local unsafe-API scanner is narrow and not a substitute for general SAST. Before publishing:

1. Complete and document the dependency/CI baseline and scanner enforcement, including high/critical vulnerability triage.
2. Resolve the SFW browser-E2E requirement with adequate evidence or a **permissible, explicit, time-bounded** owner-approved Section 14 exception (owner, issue, approval, expiry, compensating controls, restoration criteria).
3. Perform an explicit human T2 security/release review and record authorisation for the exact repo, environment and revision.
4. Protect `main` and the `github-pages` deployment environment, then run the manually dispatched release pipeline only after all gates pass.
5. Check the real published routes, HTTPS and hashing behaviour; record the deployed SHA and rollback path.

The authoring assistant has not performed or authorised a push, merge, release, deployment, DNS change or production action.

## 🔗 References

- [Threat model](docs/threat-model.md)
- [Test evidence](docs/testing.md)
- [SFW Engineering Standard v1.1](docs/engineering/SFW_AI_ENGINEERING_STANDARD.md)
