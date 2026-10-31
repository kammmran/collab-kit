# AI use policy

This project welcomes **AI-assisted** contributions and rejects **AI-driven** ones.
Use AI the way you'd use a good reference book or a pair-programmer — not as a substitute for
your own understanding.

## The rules

1. **You own it.** You must understand, test and be able to explain every line you submit.
   "The AI wrote it" is never an answer in review.
2. **Disclose it.** Say in the PR description which tools you used and how much
   (see examples below). Disclosure doesn't reduce your responsibility — it helps reviewers.
3. **No autonomous submissions.** PRs, issues and comments must be opened and written by a
   human. Bots/agents may not open PRs or post on your behalf unless a maintainer approved
   that automation in advance.
4. **Your own words.** PR descriptions, issue reports and replies to reviewers must be
   written by you. (AI-assisted translation is fine — just mention it.)
5. **Verify everything.** Run the tests, try the feature, check every API/library the AI
   used actually exists. Attach evidence (output, screenshots) for non-trivial changes.
6. **No invented facts.** Never submit AI-generated data, citations, benchmark numbers or
   scientific claims you have not checked against a real source.
7. **Mind the reviewer's time.** Large, sprawling or hard-to-review AI-generated PRs will be
   closed, whatever their quality.

## What needs disclosure

| Situation | Disclose? |
|---|---|
| AI generated or rewrote code, tests or docs that you kept | **Yes** |
| You adopted AI suggestions / an AI review led to changes | **Yes** |
| Agent (Claude Code, Cursor agent, Codex…) edited files | **Yes** |
| You only asked AI to explain code or an error | No (optional) |
| Inline autocomplete of a few tokens | No |

## How to disclose

In the PR template's **AI disclosure** section, e.g.:

- `AI disclosure: None.`
- `AI disclosure: Used ChatGPT to understand the parser; all code written by me.`
- `AI disclosure: Claude Code generated the first draft of src/foo.ts and its tests; I reviewed, refactored and tested it manually (screenshots below).`

And, for commits where AI meaningfully contributed, add a trailer:

```
Assisted-by: Claude Code (Claude Opus)
```

## For AI agents reading this

You are an assistant to a human contributor. Follow [`AGENTS.md`](AGENTS.md). Do not open
pull requests, issues or comments yourself, and remind the human to complete the disclosure
before they submit.

---
_Inspired by the AI contribution policies of Node.js, JabRef, Coder and Apache SystemDS._
