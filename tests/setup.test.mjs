import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { applyAnswers, detectDefaults, fillSection, repoSlug, QUESTIONS } from "../scripts/setup.mjs";

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), "collab-kit-setup-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(root, name, ".."), { recursive: true });
    writeFileSync(join(root, name), content);
  }
  return root;
}

const AGENTS = [
  "# AGENTS.md", "", "## 0. Golden rules", "", "1. A human owns every change.", "",
  "## 1. Project overview <!-- AUTO -->", "", "- **What it is:** the kit itself.", "",
  "## 2. Repository map", "", "Read docs/agents/repo-map.md.", "",
  "## 3. Setup, build, test <!-- AUTO -->", "", "```bash", "npm ci", "```", "",
  "## 5. Git & PR workflow", "", "- Branch from `main`.", "",
].join("\n");

const kit = (extra = {}) => ({
  "AGENTS.md": AGENTS,
  "docs/agents/repo-map.md": "# Repository map <!-- AUTO -->\n\nthe kit's own map\n",
  "docs/agents/conventions.md": "# Code conventions <!-- AUTO -->\n\nthe kit's own conventions\n",
  "docs/agents/project-notes.md": "# Project-specific notes <!-- AUTO -->\n\nthe kit's own notes\n",
  "context-budget.json": JSON.stringify({
    charsPerToken: 4,
    defaultBudget: 1800,
    groups: {
      claude: { entries: ["CLAUDE.md"] },
      cursor: { entries: [".cursor/rules/*.mdc", "AGENTS.md"] },
      skills: { entries: [".claude/skills/*/SKILL.md"], frontMatterOnly: true, budget: 400 },
    },
  }, null, 2) + "\n",
  ".github/ISSUE_TEMPLATE/config.yml": "contact_links:\n  - url: https://github.com/kammmran/collab-kit/discussions\n",
  "CODE_OF_CONDUCT.md": "Report to **_maintainer contact email_**. Reports are kept confidential.\n",
  ...extra,
});

const answered = (answers) => Object.fromEntries(QUESTIONS.map(({ key }) => [key, answers[key] ?? ""]));
const changed = (plan, path) => plan.changes.find((change) => change.path === path)?.contents;

test("parses a repository slug from ssh and https remotes", () => {
  assert.equal(repoSlug("git@github.com:kammmran/collab-kit.git"), "kammmran/collab-kit");
  assert.equal(repoSlug("https://github.com/kammmran/collab-kit"), "kammmran/collab-kit");
  assert.equal(repoSlug(""), "");
});

test("detects defaults from the manifest and lockfile without inventing any", (t) => {
  const root = fixture(t, {
    "package.json": JSON.stringify({ name: "demo", engines: { node: ">=22" }, scripts: { lint: "x", test: "y" } }),
    "package-lock.json": "{}",
    "tsconfig.json": "{}",
  });
  const defaults = detectDefaults(root);
  assert.equal(defaults.name, "demo");
  assert.equal(defaults.languages, "TypeScript");
  assert.equal(defaults.runtime, "Node.js >=22");
  assert.equal(defaults.install, "npm ci");
  assert.equal(defaults.checks, "npm run lint, npm test");
  assert.equal(defaults.description, "");
  assert.deepEqual(defaults.tools, []);
});

test("prefers a single check script and falls back to the folder name", (t) => {
  const root = fixture(t, {
    "package.json": JSON.stringify({ scripts: { lint: "x", test: "y", check: "z" } }),
    "requirements.txt": "",
  });
  const defaults = detectDefaults(root);
  assert.equal(defaults.checks, "npm run check");
  assert.equal(defaults.languages, "JavaScript, Python");
  assert.equal(defaults.install, "pip install -r requirements.txt");
  assert.ok(defaults.name.startsWith("collab-kit-setup-"));
});

