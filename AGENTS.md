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

- **What it is:** _one or two sentences on what the project does and for whom._
- **Status:** _e.g. alpha / stable; who maintains it._
- **Primary language(s) / framework(s):** _…_
- **Runtime / platform:** _e.g. browser (GitHub Pages), Node ≥ 20, Python 3.11, Obsidian ≥ 1.5…_

## 2. Repository map <!-- AUTO -->

```
_tree of the important top-level folders, one line each explaining what lives there_
```

Files/folders agents must **not** edit without explicit permission:
- `LICENSE`, `AGENTS.md` (except via the skill), release/version files, generated files (`dist/`, `build/`, lockfiles unless adding a dependency)
- _project-specific additions_

## 3. Setup, build, test <!-- AUTO -->

```bash
# install
_command_
# run locally / dev server
_command_
# test
_command_
# lint / format / type-check
_command_
# build
_command_
```

**Definition of done for any change:** install ✔ · lint ✔ · type-check ✔ · tests ✔ · builds ✔ ·
manually checked the feature works (screenshot or output for UI/visual changes).

## 4. Code conventions <!-- AUTO -->

- **Style/formatter:** _e.g. Prettier + ESLint config in repo; Ruff/Black for Python._
- **Naming:** _files, functions, components, CSS classes._
- **Structure patterns to follow:** _e.g. "one component per file in src/components", "pure functions in src/lib, side effects only in src/main.ts"._
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

_Domain knowledge an agent needs that isn't obvious from the code (e.g. units, data sources,
known pitfalls, performance limits, browser support, accessibility requirements)._

---

### Agent skills available in this repo

| Skill | What it does | Who runs it |
|---|---|---|
| `onboard-me` | Reads the repo and gives a new contributor a guided tour + good first tasks | new contributors |
| `pre-pr-check` | Checks a branch against these rules before opening a PR; drafts the PR text with AI disclosure | every contributor |
| `collab-rules-builder` | Reads the codebase and (re)generates the `<!-- AUTO -->` sections of this file | maintainer |

Skills live in `.claude/skills/<name>/SKILL.md`. Agents that don't support skills (Copilot,
Cursor, Gemini…) can be told "follow `.claude/skills/<name>/SKILL.md`" — they are plain Markdown.
