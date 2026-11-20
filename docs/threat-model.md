# 🛡️ Web Tools — Threat model

> **Scope:** SRI Hash Generator candidate `v0.1.0`, 18 November 2026. SFW Profile B+D, T2. Manual human owner review is pending.

## 🎯 Assets, actors and boundaries

- **Assets:** Correct integrity tokens, user-supplied files/text, URLs containing optional sensitive query information, GitHub Pages source/deployment authority, users' trust in tool output.
- **Actors:** Legitimate users, malicious input providers, malicious third-party resource hosts, compromised npm/CI dependencies, compromised publication or GitHub permissions.
- **Data flows:** Untrusted URL → browser network fetch → bounded byte stream → Web Crypto; untrusted local file/text → browser bytes → Web Crypto; computed token → inert text output → clipboard.
- **Trust boundaries:** Browser vs remote HTTPS origin; public static code vs user data; copied string vs HTML consumer; code review vs deployment credentials.

## ⚔️ Threats, controls and residual risk

| Threat                                 | Mitigation in this candidate                                                                              | Verification                                                                                | Residual risk                                                       |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Hash mismatch due to bad encoding      | Native digest over raw bytes and Base64; explicit UTF-8/text caveat                                       | OpenSSL references, independent Node crypto comparisons, Vitest vectors (pending execution) | Mutable or browser-dependent remote content                         |
| DOM injection via URL/snippet          | Attribute escaping and `textContent`/`value` output only; no HTML injection                               | Snippet negative tests + static unsafe API check                                            | Future UI changes may introduce unsafe sinks                        |
| Unintended network requests            | User click required; HTTPS only; credentials omitted; redirects blocked; obvious private literals refused | Mocked fetch options and negative inputs                                                    | DNS names may resolve private/rebind; CORS may permit reads         |
| Local data exfiltration                | No backend, network request only in URL mode, no telemetry/persistence                                    | Source inspection, manual browser request check pending                                     | Browser extensions or compromised hosting still relevant            |
| Memory/CPU denial of service           | 20 MiB limit, stream read checks, timeout and cancellation                                                | Oversize tests and Node smoke                                                               | Browser memory overhead still depends on engine                     |
| Permission and supply-chain compromise | Minimal runtime dependencies, separate read-only checks and deploy-only write permissions                 | Workflow review; actual CI not yet observed                                                 | Workflow changes / pinned action updates need review                |
| Missing response-header protections    | Restrictive CSP in HTML meta, no inline scripts/styles                                                    | Static inspection; deployed header review pending                                           | No CSP `frame-ancestors`; GitHub Pages cannot set arbitrary headers |
| Untrusted artifact shipped             | Manual release only; deployment depends on quality/security jobs                                          | Workflow dependency inspection; CI execution pending                                        | Environment protection must be configured                           |

## 🔍 Verification and approval gaps

Local Node smoke and static checks were executed; see `docs/testing.md`. Vitest, ESLint, formatting, HTML validation, dependency audits, secret scan and browser E2E require evidence. No T2 owner release sign-off or exception record exists.

**Containment/rollback:** Stop publication, revert to last verified GitHub Pages revision and re-run gated manual deployment after approval. Static application has no persistent data to migrate or restore.
