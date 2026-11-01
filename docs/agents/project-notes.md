# Project-specific notes <!-- AUTO -->

Read this before changing the checks, the skills, CI, or anything about adopting the kit in
another repository. The always-loaded rules are in [`AGENTS.md`](../../AGENTS.md).

- This is a kit, not an application. Keep adoption instructions distinct from
  this repository's own development commands (`README.md`).
- When copying the kit, run `npm run setup` in the destination repository to answer the setup
  questions, then regenerate the `<!-- AUTO -->` sections for that project. Merge existing
  settings instead of overwriting them, and do not copy this repository's Git metadata.
- CI validates PR titles, AI disclosure presence, agent-rule references, Markdown,
  local links, and the agent context budget. Branch protection and Discussions require GitHub
  configuration.
- The link checker validates Markdown links/images and Markdown heading fragments,
  including reference links. Raw HTML links/anchors and external URLs are outside
  its scope. Git supplies tracked and unignored Markdown paths.
- Every AI tool reloads its instruction files in each session, so `AGENTS.md` stays short and the
  detail lives in `docs/agents/`. `npm run check:context` estimates the always-loaded size per
  tool (characters ÷ `charsPerToken`, so the numbers are estimates, not tokenizer output) and
  fails when a group in `context-budget.json` is over budget. Raise a budget deliberately, in its
  own commit, rather than to make a check pass.
- Keep dependencies limited to documentation tooling: `markdownlint-cli2` for
  linting, `markdown-it` for parsing, and `github-slugger` for heading IDs. The link checker,
  context check and setup wizard use Node built-ins only.
