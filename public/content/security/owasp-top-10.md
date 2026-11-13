---
title: OWASP Top 10
summary: The ten most critical web application security risks (2025 edition) — what each means, a typical example, and how to prevent it.
difficulty: intermediate
tags: [security, owasp, web, backend]
order: 1
related: [security/secrets-management, backend/authentication-sessions-vs-tokens, ai-era/reviewing-ai-generated-code]
status: needs-review
reviewNotes: New entry from the topic-gaps batch. Category names and order verified against top10.owasp.org/2025 on 2026-11-13.
---

The **OWASP Top 10** is a widely used awareness list of the most critical security risks to web applications, maintained by the Open Worldwide Application Security Project. It's updated every few years from real-world vulnerability data and community surveys. The current edition is **2025**.

It isn't a complete security standard (for that, see OWASP ASVS), but it's the baseline every web developer should know.

## The 2025 list

| # | Risk | In one line |
| --- | --- | --- |
| A01 | Broken Access Control | Users can act outside their permissions |
| A02 | Security Misconfiguration | Insecure defaults, verbose errors, open storage |
| A03 | Software Supply Chain Failures | Vulnerable, malicious or untracked dependencies and build tooling |
| A04 | Cryptographic Failures | Sensitive data exposed through weak or missing cryptography |
| A05 | Injection | Untrusted input interpreted as code or commands (SQL, OS, XSS) |
| A06 | Insecure Design | Missing security controls at the design level |
| A07 | Authentication Failures | Weak login, session or credential handling |
| A08 | Software or Data Integrity Failures | Trusting unverified code, updates or serialised data |
| A09 | Security Logging and Alerting Failures | Attacks go unnoticed |
| A10 | Mishandling of Exceptional Conditions | Errors and edge cases leave the system in an unsafe state |

## A01: Broken Access Control

The most common serious flaw. Typical forms:

- **IDOR (insecure direct object reference):** `GET /api/invoices/1043` returns *someone else's* invoice because the server only checks that you're logged in, not that the invoice is yours.
- Missing authorisation on admin endpoints that are merely hidden in the UI.
- Changing a `role` field in a request body.

```csharp
// ✅ Authorise against the resource, not just the user's login
var invoice = await db.Invoices.FindAsync(id);
if (invoice is null || invoice.CustomerId != currentUser.CustomerId) return NotFound();
```

**Prevent:** deny by default; check ownership on every request server-side; centralise authorisation policies; test for it.

## A02: Security Misconfiguration

Default credentials, debug mode in production, stack traces returned to users, public cloud storage buckets, missing security headers, overly permissive CORS (`Access-Control-Allow-Origin: *` with credentials).

**Prevent:** hardened, repeatable configuration as code; separate settings per environment; automated configuration scanning.

## A03: Software Supply Chain Failures

Your app is mostly other people's code. Risks include known-vulnerable packages, typosquatted or **hallucinated package names**, compromised maintainers, and tampered build pipelines.

**Prevent:** commit lock files; run dependency scanning (Dependabot, `npm audit`, `dotnet list package --vulnerable`); generate an SBOM; pin and review CI actions; verify every new dependency is real and maintained. See [Reviewing AI-Generated Code](../ai-era/reviewing-ai-generated-code.md).

## A04: Cryptographic Failures

Sensitive data sent over plain HTTP, passwords stored with fast hashes (MD5, SHA-256) instead of **slow, salted** ones (Argon2id, bcrypt, scrypt, PBKDF2), hard-coded keys, home-made crypto.

**Prevent:** TLS everywhere; proper password hashing; encrypt sensitive data at rest; use well-reviewed libraries; never invent algorithms.

## A05: Injection

Untrusted input becomes part of a query or command:

```ts
// ❌ SQL injection
db.query(`SELECT * FROM users WHERE email = '${email}'`);
// ✅ Parameterised
db.query('SELECT * FROM users WHERE email = $1', [email]);
```

**Cross-site scripting (XSS)** is injection into HTML. Frameworks such as Angular and React escape output by default; danger appears with `innerHTML`, `bypassSecurityTrust…` and `dangerouslySetInnerHTML` on user data.

**Prevent:** parameterised queries or an ORM; output encoding; allow-list validation; a Content Security Policy.

## A06: Insecure Design

Flaws no amount of careful coding fixes: no rate limit on password reset, a business flow that lets you apply a discount twice, trusting the client to calculate prices.

**Prevent:** threat modelling early (*what could go wrong?*), abuse cases alongside user stories, secure design patterns and reference architectures.

## A07: Authentication Failures

Credential stuffing (no rate limiting), weak password rules, missing MFA, session IDs in URLs, sessions not invalidated on logout or password change.

**Prevent:** MFA; rate limiting and breached-password checks; secure session handling; prefer a proven identity provider over building your own. See [Sessions vs Tokens](../backend/authentication-sessions-vs-tokens.md).

## A08: Software or Data Integrity Failures

Auto-updates without signature checks, CI/CD pipelines anyone can modify, **insecure deserialisation** (turning untrusted data into arbitrary objects).

**Prevent:** sign and verify artefacts; protect pipelines; avoid deserialising untrusted data into polymorphic types.

## A09: Security Logging and Alerting Failures

Breaches often go undetected for months. Logins, access-control failures and high-value transactions should be logged with enough context, *without* logging secrets or personal data, and should trigger alerts. See [Observability](../devops/observability.md).

## A10: Mishandling of Exceptional Conditions

New in 2025. Systems that **fail open** (granting access when an auth service times out), leak information in error messages, or are left half-updated after an exception.

```csharp
// ❌ Fails open
try { allowed = await authz.CheckAsync(user, resource); }
catch { allowed = true; }

// ✅ Fails closed
try { allowed = await authz.CheckAsync(user, resource); }
catch (Exception ex) { logger.LogError(ex, "Authorisation check failed"); allowed = false; }
```

**Prevent:** fail closed; handle errors centrally; use transactions so failures roll back cleanly; return generic error messages to users.

```recall
Q: What is the #1 risk in the OWASP Top 10:2025?
A: Broken Access Control — users acting outside their intended permissions (e.g. IDOR).

Q: What is an IDOR vulnerability?
A: Insecure Direct Object Reference — accessing another user's resource by changing an identifier, because the server checks authentication but not ownership.

Q: How should passwords be stored?
A: Hashed with a slow, salted algorithm designed for passwords — Argon2id, bcrypt, scrypt or PBKDF2 — never plain or with fast hashes like SHA-256.

Q: What does "fail closed" mean?
A: When a security check errors or is unavailable, deny access rather than allowing it.

Q: What's the primary defence against SQL injection?
A: Parameterised queries (or an ORM that parameterises), never string concatenation of user input.

Q: Name three defences against software supply chain failures.
A: Lock files and dependency scanning, verifying new packages are real and maintained (watch for typosquatting/hallucinated names), and protecting/pinning CI pipelines and actions (plus SBOMs).
```
