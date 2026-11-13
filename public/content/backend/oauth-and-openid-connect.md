---
title: OAuth 2.0 & OpenID Connect
summary: Delegated authorization with OAuth 2.0, sign-in with OpenID Connect, the roles involved, and which flows to use today.
difficulty: intermediate
tags: [oauth, oidc, security, auth, backend]
order: 4
related: [backend/json-web-tokens, backend/authentication-sessions-vs-tokens]
status: needs-review
reviewNotes: Imported from the 2023 OAuth note. Corrected the roles (the resource owner is the user, not the provider), clarified that OAuth is authorization and sign-in is OpenID Connect, marked OAuth 1.0 as legacy and added OAuth 2.1 guidance and flows.
---

**OAuth 2.0** is a standard for **delegated authorization**: letting an application act on a user's behalf at another service *without the user handing over their password*. "Let this photo-printing site read my Google Photos" is OAuth.

## The roles

| Role | Example |
| --- | --- |
| **Resource owner** | You, the user who owns the photos |
| **Client** | The photo-printing app requesting access |
| **Authorization server** | Google's login/consent service, which issues tokens |
| **Resource server** | The Google Photos API, which accepts the tokens |

The client receives an **access token** scoped to specific permissions (`photos.readonly`) — never the user's credentials.

## OAuth is not login — OpenID Connect is

OAuth says *what a client may access*; it doesn't define *who the user is*. **OpenID Connect (OIDC)** is a thin identity layer on top that adds an **ID token** (a JWT about the user) and a `userinfo` endpoint. "Sign in with Google/Microsoft/Apple" buttons are OIDC.

## Flows to use today

- **Authorization Code + PKCE** — for web apps, SPAs and mobile apps. The user signs in at the authorization server, which redirects back with a short-lived code; the client exchanges it for tokens. PKCE stops intercepted codes from being redeemed.
- **Client Credentials** — machine-to-machine, no user involved.
- **Device Code** — for TVs and CLIs without a convenient browser.

> [!WARNING]
> The **Implicit** and **Resource Owner Password** flows are deprecated. OAuth 2.1 consolidates current best practice: PKCE for all authorization-code clients, exact redirect URI matching, no implicit flow. OAuth 1.0 is legacy — you're unlikely to need it outside old integrations.

## Authorization Code + PKCE, in brief

1. The client creates a random `code_verifier` and sends its hash (`code_challenge`) with the authorize request.
2. The user signs in and consents at the authorization server.
3. The server redirects back to the client with an authorization `code`.
4. The client posts the `code` **plus the original `code_verifier`** to the token endpoint.
5. The server checks that the verifier matches the challenge, then returns access (and optionally refresh and ID) tokens.

```recall
Q: In OAuth 2.0, who is the resource owner?
A: The user who owns the data and grants access — not the company running the service.

Q: What does OpenID Connect add to OAuth 2.0?
A: Authentication: an ID token (JWT) describing the signed-in user, plus a userinfo endpoint and discovery metadata.

Q: Which OAuth flow should a SPA or mobile app use?
A: Authorization Code with PKCE.

Q: What does PKCE protect against?
A: An intercepted authorization code being exchanged for tokens by an attacker who doesn't have the original code_verifier.
```
