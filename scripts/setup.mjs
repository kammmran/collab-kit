// Interactive setup for a project adopting this kit: asks a short list of questions in the
// terminal, then fills in the project-specific parts of AGENTS.md, docs/agents/, the issue
// templates, the code of conduct and the context budget. Nothing is written until the planned
// changes have been shown and confirmed, nothing is deleted without a separate confirmation, and
// no answer is invented — unanswered questions are left as `_TODO(maintainer): …_`.
//
// Usage: npm run setup [-- --yes] [-- --dry-run]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { basename, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { checkContext, formatReport, loadConfig } from "./check-context.mjs";
import { fileURLToPath } from "node:url";

const TOOL_FILES = {
  claude: ["CLAUDE.md"],
  cursor: [".cursor/rules/project.mdc"],
  copilot: [".github/copilot-instructions.md"],
  gemini: [".gemini/settings.json"],
};

const TODO = (what) => `_TODO(maintainer): ${what}_`;

function read(root, path) {
  const file = resolve(root, path);
  return existsSync(file) ? readFileSync(file, "utf8") : null;
}

function git(root, args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

export function repoSlug(remote) {
  const match = remote.match(/[:/]([^/:]+)\/([^/]+?)(?:\.git)?$/);
  return match ? `${match[1]}/${match[2]}` : "";
}

export function detectDefaults(root) {
  const manifest = read(root, "package.json");
  const pkg = manifest ? JSON.parse(manifest) : null;
  const has = (path) => existsSync(resolve(root, path));

  const languages = [
    has("tsconfig.json") && "TypeScript",
    pkg && !has("tsconfig.json") && "JavaScript",
    (has("pyproject.toml") || has("requirements.txt")) && "Python",
    has("Cargo.toml") && "Rust",
    has("go.mod") && "Go",
    has("pom.xml") || has("build.gradle") ? "Java" : "",
  ].filter(Boolean);

  const install = has("package-lock.json") ? "npm ci"
    : has("pnpm-lock.yaml") ? "pnpm install --frozen-lockfile"
      : has("yarn.lock") ? "yarn install --immutable"
        : has("requirements.txt") ? "pip install -r requirements.txt"
          : has("Cargo.toml") ? "cargo fetch"
            : has("go.mod") ? "go mod download" : "";

  const scripts = Object.keys(pkg?.scripts ?? {});
  // A single `check` script usually runs the others; otherwise list what exists.
  const checks = scripts.includes("check") ? ["npm run check"]
    : ["lint", "typecheck", "type-check", "test", "build"]
      .filter((script) => scripts.includes(script))
      .map((script) => (script === "test" ? "npm test" : `npm run ${script}`));

  return {
    name: pkg?.name ?? basename(resolve(root)),
    description: pkg?.description ?? "",
    repo: repoSlug(git(root, ["remote", "get-url", "origin"])),
    languages: languages.join(", "),
    runtime: pkg?.engines?.node ? `Node.js ${pkg.engines.node}` : "",
    install,
    checks: checks.join(", "),
    tools: Object.keys(TOOL_FILES).filter((tool) => TOOL_FILES[tool].every((path) => has(path))),
    email: git(root, ["config", "user.email"]),
    budget: 1800,
  };
}

export const QUESTIONS = [
  { key: "name", ask: "Project name" },
  { key: "description", ask: "One sentence: what is this project?" },
  { key: "repo", ask: "GitHub repository (owner/name)" },
  { key: "languages", ask: "Languages and stack (comma separated)" },
  { key: "runtime", ask: "Runtime / toolchain requirement, e.g. Node.js >= 22" },
  { key: "install", ask: "Install command" },
  { key: "checks", ask: "Check commands that must pass, separated by commas" },
  { key: "tools", ask: `AI tools to keep configured (${Object.keys(TOOL_FILES).join(", ")}, or all)`, list: true },
  { key: "email", ask: "Contact for code of conduct reports" },
  { key: "budget", ask: "Token budget per tool for always-loaded instructions", number: true },
];

export function fillSection(source, heading, body) {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => line.startsWith(heading));
  if (start === -1) return null;
  let end = start + 1;
  while (end < lines.length && !/^## /.test(lines[end])) end += 1;
  return [...lines.slice(0, start + 1), "", ...body.trim().split("\n"), "", ...lines.slice(end)].join("\n");
}

function overview(answers) {
  const value = (text, what) => (text?.trim() ? text.trim() : TODO(what));
  return [
    `- **What it is:** ${value(answers.description, "describe the project in one sentence")} (see \`README.md\`).`,
    `- **Repository:** \`${value(answers.repo, "set owner/name")}\`.`,
    `- **Languages:** ${value(answers.languages, "list the languages and stack")}.`,
    `- **Runtime:** ${value(answers.runtime, "state the runtime and version")}.`,
  ].join("\n");
}

function commands(answers) {
  const checks = String(answers.checks ?? "").split(/[,\n]/).map((check) => check.trim()).filter(Boolean);
  const install = answers.install?.trim();
  const block = [
    install ? `${install}   # once per checkout` : `# ${TODO("add the install command")}`,
    ...(checks.length ? checks : [`# ${TODO("add the lint, test and build commands")}`]),
    "git diff --check",
  ];
  return [
    "```bash",
    ...block,
    "```",
    "",
    `**Definition of done for any change:** install ✔ · ${checks.length ? checks.join(" ✔ · ") + " ✔" : "checks ✔"}`
    + " · agent context budget ✔ · manually checked the feature works (screenshot or output for"
    + " UI/visual changes).",
    "",
    TODO("confirm these commands match CI, and add anything CI runs that is missing"),
  ].join("\n");
}

function referenceStub(title, project, guidance) {
  return `# ${title} <!-- AUTO -->\n\n${guidance}\n\n${TODO(`describe this for ${project}, or run the \`collab-rules-builder\` skill to draft it from the codebase`)}\n`;
}

export function applyAnswers(root, answers) {
  const changes = [];
  const notes = [];
  const project = answers.name?.trim() || "this project";
  const tools = answers.tools?.length ? answers.tools : Object.keys(TOOL_FILES);

  const agents = read(root, "AGENTS.md");
  if (!agents) {
    notes.push("AGENTS.md is missing — copy it from the kit before running setup.");
  } else {
    let next = fillSection(agents, "## 1. Project overview", overview(answers));
    next = next === null ? null : fillSection(next, "## 3. Setup, build, test", commands(answers));
    if (next === null) notes.push("AGENTS.md has no '## 1. Project overview' or '## 3. Setup, build, test' heading; left unchanged.");
    else if (next !== agents) changes.push({ path: "AGENTS.md", contents: next });
  }

  const references = [
    ["docs/agents/repo-map.md", "Repository map",
      "Read this before creating, moving or deleting files, or when you need to know where something lives. It also holds the paths agents must not edit without permission."],
    ["docs/agents/conventions.md", "Code conventions",
      "Read this before writing or editing code, Markdown or configuration."],
    ["docs/agents/project-notes.md", "Project-specific notes",
      "Read this before changing the checks, the skills, CI, or anything domain-specific."],
  ];
  for (const [path, title, guidance] of references) {
    const current = read(root, path);
    const contents = referenceStub(title, project, `${guidance} The always-loaded rules are in [\`AGENTS.md\`](../../AGENTS.md).`);
    if (current === null) notes.push(`${path} is missing — copy \`docs/agents/\` from the kit.`);
    else if (current !== contents) changes.push({ path, contents });
  }

  const budgetFile = read(root, "context-budget.json");
  if (budgetFile) {
    const config = JSON.parse(budgetFile);
    const budget = Number(answers.budget);
    if (Number.isFinite(budget) && budget > 0) config.defaultBudget = budget;
    config.groups = Object.fromEntries(Object.entries(config.groups ?? {})
      .filter(([group]) => tools.includes(group) || !(group in TOOL_FILES)));
    const contents = `${JSON.stringify(config, null, 2)}\n`;
    if (contents !== budgetFile) changes.push({ path: "context-budget.json", contents });
  }

  const config = read(root, ".github/ISSUE_TEMPLATE/config.yml");
  if (config && answers.repo?.trim()) {
    const contents = config.replace(/https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/discussions/g,
      `https://github.com/${answers.repo.trim()}/discussions`);
    if (contents !== config) changes.push({ path: ".github/ISSUE_TEMPLATE/config.yml", contents });
  }

  const conduct = read(root, "CODE_OF_CONDUCT.md");
  if (conduct && answers.email?.trim()) {
    const contents = conduct.replace(/_maintainer contact email_/g, answers.email.trim());
    if (contents !== conduct) changes.push({ path: "CODE_OF_CONDUCT.md", contents });
  }

  const removals = Object.entries(TOOL_FILES)
    .filter(([tool]) => !tools.includes(tool))
    .flatMap(([, paths]) => paths)
    .filter((path) => existsSync(resolve(root, path)));

  return { changes, notes, removals };
}

