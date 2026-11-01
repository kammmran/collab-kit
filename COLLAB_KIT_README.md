# Collaboration kit — setup guide

Drop-in rules so new collaborators (humans **and** their AI assistants) follow the same rules on
your project. Delete this file after setup.

## What's inside

```
AGENTS.md                         ← single source of truth for ALL AI agents (loaded every session)
docs/agents/                      ← repo map, conventions, project notes: read on demand
context-budget.json               ← token budgets for the always-loaded instruction files
CLAUDE.md                         ← Claude Code: imports @AGENTS.md
.cursor/rules/project.mdc         ← Cursor: always-on rule pointing to AGENTS.md
.github/copilot-instructions.md   ← GitHub Copilot: points to AGENTS.md
.gemini/settings.json             ← Gemini CLI: reads AGENTS.md as its context file
                                    (Codex, Jules, Windsurf, Zed, Aider, Devin read AGENTS.md natively)

CONTRIBUTING.md                   ← rules for humans
AI_POLICY.md                      ← AI-assisted yes, AI-driven no; disclosure rules
CODE_OF_CONDUCT.md
.github/PULL_REQUEST_TEMPLATE.md  ← includes required "AI disclosure:" line
.github/ISSUE_TEMPLATE/           ← bug / feature forms (claim-before-you-code)
.github/workflows/collab-rules.yml← CI: Conventional-Commit PR title, AI disclosure filled,
                                    per-LLM files still point to AGENTS.md

.claude/skills/
  collab-rules-builder/  ← YOU run it: Claude Code reads the repo and fills AGENTS.md
  onboard-me/            ← newcomers run it: guided tour + good first tasks
  pre-pr-check/          ← contributors run it before a PR: checks + drafts PR with disclosure

scripts/setup.mjs                 ← `npm run setup`: asks about your project, fills the files in
scripts/check-context.mjs         ← `npm run check:context`: fails if the rules get too big
```

## Install (5 minutes)

```bash
# 1. merge the files listed in README.md into your project
# Keep its existing README, package scripts, configuration, and Git metadata.
cd /path/to/your-repo

# 2. answer the setup questions in the terminal; nothing is written until you confirm
npm run setup                 # or: npm run setup -- --dry-run to see the detected answers

# 3. let Claude Code read the project and replace the remaining TODOs
claude
> /collab-rules-builder

# 4. review the diff, answer the TODOs, then commit
git add AGENTS.md CLAUDE.md CONTRIBUTING.md AI_POLICY.md CODE_OF_CONDUCT.md docs .github .claude .cursor .gemini
git commit -m "docs: add collaboration rules for humans and AI agents"
```

Then on GitHub:
- **Settings → General → Features:** enable Discussions (the issue template links to it).
- **Settings → Branches:** protect `main` — require a PR, 1 approval, and the
  `Collaboration rules` checks to pass.
- Create labels `good first issue`, `help wanted`, `bug`, `enhancement`, `triage`, `question`.
- Set the Discussions URL to your repository and review the Code of Conduct reporting guidance.

The current `AGENTS.md` and `docs/agents/` AUTO sections describe this kit; `npm run setup`
replaces them with your answers and TODOs, and `/collab-rules-builder` drafts the rest.
Because every agent reloads `AGENTS.md` in every session, keep the detail in `docs/agents/` and
let `npm run check:context` tell you when the always-loaded rules have grown too big — see
[keeping agent context small](README.md#keeping-agent-context-small). The documentation CI job also needs the check tooling listed
in [README.md](README.md#set-up-in-your-project). Merge those files with existing
tooling before enabling the job. For local verification, follow the
[local check commands](README.md#local-checks).

## How it works across LLMs

AGENTS.md is the open, tool-neutral format (now stewarded under the Linux Foundation) that most
coding agents auto-discover. The tools that use their own file names get a tiny "shim" that
points back to it, so you only ever edit **one** file. The CI job fails if a shim gets
disconnected.

## Useful GitHub repos (found while building this)

| Repo | What it's for | When to use it |
|---|---|---|
| [agents.md](https://agents.md/) | The AGENTS.md open standard + examples | Reference for what to put in AGENTS.md |
| [intellectronica/ruler](https://github.com/intellectronica/ruler) | Keep rules in a `.ruler/` folder and `ruler apply` writes CLAUDE.md, AGENTS.md, Copilot, Cursor, Windsurf, Cline, Kiro… files; also MCP + skills; has a CI "in sync" check | If your rules grow into many files, or you want 15+ tools covered |
| [dyoshikawa/rulesync](https://github.com/dyoshikawa/rulesync) | Similar: one `.rulesync/` source → rules, ignore files, MCP, commands, subagents, skills for 20+ tools; can **import** an existing CLAUDE.md/.cursorrules | If collaborators already have their own rule files to merge |
| [fialhosoft/agentlink](https://github.com/fialhosoft/agentlink) | Keeps AGENTS.md + `.agents/skills` canonical and symlinks/stubs them for Claude, Cursor, Copilot | If you want skills shared across agents without copies |
| [Zrzzzz/agent-codebase-skills](https://github.com/Zrzzzz/agent-codebase-skills) | Claude Code skills (`init-agents-md` etc.) that read a codebase and write AGENTS.md | Alternative/companion to `collab-rules-builder` |
| [Edwarddev0723/ds-agent-rules](https://github.com/edwarddev0723/ds-agent-rules) | Ready-made rule presets for data science / ML / LLM projects, synced to Claude, Copilot, Codex, Gemini, Cursor, Windsurf | Good extra rules for your ML / science projects |
| [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) | Huge library of stack-specific rule files | Borrow stack rules (React, Python, TypeScript…) into AGENTS.md §4 |
| [Adobe AI repo harness guide](https://opensource.adobe.com/ai-repo-harness-guide/) | Pattern: CLAUDE.md = only `@AGENTS.md`; skills in `.agents/skills` symlinked into `.claude/skills` | If you later move skills to `.agents/skills/` |
| [bgtvdm/context-optimizer](https://github.com/bgtvdm/context-optimizer) | Skill that audits CLAUDE.md / AGENTS.md / knowledge bases and writes a token-cost plan per file | A deeper one-off audit than `npm run check:context` gives |
| [wrsmith108/claude-md-optimizer](https://github.com/wrsmith108/claude-md-optimizer) · [CaesiumY/agents-md-optimizer](https://github.com/CaesiumY/agents-md-optimizer) | Shrink an oversized rules file by progressive disclosure, or by dropping what an agent can discover from the code anyway | The method this kit's `docs/agents/` split follows |
| [skillbudget](https://pypi.org/project/mujin-skillbudget/) | Python CLI that budgets always-loaded agent context (CLAUDE.md, skill descriptions, Cursor rules) and fails CI | If you prefer a published tool over this kit's `check:context` script |

AI-contribution policies this kit's `AI_POLICY.md` is modelled on:
[Node.js](https://github.com/nodejs/node/blob/main/doc/contributing/ai-guidelines.md) ·
[Coder](https://coder.com/docs/about/contributing/AI_CONTRIBUTING) ·
[Seerr](https://github.com/seerr-team/seerr/blob/develop/CONTRIBUTING.md) ·
[Apache SystemDS proposal](https://github.com/apache/systemds/pull/2570).

## Optional: switch to Ruler later

If you outgrow the shims:

```bash
npm install -g @intellectronica/ruler
ruler init                       # creates .ruler/
mv AGENTS.md .ruler/AGENTS.md    # your rules become the source
ruler apply                      # regenerates every agent's file
```
