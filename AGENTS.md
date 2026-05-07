# AI Agent Guide for `auto-changelog`

This document provides the **minimal, high-signal context** needed for AI agents working on this repository. Prefer **reading this file first** before exploring the codebase.

---

## 1. Project Overview

- **Purpose**: `auto-changelog` is a Node/TypeScript library/CLI that generates changelogs automatically from Git metadata and (optionally) external APIs (e.g. GitHub).
- **Primary responsibilities**:
  - Parse Git commits and metadata.
  - Classify and format changes into a structured changelog representation.
  - Optionally enrich data via external APIs (e.g. GitHub) before generating output.
- **Key design constraints**:
  - Library should be usable both programmatically and via CLI.
  - Output should be deterministic given the same inputs.
  - External APIs must be **optional** and configurable, never hard-coded.

If you’re adding new behavior, always ask: **“Does this keep the library deterministic and composable?”**

---

## 2. Architecture & Important Modules

- **Entry point**
  - `src/index.ts`
    - Public API surface: what gets exported is effectively the stable contract.
    - Be conservative about adding exports; avoid breaking changes.

- **API layer**
  - `src/apis/api.ts`
    - Core abstraction for remote APIs.
    - Defines shared types, base classes, error handling strategy, and rate limiting/backoff patterns (if any).
    - When adding a new API integration, model it after this layer and keep **side effects well-encapsulated**.
  - `src/apis/github.ts`
    - GitHub-specific implementation.
    - Deals with authentication, request building, pagination, and response normalization.
    - Any new GitHub behavior should:
      - Use existing helpers for HTTP calls.
      - Respect existing retry and error handling patterns.
      - Surface **normalized** data back to the core, not raw GitHub shapes.

- **Changelog domain**
  - `src/nodes/`
    - Contains the “domain model” for the changelog (nodes like `changelog`, `commit-author`, etc.).
    - Each node is responsible for a **single concept** (e.g. author, commit, section).
    - Keep these modules:
      - **Pure** where possible.
      - Focused on data modeling, transformation, and formatting.
  - Examples:
    - `src/nodes/index.ts` – re-exports and common utilities.
    - `src/nodes/changelog.ts` – top-level changelog representation.
    - `src/nodes/commit-author.ts` – modeling/formatting of commit authors.

- **Tests**
  - `tests/apis/api.test.ts`
    - High-signal test suite for verifying API abstractions and integrations.
    - When changing API contracts or behavior, **extend or adjust these tests first**.
  - Other tests (if present) should be followed for style/structure:
    - Arrange–Act–Assert.
    - Clear fixtures.
    - Prefer integration-style tests around the public API surfaces.

---

## 3. Coding & Design Guidelines for Agents

- **Language & tooling**
  - Language: **TypeScript** (ES modules / Node).
  - Linting: ESLint + project-specific rules (see `.eslintrc*` / Husky hooks).
  - Formatting: Follow existing style; rely on project formatter if configured.

- **API design**
  - Keep public APIs:
    - **Explicit**, strongly typed, and minimal.
    - Backwards-compatible where possible. Avoid signature changes; prefer new options or overloads.
  - For new configuration:
    - Use **plain objects** and well-typed options.
    - Provide sensible defaults; do not surprise existing users.

- **Error handling**
  - Prefer **typed errors** or clearly distinguishable error messages.
  - When dealing with remote APIs:
    - Normalize low-level errors (network, rate limits, validation) into a small, predictable set of error types.
    - Do not leak raw low-level library/API error objects to callers.

- **Purity & determinism**
  - Core domain logic (in `src/nodes/` and similar modules) should be:
    - Pure functions or simple data classes where possible.
    - Free of I/O, randomness, or hidden state.
  - Confine I/O and side effects (HTTP, file system, process env) to:
    - Explicit integration layers (`src/apis/`, CLI entry points, etc.).

- **Testing**
  - For changes in core logic:
    - Add or update **unit tests** near existing ones.
  - For new APIs or behavior:
    - Add **integration-style tests** under `tests/` that exercise behavior via public entry points.
  - Keep tests:
    - Fast, deterministic, and independent of real network where feasible.
    - Using mocks/fakes for network calls, unless the project explicitly has live tests.

---

## 4. Git, Branching, and Commit Hooks

- This repository uses **Husky hooks** (`.husky/pre-commit`, `.husky/commit-msg`):
  - Expect linting, tests, or commit message validation to run on commit.
  - Do **not** modify Husky configuration unless explicitly requested.

- Branch assumptions:
  - You are likely working on a feature branch (e.g. `219-feat-add-api-input`).
  - **Do not create or push commits** unless the user explicitly asks.

- When adjusting tests or lint rules:
  - Prefer aligning with existing patterns (naming conventions, folder structure).
  - If a rule is noisy or broken, surface it via explanation in your response rather than silently disabling it.

---

## 5. How Agents Should Approach Changes

When performing non-trivial work, follow this pattern:

1. **Understand the impact**
   - Identify affected public APIs (`src/index.ts`, exported types).
   - Identify downstream dependencies (nodes, APIs, CLI).

2. **Plan briefly**
   - Summarize the intended change in a few bullets in your response.
   - Note any assumptions (e.g. “GitHub is the only external API for now”).

3. **Implement in small steps**
   - Modify or add types, domain logic, then API/integration code.
   - Keep changes localized and reversible where possible.

4. **Update tests**
   - Adapt or extend tests in `tests/` first, then ensure they pass.
   - Do not delete coverage without strong justification.

5. **Keep the user in control**
   - Do not:
     - Force-push.
     - Change Git config.
     - Rewire CI, publishing, or Husky hooks without explicit instruction.

---

## 6. When in Doubt

If an instruction or requirement is ambiguous:

- Prefer **non-breaking**, backwards-compatible approaches.
- Prefer adding new options or helpers over changing existing semantics.
- Document your reasoning clearly in your assistant response (not in code comments) so humans can review.
