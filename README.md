# 🧰 Web Tools

A collection of small, browser-first utilities for developers, system administrators and security engineers, maintained under `safesploitOrg`.

> **Status:** Local implementation candidate `v0.1.0` — **not released or deployed**. Repository, Pages configuration, required independent browser verification and T2 owner approval are pending. The published URL below is a target, not a claim of availability.

## 🌐 URLs and scope

- **Proposed GitHub repository:** `https://github.com/safesploitOrg/web-tools`
- **Target catalogue:** `https://safesploitorg.github.io/web-tools/`
- **Target SRI utility:** `https://safesploitorg.github.io/web-tools/sri-hash/`
- **Hosting:** GitHub Pages project site, no custom domain and no `CNAME`.

`public/index.html` is a catalogue; `public/sri-hash/index.html` is the first real utility. Browser runtime uses plain HTML/CSS/JavaScript ES modules, no frameworks, no backend and no database.

## 🔐 SRI Hash Generator

1. Choose **Resource URL**, **Local file** or **Paste text**.
2. Select **SHA-256**, **SHA-384** (default) or **SHA-512**.
3. Select JavaScript or Stylesheet if you need HTML markup, then select **Generate integrity hash**.
4. Copy the integrity token, or the generated script/link snippet when a hosted HTTPS resource URL was supplied.

**Exact bytes matter:** URL mode fetches resource bytes using browser CORS; file mode hashes the local file's bytes; pasted text is encoded as UTF-8 and may differ from a file because textareas normalise some line endings. The token measures bytes, **not** whether the source is trustworthy.

### Browser privacy and limitations

- Files and pasted text are processed locally; nothing is uploaded to a safesploitOrg backend.
- URL mode makes a user-initiated request directly to the specified HTTPS server. The destination sees the request and must permit CORS. Redirects are refused; use the final resource URL or download the file and hash it locally.
- Maximum size is **20 MiB** in all three modes. Network streams are checked against bytes actually received, not only `Content-Length`. Timeout defaults to 15 seconds; user cancellation is supported for URL mode.
- IP-address literals that are obviously private or reserved are rejected; IPv6 literals are not supported in v0.1. DNS-based internal-name resolution cannot be ruled out by a browser-only validator. This is not an SSRF firewall.
- Generated markup is inert text; untrusted resource content is never executed or inserted as HTML.
- The browser must support modern JavaScript, Web Crypto, `fetch`, `ReadableStream` and the Clipboard API for copying. Select-and-copy works when clipboard access is denied.

## 💻 Local development

For a local HTTP preview, serve `public/` rather than the repository root. `localhost` and `127.0.0.1` are secure browser contexts for Web Crypto.

```bash
python3 -m http.server 8080 --directory public
# Open http://localhost:8080/
# Direct tool: http://localhost:8080/sri-hash/
```

The same relative links should resolve under the GitHub Pages `/web-tools/` prefix without rewriting URLs.

### Quality commands

Requires Node.js **22+**. Once the registry is available and the dependency lockfile is generated and verified:

```bash
npm install --package-lock-only --ignore-scripts
npm ci --ignore-scripts
npm run check                 # Includes formatting, lint, HTML, routes, safety checks, Vitest
npm run test:smoke            # Uses only built-in Node modules
npm run format                # Apply Prettier formatting before committing
```

**Environment limitation at initial implementation:** npm registry DNS was unavailable, so `npm ci`, Vitest, ESLint, Prettier and HTML validation could not be executed. The dependency lockfile must be generated with registry access, reviewed and committed **before the CI workflow can pass**. Do not mark the release as verified on the strength of `test:smoke` alone. See [`docs/testing.md`](docs/testing.md).

## 🚦 CI and release boundaries

The proposed `.github/workflows/pages.yml` runs unit, format, source, route, audit and secret checks; it does **not** run Playwright in CI, per owner direction. That omission is an unresolved SFW Profile B browser-E2E requirement, not a passing result.

Publishing is gated on both CI jobs and requires a **manual `workflow_dispatch` on `main`**, plus the GitHub Pages environment protections and a separately recorded owner T2 release decision. Source implementation does not grant permission to push, merge or deploy.

Do not dispatch the release workflow until [`docs/testing.md`](docs/testing.md), [`SECURITY.md`](SECURITY.md) and [`docs/operations.md`](docs/operations.md) release gates have been satisfied.

## 🧱 Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — as-built components, data flow, constraints and release boundaries.
- [`ROADMAP.md`](ROADMAP.md) — implementation phases and outstanding tasks.
- [`CHANGELOG.md`](CHANGELOG.md) — unreleased candidate changes.
- [`SECURITY.md`](SECURITY.md) and [`docs/threat-model.md`](docs/threat-model.md) — security assumptions, risks and review gates.
- [`docs/testing.md`](docs/testing.md) — test matrix, commands and actual evidence.
- [`docs/operations.md`](docs/operations.md) — deployment, smoke and rollback instructions.
- [`AGENTS.md`](AGENTS.md) / [`docs/engineering/SFW_AI_ENGINEERING_STANDARD.md`](docs/engineering/SFW_AI_ENGINEERING_STANDARD.md) — agent entry point and owner-adopted SFW v1.1 policy.

## 📜 Licensing

No licence has been selected by the repository owner. Source availability should not be confused with an open-source licence; do not add a licence without an owner decision.
