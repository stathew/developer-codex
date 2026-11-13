---
title: "Authentication: Sessions vs Tokens"
summary: Server-side sessions versus self-contained tokens like JWTs — how each works, their security trade-offs, and where to store credentials in the browser.
difficulty: intermediate
tags: [security, auth, jwt, http, backend]
order: 2
related: [backend/rest-api-design, ai-era/reviewing-ai-generated-code]
---

**Authentication** answers *who are you?* **Authorisation** answers *what may you do?* This entry is about the first — specifically, how a server remembers who you are between requests.

## Server-side sessions

1. User logs in; server creates a session record (in memory, Redis or a database).
2. Server sends back an opaque, random **session ID** in a cookie.
3. Each request includes the cookie; the server looks up the session.

```http
Set-Cookie: sid=Yp8...k2; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400
```

**Strengths:** instant revocation (delete the record), tiny cookie, nothing sensitive on the client.
**Costs:** a lookup on every request and shared session storage when you scale horizontally.

## Tokens (JWT)

A **JSON Web Token** is a signed, self-contained claim set: `header.payload.signature`.

```json
{ "sub": "user_123", "role": "admin", "iat": 1767225600, "exp": 1767226500 }
```

The server verifies the signature and trusts the claims — no lookup needed.

**Strengths:** stateless verification, works across services and domains.
**Costs:** **you can't easily revoke a JWT before it expires.** Logout, password changes and banned users need extra machinery (short expiry + refresh tokens, or a deny-list — which reintroduces state).

> [!WARNING]
> JWT payloads are **encoded, not encrypted**. Anyone holding the token can read them. Never put secrets or personal data in claims.

## Common JWT pitfalls

- Accepting `alg: none` or letting the token choose the algorithm — always pin the expected algorithm.
- Long-lived access tokens. Keep them to minutes; use rotating refresh tokens.
- Not validating `exp`, `aud` and `iss`.

## Where to store credentials in the browser

| Storage | XSS can steal it? | CSRF risk? |
| --- | --- | --- |
| `HttpOnly` cookie | No (JS can't read it) | Yes — mitigate with `SameSite` + CSRF tokens |
| `localStorage` | **Yes** | No |
| In-memory variable | Harder, lost on reload | No |

For first-party web apps, an `HttpOnly; Secure; SameSite` cookie is usually the safest default — even when the cookie contains a JWT.

> [!AI]
> Assistants frequently generate "store the JWT in localStorage" tutorials-style code. It works, which is exactly why it gets copied. Check where credentials live in every generated auth flow.

## Choosing

- **Monolith or single web app:** sessions in cookies are simple and secure.
- **Many services / third-party API clients:** short-lived tokens verified locally, issued by a central identity provider (OAuth 2.0 / OpenID Connect).

```recall
Q: What's the main operational drawback of stateless JWTs?
A: They can't be revoked before expiry without adding state (a deny-list) or relying on very short lifetimes with refresh tokens.

Q: Is a JWT payload confidential?
A: No — it's base64url-encoded and signed, not encrypted. Anyone with the token can read the claims.

Q: Why is an HttpOnly cookie safer than localStorage for credentials?
A: JavaScript (including injected XSS code) can't read HttpOnly cookies, whereas anything in localStorage is readable by any script on the page.

Q: Authentication vs authorisation?
A: Authentication establishes identity (who you are); authorisation decides permissions (what you may do).
```
