# Contributing

Thanks for wanting to help! This page explains how to collaborate on this project.
Please read it fully before your first pull request — PRs that ignore these rules may be
closed without review.

## 1. Before you start

1. Read the [`README.md`](README.md), this file, the [AI policy](AI_POLICY.md) and the
   [Code of Conduct](CODE_OF_CONDUCT.md).
2. **Open or claim an issue first.** Comment "I'd like to work on this" and wait for a
   maintainer's 👍 before starting anything larger than a typo fix. This avoids two people
   doing the same work, or work that won't be merged.
3. Good starting points are labelled `good first issue` and `help wanted`.

## 2. Set up locally

The exact install / run / test commands are in [`AGENTS.md` §3](AGENTS.md#3-setup-build-test)
(the same file AI assistants read, so humans and agents use identical steps).

If you use Claude Code, run `/onboard-me` for a guided tour of the codebase.

## 3. Making a change

- Fork → branch from `main`: `feat/…`, `fix/…`, `docs/…`.
- Keep changes **small and focused** — one concern per PR (aim for < 400 changed lines).
- Follow the existing code style and structure (details in `AGENTS.md` §4).
- Add or update tests for behaviour you change. Never delete or skip a test to make CI pass.
- Update docs/README if user-visible behaviour changes.
- Commit messages and PR titles use **Conventional Commits** (`feat: add X`, `fix: Y`).

## 4. Opening a pull request

Before opening:

- [ ] Lint, type-check, tests and build pass locally.
- [ ] You tested the change by hand (screenshots / GIF for UI or visual changes).
- [ ] You can explain **every line** of the diff in your own words.
- [ ] You filled in every section of the PR template, **including AI disclosure**.

Claude Code users: run `/pre-pr-check` — it checks your branch against these rules and drafts
the PR description.

## 5. Review process

- A maintainer will review within about a week. Be patient and polite.
- Respond to comments yourself (not with copy-pasted AI output).
- Maintainers may ask you to split, simplify or rework a PR. Final decision rests with them.
- Inactive PRs (no response for 30 days) may be closed; you can always reopen.

## 6. Using AI tools

AI assistants are welcome as **tools**, not as authors. Short version:

- You are responsible for everything you submit.
- Disclose AI use in the PR.
- No fully automated / agent-submitted PRs.

The full rules are in [`AI_POLICY.md`](AI_POLICY.md). Rules for the AI assistants themselves
(Claude, Cursor, Copilot, Gemini, Codex…) are in [`AGENTS.md`](AGENTS.md) and are picked up
automatically by those tools.

## 7. Licence

By contributing you agree your contribution is licensed under this project's
[licence](LICENSE), and that you have the right to submit it.

## 8. Questions

Open a GitHub Discussion or an issue with the `question` label.
