#!/usr/bin/env node
/**
 * Compile the TypeScript sources and inline everything into one HTML file.
 *
 *   node build.mjs
 *
 * Requires TypeScript and esbuild on PATH (TSC / ESBUILD env vars override).
 *
 * Output: site/index.html — a single self-contained page with no network
 * requests, no build-time dependencies at runtime, and no backend.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const tsc = process.env.TSC ?? join(here, "node_modules", ".bin", "tsc");
const esbuild = process.env.ESBUILD ?? join(here, "node_modules", ".bin", "esbuild");

const sources = ["types.ts", "content.ts", "letter.ts", "docs.ts", "app.ts"].map((f) => join(here, "src", f));

// Type-check (no emit) so type errors fail the build.
execFileSync(
  tsc,
  [
    "--noEmit",
    "--strict",
    "--target", "ES2020",
    "--module", "ESNext",
    "--moduleResolution", "bundler",
    "--lib", "ES2020,DOM",
    "--noUnusedLocals",
    "--noUnusedParameters",
    "--noImplicitReturns",
    "--noFallthroughCasesInSwitch",
    ...sources,
  ],
  { stdio: "inherit" },
);

// Bundle to a classic IIFE so the page needs no module loading.
const bundled = execFileSync(
  esbuild,
  [join(here, "src", "app.ts"), "--bundle", "--format=iife", "--target=es2020", "--minify"],
  { encoding: "utf8" },
);

const js = bundled;

// Minify the stylesheet and collapse inter-tag whitespace in the final page.
// GitHub Pages gzips the result, so the win is parse time as much as bytes.
const minCss = execFileSync(esbuild, ["--minify", "--loader=css"], {
  input: readFileSync(join(here, "src", "styles.css"), "utf8"),
  encoding: "utf8",
});

const minifyHtml = (html) =>
  html
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .replace(/> </g, "><");

// Emit the Markdown letter from the same data the page renders, so the two
// can never disagree. Node cannot import TypeScript directly, so esbuild
// transpiles letter.ts to a temporary ES module first.
const letterTmp = join(tmpdir(), `letter-${process.pid}.mjs`);
execFileSync(esbuild, [join(here, "src", "letter.ts"), "--format=esm", `--outfile=${letterTmp}`], {
  stdio: "inherit",
});
const { letterMarkdown } = await import(pathToFileURL(letterTmp).href);
const md = letterMarkdown();
writeFileSync(join(here, "docs", "open-letter.md"), md);
rmSync(letterTmp, { force: true });
console.log(`wrote docs/open-letter.md (${md.split("\n").length} lines)`);
const template = readFileSync(join(here, "src", "index.template.html"), "utf8");

const html = minifyHtml(
  template.replace("/*__CSS__*/", () => minCss).replace("/*__JS__*/", () => js),
);
mkdirSync(here, { recursive: true });
writeFileSync(join(here, "index.html"), html);
rmSync(join(here, "dist"), { recursive: true, force: true });
console.log(`wrote site/index.html (${(html.length / 1024).toFixed(1)} KiB)`);
