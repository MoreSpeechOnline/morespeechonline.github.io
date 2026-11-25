/**
 * Print-path test: drive the builder, then print the generated filings to PDF
 * with print media emulation and check the page count and text.
 *
 *   node test/print.mjs <file-url> <out.pdf>
 */

const [,, fileUrl, out] = process.argv;
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
  if (m.method === "Runtime.exceptionThrown") problems.push(m.params.exceptionDetails.text);
});
const send = (method, params = {}) =>
  new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise((res, rej) => { ws.addEventListener("open", res, { once: true }); ws.addEventListener("error", rej, { once: true }); });
await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url: fileUrl });
await new Promise((r) => setTimeout(r, 500));
await send("Runtime.evaluate", { expression: "try{localStorage.clear()}catch(e){}" });
await send("Page.navigate", { url: fileUrl });
await new Promise((r) => setTimeout(r, 800));

const evaluate = async (expression) => {
  const out = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return out.result?.value;
};

await evaluate(`(() => {
  const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input',{bubbles:true})); };
  set('p-name','Jordan A. Rivera'); set('p-street','14 Elm Street'); set('p-city','Springfield');
  set('p-state','IL'); set('p-zip','62701'); set('p-email','j@example.com'); set('p-phone','217-555-0134');
  set('m-name','Dana M. Whitfield'); set('m-district',"Illinois's 13th Congressional District");
  set('m-office','1234 Longworth HOB'); set('o-district','Central District of Illinois');
  set('a-handle','RepWhitfield'); set('a-display','Rep. Dana Whitfield'); set('a-bio','Official account');
  set('f-postdate','2026-03-03'); set('f-posttext','You voted to cut the clinic. Own it.'); set('f-blockdate','2026-03-04');
})()`);

await evaluate(`(async () => {
  const next = document.getElementById('next');
  for (let i = 0; i < 5; i++) { next.click(); await new Promise(r=>setTimeout(r,80)); }
  next.click();
  await new Promise(r=>setTimeout(r,400));
})()`);

const upload = await evaluate(`(async () => {
  // Build a small PNG in-page and hand it to the file input, as a user would.
  const c = document.createElement('canvas');
  c.width = 640; c.height = 360;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0,0,640,360);
  g.fillStyle = '#14110f'; g.font = 'bold 28px Georgia';
  g.fillText('@RepWhitfield profile', 24, 60);
  g.font = '18px Georgia';
  g.fillText('Official account of Rep. Whitfield', 24, 100);
  g.strokeStyle = '#7a1f1f'; g.lineWidth = 3;
  g.strokeRect(20, 20, 600, 120);
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const file = new File([blob], 'profile-capture.png', { type: 'image/png' });
  const dt = new DataTransfer();
  dt.items.add(file);
  const input = document.getElementById('ev-file');
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 900));
  return {
    items: document.querySelectorAll('#ev-list .ev-item').length,
    thumbs: document.querySelectorAll('#ev-list img').length,
  };
})()`);

const regenerated = await evaluate(`(async () => {
  document.getElementById('next').click();
  await new Promise(r => setTimeout(r, 500));
  return {
    tabs: document.querySelectorAll('#doctabs button').length,
    exhibitPages: document.querySelectorAll('#print-root .exhibit-page').length,
    imgInPrint: document.querySelectorAll('#print-root .exhibit-img').length,
  };
})()`);
console.log(JSON.stringify({ upload, regenerated }));

await send("Emulation.setEmulatedMedia", { media: "print" });
await new Promise((r) => setTimeout(r, 400));
const { data } = await send("Page.printToPDF", {
  printBackground: true, paperWidth: 8.5, paperHeight: 11,
  marginTop: 1, marginBottom: 1, marginLeft: 1, marginRight: 1,
  preferCSSPageSize: false,
});
const fs = await import("node:fs");
fs.writeFileSync(out, Buffer.from(data, "base64"));
console.log(JSON.stringify({ bytes: Buffer.from(data, "base64").length, problems }));
ws.close();
