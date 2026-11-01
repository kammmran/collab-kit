import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import GithubSlugger from "github-slugger";

const markdown = new MarkdownIt({ html: true });

function parse(file) {
  // Skill front matter is metadata, not rendered Markdown.
  const source = readFileSync(file, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
  return markdown.parse(source, {});
}

function headings(tokens) {
  const slugger = new GithubSlugger();
  return new Set(tokens.flatMap((token, index) => {
    if (token.type !== "heading_open") return [];
    const text = (tokens[index + 1].children ?? [])
      .filter((child) => ["text", "code_inline", "image"].includes(child.type))
      .map((child) => child.content).join("");
    return [slugger.slug(text.trim())];
  }));
}

export function checkLinks(root, files) {
  root = realpathSync(root);
  const errors = [];
  const cache = new Map();
  const tokensFor = (file) => {
    if (!cache.has(file)) cache.set(file, parse(file));
    return cache.get(file);
  };
  for (const file of files) {
    const source = resolve(root, file);
    for (const block of tokensFor(source)) {
      for (const token of block.children ?? []) {
        const href = token.type === "link_open" ? token.attrGet("href")
          : token.type === "image" ? token.attrGet("src") : null;
        if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) continue;
        try {
          const [destination, fragment] = href.split("#");
          const path = decodeURIComponent(destination.split("?")[0]);
          const target = path ? resolve(path.startsWith("/") ? root : dirname(source), path.replace(/^\//, "")) : source;
          const inside = relative(root, existsSync(target) ? realpathSync(target) : target);
          if (inside === ".." || inside.startsWith(`..${sep}`)) {
            throw new Error("target is outside the repository");
          }
          if (!existsSync(target)) throw new Error("target does not exist (check filename casing)");
          if (fragment && extname(target).toLowerCase() === ".md" && statSync(target).isFile()
            && !headings(tokensFor(target)).has(decodeURIComponent(fragment))) {
            throw new Error("heading does not exist");
          }
        } catch (error) {
          errors.push(`${file}: ${href}: ${error.message}`);
        }
      }
    }
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const files = [...new Set(execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root, encoding: "utf8" }).split("\0"))]
    .filter((file) => file.endsWith(".md") && existsSync(resolve(root, file)));
  const errors = checkLinks(root, files);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Local Markdown links passed in ${files.length} files.`);
  }
}
