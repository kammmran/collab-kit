import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { checkLinks } from "../scripts/check-links.mjs";

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), "collab-kit-links-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(root, name, ".."), { recursive: true });
    writeFileSync(join(root, name), content);
  }
  return root;
}

test("resolves nested, reference, image, root-relative and encoded links", (t) => {
  const root = fixture(t, {
    "docs/guide.md": "[root](/README.md) [ref][target] ![image](../image.svg)\n\n[target]: ../README.md#hello-code\n",
    "README.md": "# Hello `code`\n\n# Hello `code`\n\n[duplicate](#hello-code-1) [space](<space file.md>)",
    "space file.md": "# Space\n",
    "image.svg": "<svg/>\n",
  });
  assert.deepEqual(checkLinks(root, ["README.md", "docs/guide.md"]), []);
});

test("reports missing files, images and headings", (t) => {
  const root = fixture(t, { "README.md": "# Title\n\n[bad](missing.md) ![image](missing.png) [heading](#absent)" });
  const errors = checkLinks(root, ["README.md"]);
  assert.equal(errors.length, 3);
  assert.match(errors.join("\n"), /missing.md: target does not exist/);
  assert.match(errors.join("\n"), /missing.png: target does not exist/);
  assert.match(errors.join("\n"), /#absent: heading does not exist/);
});

test("matches headings with punctuation, inline comments and emphasis", (t) => {
  const root = fixture(t, {
    "README.md": "[setup](AGENTS.md#3-setup-build-test)",
    "AGENTS.md": "## 3. Setup, **build**, test <!-- AUTO -->\n",
  });
  assert.deepEqual(checkLinks(root, ["README.md"]), []);
});

test("ignores examples, comments, front matter and external URLs", (t) => {
  const root = fixture(t, { "README.md": [
    "---", "description: '[metadata](missing.md)'", "---", "# Title",
    "<!-- [comment](missing.md) -->", "`[inline](missing.md)`",
    "```text", "[example](missing.md)", "```",
    "[external](https://example.invalid) [email](mailto:example@example.invalid)",
  ].join("\n") });
  assert.deepEqual(checkLinks(root, ["README.md"]), []);
});

test("rejects paths escaping the repository and malformed URL escapes", (t) => {
  const root = fixture(t, { "README.md": "[outside](../outside.md) [bad](%FF.md)" });
  const errors = checkLinks(root, ["README.md"]);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /outside the repository/);
  assert.match(errors[1], /URI malformed/);
});
