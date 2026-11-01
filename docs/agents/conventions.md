# Code conventions <!-- AUTO -->

Read this before writing or editing code, Markdown or configuration. The always-loaded rules are
in [`AGENTS.md`](../../AGENTS.md).

- **Style:** `.editorconfig` specifies UTF-8, LF, final newlines, and two-space
  indentation. Markdown allows intentional trailing spaces for hard line breaks.
  `.markdownlint-cli2.yaml` preserves existing compact lists and long tables.
- **Naming:** Policy files use uppercase names; skill folders and JavaScript tools
  use lowercase hyphenated names. Tests use `*.test.mjs` under `tests/`.
- **Structure:** Shared agent rules live in `AGENTS.md`; the reference material agents read on
  demand lives here in `docs/agents/`; tool-specific files only point at `AGENTS.md`.
  Each `.claude/skills/<name>/` has one `SKILL.md`. Tools use ES modules under
  `scripts/` and Node's built-in test runner under `tests/` (`package.json`). Scripts export the
  functions their tests exercise and keep the command-line wrapper behind an
  `import.meta.url` guard, as `scripts/check-links.mjs` does.
- **Dependencies:** prefer the standard library and what's already installed. Adding a dependency
  requires a one-line justification in the PR.
- **Comments/docs:** explain *why*, not *what*. Update README/docs when behaviour changes.
- **Scientific / data code:** cite the source (paper, database + version) for any constant,
  model parameter or dataset; never fabricate data or results.