class Cancelled extends Error {}

// A terminal gets real prompts; piped input (one answer per line) is replayed through the same
// questions so the wizard can be scripted. Either way, running out of input or pressing Ctrl+C
// or Ctrl+D cancels without writing anything, and never hangs.
function asker() {
  if (process.stdin.isTTY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const ask = async (text) => {
      let onClose;
      try {
        return await Promise.race([
          rl.question(text),
          new Promise((_, reject) => {
            onClose = () => reject(new Cancelled());
            rl.once("close", onClose);
          }),
        ]);
      } catch (error) {
        if (error instanceof Cancelled || error?.code === "ABORT_ERR") throw new Cancelled();
        throw error;
      } finally {
        if (onClose) rl.off("close", onClose);
      }
    };
    return { ask, close: () => rl.close() };
  }

  let lines = [];
  try {
    lines = readFileSync(0, "utf8").split("\n");
    if (lines.at(-1) === "") lines.pop();
  } catch {
    lines = [];
  }
  let index = 0;
  return {
    ask: async (text) => {
      if (index >= lines.length) throw new Cancelled();
      const answer = lines[index++];
      process.stdout.write(`${text}${answer}\n`);
      return answer;
    },
    close: () => {},
  };
}

async function prompt(root, defaults) {
  const rl = asker();
  const answers = {};
  console.log("\nSetting up this project's collaboration rules. Press Enter to accept the value in"
    + " brackets, or type a new one.\n");
  try {
    for (const question of QUESTIONS) {
      const fallback = defaults[question.key];
      const shown = Array.isArray(fallback) ? fallback.join(", ") : String(fallback ?? "");
      const answer = (await rl.ask(`${question.ask}${shown ? ` [${shown}]` : ""}: `)).trim();
      if (question.list) {
        const chosen = answer === "" ? fallback
          : /^all$/i.test(answer) ? Object.keys(TOOL_FILES)
            : answer.split(",").map((item) => item.trim().toLowerCase()).filter((item) => item in TOOL_FILES);
        answers[question.key] = chosen.length ? chosen : fallback;
      } else if (question.number) {
        const value = Number(answer === "" ? fallback : answer);
        answers[question.key] = Number.isFinite(value) && value > 0 ? value : fallback;
      } else {
        answers[question.key] = answer === "" ? (fallback ?? "") : answer;
      }
    }
    const plan = applyAnswers(root, answers);
    console.log("\nPlanned changes:");
    for (const change of plan.changes) console.log(`  update  ${change.path}`);
    if (!plan.changes.length) console.log("  (none — the files already match these answers)");
    for (const note of plan.notes) console.log(`  note    ${note}`);
    if (plan.changes.length) {
      const confirm = (await rl.ask("\nWrite these changes? [y/N]: ")).trim().toLowerCase();
      if (confirm !== "y" && confirm !== "yes") {
        console.log("Nothing written.");
        return null;
      }
    }
    let removals = [];
    if (plan.removals.length) {
      console.log(`\nThese files belong to AI tools you did not keep:\n${plan.removals.map((path) => `  ${path}`).join("\n")}`);
      const confirm = (await rl.ask("Delete them? [y/N]: ")).trim().toLowerCase();
      if (confirm === "y" || confirm === "yes") removals = plan.removals;
      else console.log("Keeping them; they stay in the context budget only if listed in context-budget.json.");
    }
    return { ...plan, removals };
  } finally {
    rl.close();
  }
}

