# 🏛️ Web Tools — Architecture

> **Status:** As-built local implementation candidate, `v0.1.0` (unreleased), 18 November 2026. No GitHub repository, hosting or release is asserted. The agreed design baseline was v0.2.

## 🎯 Purpose and boundaries

Web Tools is a small multi-page, browser-only collection of developer and infrastructure utilities. The first module is the SRI Hash Generator. The existing `safesploitOrg/overview` remains a separate central launcher; PKI Toolkit, Identity Toolkit, PassFabricator and other major applications are **not** migrated.

**Deployment target:** `safesploitOrg/web-tools`, hosted as a GitHub Pages project site at `https://safesploitorg.github.io/web-tools/`, without a custom domain.

**Classification:** SFW **Profile B+D**, **T2** because the application computes integrity values and fetches untrusted remote resources. Public release needs human review and the missing browser-E2E policy control resolved.

## 🧩 Logical components and data flow

```text
Catalogue: public/index.html
  |
  `-- sri-hash/index.html (shared CSS + ES module controller)
        |
        | explicit Generate action
        v
      validate.js (algorithm/URL checks, 20 MiB limit)
        |
      input.js (HTTPS+CORS stream / File API / UTF-8 TextEncoder)
        |
      digest.js (crypto.subtle.digest, raw digest bytes -> Base64)
        |
      snippets.js (optional HTML-safe script/link string)
        |
      main.js (DOM via textContent/value; copy/status/errors)
```

There is **no backend, API, database, authentication, tracking, third-party runtime JavaScript, persisted user data or service worker**. File/text resources are processed locally. URL mode explicitly connects to the destination origin; the destination may observe that request.

## 📐 File layout

```text
public/
  index.html
  sri-hash/index.html
  assets/css/{site.css,tools.css}
  assets/js/shared/clipboard.js
  assets/js/tools/sri-hash/{main,input,validate,digest,snippets}.js
  assets/images/favicon.svg
scripts/{check-routes,check-security,smoke-node}.mjs
tests/unit/{sri-hash,shared}/*.test.js
.github/workflows/pages.yml
```

Supporting documents, the repository agent instructions and SFW v1.1 standard live outside `public/` and are never part of the Pages artifact. Site navigation and assets use **relative links** so both `/` local previews and `/web-tools/` Pages routes work.

## 🔑 Module contracts

| Module | Responsibility | Trust boundary |
| --- | --- | --- |
| `validate.js` | HTTPS URL policy, local-address literal rejection, byte limits and SHA allowlist | Untrusted input |
| `input.js` | Read local file, encode UTF-8, fetch remote streams without credentials | Browser network and local file APIs |
| `digest.js` | Generate SHA-256/384/512 token via Web Crypto, preserve byte offsets | Exact resource bytes |
| `snippets.js` | Produce inert HTML strings, safely escape URL attributes | User-supplied URL and integrity token |
| `main.js` | UI state, tabs, cancellation, copy actions and accessible feedback | Untrusted strings to DOM |
| `clipboard.js` | Copy plain text only via secure clipboard | Clipboard permission |

### Remote URL policy

- Require a complete HTTPS URL and reject embedded credentials, control characters, unqualified/local hostnames and obvious private/reserved IPv4; IPv6 literals are not yet supported.
- Fetch only after the user's Generate action, using `mode: cors`, `credentials: omit`, `referrerPolicy: no-referrer`, `cache: no-store`, and `redirect: error`.
- **Design refinement:** The v0.2 draft proposed showing redirected URLs. The implementation instead **blocks redirects**, avoiding a new network destination before validation. Users must supply the final URL. This is a deliberate security constraint.
- Read streaming responses with an enforced **20 MiB maximum for actual bytes received**, plus a 15-second timeout and a cancellation button. `Content-Length` is only an early-exit hint.
- The browser cannot resolve target DNS before fetching; a hostname can still resolve to internal networks. CORS and browser network policy provide additional constraints but are not substitute SSRF defences.

### SRI correctness

`SHA-384` is the UI default. Binary digest bytes from `crypto.subtle.digest` are Base64-encoded and combined with `sha256-`, `sha384-` or `sha512-`. The tool does **not** hex-encode bytes, strip whitespace from source or execute remote code.

An HTML `<script>` or `<link rel="stylesheet">` string is offered only when the user has provided a valid hosted HTTPS resource URL. It includes `integrity="…"` and `crossorigin="anonymous"`. Attribute values are escaped for copied markup; inserted UI output uses `.value` or `.textContent`, never dynamic `innerHTML`.

## 🛡️ Security controls and limitations

- Browser `<meta http-equiv="Content-Security-Policy">` allows only same-origin scripts/styles and deliberate `connect-src https:` URL requests. GitHub Pages cannot configure arbitrary application response headers; meta CSP cannot express `frame-ancestors` or report-only enforcement. It is not equivalent to a response-header CSP.
- Untrusted inputs are bounded and never persisted, logged or transmitted to a backend.
- Trusted runtime code is served statically; dependencies are only development tools.
- `scripts/check-security.mjs` guards a few known dangerous APIs; it does **not** qualify as a full SAST tool or replace threat review.
- Detailed threats and negative cases: [`docs/threat-model.md`](docs/threat-model.md).

## 🧪 Verification and release pipeline

`pages.yml` runs a blocking **quality** job (Vitest, lint, HTML, formatting and link checks) and **security** job (npm audit and pinned Gitleaks). A deployment job depends on both, runs only when **manually dispatched from `main`**, and publishes only `public/`. The external Actions are pinned to verified commit SHAs at authoring time.

**Playwright is absent from CI by owner request.** Browser E2E remains an unmet SFW v1.1 requirement. No exception has been approved or released, and the initial implementation has not been pushed or deployed. See [`docs/testing.md`](docs/testing.md) for the exact verification status and remaining work.

## 📚 Authoritative references

- [SRI (MDN)](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity)
- [Web Crypto digest (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)
- [GitHub Pages Actions publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [SFW v1.1](docs/engineering/SFW_AI_ENGINEERING_STANDARD.md)

---

**Non-goals:** general-purpose URL proxy, authentication, server-side hashing, user input history, migrating existing standalone projects, custom-domain management and automatically executing imported code.
