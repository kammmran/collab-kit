# AGENTS.md — rules for AI coding agents working on this project

> This file is the **single source of truth** for every AI assistant used on this repo
> (Claude Code, Cursor, GitHub Copilot, Codex, Gemini CLI, Windsurf, Aider, Zed, Jules…).
> Tool-specific files (`CLAUDE.md`, `.cursor/rules/`, `.github/copilot-instructions.md`,
> `.gemini/settings.json`) only point here. **Edit this file, not the shims.**
>
> Sections marked `<!-- AUTO -->` are filled in by the `collab-rules-builder` Claude Code
> skill after it reads the codebase. Re-run it whenever the stack or layout changes.

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

---

## 1. Project overview <!-- AUTO -->

- **What it is:** A reusable collaboration kit: policies, agent instructions, GitHub
  templates, and checks for contributors and maintainers (see `README.md`).
- **Repository:** `kammmran/collab-kit`; project-specific rules must be adapted when
  copying the kit to another repository.
- **Languages:** Markdown, YAML/JSON configuration, and JavaScript documentation tools.
- **Runtime:** Node.js ≥ 22 and npm for checks (`package.json`); GitHub Actions for CI.

## 2. Repository map <!-- AUTO -->

```
README.md / COLLAB_KIT_README.md   Overview, collaboration workflow, and adoption guide
AGENTS.md / CONTRIBUTING.md       Agent rules and human contribution process
AI_POLICY.md / CODE_OF_CONDUCT.md Disclosure and community policies
LICENSE                          Apache License 2.0
.github/                         Issue/PR templates and collaboration CI
.claude/skills/                   Rule maintenance, onboarding, and pre-PR skills
CLAUDE.md / .cursor/ / .gemini/    Tool-specific references to AGENTS.md
scripts/check-links.mjs           Offline local Markdown link validation
tests/check-links.test.mjs        Link-checker regression tests
package.json / package-lock.json  Check commands and pinned development dependencies
.editorconfig / .gitignore        Editor conventions and local-file exclusions
.markdownlint-cli2.yaml           Markdown lint scope and style rules
```

Files/folders agents must **not** edit without explicit permission:
- `LICENSE`, `AGENTS.md` (except via the skill), release/version files, generated files (`dist/`, `build/`, lockfiles unless adding a dependency)
- `node_modules/` is installed dependency output; do not edit it manually.

## 3. Setup, build, test <!-- AUTO -->

```bash
# install check tooling (network access required on a fresh checkout)
npm ci --ignore-scripts --no-audit --no-fund
# Markdown lint, local links, and checker regression tests
npm run check
# individual checks
npm run lint
npm run check:links
npm test
# whitespace review
git diff --check
```

No dev server, application build, or static type-check is configured. For this kit,
those steps are not applicable. Inspect rendered Markdown for documentation changes.
Checks run offline after installation; external links are not fetched. The
`documentation` CI job runs the same install and check commands.

**Definition of done for any change:** install ✔ · lint ✔ · type-check ✔ · tests ✔ · builds ✔ ·
manually checked the feature works (screenshot or output for UI/visual changes).

## 4. Code conventions <!-- AUTO -->

- **Style:** `.editorconfig` specifies UTF-8, LF, final newlines, and two-space
  indentation. Markdown allows intentional trailing spaces for hard line breaks.
  `.markdownlint-cli2.yaml` preserves existing compact lists and long tables.
- **Naming:** Policy files use uppercase names; skill folders and JavaScript tools
  use lowercase hyphenated names. Tests use `*.test.mjs` under `tests/`.
- **Structure:** Shared agent rules live here; tool-specific files reference them.
  Each `.claude/skills/<name>/` has one `SKILL.md`. Tools use ES modules under
  `scripts/` and Node's built-in test runner under `tests/` (`package.json`).
- **Dependencies:** prefer the standard library and what's already installed. Adding a dependency
  requires a one-line justification in the PR.
- **Comments/docs:** explain *why*, not *what*. Update README/docs when behaviour changes.
- **Scientific / data code:** cite the source (paper, database + version) for any constant,
  model parameter or dataset; never fabricate data or results.

## 5. Git & PR workflow

- Branch from `main`: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.
- **Conventional Commits** for commit messages and PR titles:
  `feat: …`, `fix: …`, `docs: …`, `refactor: …`, `test: …`, `chore: …`.
- If AI meaningfully helped with a commit, add a trailer:
  ```
  Assisted-by: <tool and model, e.g. Claude Code (Claude Opus)>
  ```
- Keep PRs small (aim < 400 changed lines). Fill in every section of the PR template,
  including **AI disclosure**.

## 6. How agents should work

- **Plan first** for anything larger than a one-file fix: list the files you'll touch and why,
  and wait for the human's OK.
- **Ask** when requirements are ambiguous instead of guessing.
- **Explain** what you changed and how you verified it, in plain words, so the human can
  review and defend every line.
- **Stop** and ask before: deleting files, changing public APIs, adding dependencies,
  touching CI/release config, or running anything that hits the network or costs money.

## 7. Project-specific notes <!-- AUTO -->

- This is a kit, not an application. Keep adoption instructions distinct from
  this repository's own development commands (`README.md`).
- When copying the kit, merge existing settings and regenerate the AUTO sections
  for the destination project. Do not copy this repository's Git metadata.
- CI validates PR titles, AI disclosure presence, agent-rule references, Markdown,
  and local links. Branch protection and Discussions require GitHub configuration.
- The link checker validates Markdown links/images and Markdown heading fragments,
  including reference links. Raw HTML links/anchors and external URLs are outside
  its scope. Git supplies tracked and unignored Markdown paths.
- Keep dependencies limited to documentation tooling: `markdownlint-cli2` for
  linting, `markdown-it` for parsing, and `github-slugger` for heading IDs.

---

### Agent skills available in this repo

| Skill | What it does | Who runs it |
|---|---|---|
| `onboard-me` | Reads the repo and gives a new contributor a guided tour + good first tasks | new contributors |
| `pre-pr-check` | Checks a branch against these rules before opening a PR; drafts the PR text with AI disclosure | every contributor |
| `collab-rules-builder` | Reads the codebase and (re)generates the `<!-- AUTO -->` sections of this file | maintainer |

Skills live in `.claude/skills/<name>/SKILL.md`. Agents that don't support skills (Copilot,
Cursor, Gemini…) can be told "follow `.claude/skills/<name>/SKILL.md`" — they are plain Markdown.
