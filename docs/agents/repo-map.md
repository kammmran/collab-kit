# Repository map <!-- AUTO -->

Read this before creating, moving or deleting files, or when you need to know where something
lives. The always-loaded rules are in [`AGENTS.md`](../../AGENTS.md).

```text
README.md / COLLAB_KIT_README.md   Overview, collaboration workflow, and adoption guide
AGENTS.md / CONTRIBUTING.md       Agent rules and human contribution process
AI_POLICY.md / CODE_OF_CONDUCT.md Disclosure and community policies
LICENSE                          Apache License 2.0
docs/agents/                      Agent reference read on demand: this map, conventions, notes
.github/                         Issue/PR templates and collaboration CI
.claude/skills/                   Rule maintenance, onboarding, and pre-PR skills
CLAUDE.md / .cursor/ / .gemini/    Tool-specific references to AGENTS.md
context-budget.json               Token budgets for the always-loaded instruction files
scripts/check-links.mjs           Offline local Markdown link validation
scripts/check-context.mjs         Always-loaded agent context size check
scripts/setup.mjs                 Interactive setup wizard for a project adopting the kit
tests/*.test.mjs                  Regression tests for the scripts above
package.json / package-lock.json  Check commands and pinned development dependencies
.editorconfig / .gitignore        Editor conventions and local-file exclusions
.markdownlint-cli2.yaml           Markdown lint scope and style rules
```

Files and folders agents must **not** edit without explicit permission:

- `LICENSE`, release/version files, and generated files (`dist/`, `build/`, lockfiles unless a
  dependency is being added).
- `AGENTS.md` and this `docs/agents/` reference, except through the `collab-rules-builder` skill.
- `node_modules/` is installed dependency output; never edit it by hand.
