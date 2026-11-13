---
title: Reviewing AI-Generated Code
summary: A practical checklist for reviewing code you didn't write — the failure modes assistants are prone to and how to catch them before production does.
difficulty: intermediate
tags: [ai, code-review, security, testing]
order: 2
related: [ai-era/developing-in-the-age-of-ai, backend/authentication-sessions-vs-tokens, fundamentals/big-o-notation]
---

Review AI output the way you'd review a confident, fast, well-read colleague who has **never seen your codebase** and **never been paged**. The code is usually fluent; the failures are in the gaps.

## Common failure modes

### Plausible but wrong

The most dangerous bugs look idiomatic. Watch for:

- **Off-by-one and boundary errors** — empty arrays, a single element, the last page of results.
- **Inverted conditions** — `if (!user.isAdmin)` where the opposite was intended.
- **Wrong default** — `timeout: 0` meaning "no timeout" in one library and "immediately" in another.

### Hallucinated APIs

Methods, options or packages that don't exist, or existed in an older major version. Type checking catches some; configuration objects and dynamic languages often won't.

> [!WARNING]
> A hallucinated **package name** is a supply-chain risk: attackers register commonly hallucinated names. Verify every new dependency exists, is maintained and is the one you meant.

### Missing context

The assistant doesn't know your conventions, so it reinvents things:

- A new date helper when `shared/dates.ts` already exists.
- Raw `fetch` calls that bypass your auth interceptor and retry policy.
- Error handling that swallows exceptions your observability depends on.

### Insecure by default

Training data contains a lot of insecure code. Look specifically for:

```ts
// ❌ SQL built by string concatenation — injectable
const rows = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ Parameterised query
const rows = await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

Also: secrets in code, missing authorisation checks (authentication ≠ authorisation), permissive CORS, `innerHTML` with user data, and disabled certificate validation "to make it work".

### Quietly expensive

Nested loops over growing collections, an N+1 query inside a `map`, loading an entire table to count it. See [Database Indexes](../databases/indexes.md) for the database side.

## A review checklist

1. **Can I explain every line?** If not, stop and find out.
2. **Does it match the requirement — not just the prompt?**
3. **What happens at the edges?** Empty, null, huge, concurrent, unicode, timezone.
4. **What does it trust?** Trace every external input to where it's used.
5. **Does it fit the codebase?** Existing helpers, patterns, error handling, logging.
6. **Do the tests test anything?** Tests generated alongside code often assert the implementation, not the behaviour. Mutate the code — do they fail?
7. **Are new dependencies real and justified?**

> [!AI]
> Asking the assistant "what could go wrong with this code?" is a genuinely useful second pass — but it's a supplement to your review, never a replacement.

## Recall

```recall
Q: Why is a hallucinated package name a security risk?
A: Attackers can register package names that models commonly hallucinate ("slopsquatting"), so installing them pulls in malicious code.

Q: What's a quick way to check whether generated tests are meaningful?
A: Deliberately break (mutate) the implementation and confirm the tests fail.

Q: Name three "missing context" mistakes AI-generated code commonly makes.
A: Re-implementing helpers that already exist, bypassing shared infrastructure (auth interceptors, retry policies), and error handling that doesn't match the codebase's logging/observability conventions.
```
