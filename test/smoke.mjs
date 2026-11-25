/**
 * Headless smoke test for the built single-page app.
 *
 * Drives Chrome over CDP (the sandbox browser at CDP_URL), loads the built
 * index.html from the guest filesystem, walks the builder, generates the
 * filings, and reports console errors plus a screenshot.
 *
 *   node smoke.mjs <file-url> <screenshot.png>
 */

const [,, fileUrl, shot] = process.argv;
const CDP = process.env.CDP_URL ?? "http://127.0.0.1:9223";

const tab = await (await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);

let id = 0;
const pending = new Map();
const problems = [];

ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") {
    problems.push("exception: " + (m.params.exceptionDetails.text ?? "") + " " +
      (m.params.exceptionDetails.exception?.description ?? ""));
  }
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    problems.push("console.error: " + m.params.args.map((a) => a.value ?? a.description).join(" "));
  }
});

const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const msgId = ++id;
    pending.set(msgId, { res, rej });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});

await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false,
});

await send("Page.navigate", { url: fileUrl });
await new Promise((r) => setTimeout(r, 400));
await send("Runtime.evaluate", { expression: "try{localStorage.clear()}catch(e){}" });
const nav = await send("Page.navigate", { url: fileUrl });
if (nav.errorText) {
  console.error("navigation failed:", nav.errorText);
  process.exit(1);
}
await new Promise((r) => setTimeout(r, 1200));

const evaluate = async (expression) => {
  const out = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (out.exceptionDetails) {
    problems.push("eval: " + (out.exceptionDetails.exception?.description ?? out.exceptionDetails.text));
    return null;
  }
  return out.result.value;
};

const state = await evaluate(`(() => {
  const q = (s) => document.querySelector(s);
  return {
    title: document.title,
    chain: document.querySelectorAll('#chain .step').length,
    stats: document.querySelectorAll('#stats .stat').length,
    cases: document.querySelectorAll('#cases .case').length,
    defenses: document.querySelectorAll('#acc .acc-item').length,
    panes: document.querySelectorAll('.pane').length,
    steps: document.querySelectorAll('#steps button').length,
  };
})()`);

const fill = await evaluate(`(() => {
  const set = (id, v) => { const el = document.getElementById(id); el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true })); };
  const tick = (id, v) => { const el = document.getElementById(id); el.checked = v;
    el.dispatchEvent(new Event('change', { bubbles: true })); };
  set('p-name', 'Jordan A. Rivera');
  set('p-street', '14 Elm Street, Apt 3');
  set('p-city', 'Springfield'); set('p-state', 'IL'); set('p-zip', '62701');
  set('p-email', 'jrivera@example.com'); set('p-phone', '(217) 555-0134');
  set('p-handle', 'jrivera_il');
  set('m-name', 'Dana M. Whitfield');
  set('m-district', "Illinois's 13th Congressional District");
  set('m-office', '1234 Longworth HOB, Washington, D.C. 20515');
  set('o-district', 'Central District of Illinois');
  set('a-handle', 'RepWhitfield'); set('a-display', 'Rep. Dana Whitfield');
  set('a-url', 'https://x.com/RepWhitfield');
  set('a-bio', 'Official account of Rep. Whitfield');
  tick('a-link', true); tick('a-staff', true); tick('a-announces', true);
  set('f-postdate', '2026-03-03');
  set('f-posttext', 'You voted to cut the clinic. Own it.');
  set('f-blockdate', '2026-03-04');
  set('f-blockmsg', "You're blocked");
  set('f-cmp-handle', 'other_critic');
  set('f-cmp-text', 'Worst vote of your career.');
  return document.getElementById('p-name').value;
})()`);

const advanced = await evaluate(`(async () => {
  const next = document.getElementById('next');
  for (let i = 0; i < 4; i++) { next.click(); await new Promise(r => setTimeout(r, 120)); }
  return { step: document.querySelector('.pane.on')?.dataset.pane };
})()`);

const evidence = await evaluate(`(async () => {
  document.getElementById('ev-link-add').click();
  const url = document.getElementById('ev-url');
  const cap = document.getElementById('ev-url-caption');
  url.value = 'https://archive.ph/example';
  cap.value = 'Archived profile page';
  url.dispatchEvent(new Event('input', { bubbles: true }));
  cap.dispatchEvent(new Event('input', { bubbles: true }));
  document.getElementById('ev-url-save').click();
  await new Promise(r => setTimeout(r, 150));
  return {
    items: document.querySelectorAll('#ev-list .ev-item').length,
    letter: document.querySelector('.ev-letter')?.textContent ?? null,
  };
})()`);

const generated = await evaluate(`(async () => {
  const next = document.getElementById('next');
  for (let i = 0; i < 2; i++) { next.click(); await new Promise(r => setTimeout(r, 150)); }
  const out = document.getElementById('output');
  return {
    hidden: out.hidden,
    tabs: document.querySelectorAll('#doctabs button').length,
    printed: document.querySelectorAll('#print-root .doc').length,
    firstDocChars: (document.querySelector('#docview')?.textContent ?? '').length,
    exhibitMention: (document.querySelector('#docview')?.textContent ?? '').includes('Exhibit A'),
    shareText: document.getElementById('share-text').value.slice(0, 60),
    captionText: (document.querySelector('#docview .cap')?.textContent ?? '').replace(/\\s+/g, ' ').trim().slice(0, 120),
  };
})()`);

await evaluate(`document.getElementById('output').scrollIntoView()`);
await new Promise((r) => setTimeout(r, 400));

const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
if (shot && data) {
  const fs = await import("node:fs");
  fs.writeFileSync(shot, Buffer.from(data, "base64"));
}

console.log(JSON.stringify({ state, fill, advanced, evidence, generated, problems }, null, 2));
ws.close();
