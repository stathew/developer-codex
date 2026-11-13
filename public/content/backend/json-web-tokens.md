---
title: JSON Web Tokens (JWT)
summary: The structure of a JWT, how signatures make it tamper-evident, what to validate, and the mistakes that turn JWTs into vulnerabilities.
difficulty: intermediate
tags: [jwt, security, auth, backend]
order: 3
related: [backend/authentication-sessions-vs-tokens, backend/oauth-and-openid-connect]
status: needs-review
reviewNotes: Imported from the 2023 JWT note, which closely followed the jwt.io introduction, so it was rewritten. Kept the scope (what, when, structure) and completed the unfinished structure section; added validation rules and pitfalls.
---

A **JSON Web Token** (RFC 7519) is a compact, URL-safe way to carry a set of **claims** between parties. Most JWTs are **signed** (JWS), which makes them tamper-evident; a few are **encrypted** (JWE), which also hides their contents.

## Structure

A signed JWT is three base64url-encoded parts separated by dots:

```text
xxxxx.yyyyy.zzzzz
header.payload.signature
```

**Header** — token type and signing algorithm:

```json
{ "alg": "RS256", "typ": "JWT", "kid": "2026-11-key" }
```

**Payload** — the claims. Registered claims have short names:

```json
{
  "iss": "https://auth.example.com",   // issuer
  "sub": "user_123",                   // subject (who it's about)
  "aud": "orders-api",                 // intended audience
  "exp": 1794564000,                   // expiry (Unix seconds)
  "iat": 1794563100,                   // issued at
  "scope": "orders:read"
}
```

**Signature** — computed over `base64url(header) + "." + base64url(payload)`:

- **HMAC (HS256)** — one shared secret signs *and* verifies. Fine within a single service.
- **RSA / ECDSA (RS256, ES256)** — a private key signs, a public key verifies. Use this when many services verify tokens from one issuer; they never hold the signing key.

> [!WARNING]
> Signed is not secret. Anyone with the token can base64-decode the payload. Never put passwords, secrets or sensitive personal data in claims.

## Common uses

- **Authorization** — the client sends `Authorization: Bearer <jwt>`; APIs verify it locally without calling the issuer.
- **Identity** — OpenID Connect ID tokens are JWTs describing the signed-in user.
- **Signed information exchange** — the receiver can verify who sent the data and that it wasn't altered.

## What to validate — every time

1. **Signature**, with the **algorithm pinned** to what you expect (reject `alg: none` and algorithm switching).
2. **`exp`** (and `nbf`), allowing small clock skew.
3. **`iss`** — issued by the authority you trust.
4. **`aud`** — intended for *this* API.
5. Then authorise based on claims (`scope`, roles).

Use a maintained library (`Microsoft.AspNetCore.Authentication.JwtBearer`, `jose`, `PyJWT`) rather than hand-parsing.

## Pitfalls

- Long-lived access tokens — keep them short (minutes) and use refresh tokens.
- No revocation story — see [Sessions vs Tokens](authentication-sessions-vs-tokens.md).
- Storing tokens in `localStorage`, where any XSS can read them.

```recall
Q: What are the three parts of a signed JWT?
A: Header (algorithm, type), payload (claims) and signature — each base64url-encoded and separated by dots.

Q: When would you choose RS256 over HS256?
A: When multiple services must verify tokens: they only need the public key, while only the issuer holds the private signing key.

Q: Which claims should an API validate besides the signature?
A: exp (and nbf), iss and aud — plus pin the expected algorithm.

Q: Can anyone read a JWT's payload?
A: Yes. A signed JWT is only encoded, not encrypted; the signature prevents tampering, not reading.
```
