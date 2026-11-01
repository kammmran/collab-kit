# AGENTS.md — rules for AI coding agents working on this project

> **Single source of truth** for every AI assistant on this repo. The tool-specific files
> (`CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `.gemini/settings.json`)
> only point here — **edit this file, not the shims.**
>
> Every agent reloads this file in every session, so it stays short: reference material lives in
> [`docs/agents/`](docs/agents/), read when a task needs it, and `npm run check:context` guards
> the size. `<!-- AUTO -->` sections, here and in `docs/agents/`, are written by the
> `collab-rules-builder` skill; re-run it when the stack or layout changes.

---

## 0. Golden rules (apply to every agent, every task)

1. **A human owns every change.** You assist a contributor; you never act as the contributor.
   Do not open PRs, issues, comments or reviews on GitHub by yourself.
2. **Read before you write.** Before editing a file, read it and its nearest neighbours/tests.
   Follow the patterns already in the codebase — don't introduce a new style, library or
   architecture unless the task explicitly asks for it.
3. **Small, focused changes.** One concern per change. No drive-by refactors, renames or
   reformatting of code unrelated to the task.
4. **Never invent.** No made-up APIs, config keys, file paths, citations, data or test results.
   If something is unknown, say so and ask.
5. **Tests and checks must pass locally** (see §3) before you tell the human the work is done.
   Never delete, skip or weaken a test to make it pass.
6. **No secrets, ever.** Don't read, print, commit or send `.env*`, keys, tokens or credentials.
   Don't add telemetry or network calls that weren't asked for.
7. **Respect licences.** Don't paste code from other projects unless its licence is compatible
   and it is credited.
8. **Remind the human to disclose AI use** in the PR description (see `AI_POLICY.md`).

Never edit without explicit permission: `LICENSE`, release/version files, lockfiles (unless
adding a dependency), generated output, `AGENTS.md` and `docs/agents/` (skill only) — see §2.

---

## 1. Project overview <!-- AUTO -->

- **What it is:** A reusable collaboration kit: policies, agent instructions, GitHub
  templates, and checks for contributors and maintainers (see `README.md`).
- **Repository:** `kammmran/collab-kit`; project-specific rules must be adapted when
  copying the kit to another repository.
- **Languages:** Markdown, YAML/JSON configuration, and JavaScript documentation tools.
- **Runtime:** Node.js ≥ 22 and npm for checks (`package.json`); GitHub Actions for CI.

## 2. Repository map

Read [`docs/agents/repo-map.md`](docs/agents/repo-map.md) before creating, moving or deleting
files, or when you need to know where something lives. It also holds the full list of paths
agents must not edit without permission.

## 3. Setup, build, test <!-- AUTO -->

```bash
npm ci --ignore-scripts --no-audit --no-fund   # once per checkout; needs the npm registry
npm run check                                  # lint + local links + context budget + tests
git diff --check                               # whitespace review
```

Individual checks: `npm run lint`, `npm run check:links`, `npm run check:context`, `npm test`.
They run offline after installation and are what the `documentation` CI job runs. This kit has no
dev server, application build or type-check. `npm run setup` is the wizard an adopting project
runs once; it is not part of the checks.

**Definition of done:** install ✔ · lint ✔ · links ✔ · context budget ✔ · tests ✔ · result
checked by hand (rendered Markdown, or command output for a script).

## 4. Code conventions

Read [`docs/agents/conventions.md`](docs/agents/conventions.md) before writing or editing code,
Markdown or configuration. In short: follow the file you are editing and the config it obeys
(`.editorconfig`, `.markdownlint-cli2.yaml`); prefer the standard library and what is already
installed — a new dependency needs a one-line justification in the PR; comments explain *why*;
cite a real source for any constant, dataset or claim.

## 5. Git & PR workflow

- Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- **Conventional Commits** for commit messages and PR titles: `feat: …`, `fix: …`, `docs: …`,
  `refactor: …`, `test: …`, `chore: …`.
- Where AI helped meaningfully, add a trailer: `Assisted-by: <tool and model>`.
- Keep PRs small (aim < 400 changed lines) and fill in every section of the PR template,
  including **AI disclosure**.

## 6. How agents should work

- **Plan first** for anything larger than a one-file fix: list the files you'll touch and why,
  then wait for the human's OK.
- **Ask** when requirements are ambiguous instead of guessing.
- **Explain** what you changed and how you verified it, in plain words, so the human can review
  and defend every line.
- **Stop** and ask before deleting files, changing public APIs, adding dependencies, touching
  CI/release config, or running anything that hits the network or costs money.

## 7. Project-specific notes

Read [`docs/agents/project-notes.md`](docs/agents/project-notes.md) before changing the checks,
the skills, CI, or anything about adopting this kit in another repository.

---

### Agent skills available in this repo

`onboard-me` (new contributors), `pre-pr-check` (before every PR), `collab-rules-builder`
(maintainers: regenerates the AUTO sections). Each is plain Markdown in
`.claude/skills/<name>/SKILL.md` — Claude Code runs `/<name>`; other agents can be told to follow
the file.
