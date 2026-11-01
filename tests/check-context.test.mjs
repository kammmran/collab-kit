import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkContext, estimateTokens } from "../scripts/check-context.mjs";

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), "collab-kit-context-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(root, name, ".."), { recursive: true });
    writeFileSync(join(root, name), content);
  }
  return root;
}

const group = (name) => (result) => result.groups.find((entry) => entry.name === name);

test("estimates tokens from characters and honours charsPerToken", () => {
  assert.equal(estimateTokens("12345678"), 2);
  assert.equal(estimateTokens("12345678", 2), 4);
  assert.equal(estimateTokens("123", 2), 2);
  assert.equal(estimateTokens(""), 0);
  assert.throws(() => estimateTokens("x", 0), TypeError);
});

test("follows @imports transitively, once per file, and survives a cycle", (t) => {
  const root = fixture(t, {
    "CLAUDE.md": "@AGENTS.md and @AGENTS.md again\n",
    "AGENTS.md": "@docs/agents/notes.md\n",
    "docs/agents/notes.md": "@../../CLAUDE.md\n",
  });
  const result = checkContext(root, { groups: { claude: { entries: ["CLAUDE.md"], budget: 100 } } });
  assert.deepEqual(group("claude")(result).files.map((file) => file.path),
    ["CLAUDE.md", "AGENTS.md", "docs/agents/notes.md"]);
  assert.deepEqual(result.errors, []);
});

test("ignores @imports in code blocks and non-existent targets", (t) => {
  const root = fixture(t, {
    "CLAUDE.md": "`@AGENTS.md` and\n\n```text\n@AGENTS.md\n```\n\n@missing.md k.a.heydarov@example.invalid\n",
    "AGENTS.md": "rules\n",
  });
  const result = checkContext(root, { groups: { claude: { entries: ["CLAUDE.md"] } } });
  assert.deepEqual(group("claude")(result).files.map((file) => file.path), ["CLAUDE.md"]);
});

test("counts only front matter for skill entries and expands globs", (t) => {
  const body = "x".repeat(400);
  const root = fixture(t, {
    ".claude/skills/a/SKILL.md": `---\nname: a\ndescription: one\n---\n\n${body}`,
    ".claude/skills/b/SKILL.md": `---\nname: b\ndescription: two\n---\n\n${body}`,
  });
  const result = checkContext(root, {
    groups: { skills: { entries: [".claude/skills/*/SKILL.md"], frontMatterOnly: true, budget: 100 } },
  });
  const skills = group("skills")(result);
  assert.deepEqual(skills.files.map((file) => file.path),
    [".claude/skills/a/SKILL.md", ".claude/skills/b/SKILL.md"]);
  assert.ok(skills.tokens < 20, `front matter only, got ${skills.tokens} tokens`);
  assert.deepEqual(result.errors, []);
});

test("reports a group over budget and leaves one under budget alone", (t) => {
  const root = fixture(t, { "AGENTS.md": "y".repeat(800) });
  const result = checkContext(root, {
    groups: { gemini: { entries: ["AGENTS.md"], budget: 100 }, spare: { entries: ["AGENTS.md"], budget: 500 } },
  });
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /^gemini: 200 estimated tokens .* exceed the budget of 100/);
  assert.equal(group("gemini")(result).tokens, 200);
});

test("skips absent entries and Cursor rules that are not always applied", (t) => {
  const root = fixture(t, {
    ".cursor/rules/on.mdc": "---\nalwaysApply: true\n---\n\nfollow AGENTS.md\n",
    ".cursor/rules/off.mdc": `---\nalwaysApply: false\n---\n\n${"z".repeat(4000)}`,
  });
  const result = checkContext(root, {
    groups: { cursor: { entries: [".cursor/rules/*.mdc", "AGENTS.md", ".windsurf/*.md"], budget: 100 } },
  });
  const cursor = group("cursor")(result);
  assert.deepEqual(cursor.files.map((file) => file.path), [".cursor/rules/on.mdc"]);
  assert.deepEqual(cursor.skipped, ["AGENTS.md", ".windsurf/*.md"]);
  assert.deepEqual(result.errors, []);
});

test("rejects a context file outside the repository", (t) => {
  const root = fixture(t, { "CLAUDE.md": "rules\n" });
  const result = checkContext(root, { groups: { claude: { entries: ["../outside.md"] } } });
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /outside the repository/);
});
