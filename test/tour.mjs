/**
 * Capture a guided tour of the app: hero, argument, record, defenses, each
 * builder step, the generated filing, and the printed page.
 *
 *   node test/tour.mjs <file-url> <out-dir>
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [,, fileUrl, outDir] = process.argv;
const CDP = process.env.CDP_URL ?? "http://127.0.0.1:9223";

mkdirSync(outDir, { recursive: true });

const tab = await (await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const errors = [];

ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.text);
});
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const i = ++id;
    pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params }));
  });

await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});
await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440, height: 900, deviceScaleFactor: 2, mobile: false,
});

const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) errors.push(r.exceptionDetails.exception?.description ?? "");
  return r.result?.value;
};

const shot = async (name) => {
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(outDir, `${name}.png`), Buffer.from(data, "base64"));
  return name;
};

const scrollTo = async (sel) => {
  await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)});
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70 }); })()`);
  await new Promise((r) => setTimeout(r, 550));
};

await send("Page.navigate", { url: fileUrl });
await new Promise((r) => setTimeout(r, 600));
await send("Runtime.evaluate", { expression: "try{localStorage.clear()}catch(e){}" });
await send("Page.navigate", { url: fileUrl });
await new Promise((r) => setTimeout(r, 1200));
await evaluate("window.scrollTo(0,0)");
await new Promise((r) => setTimeout(r, 400));

const shots = [];
shots.push(await shot("01-hero"));

// open the first link of the chain
await scrollTo("#argument");
await evaluate(`document.querySelectorAll('.disclose')[0].click()`);
await new Promise((r) => setTimeout(r, 350));
shots.push(await shot("02-argument"));

await scrollTo("#record");
await new Promise((r) => setTimeout(r, 500));
shots.push(await shot("03-record"));

await scrollTo("#defenses");
await evaluate(`document.querySelectorAll('.acc-q')[2].click()`);
await new Promise((r) => setTimeout(r, 350));
shots.push(await shot("04-defenses"));

// builder
await scrollTo("#letter");
await new Promise((r) => setTimeout(r, 450));
shots.push(await shot("05-letter"));

await scrollTo("#builder");
shots.push(await shot("06-builder-step1"));

const set = async (fieldId, value) => {
  await evaluate(`(() => { const el = document.getElementById(${JSON.stringify(fieldId)});
    el.value = ${JSON.stringify(value)};
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true })); })()`);
};
const tick = async (fieldId, on) => {
  await evaluate(`(() => { const el = document.getElementById(${JSON.stringify(fieldId)});
    el.checked = ${on ? "true" : "false"};
    el.dispatchEvent(new Event('change', { bubbles: true })); })()`);
};

await set("p-name", "Jordan A. Rivera");
await set("p-street", "14 Elm Street, Apt 3");
await set("p-city", "Springfield");
await set("p-state", "IL");
await set("p-zip", "62701");
await set("p-email", "jrivera@example.com");
await set("p-phone", "(217) 555-0134");
await set("p-handle", "jrivera_il");
await new Promise((r) => setTimeout(r, 300));
shots.push(await shot("07-step1-filled"));

const next = async (times = 1) => {
  for (let i = 0; i < times; i++) {
    await evaluate(`document.getElementById('next').click()`);
    await new Promise((r) => setTimeout(r, 320));
  }
};

await next();
await set("m-name", "Dana M. Whitfield");
await set("m-district", "Illinois's 13th Congressional District");
await set("m-office", "1234 Longworth HOB, Washington, D.C. 20515");
await set("o-district", "Central District of Illinois");
await new Promise((r) => setTimeout(r, 300));
shots.push(await shot("08-step2-official"));

await next();
await set("a-handle", "RepWhitfield");
await set("a-display", "Rep. Dana Whitfield");
await set("a-url", "https://x.com/RepWhitfield");
await set("a-bio", "Official account of Rep. Whitfield");
await tick("a-link", true);
await tick("a-staff", true);
await tick("a-announces", true);
await new Promise((r) => setTimeout(r, 300));
shots.push(await shot("09-step3-account"));

await next();
await set("f-postdate", "2026-03-03");
await set("f-posttext", "You voted to cut the clinic. Own it.");
await set("f-blockdate", "2026-03-04");
await set("f-blockmsg", "You're blocked");
await set("f-cmp-handle", "other_critic");
await set("f-cmp-text", "Worst vote of your career.");
await new Promise((r) => setTimeout(r, 300));
shots.push(await shot("10-step4-events"));

// evidence: upload a synthetic screenshot through the real input
await next();
await evaluate(`(async () => {
  const c = document.createElement('canvas');
  c.width = 1200; c.height = 700;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 1200, 700);
  g.fillStyle = '#f7f9f9'; g.fillRect(0, 0, 1200, 120);
  g.fillStyle = '#14110f'; g.font = 'bold 34px Georgia';
  g.fillText('Rep. Dana Whitfield', 130, 60);
  g.fillStyle = '#6b6259'; g.font = '24px Georgia';
  g.fillText('@RepWhitfield · Official account', 130, 96);
  g.fillStyle = '#14110f'; g.beginPath(); g.arc(70, 70, 44, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.font = 'bold 30px Georgia'; g.fillText('DW', 48, 82);
  g.fillStyle = '#14110f'; g.font = '30px Georgia';
  g.fillText('The district secured $4.2M for the transit corridor.', 60, 200);
  g.fillText('This is what we promised, and what we delivered.', 60, 245);
  g.strokeStyle = '#cfd9de'; g.beginPath(); g.moveTo(60, 300); g.lineTo(1140, 300); g.stroke();
  g.fillStyle = '#536471'; g.font = '26px Georgia';
  g.fillText('@jrivera_il  You voted to cut the clinic. Own it.', 60, 350);
  g.fillText('@other_critic  Worst vote of your career.', 60, 400);
  g.strokeStyle = '#7a1f1f'; g.lineWidth = 4;
  g.strokeRect(50, 330, 700, 60);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = new File([blob], 'block-capture.png', { type: 'image/png' });
  const dt = new DataTransfer(); dt.items.add(file);
  const inp = document.getElementById('ev-file');
  inp.files = dt.files;
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 1200));
})()`);
await new Promise((r) => setTimeout(r, 600));
shots.push(await shot("11-step5-evidence"));

await next();
await new Promise((r) => setTimeout(r, 300));
shots.push(await shot("12-step6-options"));

await evaluate(`document.getElementById('next').click()`);
await new Promise((r) => setTimeout(r, 900));
shots.push(await shot("13-generated-complaint"));

await evaluate(`(() => {
  const tabs = document.querySelectorAll('#doctabs button');
  const last = tabs[tabs.length - 1];
  if (last) last.click();
})()`);
await new Promise((r) => setTimeout(r, 500));
await scrollTo("#docview");
shots.push(await shot("14-exhibit-page"));

await scrollTo("#share");
await new Promise((r) => setTimeout(r, 400));
shots.push(await shot("15-share-prompt"));

// mobile view of the hero and the builder
await send("Emulation.setDeviceMetricsOverride", {
  width: 390, height: 844, deviceScaleFactor: 3, mobile: true,
});
await send("Page.navigate", { url: fileUrl });
await new Promise((r) => setTimeout(r, 1200));
shots.push(await shot("16-mobile-hero"));

console.log(JSON.stringify({ shots, errors }, null, 2));
ws.close();