function write(root, plan) {
  for (const change of plan.changes) writeFileSync(resolve(root, change.path), change.contents);
  for (const path of plan.removals) rmSync(resolve(root, path), { force: true });
  console.log(`\nWrote ${plan.changes.length} file(s)${plan.removals.length ? `, deleted ${plan.removals.length}` : ""}.`);

  // Show what the rules now cost in every session, since the answers changed them.
  const budget = checkContext(root, loadConfig(root));
  console.log(`\n${formatReport(budget, { files: false })}`);
  if (budget.errors.length) {
    console.log("\nOver budget — shorten AGENTS.md, move detail into docs/agents/, or raise the"
      + " budget in context-budget.json deliberately.");
  }

  console.log([
    "",
    "Next steps:",
    "  1. Replace every _TODO(maintainer)_ left in AGENTS.md and docs/agents/ — with Claude Code,",
    "     run /collab-rules-builder to draft them from the codebase, then review the result.",
    "  2. Run `npm run check` (lint, links, agent context budget, tests).",
    "  3. Enable Discussions and the labels the templates use, and protect `main` with the",
    "     Collaboration rules checks (see README.md).",
    plan.removals.length
      ? "  4. Drop the deleted tool files from the `agent-shims-intact` job in"
        + " .github/workflows/collab-rules.yml, then commit the diff yourself."
      : "  4. Review the diff and commit it yourself: `docs: adopt collaboration rules`.",
  ].join("\n"));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const args = process.argv.slice(2);
  const defaults = detectDefaults(root);

  if (args.includes("--dry-run") || args.includes("--yes")) {
    const plan = applyAnswers(root, defaults);
    console.log("Detected answers:");
    for (const [key, value] of Object.entries(defaults)) console.log(`  ${key}: ${Array.isArray(value) ? value.join(", ") : value}`);
    console.log("\nPlanned changes:");
    for (const change of plan.changes) console.log(`  update  ${change.path}`);
    if (!plan.changes.length) console.log("  (none)");
    for (const note of plan.notes) console.log(`  note    ${note}`);
    if (plan.removals.length) console.log(`  kept    ${plan.removals.join(", ")} (never deleted without a prompt)`);
    if (args.includes("--yes")) write(root, { ...plan, removals: [] });
    process.exit(0);
  }

  try {
    const plan = await prompt(root, defaults);
    if (plan) write(root, plan);
  } catch (error) {
    if (!(error instanceof Cancelled)) throw error;
    console.log("\nCancelled — nothing written. Run `npm run setup` again when you are ready.");
  }
}
