---
name: onboard-me
description: Give a new contributor a guided tour of this repository — what it does, how it is organised, how to run and test it, the collaboration rules, and a few good first tasks. Use when someone is new to the project or asks where to start.
---

# Onboard a new contributor

The person you're talking to is **new to this project**. Your job is to get them productive and
make sure they know the rules — not to write code for them yet.

## 1. Read first

Read `AGENTS.md`, `CONTRIBUTING.md`, `AI_POLICY.md`, `README*`, the top-level folder tree, and the
CI workflows in `.github/workflows/`. Skim 2–3 core source files.

## 2. Ask one question

Ask what they want to do (fix a bug, add a feature, improve docs, add data/science content) and
their experience with the stack. Adapt everything below to the answer.

## 3. Give the tour (short, in plain language)

1. **What the project is** — 2–3 sentences.
2. **Map** — the 5–8 folders/files that matter, with what lives in each. Point at one example
   file they can copy patterns from.
3. **Run it** — the install / run / test commands from `AGENTS.md §3`. Offer to run them with
   them and explain any failure.
4. **The rules that matter most** — in 5 bullets: claim an issue first; small focused PRs;
   Conventional Commits; tests must pass; **disclose AI use** in the PR and own every line.
5. **Good first tasks** — if GitHub CLI is available, run
   `gh issue list --label "good first issue" --state open --limit 10`; otherwise suggest 2–3
   small, concrete improvements you noticed (missing test, unclear doc, small bug), each with the
   files involved.

## 4. Hand-off

Remind them to comment on the issue they pick and wait for the maintainer's OK, and that
`/pre-pr-check` will check their work before they open a PR.

Do **not** open issues, PRs or comments on GitHub yourself.
