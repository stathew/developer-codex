---
title: Developer Tools Overview
summary: A map of the everyday toolchain — editors and IDEs, version control, package managers, build tools, debugging, API clients, quality tools, containers, CI/CD and AI assistants.
difficulty: beginner
tags: [tools, ide, workflow, productivity, devops]
order: 0
related: [devops/git-essentials, devops/containers-and-docker, devops/svn, ai-era/prompting-for-code]
status: needs-review
reviewNotes: New entry drafted from the empty 2023 Tools Overview stub (no content). Tool lists are examples, not endorsements, and will date; prune to what you actually use.
---

A developer's productivity depends heavily on their tools. This is a map of the main categories and why each matters. Learn **one tool in each category well**, rather than sampling many.

## Editors and IDEs

| Tool | Notes |
| --- | --- |
| **VS Code** | Lightweight, extensible, the most popular editor across languages |
| **Visual Studio** | Full IDE for .NET on Windows |
| **JetBrains IDEs** | Rider (.NET), IntelliJ IDEA (Java/Kotlin), WebStorm, PyCharm: deep refactoring and analysis |
| **Vim / Neovim** | Keyboard-driven, everywhere, steep learning curve |

Worth mastering in any editor: go-to-definition, find references, **rename refactoring**, multi-cursor editing, the integrated debugger and the command palette.

## Version control

**[Git](git-essentials.md)** is the standard, with GitHub, GitLab, Azure DevOps or Bitbucket hosting. You'll still meet **[SVN](svn.md)** in older organisations.

## Package managers

| Ecosystem | Package manager |
| --- | --- |
| JavaScript/TypeScript | npm, pnpm, Yarn |
| .NET | NuGet (`dotnet add package`) |
| Java/Kotlin | Maven, Gradle |
| Python | pip, uv, Poetry |
| System | winget, Homebrew, apt |

Commit **lock files** (`package-lock.json`, `packages.lock.json`) so every machine and CI run installs identical versions.

## Build tools and runtimes

The `dotnet` CLI, Angular CLI / Vite / esbuild, Maven / Gradle, and Make. Know how to run a build from the **command line**, because that's what CI does.

## The terminal

Comfort in a shell (bash, zsh or PowerShell) pays off daily: running builds, inspecting logs, scripting repetitive tasks, using `git` fully. Useful extras include `ripgrep` (fast search), `jq` (JSON) and `fzf` (fuzzy finding).

## Debugging and profiling

- **Debuggers:** breakpoints, conditional breakpoints, watch expressions, stepping through code. Use them instead of `console.log` archaeology.
- **Browser DevTools:** Elements, Console, Network, Performance and Application panels.
- **Profilers:** `dotnet-trace` and `dotnet-counters`, Visual Studio and Rider profilers, Chrome's Performance panel, Java Flight Recorder.

## API tools

`curl`, **`.http` files** (built into Visual Studio, Rider and VS Code extensions), Postman, Bruno or Insomnia for exploring and testing HTTP APIs. **Swagger UI / Scalar** give interactive [OpenAPI](../backend/openapi-and-swagger.md) docs.

## Code quality

- **Formatters:** Prettier, `dotnet format`. End style debates by automating them.
- **Linters and analysers:** ESLint, Roslyn analysers, SonarQube/SonarCloud.
- **Testing:** see [Testing & Quality](../testing/automated-testing.md).
- **Git hooks:** Husky or lefthook run checks before commits.

## Containers and environments

**[Docker](containers-and-docker.md)** and Docker Compose for reproducible local dependencies. Dev Containers and GitHub Codespaces give everyone an identical development environment.

## CI/CD

GitHub Actions, Azure Pipelines, GitLab CI and Jenkins build, test and deploy on every push. This codex deploys itself with GitHub Actions.

## AI assistants

Inline completion and chat (GitHub Copilot and others), AI-native editors, and agentic coding tools in the terminal or IDE. They're powerful accelerators, used well: see [Prompting for Code](../ai-era/prompting-for-code.md) and [Reviewing AI-Generated Code](../ai-era/reviewing-ai-generated-code.md).

```recall
Q: Why should you commit lock files?
A: So every developer machine and CI run installs exactly the same dependency versions.

Q: Name five IDE features worth mastering.
A: Go to definition, find references, rename refactoring, multi-cursor editing and the integrated debugger (also the command palette).

Q: Why automate formatting with a tool like Prettier or dotnet format?
A: It ends style debates and noisy diffs by applying one consistent style automatically.
```
