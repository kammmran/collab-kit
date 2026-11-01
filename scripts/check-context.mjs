// Measures the instruction files every AI tool loads automatically in each session and fails
// when a tool's always-loaded context grows past its budget. Token counts are estimates: the
// script divides characters by `charsPerToken` (4 by default) because the real count depends on
// the model's tokenizer. Bytes are reported too, so the numbers can be checked by hand.
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;
// Claude Code stops following `@path` imports after five hops.
const MAX_IMPORT_DEPTH = 5;

export const defaultConfig = {
  charsPerToken: 4,
  defaultBudget: 1200,
  groups: {
    claude: { entries: ["CLAUDE.md"] },
    cursor: { entries: [".cursor/rules/*.mdc", "AGENTS.md"] },
    copilot: { entries: [".github/copilot-instructions.md", "AGENTS.md"] },
    gemini: { entries: ["AGENTS.md"] },
    skills: { entries: [".claude/skills/*/SKILL.md"], frontMatterOnly: true, budget: 400 },
  },
};

export function estimateTokens(text, charsPerToken = defaultConfig.charsPerToken) {
  if (!(charsPerToken > 0)) throw new TypeError("charsPerToken must be a positive number");
  return Math.ceil(text.length / charsPerToken);
}

function posix(path) {
  return path.split(sep).join("/");
}

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

// Supports `*` inside one path segment, which is all the entry patterns need.
function expand(root, pattern) {
  if (!pattern.includes("*")) return [pattern];
  let matches = [""];
  for (const segment of pattern.split("/")) {
    if (!segment.includes("*")) {
      matches = matches.map((base) => (base ? `${base}/${segment}` : segment));
      continue;
    }
    const name = new RegExp(`^${segment.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`);
    matches = matches.flatMap((base) => {
      const directory = resolve(root, base);
      if (!existsSync(directory) || !statSync(directory).isDirectory()) return [];
      return readdirSync(directory).filter((entry) => name.test(entry)).sort()
        .map((entry) => (base ? `${base}/${entry}` : entry));
    });
  }
  return matches.filter((match) => isFile(resolve(root, match)));
}

function frontMatter(source) {
  const match = source.match(FRONT_MATTER);
  return match ? { block: match[0], fields: match[1] } : null;
}

// `@path` imports, ignoring fenced and inline code so examples are not followed.
function importsIn(source) {
  const prose = source.replace(/^```[\s\S]*?^```/gm, "").replace(/`[^`\n]*`/g, "");
  return [...prose.matchAll(/(?:^|\s)@([A-Za-z0-9._~/-]+)/gm)].map((match) => match[1]);
}

function contains(root, target) {
  const inside = relative(root, existsSync(target) ? realpathSync(target) : target);
  return inside !== ".." && !inside.startsWith(`..${sep}`);
}

export function checkContext(root, config = defaultConfig) {
  root = realpathSync(root);
  const charsPerToken = config.charsPerToken ?? defaultConfig.charsPerToken;
  const defaultBudget = config.defaultBudget ?? defaultConfig.defaultBudget;
  const errors = [];
  const groups = [];

  for (const [name, group] of Object.entries(config.groups ?? {})) {
    const budget = group.budget ?? defaultBudget;
    const queue = [];
    const skipped = [];
    const files = [];
    const seen = new Set();

    for (const pattern of group.entries ?? []) {
      let rejected = false;
      const present = expand(root, pattern).filter((path) => {
        const target = resolve(root, path);
        if (!contains(root, target)) {
          errors.push(`${name}: ${path}: context file is outside the repository`);
          rejected = true;
          return false;
        }
        return isFile(target);
      });
      // Adopting projects won't have every tool's file; a pattern that matches nothing is
      // reported, not an error.
      if (!present.length && !rejected) skipped.push(pattern);
      for (const path of present) queue.push({ path, depth: 0, via: null });
    }

    while (queue.length) {
      const { path, depth, via } = queue.shift();
      const target = resolve(root, path);
      if (!isFile(target)) continue;
      const key = realpathSync(target);
      if (seen.has(key)) continue;
      seen.add(key);

      const source = readFileSync(target, "utf8");
      const matter = frontMatter(source);
      // A Cursor rule that is not always applied is loaded on demand, not every session.
      if (matter && /^alwaysApply:\s*false\s*$/m.test(matter.fields)) continue;
      // Agents load a skill's front matter every session; its body only when the skill runs.
      const counted = group.frontMatterOnly ? (matter?.block ?? "") : source;
      files.push({
        path: posix(relative(root, target)),
        via,
        bytes: Buffer.byteLength(counted),
        tokens: estimateTokens(counted, charsPerToken),
      });

      if (group.frontMatterOnly || depth >= MAX_IMPORT_DEPTH) continue;
      for (const reference of importsIn(source)) {
        const next = reference.startsWith("/")
          ? resolve(root, reference.slice(1))
          : resolve(dirname(target), reference);
        // A missing target is an email address or a mention, not an import.
        if (!isFile(next)) continue;
        if (!contains(root, next)) {
          errors.push(`${name}: ${posix(relative(root, target))}: imports ${reference}, which is outside the repository`);
          continue;
        }
        queue.push({ path: posix(relative(root, next)), depth: depth + 1, via: posix(relative(root, target)) });
      }
    }

    const tokens = files.reduce((total, file) => total + file.tokens, 0);
    const bytes = files.reduce((total, file) => total + file.bytes, 0);
    if (tokens > budget) {
      errors.push(`${name}: ${tokens} estimated tokens of always-loaded context exceed the budget of ${budget}`
        + ` — shorten ${files.map((file) => file.path).join(", ")} or move detail into files agents read on demand`);
    }
    groups.push({ name, budget, tokens, bytes, files, skipped });
  }

  return { charsPerToken, groups, errors };
}

export function loadConfig(root) {
  const path = resolve(root, "context-budget.json");
  if (!existsSync(path)) return defaultConfig;
  const config = JSON.parse(readFileSync(path, "utf8"));
  return { ...defaultConfig, ...config, groups: config.groups ?? defaultConfig.groups };
}

export function formatReport({ charsPerToken, groups }, { files = true } = {}) {
  const lines = [`Always-loaded agent context, estimated at ${charsPerToken} characters per token:`, ""];
  for (const group of groups) {
    const status = group.tokens > group.budget ? "OVER BUDGET" : "ok";
    lines.push(`${group.name}: ~${group.tokens} tokens of ${group.budget} (${group.bytes} bytes) — ${status}`);
    if (!files) continue;
    for (const file of group.files) {
      lines.push(`  ${file.path}${file.via ? ` (imported by ${file.via})` : ""}: ~${file.tokens} tokens`);
    }
    if (group.skipped.length) lines.push(`  not present, skipped: ${group.skipped.join(", ")}`);
  }
  return lines.join("\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const args = process.argv.slice(2);
  const budget = args.includes("--budget") ? Number(args[args.indexOf("--budget") + 1]) : null;
  const config = loadConfig(root);
  if (budget !== null) {
    if (!Number.isFinite(budget) || budget <= 0) {
      console.error("--budget needs a positive number of tokens");
      process.exit(2);
    }
    config.groups = Object.fromEntries(Object.entries(config.groups)
      .map(([name, group]) => [name, { ...group, budget }]));
  }

  const result = checkContext(root, config);
  if (args.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatReport(result));
  }
  if (result.errors.length) {
    console.error(`\n${result.errors.join("\n")}`);
    if (!args.includes("--no-fail")) process.exitCode = 1;
  } else if (!args.includes("--json")) {
    console.log(`\nEvery agent context group is within budget.`);
  }
}
