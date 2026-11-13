---
title: CI/CD Pipelines
summary: Continuous integration, delivery and deployment — pipeline stages, a GitHub Actions example, deployment strategies, feature flags and keeping pipelines fast and secure.
difficulty: intermediate
tags: [ci-cd, devops, github-actions, deployment, automation]
order: 3
related: [devops/git-essentials, devops/containers-and-docker, testing/automated-testing, security/secrets-management]
status: needs-review
reviewNotes: New entry from the topic-gaps batch. The workflow example mirrors this codex's own deploy workflow plus a test step.
---

**CI/CD** automates the path from a commit to running software:

- **Continuous Integration (CI):** every change is merged frequently and **automatically built and tested**, so problems surface within minutes.
- **Continuous Delivery:** every change that passes the pipeline is **releasable**; deploying to production is a button press.
- **Continuous Deployment:** every passing change **goes to production automatically**, with no manual step.

## A typical pipeline

```text
commit → build → unit tests → static analysis / security scans → package (image) → deploy to staging
       → integration / E2E tests → approval (delivery) → deploy to production → smoke tests → monitor
```

Fail fast: put the quickest, most likely-to-fail checks first.

## Example: GitHub Actions

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci                 # exact versions from the lock file
      - run: npm test               # unit tests
      - run: npm run build          # this codex's build also fails on broken links
```

This codex deploys with a similar workflow (`.github/workflows/deploy-pages.yml`).

## Practices that make CI work

- **Trunk-based development:** short-lived branches merged at least daily. Long-lived branches make integration painful.
- **Keep the build green:** a broken main branch is everyone's top priority.
- **Fast feedback:** aim for a CI run of under about 10 minutes. Cache dependencies, parallelise, and run slow suites less often.
- **Reproducible builds:** lock files, pinned tool versions, containers.
- **Build once, deploy many:** promote the *same* artefact through environments rather than rebuilding for each.

## Deployment strategies

| Strategy | How | Trade-off |
| --- | --- | --- |
| **Rolling** | Replace instances gradually | Simple; old and new versions run side by side briefly |
| **Blue–green** | Deploy to an idle copy, then switch traffic | Instant rollback; double the infrastructure during the switch |
| **Canary** | Send a small % of traffic to the new version, watch metrics, then expand | Limits blast radius; needs good [observability](observability.md) |
| **Recreate** | Stop old, start new | Simple; causes downtime |

## Feature flags

**Separate deploying from releasing.** Ship code switched off, then turn features on per user, per percentage or per environment. This enables trunk-based development, gradual rollouts and instant kill switches. Remove old flags promptly: each one is a branch in your code.

## Database migrations

Deploy schema changes in **backward-compatible** steps (*expand and contract*): add the new column, deploy code that writes both, backfill, switch reads, and remove the old column in a later release. Old and new code versions must both work during a rollout.

## Pipeline security

The pipeline can deploy to production, so it's a high-value target:

- Use **OIDC** for cloud access instead of stored keys. See [Secrets Management](../security/secrets-management.md).
- Pin third-party actions to a full commit SHA, and keep `permissions:` minimal.
- Require reviews and protected branches before deployment jobs run.

## Interview questions

Open-ended questions you might be asked about this topic. Try answering out loud before revealing the model answer — they also appear in **Interview prep**.

```interview
Q: Describe the CI/CD pipeline you'd set up for a new web service.
A: **On every pull request**: restore from lock files, build, lint/format check, unit tests, static and dependency security scans, and maybe integration tests in containers.
- **On merge to main**: build one versioned artefact (container image), push to a registry, deploy to staging, run smoke/E2E tests.
- **Production**: promote the same artefact with approval (continuous delivery) or automatically (deployment), using canary or blue–green, then smoke tests and monitoring.
- Infrastructure as code, secrets from a vault/OIDC, protected branches and fast feedback (under ~10 minutes for PR checks).

Q: How do you deploy a new version with zero downtime, including database changes?
A: **Application**: rolling, blue–green or canary deployments behind a load balancer with health checks, and graceful shutdown so in-flight requests finish.
- **Database**: expand-and-contract migrations — add the new schema first, deploy code that works with both, backfill, switch reads, and remove the old schema in a later release.
- Feature flags to decouple releasing features from deploying code; a tested rollback path.

Q: A deployment has just broken production. What do you do?
A: **Mitigate first, investigate second.**
- Roll back (or flip the feature flag off) to restore service quickly — that's why build-once artefacts and fast rollbacks matter.
- Communicate: tell stakeholders, open an incident channel, assign roles.
- Once stable, find the root cause using logs, traces and the diff.
- Run a **blameless postmortem**: what allowed it through (missing test, alert, review) and the follow-up actions to prevent recurrence.
```

```recall
Q: What's the difference between continuous delivery and continuous deployment?
A: Continuous delivery keeps every passing change releasable with a manual go-live decision; continuous deployment releases every passing change automatically.

Q: What is a canary deployment?
A: Releasing a new version to a small percentage of traffic, monitoring it, then gradually expanding if healthy.

Q: What does "build once, deploy many" mean?
A: Build a single artefact and promote that same artefact through each environment, rather than rebuilding per environment.

Q: How do feature flags help CI/CD?
A: They decouple deployment from release: code ships disabled and is enabled gradually or per user, with instant rollback by toggling.

Q: What is the expand-and-contract approach to database migrations?
A: Making schema changes in backward-compatible steps (add, dual-write, backfill, switch, then remove) so old and new code both work during deployment.
```
