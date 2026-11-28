/**
 * Render a link-card image from an HTML file, through Chrome.
 *
 *   node scripts/og-shot.mjs src/og.html assets/og-1200x630.png [width height]
 *
 * Chrome must be reachable over CDP (CDP_URL, default http://127.0.0.1:9223).
 * The page is captured at 2× and downsampled, which keeps Barlow Condensed's
 * thin strokes from turning to fringe at 1× — the file shipped is 1× so every
 * crawler sees the dimensions it expects.
 */

import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const [,, htmlPath, outPath, wArg, hArg] = process.argv;
if (!htmlPath || !outPath) {
  console.error("usage: node scripts/og-shot.mjs <in.html> <out.png> [width] [height]");
  process.exit(2);
}
const width = Number(wArg ?? 1200);
const height = Number(hArg ?? 630);
const CDP = process.env.CDP_URL ?? "http://127.0.0.1:9223";

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
await send("Page.navigate", { url: `file://${resolve(htmlPath)}` });
// Fonts are the whole point of the card; wait for them, not for a stopwatch.
await send("Runtime.evaluate", { awaitPromise: true, expression: "document.fonts.ready" });
await new Promise((r) => setTimeout(r, 400));

const { data } = await send("Page.captureScreenshot", {
  format: "png",
  clip: { x: 0, y: 0, width, height, scale: 2 },
});
const raw = Buffer.from(data, "base64");
writeFileSync(`/tmp/og-raw-${process.pid}.png`, raw);
ws.close();

// Downsample 2× → 1× with the same Lanczos resampling the site's images use.
const py = `
from PIL import Image
im = Image.open("/tmp/og-raw-${process.pid}.png").convert("RGB")
im.resize((${width}, ${height}), Image.LANCZOS).save("${outPath}", optimize=True)
`;
execFileSync("python3", ["-c", py], { stdio: "inherit" });
execFileSync("rm", ["-f", `/tmp/og-raw-${process.pid}.png`]);
console.log(`wrote ${outPath} (${width}×${height})`);
