# Copilot instructions

The full rules for AI assistants on this project are in [`AGENTS.md`](../AGENTS.md) at the
repository root — follow them. (Copilot in VS Code can also read `AGENTS.md` directly.)

Key points:
- A human owns and reviews every change; Copilot never opens PRs/issues on its own.
- Follow existing patterns; keep diffs small and focused; no unrelated refactors.
- Never invent APIs, data, citations or test results. Ask when unsure.
- Run the lint/test commands in `AGENTS.md §3` before declaring work done.
- Never read or commit secrets.
- Remind the contributor to fill in the **AI disclosure** in the PR template (`AI_POLICY.md`).