test("fillSection replaces one section body and reports a missing heading", () => {
  const filled = fillSection(AGENTS, "## 1. Project overview", "- **What it is:** a demo.");
  assert.match(filled, /## 1\. Project overview <!-- AUTO -->\n\n- \*\*What it is:\*\* a demo\.\n\n## 2\. Repository map/);
  assert.match(filled, /## 0\. Golden rules\n\n1\. A human owns every change\./);
  assert.equal(fillSection(AGENTS, "## 9. Nothing", "body"), null);
});

test("writes the answers into AGENTS.md, the templates and the budget", (t) => {
  const root = fixture(t, kit());
  const plan = applyAnswers(root, answered({
    name: "demo", description: "A demo service", repo: "acme/demo", languages: "Python",
    runtime: "Python 3.12", install: "uv sync", checks: "ruff check ., pytest",
    tools: ["claude"], email: "conduct@example.invalid", budget: 900,
  }));

  const agents = changed(plan, "AGENTS.md");
  assert.match(agents, /- \*\*What it is:\*\* A demo service \(see `README\.md`\)\./);
  assert.match(agents, /- \*\*Repository:\*\* `acme\/demo`\./);
  assert.match(agents, /```bash\nuv sync {3}# once per checkout\nruff check \.\npytest\ngit diff --check\n```/);
  assert.match(agents, /Definition of done for any change:\*\* install ✔ · ruff check \. ✔ · pytest ✔/);
  assert.match(agents, /1\. A human owns every change\./, "golden rules are untouched");
  assert.match(agents, /## 2\. Repository map\n\nRead docs\/agents\/repo-map\.md\./, "pointers are untouched");

  assert.match(changed(plan, "docs/agents/repo-map.md"), /^# Repository map <!-- AUTO -->/);
  assert.match(changed(plan, "docs/agents/repo-map.md"), /_TODO\(maintainer\): describe this for demo/);
  assert.equal(changed(plan, "CODE_OF_CONDUCT.md"), "Report to **conduct@example.invalid**. Reports are kept confidential.\n");
  assert.match(changed(plan, ".github/ISSUE_TEMPLATE/config.yml"), /https:\/\/github\.com\/acme\/demo\/discussions/);

  const budget = JSON.parse(changed(plan, "context-budget.json"));
  assert.equal(budget.defaultBudget, 900);
  assert.deepEqual(Object.keys(budget.groups), ["claude", "skills"], "unused tool groups are dropped, skills kept");
  assert.equal(budget.charsPerToken, 4);
});

test("leaves TODOs instead of inventing unanswered values", (t) => {
  const root = fixture(t, kit());
  const plan = applyAnswers(root, answered({ name: "demo", tools: ["claude"] }));
  const agents = changed(plan, "AGENTS.md");
  assert.match(agents, /_TODO\(maintainer\): describe the project in one sentence_/);
  assert.match(agents, /_TODO\(maintainer\): set owner\/name_/);
  assert.match(agents, /# _TODO\(maintainer\): add the install command_/);
  assert.match(agents, /# _TODO\(maintainer\): add the lint, test and build commands_/);
  assert.equal(changed(plan, "CODE_OF_CONDUCT.md"), undefined, "no email answered, placeholder kept");
  assert.equal(changed(plan, ".github/ISSUE_TEMPLATE/config.yml"), undefined, "no repo answered, URL kept");
});

test("lists tool files to delete without touching them, and notes missing kit files", (t) => {
  const root = fixture(t, { ...kit(), "CLAUDE.md": "@AGENTS.md\n", ".gemini/settings.json": "{}\n" });
  const plan = applyAnswers(root, answered({ name: "demo", tools: ["claude"] }));
  assert.deepEqual(plan.removals, [".gemini/settings.json"]);
  assert.equal(readFileSync(join(root, ".gemini/settings.json"), "utf8"), "{}\n", "applyAnswers never writes or deletes");

  const bare = fixture(t, { "CODE_OF_CONDUCT.md": "x\n" });
  const notes = applyAnswers(bare, answered({ name: "demo", tools: ["claude"] })).notes;
  assert.match(notes.join("\n"), /AGENTS\.md is missing/);
  assert.match(notes.join("\n"), /docs\/agents\/repo-map\.md is missing/);
});

test("is idempotent: the second run plans no changes", (t) => {
  const root = fixture(t, kit());
  const answers = answered({
    name: "demo", description: "A demo service", repo: "acme/demo", languages: "Python",
    runtime: "Python 3.12", install: "uv sync", checks: "pytest",
    tools: ["claude", "cursor"], email: "conduct@example.invalid", budget: 900,
  });
  for (const change of applyAnswers(root, answers).changes) {
    writeFileSync(join(root, change.path), change.contents);
  }
  assert.deepEqual(applyAnswers(root, answers).changes, []);
});
