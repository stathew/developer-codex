---
title: Secrets Management
summary: Keeping API keys, connection strings and certificates out of code and logs — local development, CI, production secret stores, rotation and what to do after a leak.
difficulty: intermediate
tags: [security, secrets, devops, configuration]
order: 2
related: [security/owasp-top-10, devops/ci-cd, devops/containers-and-docker]
status: needs-review
reviewNotes: New entry from the topic-gaps batch.
---

A **secret** is anything that grants access: API keys, database passwords, connection strings, signing keys, certificates, OAuth client secrets, webhook signing secrets. Leaked secrets are one of the most common causes of breaches, and **automated bots scan public repositories for them within minutes** of a push.

## Rule one: never commit secrets

Not in code, not in config files, not in a "temporary" test, not in a Dockerfile. Git history is forever: deleting the line in a later commit doesn't remove it.

```text
# .gitignore
.env
.env.*
!.env.example        ← commit a template with placeholder values
appsettings.*.local.json
```

## Where secrets should live

| Environment | Use |
| --- | --- |
| **Local development** | .NET User Secrets (`dotnet user-secrets set "Stripe:Key" "…"`), a git-ignored `.env`, or your password manager's CLI |
| **CI/CD** | The platform's encrypted secrets (GitHub Actions secrets, Azure DevOps variable groups), ideally exchanged for short-lived cloud credentials via **OIDC** instead of long-lived keys |
| **Production** | A secret store: Azure Key Vault, AWS Secrets Manager, Google Secret Manager, HashiCorp Vault, Kubernetes Secrets (with encryption at rest) |

Applications read secrets at runtime from configuration or environment variables populated from the store. In .NET, `builder.Configuration.AddAzureKeyVault(...)` makes Key Vault values appear as ordinary configuration.

## Better than secrets: no secrets

- **Managed identities / workload identity:** your app authenticates to the database or storage *as itself*, using credentials the cloud platform manages and rotates. There's nothing to leak.
- **OIDC federation for CI:** GitHub Actions can obtain short-lived cloud tokens without any stored key.

## Hygiene

- **Least privilege:** a key for reading one storage container shouldn't be able to delete the account.
- **Rotation:** rotate regularly, and automatically where possible. Short-lived credentials are best.
- **Don't log secrets:** watch request logging, exception messages containing connection strings, and debug dumps of configuration objects.
- **Scanning:** enable secret scanning and push protection (GitHub has both), and run a scanner such as gitleaks in pre-commit hooks.
- **Separate per environment:** development keys must never work in production.

> [!AI]
> Never paste real secrets into an AI chat or prompt, and watch for assistants that "helpfully" inline a key into code or config to make an example work. Use placeholders and environment variables.

## If a secret leaks

1. **Revoke or rotate it immediately.** This is the only real fix. Assume it has already been used.
2. Check the provider's logs for misuse.
3. Remove it from history (`git filter-repo`, BFG) *after* rotating. Cleaning history alone isn't enough, because forks and caches may hold copies.
4. Find out how it happened and add a guard (push protection, pre-commit scanning).

```recall
Q: Why isn't deleting a committed secret in a later commit enough?
A: It remains in Git history (and possibly in forks, clones and caches); the secret must be revoked/rotated.

Q: What's the first thing to do when a secret leaks?
A: Revoke or rotate it immediately and assume it has been used.

Q: What are managed identities?
A: Cloud-managed credentials that let an application authenticate to other services as itself, so no secret needs to be stored or rotated by you.

Q: How should CI pipelines access cloud resources without long-lived keys?
A: Via OIDC federation, exchanging the pipeline's identity token for short-lived cloud credentials.
```
