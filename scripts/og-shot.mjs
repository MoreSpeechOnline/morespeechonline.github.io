/**
 * Render a link-card image from an HTML file, through Chrome.
 *
 *   node scripts/og-shot.mjs src/og.html assets/og-1200x630.png [width height]
 *
 * Chrome must be reachable over CDP (CDP_URL, default http://127.0.0.1:9223).
 * The page is captured at 2× and downsampled, which keeps Barlow Condensed's
 * thin strokes from turning to fringe at 1× — the file shipped is 1× so every
 * crawler sees the dimensions it expects.
 *
 * The stylesheet's local resources (fonts, the stamp) are inlined before the
 * page is loaded as a data: URL, so this works against a browser running
 * anywhere — the sandbox does not share this filesystem.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, extname, join, resolve } from "node:path";

const [,, htmlPath, outPath, wArg, hArg] = process.argv;
if (!htmlPath || !outPath) {
  console.error("usage: node scripts/og-shot.mjs <in.html> <out.png> [width] [height]");
  process.exit(2);
}
const width = Number(wArg ?? 1200);
const height = Number(hArg ?? 630);
const CDP = process.env.CDP_URL ?? "http://127.0.0.1:9223";

const MIME = {
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const base = dirname(resolve(htmlPath));
const html = readFileSync(htmlPath, "utf8").replace(
  /(?:href|src)="(\.\.?\/[^"]+)"/g,
  (match, ref) => {
    const file = resolve(base, ref);
    const mime = MIME[extname(file).toLowerCase()];
    if (!mime) return match;
    const attr = match.slice(0, match.indexOf("="));
    const data = readFileSync(file).toString("base64");
    return `${attr}="data:${mime};base64,${data}"`;
  },
);

const tab = await (await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
});
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width, height, deviceScaleFactor: 2, mobile: false,
});
await send("Page.navigate", {
  url: `data:text/html;base64,${Buffer.from(html).toString("base64")}`,
});
// Fonts are the whole point of the card; wait for them, not for a stopwatch.
await send("Runtime.evaluate", { awaitPromise: true, expression: "document.fonts.ready" });
await new Promise((r) => setTimeout(r, 350));

const { data } = await send("Page.captureScreenshot", {
  format: "png",
  clip: { x: 0, y: 0, width, height, scale: 1 },
});
const rawPath = `/tmp/og-raw-${process.pid}.png`;
writeFileSync(rawPath, Buffer.from(data, "base64"));
ws.close();

// Downsample 2× → 1×, and refuse to ship a blank frame: a white render means the
// page never painted, which is exactly how the first version of this failed.
const py = `
from PIL import Image, ImageStat
im = Image.open("${rawPath}").convert("RGB")
if min(im.size) < 2 * min(${width}, ${height}):
    raise SystemExit(f"unexpected capture size {im.size}")
im = im.resize((${width}, ${height}), Image.LANCZOS)
spread = ImageStat.Stat(im).stddev
if max(spread) < 8:
    raise SystemExit(f"blank render (stddev {spread}) — the page did not paint")
im.save("${outPath}", optimize=True)
print(f"stddev {[round(x,1) for x in spread]}")
`;
execFileSync("python3", ["-c", py], { stdio: "inherit" });
execFileSync("rm", ["-f", rawPath]);
console.log(`wrote ${outPath} (${width}×${height})`);
