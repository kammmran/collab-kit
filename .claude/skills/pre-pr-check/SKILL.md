---
name: pre-pr-check
description: Check the current branch against this project's collaboration rules before a pull request is opened, run lint/tests/build, flag problems, and draft a PR description with the required AI disclosure. Use when a contributor says they are ready to open a PR or asks to review their changes.
---

# Pre-PR check

You are reviewing a contributor's branch **before** they open a pull request. Be honest and
specific; the goal is a PR the maintainer can review quickly.

## 1. Gather

- Read `AGENTS.md`, the `docs/agents/` reference it links to, `CONTRIBUTING.md`, `AI_POLICY.md`,
  `.github/PULL_REQUEST_TEMPLATE.md`.
- `git fetch origin` (if allowed), then `git diff --stat origin/main...HEAD`,
  `git diff origin/main...HEAD`, `git log --oneline origin/main..HEAD`.

## 2. Run the checks from `AGENTS.md §3`

Run lint, type-check, tests and build — in this repo `npm run check`, which also runs
`npm run check:context`. Report each as ✅ / ❌ with the key error lines. Do not "fix" a failing
test by deleting, skipping or loosening it, and do not raise a token budget to make
`check:context` pass: shorten the always-loaded rules or move detail into `docs/agents/`.

## 3. Review against the rules

Report a checklist with ✅ / ⚠️ / ❌ and a one-line reason each:

- **Scope** — one concern? Any unrelated changes, renames or reformatting? Size (< ~400 lines)?
- **Patterns** — follows existing structure and style; no new dependency without justification.
- **Tests** — behaviour changes have tests.
- **Docs** — README/docs updated if user-visible behaviour changed.
- **Correctness red flags** — APIs/imports that don't exist, hard-coded paths, leftover debug
  code, TODOs, commented-out blocks.
- **Secrets & safety** — no keys, tokens, `.env` files, personal data, unexpected network calls.
- **Data/science integrity** — constants, datasets and claims have a real source cited.
- **Commits** — Conventional Commit messages; `Assisted-by:` trailer where AI helped.
- **Issue link** — does a linked, approved issue exist?

## 4. Ask about AI use

Ask the contributor directly which AI tools they used and for what. Don't assume.

## 5. Draft the PR

Produce a PR title (Conventional Commits) and a description that follows the template, with:
- a short summary the contributor should **rewrite in their own words**,
- how it was tested (from step 2),
- the checklist ticked only where true,
- an `AI disclosure:` line based on their answer.

Tell them to review and edit it, and to open the PR themselves. **Never** open the PR, push, or
post on GitHub yourself.
