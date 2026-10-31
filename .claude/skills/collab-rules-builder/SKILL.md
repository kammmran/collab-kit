---
name: collab-rules-builder
description: Read this repository's code and (re)generate the project-specific sections of AGENTS.md and CONTRIBUTING.md so every AI tool and human collaborator follows accurate rules. Use when the maintainer asks to build, refresh or check the collaboration rules, or after the stack/layout changes.
---

# Collaboration rules builder

You are helping the **maintainer** keep the collaboration rules accurate. The rules live in
`AGENTS.md` (single source of truth for all AI agents). Sections marked `<!-- AUTO -->` are yours
to fill; everything else is policy the maintainer wrote — do not change it unless asked.

## Step 1 — Read the project (don't guess)

Inspect, in this order, and note facts with the file they came from:

1. `README*`, `LICENSE`, existing `CONTRIBUTING*`, `docs/`.
2. Manifests and tooling: `package.json` (+ scripts), `pnpm-lock.yaml`/`package-lock.json`,
   `pyproject.toml`, `requirements*.txt`, `environment.yml`, `setup.cfg`, `Cargo.toml`, `go.mod`,
   `manifest.json` (Obsidian plugins), `vite.config.*`, `tsconfig.json`, `Makefile`, `justfile`,
   `Dockerfile`.
3. Quality config: `.eslintrc*`/`eslint.config.*`, `.prettierrc*`, `ruff.toml`, `.editorconfig`,
   `pre-commit` config, test config (`vitest`/`jest`/`pytest`).
4. CI: `.github/workflows/*.yml` — these show the *real* commands that must pass.
5. Top-level tree (2 levels) and 3–5 representative source files plus their tests, to learn
   naming, structure and patterns.
6. `git log --oneline -30` to see commit message style.

Run the install/test/lint commands you found (if safe and offline-capable) to confirm they
work. If a command fails, record that rather than inventing a fix.

## Step 2 — Draft the AUTO sections

Fill `AGENTS.md` sections 1, 2, 3, 4 and 7:

- **§1 overview** — what the project does, status, languages, runtime. 4 bullets max.
- **§2 repo map** — a short tree of meaningful folders with one-line purposes; add any
  generated or sensitive paths to the "must not edit" list.
- **§3 commands** — exact, copy-pasteable commands, verified in Step 1. Mark any you couldn't
  verify with `# unverified`.
- **§4 conventions** — only conventions you actually observed (cite the config file). Don't
  add generic advice.
- **§7 project-specific notes** — domain knowledge, data sources and their versions, units,
  performance/browser limits, pitfalls you noticed (e.g. large files, CORS, WebGL).

Rules for writing:
- Keep `AGENTS.md` under ~200 lines; agents read it on every task. Link to docs instead of
  copying them.
- Every claim must come from the repo. If you're unsure, write `_TODO(maintainer): …_`.
- Keep the `<!-- AUTO -->` markers so the skill can be re-run.

## Step 3 — Sync the human docs

- In `CONTRIBUTING.md`, check links to `AGENTS.md` sections still resolve.
- Replace placeholders such as `OWNER/REPO` in `.github/ISSUE_TEMPLATE/config.yml` and
  `_maintainer contact email_` in `CODE_OF_CONDUCT.md` **only if** the values are present in the
  repo (e.g. `git remote get-url origin`, `package.json` author). Otherwise list them as TODOs.
- Confirm `CLAUDE.md` still imports `@AGENTS.md`, `.gemini/settings.json` points to it, and the
  Cursor and Copilot files reference it.

## Step 4 — Report

Show the maintainer a diff of `AGENTS.md`, a list of TODOs that need a human answer, and any
command that failed. Do not commit — let the maintainer review and commit.
