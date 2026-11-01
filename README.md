# Collaboration kit

> Thanks to [@0rkhann](https://github.com/0rkhann) and his project, which motivated me to build
> this one.

Shared contribution rules for humans and AI coding assistants. This kit provides
project policies, agent instructions, GitHub templates, and collaboration checks
that you can adapt to your own repository.

[`AGENTS.md`](AGENTS.md) is the single source of truth for agent rules. The included
Claude Code, Cursor, GitHub Copilot, and Gemini CLI configuration files point to it,
so project instructions stay in one place. Contributors remain responsible for
understanding, reviewing, testing, and submitting their work.

## Install

Requires Node.js 22 or newer, npm, and Git — and only for the checks and the wizard; the
policies themselves work with no tooling at all.

**1. Copy the kit into your repository**, from your project's root:

```bash
git clone --depth 1 https://github.com/kammmran/collab-kit /tmp/collab-kit

cp -R /tmp/collab-kit/{AGENTS.md,CLAUDE.md,CONTRIBUTING.md,AI_POLICY.md,CODE_OF_CONDUCT.md} .
cp -R /tmp/collab-kit/{docs,scripts,tests,context-budget.json} .
cp -R /tmp/collab-kit/{.editorconfig,.markdownlint-cli2.yaml} .
cp -R /tmp/collab-kit/{.github,.claude,.cursor,.gemini} .   # merge with yours; review first
rm -rf /tmp/collab-kit
```

Review every overlapping file before you replace it, and keep your own `README.md`.

**2. Add the commands to your `package.json`** (merge with the scripts you already have), then
install the two linting dependencies:

```json
"scripts": {
  "setup": "node scripts/setup.mjs",
  "lint": "markdownlint-cli2",
  "check:links": "node scripts/check-links.mjs",
  "check:context": "node scripts/check-context.mjs",
  "test": "node --test",
  "check": "npm run lint && npm run check:links && npm run check:context && npm test"
}
```

```bash
npm install --save-dev markdownlint-cli2@0.24.0 markdown-it@15.0.3 github-slugger@2.0.0
```

**3. Answer the setup questions**, then run the checks:

```bash
npm run setup                 # or: node scripts/setup.mjs
npm run setup -- --dry-run    # optional: see the answers it detects, write nothing
npm run check                 # lint + local links + agent context budget + tests
```

`npm run setup` asks about your project in the terminal — name, description, repository,
languages, runtime, install and check commands, which AI tools to keep, the code-of-conduct
contact, and the token budget — shows the files it would change, and writes nothing until you
confirm with `y`. Blank answers become `_TODO(maintainer): …_` instead of invented text. With
Claude Code, run `/collab-rules-builder` afterwards to draft the remaining `<!-- AUTO -->`
sections from your codebase, then review the result.

Then finish the GitHub side — Discussions, labels and branch protection — as described in
[Set up in your project](#set-up-in-your-project).

## Contents

- [Install](#install)
- [What's included](#whats-included)
- [File and folder organisation](#file-and-folder-organisation)
- [Set up in your project](#set-up-in-your-project)
- [Local checks](#local-checks)
- [Keeping agent context small](#keeping-agent-context-small)
- [Included skills](#included-skills)
- [What CI checks](#what-ci-checks)
- [Collaboration workflow](#collaboration-workflow)
- [Licence](#licence)

## What's included

| File or directory | Purpose |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Shared agent rules and placeholders for project-specific guidance |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Human contribution and review workflow |
| [`AI_POLICY.md`](AI_POLICY.md) | Responsibility and disclosure requirements for AI-assisted work |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Community expectations and reporting guidance |
| [`CLAUDE.md`](CLAUDE.md) | Claude Code entry point importing `AGENTS.md` |
| [`.cursor/rules/project.mdc`](.cursor/rules/project.mdc) | Cursor rule pointing to `AGENTS.md` |
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | GitHub Copilot instructions pointing to `AGENTS.md` |
| [`.gemini/settings.json`](.gemini/settings.json) | Gemini CLI context configuration |
| [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/) | Bug reports, feature requests, and a Discussions link |
| [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) | Review checklist and required AI disclosure |
| [`.github/workflows/collab-rules.yml`](.github/workflows/collab-rules.yml) | GitHub Actions checks for contribution rules |
| [`docs/agents/`](docs/agents/) | Repository map, conventions, and project notes agents read on demand |
| [`context-budget.json`](context-budget.json) | Token budgets for the instruction files AI tools load every session |
| [`.claude/skills/`](.claude/skills/) | Guided onboarding, rule maintenance, and pre-PR review instructions |
| [`.editorconfig`](.editorconfig) / [`.gitignore`](.gitignore) | Shared editor settings and local-file exclusions |
| [`package.json`](package.json) / [`.markdownlint-cli2.yaml`](.markdownlint-cli2.yaml) | Documentation check commands and Markdown rules |
| [`scripts/`](scripts/) / [`tests/`](tests/) | Setup wizard, link checker, agent context budget check, and their tests |

## File and folder organisation

### Current repository layout

```text
collab-kit/
├── README.md                         # Project overview and collaboration guide
├── COLLAB_KIT_README.md              # Additional setup background
├── LICENSE                           # Apache License 2.0
├── AGENTS.md                         # Shared rules for coding assistants (loaded every session)
├── CONTRIBUTING.md                   # Contribution process for humans
├── AI_POLICY.md                      # AI responsibility and disclosure rules
├── CODE_OF_CONDUCT.md                # Community expectations
├── CLAUDE.md                         # Imports the shared agent rules
├── .editorconfig                     # Whitespace and encoding conventions
├── .gitignore                        # Local and generated file exclusions
├── .markdownlint-cli2.yaml           # Markdown lint configuration
├── context-budget.json               # Token budgets for always-loaded instructions
├── package.json                      # Setup and documentation check commands
├── package-lock.json                 # Locked development dependencies
├── docs/
│   └── agents/
│       ├── repo-map.md               # Repository map, read on demand
│       ├── conventions.md            # Code conventions, read on demand
│       └── project-notes.md          # Project-specific notes, read on demand
├── scripts/
│   ├── setup.mjs                     # Interactive setup for an adopting project
│   ├── check-links.mjs               # Offline local Markdown link checker
│   └── check-context.mjs             # Always-loaded agent context budget
├── tests/
│   ├── check-links.test.mjs          # Link-checker regression tests
│   ├── check-context.test.mjs        # Context-budget regression tests
│   └── setup.test.mjs                # Setup wizard regression tests
├── .claude/
│   └── skills/
│       ├── collab-rules-builder/
│       │   └── SKILL.md              # Maintain project-specific guidance
│       ├── onboard-me/
│       │   └── SKILL.md              # Guide new contributors
│       └── pre-pr-check/
│           └── SKILL.md              # Review a branch before submission
├── .cursor/
│   └── rules/
│       └── project.mdc               # Points Cursor to AGENTS.md
├── .gemini/
│   └── settings.json                 # Selects AGENTS.md as context
└── .github/
    ├── copilot-instructions.md        # Points Copilot to AGENTS.md
    ├── PULL_REQUEST_TEMPLATE.md       # PR questions and checklist
    ├── ISSUE_TEMPLATE/
    │   ├── config.yml                # Issue chooser and Discussions link
    │   ├── bug_report.yml            # Bug report form
    │   └── feature_request.yml       # Feature proposal form
    └── workflows/
        └── collab-rules.yml          # Collaboration checks
```

Keep shared agent policy in `AGENTS.md` and link to it from tool-specific files.
Keep contributor procedures in `CONTRIBUTING.md`, AI disclosure requirements in
`AI_POLICY.md`, and community behaviour rules in `CODE_OF_CONDUCT.md`. The README
should explain how these fit together and link to details. Update the owning
document when a rule changes, then check any summaries and references.

### Where new project files belong

The following are recommendations for projects adopting this kit, not folders
already included here. Follow the project's existing language and framework
conventions first, and create a directory only when there is content for it.

| Location | Suggested contents |
|---|---|
| Repository root | README, licence, contribution policies, and tooling files required at the root |
| `src/` | Application or library source, grouped by feature or domain as the project grows |
| `tests/` | Tests organised to mirror source modules; colocated tests are also appropriate when already established |
| `tests/fixtures/` | Small, non-sensitive sample inputs used by tests |
| `docs/` | Detailed setup, architecture, usage, and maintenance guides linked from the README |
| `scripts/` | Repeatable development and maintenance commands with documented inputs and effects |
| `examples/` | Small, runnable usage examples that stay in sync with supported behaviour |
| `assets/` | Shared images and other static resources, with attribution where needed |
| `.github/` | GitHub workflows, issue forms, and pull request templates |
| `.claude/skills/<skill-name>/` | One skill's `SKILL.md` and any supporting resources |

Document the actual layout and conventions in the adopting project's `AGENTS.md`
sections 2 and 4. Do not reorganise an established project just to match this
example layout.

### Naming and keeping the structure clear

- Prefer descriptive names that explain a file's responsibility. Avoid names
  such as `misc`, `stuff`, `new-file`, or `final-v2`.
- For new documentation and general-purpose folders, lowercase words separated
  by hyphens are a useful default, for example `docs/local-setup.md`. Follow
  existing conventions for source and test filenames.
- Preserve required filenames and casing such as `README.md`, `AGENTS.md`,
  `SKILL.md`, and `PULL_REQUEST_TEMPLATE.md`. Match filename casing in links and
  imports so they work on case-sensitive systems.
- Group related files together. Give each module a clear responsibility, and
  add subfolders when they clarify ownership or purpose rather than creating
  deeply nested folders with no practical benefit.
- Keep tests and fixtures easy to associate with the code they verify. Document
  where shared resources belong instead of copying them into several features.
- Keep generated output, caches, local editor state, and dependencies separate
  from maintained source. Use the adopting project's `.gitignore` for files it
  should not track, and document any intentionally committed generated files.
- Keep credentials and private datasets out of the repository. Use synthetic
  sample data where examples or tests need inputs.
- When moving or renaming files, update imports, documentation links, scripts,
  workflow paths, and the repository map, then run the relevant checks. Keep
  structural changes separate from unrelated behaviour changes.

## Set up in your project

1. Copy `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `AI_POLICY.md`, and
   `CODE_OF_CONDUCT.md` into your repository root, together with `docs/agents/` and
   `context-budget.json`. Merge the contents of `.github/`, `.claude/`, `.cursor/`, and
   `.gemini/` with any existing configuration. Review overlapping files before replacing them,
   and keep your project's own README.
2. Run the setup wizard in the destination repository:

   ```bash
   npm run setup          # add --  --dry-run to see the answers it detects first
   ```

   It asks about the project in the terminal — name, one-sentence description, repository,
   languages, runtime, install and check commands, which AI tools to keep, the code-of-conduct
   contact, and the token budget — then shows the files it would change and waits for a `y`
   before writing anything. Answers you leave blank become `_TODO(maintainer): …_` rather than
   invented text, and files belonging to tools you drop are deleted only after a second
   confirmation. Afterwards, fill in the remaining detail: with Claude Code, run
   `/collab-rules-builder` to draft the `<!-- AUTO -->` sections of `AGENTS.md` and
   `docs/agents/` from your codebase, then review the result.
3. Set the Discussions URL in `.github/ISSUE_TEMPLATE/config.yml` to your own
   repository and review the reporting guidance in `CODE_OF_CONDUCT.md`.
   Review all policies and templates
   for your project's needs, including the licence referenced by `CONTRIBUTING.md`.
4. Enable GitHub Discussions if you use the supplied Discussions link. Create the
   labels referenced by the kit: `good first issue`, `help wanted`, `bug`,
   `enhancement`, `triage`, and `question`.
5. Protect `main` with pull requests, at least one approval, and the `documentation`,
   `pr-rules`, and `agent-shims-intact` checks from the **Collaboration rules** workflow.
6. Review the diff and commit the adapted files. Use a Conventional Commit title,
   such as `docs: add collaboration rules for humans and AI agents`.

The policies can be used without installing tooling. To include the documentation
CI job, also merge `package.json`, `.markdownlint-cli2.yaml`, `.editorconfig`, and
`.gitignore`, and copy `scripts/check-links.mjs` and `tests/check-links.test.mjs`.
For a project without an existing npm manifest, copy `package-lock.json` as well;
otherwise regenerate its lockfile after merging dependencies and scripts. Keep
the destination project's existing commands and settings. The wizard and the context budget
check need `scripts/setup.mjs`, `scripts/check-context.mjs`, `context-budget.json` and their
tests. Regenerate `AGENTS.md` and `docs/agents/` for that project; the checked-in AUTO sections
describe this kit.

See the [setup guide](COLLAB_KIT_README.md) for additional background and related
tools.

## Local checks

Use Node.js 22 or newer, npm, and Git. Install the pinned development tools once:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
```

Installation requires access to the npm registry unless the packages are cached.
After installation, all checks run locally without fetching external websites.

| Command | What it checks |
|---|---|
| `npm run lint` | Markdown style, including policies, templates, and skill files |
| `npm run check:links` | Local Markdown links, images, and Markdown heading fragments |
| `npm run check:context` | Estimated size of the instruction files each AI tool loads every session |
| `npm test` | Regression tests for the scripts, using Node's built-in test runner |
| `npm run check` | All four checks in sequence; stops on failure |
| `npm run setup` | Not a check: the interactive setup wizard for a project adopting the kit |
| `git diff --check` | Whitespace errors in tracked changes |

There is no application build, dev server, or static type-check for this kit.
Preview changed Markdown in your editor or GitHub as part of review.

The development dependencies have specific roles:
[markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) provides linting,
[markdown-it](https://github.com/markdown-it/markdown-it) parses Markdown links and
headings, and [github-slugger](https://github.com/Flet/github-slugger) generates
heading IDs. `.markdownlint-cli2.yaml` preserves the existing long tables, compact
lists, language-free code blocks, and tool files that do not begin with an H1.
`.editorconfig` allows Markdown hard line breaks; the linter checks their spacing.

The link checker includes tracked and unignored `.md` files, including hidden
configuration folders. It handles relative paths, root-relative paths, reference
links, and heading fragments. It does not validate external URLs, raw HTML links
or anchors, or fragment IDs in non-Markdown files. Keep shared documentation
links in Markdown syntax so they can be checked.

## Keeping agent context small

Every AI tool reloads its instruction files at the start of each session, and some reload them on
every turn, so each line in `AGENTS.md` is paid for again and again. This kit keeps that payload
small in three ways:

1. **`AGENTS.md` holds only what every task needs** — the golden rules, the project overview, the
   commands, and the Git/PR workflow.
2. **Reference material lives in [`docs/agents/`](docs/agents/)** — the repository map,
   conventions, and project notes, each with a "read this before …" trigger in `AGENTS.md`, so an
   agent opens the file when the task calls for it instead of carrying it everywhere.
3. **The tool-specific files stay pointers.** `CLAUDE.md`, the Cursor rule, and the Copilot
   instructions only point at `AGENTS.md`; Cursor and Copilot also read `AGENTS.md` natively, so a
   rules summary in a shim would be loaded, and paid for, twice.

`npm run check:context` measures what is left and fails when a tool's always-loaded context grows
past its budget:

```text
claude: ~1510 tokens of 1800 (6079 bytes) — ok
  CLAUDE.md: ~111 tokens
  AGENTS.md (imported by CLAUDE.md): ~1399 tokens
```

It follows Claude-style `@file` imports (so `CLAUDE.md` is counted together with `AGENTS.md`),
counts a Cursor rule only when it is `alwaysApply: true`, counts only the front matter of
`.claude/skills/*/SKILL.md` — that is the part agents load every session — and skips the files of
tools a project does not use. `--json` prints the report for other tooling, `--no-fail` reports
without gating, and `--budget <n>` overrides every budget for one run.

Budgets and file groups live in [`context-budget.json`](context-budget.json). **Token counts are
estimates:** the script divides characters by `charsPerToken` (4 by default), because the real
count depends on each model's tokenizer; bytes are shown alongside so the numbers can be checked
by hand. Treat the budget as a drift alarm — when it fires, shorten the rules or move detail into
`docs/agents/` rather than raising the number.

## Included skills

These skills are Markdown instructions stored under `.claude/skills/`.

| Skill | Who uses it | What it does |
|---|---|---|
| [`collab-rules-builder`](.claude/skills/collab-rules-builder/SKILL.md) | Maintainers | Reads the project, drafts the `<!-- AUTO -->` sections of `AGENTS.md`, and checks related documentation |
| [`onboard-me`](.claude/skills/onboard-me/SKILL.md) | New contributors | Explains the repository, setup, collaboration rules, and possible first tasks |
| [`pre-pr-check`](.claude/skills/pre-pr-check/SKILL.md) | Contributors preparing a PR | Runs project checks, reviews the change, and drafts PR text for human review |

In Claude Code, invoke a skill with `/collab-rules-builder`, `/onboard-me`, or
`/pre-pr-check`. With another assistant, ask it to follow the corresponding
`SKILL.md`, for example:

```text
Follow .claude/skills/onboard-me/SKILL.md to give me a tour of this repository.
```

## What CI checks

The [Collaboration rules workflow](.github/workflows/collab-rules.yml) runs when a
pull request is opened, edited, updated, or reopened. It checks that:

- The PR title follows the configured Conventional Commits pattern.
- The PR body contains a nonempty `AI disclosure:` line outside HTML comments.
- `AGENTS.md` exists and the four tool-specific configuration files still
  reference it.
- Markdown lint, local links, the agent context budget, and the script tests pass.

These checks validate contribution metadata, documentation, and instruction
references. Add your project's application lint, type-check, test, and build jobs
separately. Branch names, individual commit messages, review approvals, and the accuracy of an AI
disclosure are not validated by this workflow. Configure branch protection
separately as described above.

## Collaboration workflow

Read the [contribution guide](CONTRIBUTING.md), [agent rules](AGENTS.md),
[AI policy](AI_POLICY.md), and [Code of Conduct](CODE_OF_CONDUCT.md) before making
changes. The guide below brings the existing rules together with practical
examples. The linked policies remain the source for contribution requirements;
recommendations below describe useful team practices.

### 1. Discuss and claim the work

- Search existing issues and pull requests before proposing or starting work.
- For bugs, include what happened, expected behaviour, reproduction steps, and
  the environment. Add relevant logs or screenshots with sensitive data removed.
- For features, explain the problem, who it affects, the proposed solution, and
  alternatives. State whether you want to implement it.
- Follow `CONTRIBUTING.md`: open or claim an issue and wait for a maintainer's
  approval before work larger than a typo fix. The PR template exempts typo/doc
  fixes from its issue-approval checklist item; discuss broader documentation
  or policy changes first.
- Look for `good first issue` or `help wanted` when choosing a first task. Use
  Discussions or an issue labelled `question` for questions.

Recommended: agree on the expected result in the issue, post updates if you are
blocked, and say when you can no longer finish so someone else can take over.

### 2. Name your branch

Branch from `main` and use the prefixes defined in `AGENTS.md`:

| Work | Branch pattern | Example |
|---|---|---|
| New functionality | `feat/<short-name>` | `feat/contributor-onboarding` |
| Bug fix | `fix/<short-name>` | `fix/disclosure-validation` |
| Documentation | `docs/<short-name>` | `docs/collaboration-guide` |

Recommended: use a short, lowercase, hyphen-separated description. An issue
number can help connect work, for example `fix/42-disclosure-validation` where
`42` is an illustrative issue number. Avoid vague names such as `changes` or
`my-branch`. For work that does not fit these prefixes, agree on a convention
with the maintainer.

For example, with a clean working tree and your local `main` already up to date:

```bash
git switch main
git switch -c docs/collaboration-guide
```

Keep each branch focused on one concern. Follow the fork workflow in
`CONTRIBUTING.md` and submit the branch through a pull request.

### 3. Write clear commits

Commit messages and PR titles follow Conventional Commits. Use this shape:

```text
type(optional-scope): short description
```

These types are accepted by the included PR-title check:

| Type | Use for | Example |
|---|---|---|
| `feat` | New functionality | `feat(onboarding): add a contributor checklist` |
| `fix` | A bug fix | `fix: reject empty AI disclosures` |
| `docs` | Documentation | `docs: explain branch naming` |
| `style` | Formatting without behaviour changes | `style: normalize YAML indentation` |
| `refactor` | Restructuring without changing behaviour | `refactor: simplify disclosure validation` |
| `perf` | Performance improvements | `perf: reduce repeated file scans` |
| `test` | Tests | `test: cover commented disclosure examples` |
| `build` | Build tooling or dependencies | `build: update build tooling` |
| `ci` | CI configuration | `ci: adjust collaboration check triggers` |
| `chore` | Other maintenance | `chore: tidy repository metadata` |
| `revert` | Reverting an earlier change | `revert: undo onboarding changes` |

These examples illustrate naming, not changes that have already been made.
Scopes are optional; the CI pattern accepts lowercase letters, numbers, dots,
underscores, slashes, and hyphens inside a scope. Use a concrete description
such as `explain branch naming` instead of `updates` or `fix stuff`.

For an intentional breaking change, add `!` before the colon, for example
`feat(config)!: change the configuration format`, and explain the impact and
migration steps in the commit body and PR. Discuss public API changes with the
maintainer before implementation.

Recommended: keep each commit understandable on its own and use the body to
explain why a change is needed. When AI meaningfully helped with a commit, add
the required trailer after a blank line, replacing the placeholder with the
actual tool and model:

```text
docs: explain branch naming

Document the branch patterns contributors should use.

Assisted-by: <tool and model>
```

### 4. Make and verify the change

- Read the affected files and nearby tests, and follow existing patterns.
- Keep one concern per change and aim for fewer than 400 changed lines per PR.
  Separate unrelated formatting, renames, and refactors.
- Add or update tests when behaviour changes. Never delete, skip, or weaken
  tests to make checks pass.
- Update documentation when behaviour changes. Explain why in comments when
  the reason would otherwise be unclear.
- Run the applicable install, lint, type-check, test, and build commands from
  the adopting project's completed `AGENTS.md`. Manually check the feature;
  include screenshots or output for visual changes.
- Report the actual commands and results. If a check is unavailable or cannot
  run, state that explicitly instead of marking it as passed.
- Keep credentials and private data out of changes, examples, logs, and
  screenshots. Credit reused material and respect its licence.

For this kit, run `npm run check` and review the rendered documentation. Check
agent configuration references when changing instructions. Report application
build and type-check steps as not applicable.

### 5. Prepare the pull request

Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md) and complete every
section in your own words:

- **Purpose:** describe the problem, the resulting behaviour, and the scope.
- **Issue:** link the real issue. Use `Closes #123` only when the PR resolves
  that issue; `123` here is an example, not an existing issue reference.
- **Verification:** list commands, results, manual checks, and any limitations.
- **Checklist:** tick only the items that are true.
- **AI disclosure:** keep a nonempty `AI disclosure:` line outside HTML comments.

Use a Conventional Commit PR title that describes the final change. For early
feedback, a draft PR is recommended; make it ready for review when the change
and its verification are complete. `/pre-pr-check` can help review the branch,
but the human contributor reviews, rewrites, and submits the PR.

Disclose AI-generated or rewritten code, tests, or documentation that you keep,
as well as adopted AI suggestions. For example, only if accurate:

```text
AI disclosure: Used Codex to draft the README; I reviewed the changes and checked the links.
```

If you used no AI, write `AI disclosure: None.` A filled-in line passes the
metadata check; the contributor is responsible for making it accurate. See
[`AI_POLICY.md`](AI_POLICY.md) for the full disclosure rules.

### 6. Review, update, and merge

- Respond to review comments yourself. Explain your reasoning and ask for
  clarification when feedback is unclear.
- Keep discussion respectful and focused on the work. Maintainers may request
  a smaller scope, a simpler solution, or separate PRs.
- When you change the implementation, rerun the relevant checks and update
  the PR description and verification evidence to match the final result.
- Follow `CONTRIBUTING.md` for review timing; it notes that inactive PRs with
  no response for 30 days may be closed.

Recommended: agree with collaborators before rewriting a shared branch's
history. When resolving conflicts, preserve both changes' intended behaviour
and rerun affected checks. Ask a maintainer when a conflict involves a design
decision.

Merge according to the adopting repository's configured approvals and required
checks. This kit does not prescribe squash, merge commits, or rebase merging;
maintainers should document their choice. After merging, confirm the linked
issue reflects the outcome and remove the completed branch when it is no
longer needed. Agents must follow `AGENTS.md` approval rules for any cleanup.

### Maintainer setup checklist

- [ ] Complete the project-specific sections of `AGENTS.md` with verified facts.
- [ ] Replace the repository URL and maintainer contact placeholders.
- [ ] Confirm the contribution policies, licence, and issue labels fit the project.
- [ ] Enable Discussions if using the supplied questions link.
- [ ] Configure branch protection, required checks, and review approvals.
- [ ] Add the project's own lint, type-check, test, and build checks.
- [ ] Document the team's merge strategy and any additional branch conventions.
- [ ] Keep review ownership clear; consider a `CODEOWNERS` file as the team grows.
- [ ] Consider a `SECURITY.md` with a private reporting route if the project needs one.

`CODEOWNERS` and `SECURITY.md` are optional additions and are not included in this
kit. GitHub settings must be configured by a maintainer; copying these files
does not enable them automatically.

## Licence

This project is licensed under the [Apache License 2.0](LICENSE).
