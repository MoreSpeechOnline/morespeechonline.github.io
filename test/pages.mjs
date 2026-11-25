/**
 * Capture the two static pages — About and Code of Ethics — which the main
 * tour does not touch (navigating away mid-tour destabilises the CDP session).
 *
 *   node test/pages.mjs <dir-containing-the-pages> <out-dir>
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [,, base, outDir] = process.argv;
const CDP = process.env.CDP_URL ?? "http://127.0.0.1:9223";
mkdirSync(outDir, { recursive: true });

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
  width: 1440, height: 1000, deviceScaleFactor: 2, mobile: false,
});

for (const [file, name] of [
  ["about.html", "05b-about"],
  ["code-of-ethics.html", "05c-ethics"],
]) {
  await send("Page.navigate", { url: `${base}/${file}` });
  await new Promise((r) => setTimeout(r, 900));
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(outDir, `${name}.png`), Buffer.from(data, "base64"));
  console.log("captured", name);
}
ws.close();
