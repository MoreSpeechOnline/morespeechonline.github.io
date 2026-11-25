import { CASES, CAN, CANNOT, CHAIN, DEFENSES, DISTRICTS, EVIDENCE_ROLES, SITE, STATS } from "./content";
import { caption, complaint, coversheet, esc, exhibits, ifp, pi, service, summons } from "./docs";
import { LETTER, letterMarkdown } from "./letter";
import type { Block } from "./letter";
import type { CaseRow, EvidenceItem, Matter, Outcome } from "./types";

/* ---------------------------------------------------------------- helpers */

const $ = <T extends HTMLElement = HTMLElement>(sel: string): T => {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`missing element: ${sel}`);
  return el as T;
};

const input = (id: string): HTMLInputElement => $(`#${id}`) as HTMLInputElement;

const readMatter = (): Matter => ({
  plaintiff: {
    name: input("p-name").value,
    street: input("p-street").value,
    city: input("p-city").value,
    state: input("p-state").value,
    zip: input("p-zip").value,
    email: input("p-email").value,
    phone: input("p-phone").value,
    handle: input("p-handle").value.replace(/^@/, ""),
  },
  member: {
    name: input("m-name").value,
    title: (input("m-title") as unknown as HTMLSelectElement).value,
    district: input("m-district").value,
    office: input("m-office").value,
  },
  account: {
    handle: input("a-handle").value.replace(/^@/, ""),
    url: input("a-url").value,
    display: input("a-display").value,
    bio: input("a-bio").value,
    officialLink: input("a-link").checked,
    staffRun: input("a-staff").checked,
    announces: input("a-announces").checked,
    campaign: input("a-campaign").checked,
  },
  facts: {
    postDate: input("f-postdate").value,
    postText: input("f-posttext").value,
    blockDate: input("f-blockdate").value,
    blockMessage: input("f-blockmsg").value,
    stillBlocked: input("f-still").checked,
    comparisonHandle: input("f-cmp-handle").value.replace(/^@/, ""),
    comparisonText: input("f-cmp-text").value,
  },
  options: {
    district: input("o-district").value,
    ifp: input("o-ifp").checked,
    pi: input("o-pi").checked,
    serviceDate: input("o-date").value,
  },
  evidence: evidence.slice(),
});

/* ---------------------------------------------------------------- content rendering */

const outcomeLabel: Record<Outcome, string> = {
  win: "won",
  survived: "survived",
  lost: "lost",
  settled: "settled",
  moot: "vacated",
};

function renderChain(): void {
  const host = $("#chain");
  host.innerHTML = CHAIN.map(
    (s) => `
    <article class="step reveal">
      <div class="step-rail"><span class="step-num">${s.num}</span></div>
      <div class="step-main">
        <span class="kicker">${s.kicker}</span>
        <h3>${s.title}</h3>
        <p class="step-lede">${s.lede}</p>
        <button class="disclose" type="button" aria-expanded="false" aria-controls="body-${s.id}">
          <span class="chev" aria-hidden="true">▶</span> The authority
        </button>
        <div class="step-body" id="body-${s.id}">
          ${s.body.map((p) => `<p>${p}</p>`).join("")}
          ${s.quotes
            .map(
              (q) => `<blockquote class="quote"><p>“${q.text}”</p><cite>${q.cite}</cite></blockquote>`,
            )
            .join("")}
          <div class="takeaway"><b>In practice</b><span>${s.takeaway}</span></div>
        </div>
      </div>
    </article>`,
  ).join("");

  host.querySelectorAll<HTMLButtonElement>(".disclose").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = document.getElementById(btn.getAttribute("aria-controls") ?? "");
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      body?.classList.toggle("open", !open);
    });
  });
}

function renderStats(): void {
  $("#stats").innerHTML = STATS.map(
    (s) => `<div class="stat"><b data-count="${s.value}" data-suffix="${s.suffix ?? ""}">0</b>
      <span class="lbl">${s.label}</span><p>${s.note}</p></div>`,
  ).join("");
}

function renderCases(): void {
  const host = $("#cases");
  const filters = $("#filters");
  const kinds: Array<{ id: string; label: string }> = [
    { id: "all", label: "All" },
    { id: "win", label: "Won" },
    { id: "survived", label: "Survived dismissal" },
    { id: "lost", label: "Lost" },
    { id: "moot", label: "Vacated" },
  ];
  filters.innerHTML = kinds
    .map(
      (k, i) =>
        `<button class="chip" type="button" aria-pressed="${i === 0}" data-kind="${k.id}">${k.label}</button>`,
    )
    .join("");

  const paint = (kind: string): void => {
    const rows = CASES.filter((c) => kind === "all" || c.outcome === kind);
    host.innerHTML = rows
      .map(
        (c: CaseRow) => `<div class="case">
          <div><b>${c.name}</b><p>${c.note}</p></div>
          <div class="court">${c.court} · ${c.year}</div>
          <span class="tagc ${c.outcome}">${outcomeLabel[c.outcome]}</span>
        </div>`,
      )
      .join("");
  };
  paint("all");

  filters.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filters.querySelectorAll<HTMLButtonElement>(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      paint(chip.dataset.kind ?? "all");
    });
  });
}

function renderDefenses(): void {
  const host = $("#acc");
  host.innerHTML = DEFENSES.map(
    (d, i) => `<div class="acc-item">
      <button class="acc-q" type="button" aria-expanded="false" aria-controls="acc-${i}">
        <h3>${d.question}</h3>
        <span class="verdict">${d.verdict}</span>
        <span class="chev" aria-hidden="true">▾</span>
      </button>
      <div class="acc-a" id="acc-${i}">
        ${d.answer.map((p) => `<p>${p}</p>`).join("")}
        ${d.quote ? `<blockquote class="quote"><p>“${d.quote.text}”</p><cite>${d.quote.cite}</cite></blockquote>` : ""}
      </div>
    </div>`,
  ).join("");

  host.querySelectorAll<HTMLButtonElement>(".acc-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.getAttribute("aria-controls") ?? "");
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel?.classList.toggle("open", !open);
    });
  });
}

function renderStakes(): void {
  $("#can").innerHTML = CAN.map((t) => `<li>${t}</li>`).join("");
  $("#cannot").innerHTML = CANNOT.map((t) => `<li>${t}</li>`).join("");
}

/* ---------------------------------------------------------------- letter */

/** Escape, then restore the two inline markers the letter uses. */
function inline(text: string): string {
  return esc(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderLetter(): void {
  const host = $("#letter-body");
  const parts: string[] = [];
  parts.push(`<div class="letter-head">
    <p class="letter-org">${esc(LETTER.org)}<span>${esc(LETTER.site)}</span></p>
    <p class="letter-date">${esc(LETTER.date)}</p>
    <address>${LETTER.to.map((l) => esc(l)).join("<br>")}</address>
    <p class="letter-cc"><b>Cc:</b> ${LETTER.cc.map((l) => esc(l)).join(", ")}</p>
    <p class="letter-re"><b>Re:</b> ${esc(LETTER.re)}</p>
  </div>`);
  for (const b of LETTER.blocks as Block[]) {
    if (b.kind === "h") parts.push(`<h3>${esc(b.text)}</h3>`);
    else if (b.kind === "p") parts.push(`<p>${inline(b.text)}</p>`);
    else if (b.kind === "quote")
      parts.push(`<blockquote><p>“${esc(b.text)}”</p><cite>${esc(b.cite)}</cite></blockquote>`);
    else if (b.kind === "list")
      parts.push(`<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`);
    else if (b.kind === "sig") {
      const lines = b.text.split("\n");
      parts.push(`<div class="letter-sig">${lines.map((l) => `<p>${inline(l)}</p>`).join("")}</div>`);
    }
  }
  parts.push(`<div class="letter-encl"><h3>Enclosures</h3><ul>${LETTER.enclosures
    .map((e) => `<li>${esc(e)}</li>`)
    .join("")}</ul></div>`);
  host.innerHTML = parts.join("\n");
  $("#letter-note").textContent = LETTER.signerNote;
}

function wireLetter(): void {
  $("#letter-print").addEventListener("click", () => {
    document.body.classList.add("printing-letter");
    const done = (): void => {
      document.body.classList.remove("printing-letter");
      window.removeEventListener("afterprint", done);
    };
    window.addEventListener("afterprint", done);
    window.print();
  });
  $("#letter-copy").addEventListener("click", async () => {
    const btn = $("#letter-copy") as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(letterMarkdown());
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.textContent = "Copy text";
      }, 1600);
    } catch {
      btn.textContent = "Copy failed";
    }
  });
  $("#letter-download").addEventListener("click", () => {
    const blob = new Blob([letterMarkdown()], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "open-letter-doj.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });
}

/* ---------------------------------------------------------------- evidence */

let evidence: EvidenceItem[] = [];
let evSeq = 0;

const nextEvId = (): string => `ev-${++evSeq}-${Date.now().toString(36)}`;

function renderEvidence(): void {
  const host = $("#ev-list");
  const empty = $("#ev-empty");
  if (evidence.length === 0) {
    host.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  host.innerHTML = evidence
    .map((e, i) => {
      const letter = String.fromCharCode(65 + i);
      const thumb = e.dataUrl
        ? `<span class="ev-thumb"><img src="${e.dataUrl}" alt=""></span>`
        : `<span class="ev-thumb">LINK</span>`;
      const roles = EVIDENCE_ROLES.map(
        (r) => `<option value="${r.id}"${r.id === e.role ? " selected" : ""}>${r.label}</option>`,
      ).join("");
      return `<div class="ev-item" data-id="${e.id}">
        ${thumb}
        <div class="ev-meta">
          <span class="ev-letter">Exhibit ${letter}</span>
          <select data-act="role" aria-label="What this shows">${roles}</select>
          <input data-act="caption" value="${e.caption.replace(/"/g, "&quot;")}" placeholder="Describe the capture">
          ${e.url ? `<span class="ev-url">${e.url.replace(/</g, "&lt;")}</span>` : ""}
        </div>
        <button class="ev-del" type="button" data-act="del" aria-label="Remove exhibit ${letter}">Remove</button>
      </div>`;
    })
    .join("");

  host.querySelectorAll<HTMLElement>(".ev-item").forEach((row) => {
    const id = row.dataset.id ?? "";
    const item = evidence.find((e) => e.id === id);
    if (!item) return;
    row.querySelector<HTMLSelectElement>('[data-act="role"]')?.addEventListener("change", (ev) => {
      item.role = (ev.target as HTMLSelectElement).value as EvidenceItem["role"];
      save();
    });
    row.querySelector<HTMLInputElement>('[data-act="caption"]')?.addEventListener("input", (ev) => {
      item.caption = (ev.target as HTMLInputElement).value;
      save();
    });
    row.querySelector<HTMLButtonElement>('[data-act="del"]')?.addEventListener("click", () => {
      evidence = evidence.filter((e) => e.id !== id);
      renderEvidence();
      save();
    });
  });
}

/** Downscale a screenshot so the generated packet stays a sane size. */
async function addImage(file: File): Promise<void> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("could not read file"));
    reader.readAsDataURL(file);
  });
  const shrunk = await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      if (scale === 1 && dataUrl.length < 900_000) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
  evidence.push({
    id: nextEvId(),
    kind: "image",
    role: evidence.length === 0 ? "profile" : "other",
    caption: file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
    url: "",
    dataUrl: shrunk,
  });
  renderEvidence();
  save();
}

/* ---------------------------------------------------------------- builder */

const TOTAL_STEPS = 6;
let step = 0;

function renderSteps(): void {
  const labels = ["You", "Official", "Account", "Events", "Evidence", "Options"];
  $("#steps").innerHTML = labels
    .map(
      (l, i) =>
        `<button type="button" role="tab" data-step="${i}" aria-current="${i === 0}" aria-selected="${i === 0}">${i + 1}. ${l}</button>`,
    )
    .join("");
  $("#steps")
    .querySelectorAll<HTMLButtonElement>("button")
    .forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.step))));
}

function go(next: number, opts: { scroll?: boolean } = {}): void {
  step = Math.max(0, Math.min(TOTAL_STEPS - 1, next));
  document.querySelectorAll<HTMLElement>(".pane").forEach((p, i) => p.classList.toggle("on", i === step));
  document.querySelectorAll<HTMLButtonElement>("#steps button").forEach((b, i) => {
    b.setAttribute("aria-current", String(i === step));
    b.setAttribute("aria-selected", String(i === step));
    b.classList.toggle("done", i < step);
  });
  ($("#prev") as HTMLButtonElement).disabled = step === 0;
  const last = step === TOTAL_STEPS - 1;
  ($("#next") as HTMLButtonElement).textContent = last ? "Generate the filings" : "Continue →";
  if (step > 0) updatePreview();
  if (opts.scroll !== false) scrollToId("builder");
}

/** Scroll to a section, leaving room for the sticky masthead. */
function scrollToId(id: string, behavior: ScrollBehavior = "smooth"): void {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 64 - 12;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

const REQUIRED_BY_STEP: Record<number, string[]> = {
  0: ["p-name", "p-street", "p-city", "p-state", "p-zip"],
  1: ["m-name", "m-district", "o-district"],
  2: ["a-handle"],
  3: ["f-postdate", "f-blockdate", "f-posttext"],
  4: [],
  5: [],
};

function validateStep(index: number): boolean {
  let ok = true;
  for (const id of REQUIRED_BY_STEP[index] ?? []) {
    const el = input(id);
    const field = el.closest<HTMLElement>(".field");
    const bad = el.value.trim().length === 0;
    field?.classList.toggle("bad", bad);
    if (bad) ok = false;
  }
  return ok;
}

/* ---------------------------------------------------------------- preview */

function updatePreview(): void {
  const m = readMatter();
  $("#preview").innerHTML = caption(m, "Complaint for Declaratory and Injunctive Relief");
  const warn = $("#campaign-warn");
  if (warn) warn.style.display = m.account.campaign ? "block" : "none";
}

/* ---------------------------------------------------------------- output */

type BuilderDoc = { id: string; label: string; html: string };

const buildDocs = (m: Matter): BuilderDoc[] => {
  const docs: BuilderDoc[] = [
    { id: "complaint", label: "Complaint", html: complaint(m) },
    { id: "summons", label: "Summons request", html: summons(m) },
  ];
  if (m.options.ifp) docs.push({ id: "ifp", label: "In forma pauperis", html: ifp(m) });
  if (m.options.pi) docs.push({ id: "pi", label: "Preliminary injunction", html: pi(m) });
  docs.push({ id: "service", label: "Certificate of service", html: service(m) });
  docs.push({ id: "coversheet", label: "Cover sheet & checklist", html: coversheet(m) });
  if (m.evidence.length) docs.push({ id: "exhibits", label: "Exhibits", html: exhibits(m) });
  return docs;
};

let current: BuilderDoc[] = [];
let activeDoc = 0;

function renderDocTabs(): void {
  $("#doctabs").innerHTML = current
    .map(
      (d, i) =>
        `<button type="button" data-i="${i}" aria-pressed="${i === activeDoc}">${d.label}</button>`,
    )
    .join("");
  $("#doctabs")
    .querySelectorAll<HTMLButtonElement>("button")
    .forEach((b) =>
      b.addEventListener("click", () => {
        activeDoc = Number(b.dataset.i);
        renderDocTabs();
        $("#docview").innerHTML = current[activeDoc].html;
      }),
    );
}

function generate(): void {
  const m = readMatter();
  if (m.account.campaign) {
    const proceed = window.confirm(
      "This account carries a campaign disclaimer. Courts have held that blocking from a campaign account is not government action, so this filing is likely to be dismissed. Generate it anyway?",
    );
    if (!proceed) return;
  }
  current = buildDocs(m);
  activeDoc = 0;
  renderDocTabs();
  $("#docview").innerHTML = current[0].html;
  $("#print-root").innerHTML = current.map((d) => d.html).join("\n");
  $("#output").hidden = false;
  renderShare(m);
  $("#output").scrollIntoView({ block: "start", behavior: "smooth" });
  // Persist the text fields only. The Matter carries evidence data URLs, and
  // writing image bytes into localStorage would both blow the quota and leave
  // screenshots of a live dispute sitting in browser storage after the tab closes.
  try {
    const text = {
      ...m,
      evidence: m.evidence.map((e) => ({
        id: e.id,
        kind: e.kind,
        role: e.role,
        caption: e.caption,
        url: e.url,
      })),
    };
    localStorage.setItem("morespeech.matter", JSON.stringify(text));
  } catch {
    /* storage may be unavailable; the app works without it */
  }
}

function renderShare(m: Matter): void {
  const who = m.member.name.trim();
  const text =
    (who ? `${who} blocked me on X for criticising her. ` : "A Member of Congress blocked me on X for criticising her. ") +
    "I used this to build a First Amendment complaint. The comment section is a public forum.\n\n" +
    `Build yours: https://${SITE.domain}`;
  const box = $("#share-text") as HTMLTextAreaElement;
  box.value = text;
  const count = $("#share-count");
  const paint = (): void => {
    count.textContent = `${box.value.length} characters`;
  };
  paint();
  box.addEventListener("input", paint);
}

function wireShare(): void {
  const box = $("#share-text") as HTMLTextAreaElement;
  $("#share-post").addEventListener("click", () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(box.value)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
  $("#share-copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(box.value);
      ($("#share-copy") as HTMLButtonElement).textContent = "Copied";
      setTimeout(() => {
        ($("#share-copy") as HTMLButtonElement).textContent = "Copy text";
      }, 1600);
    } catch {
      box.select();
    }
  });
}

function standaloneHtml(): string {
  const style = Array.from(document.querySelectorAll("style"))
    .map((s) => s.textContent ?? "")
    .join("\n");
  const body = current
    .map((d) => `<article class="doc">${d.html.replace(/^<article[^>]*>|<\/article>$/g, "")}</article>`)
    .join("\n");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>Court filings — generated with MoreSpeech</title>
<style>${style}
body{background:#fff;margin:0;padding:0}
.doc{page-break-after:always;padding:1in;max-width:none}
@page{size:letter;margin:1in}
</style></head><body>${body}</body></html>`;
}

function download(): void {
  const html = standaloneHtml();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "filings.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------------------------------------------------------------- persistence */

const FIELDS = [
  "p-name", "p-street", "p-city", "p-state", "p-zip", "p-email", "p-phone", "p-handle",
  "m-name", "m-title", "m-district", "m-office", "o-district",
  "a-handle", "a-url", "a-display", "a-bio",
  "f-postdate", "f-posttext", "f-blockdate", "f-blockmsg", "f-cmp-handle", "f-cmp-text", "o-date",
];
const CHECKS = ["a-link", "a-staff", "a-announces", "o-ifp", "o-pi", "f-still"];

function save(): void {
  const data: Record<string, string | boolean> = {};
  for (const id of FIELDS) data[id] = input(id).value;
  for (const id of CHECKS) data[id] = input(id).checked;
  data["ev.meta"] = JSON.stringify(
    evidence.map((e) => ({ id: e.id, kind: e.kind, role: e.role, caption: e.caption, url: e.url })),
  );
  try {
    localStorage.setItem("morespeech.fields", JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function restore(): void {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("morespeech.fields");
  } catch {
    return;
  }
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as Record<string, string | boolean>;
    for (const [k, v] of Object.entries(data)) {
      const el = document.getElementById(k) as HTMLInputElement | null;
      if (!el) continue;
      if (typeof v === "boolean") el.checked = v;
      else el.value = v;
    }
    const meta = data["ev.meta"];
    if (typeof meta === "string") {
      try {
        const parsed = JSON.parse(meta) as Array<Omit<EvidenceItem, "dataUrl">>;
        evidence = parsed.map((e) => ({ ...e }));
        evSeq = evidence.length;
        renderEvidence();
      } catch {
        evidence = [];
      }
    }
  } catch {
    /* corrupt entry: start clean */
  }
}

/* ---------------------------------------------------------------- motion */

function countUp(): void {
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? "";
    if (!isFinite(target)) return;
    const start = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/** Honour #argument, #builder, #builder-3 and friends on load and on hashchange. */
function handleHash(initial = false): void {
  const raw = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!raw) {
    if (initial) window.scrollTo(0, 0);
    return;
  }
  const stepMatch = /^builder-(\d+)$/.exec(raw);
  if (stepMatch) {
    const n = Math.max(0, Math.min(TOTAL_STEPS - 1, Number(stepMatch[1])));
    go(n, { scroll: false });
    requestAnimationFrame(() => scrollToId("builder", initial ? "auto" : "smooth"));
    return;
  }
  scrollToId(raw, initial ? "auto" : "smooth");
}

/** Underline the nav link for the section in view. */
function spy(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav a[href^='#']:not(.cta)"));
  const pairs = links
    .map((a) => {
      const el = document.querySelector<HTMLElement>(a.getAttribute("href") ?? "");
      return el ? { link: a, el } : null;
    })
    .filter((x): x is { link: HTMLAnchorElement; el: HTMLElement } => x !== null);
  if (pairs.length === 0) return;

  let queued = false;
  const paint = (): void => {
    queued = false;
    const line = window.scrollY + 120;
    let current: HTMLAnchorElement | null = null;
    for (const { link, el } of pairs) {
      if (el.offsetTop <= line) current = link;
    }
    for (const { link } of pairs) {
      link.setAttribute("aria-current", String(link === current));
    }
  };
  window.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    },
    { passive: true },
  );
  paint();
}

/** A hairline at the top that fills as the page is read. */
function progressBar(): void {
  const bar = document.getElementById("progress");
  if (!bar) return;
  let queued = false;
  const paint = (): void => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    bar.style.width = `${pct}%`;
  };
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }, { passive: true });
  paint();
}

/** Mobile menu: the nav links are hidden under 860px, so give them a toggle. */
function mobileNav(): void {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;
  const setOpen = (open: boolean): void => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setOpen(false);
  });
}

function observe(): void {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "-10% 0px -5% 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const stats = $("#stats");
  const once = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        countUp();
        once.disconnect();
      }
    },
    { threshold: 0.3 },
  );
  if (stats) once.observe(stats);
}

/* ---------------------------------------------------------------- boot */

function boot(): void {
  const list = $("#district-list");
  list.innerHTML = DISTRICTS.map((d) => `<option value="${d}"></option>`).join("");

  renderChain();
  renderStats();
  renderCases();
  renderDefenses();
  renderStakes();
  renderSteps();
  restore();

  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  if (!input("o-date").value) input("o-date").value = iso;

  updatePreview();

  document.querySelectorAll<HTMLInputElement>("#builder input, #builder textarea, #builder select").forEach((el) => {
    el.addEventListener("input", () => {
      save();
      updatePreview();
      const field = el.closest<HTMLElement>(".field");
      if (field?.classList.contains("bad") && el.value.trim()) field.classList.remove("bad");
    });
    el.addEventListener("change", () => {
      save();
      updatePreview();
    });
  });

  ($("#ev-file") as HTMLInputElement).addEventListener("change", async (ev) => {
    const target = ev.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      try {
        await addImage(file);
      } catch {
        window.alert(`Could not read ${file.name}. Try a PNG or JPG screenshot.`);
      }
    }
    target.value = "";
  });

  $("#ev-link-add").addEventListener("click", () => {
    const form = $("#ev-link-form");
    form.hidden = !form.hidden;
    if (!form.hidden) input("ev-url").focus();
  });

  $("#ev-url-save").addEventListener("click", () => {
    const url = input("ev-url").value.trim();
    if (!url) {
      input("ev-url").focus();
      return;
    }
    evidence.push({
      id: nextEvId(),
      kind: "link",
      role: evidence.length === 0 ? "profile" : "other",
      caption: input("ev-url-caption").value.trim() || "Archived capture",
      url,
    });
    input("ev-url").value = "";
    input("ev-url-caption").value = "";
    $("#ev-link-form").hidden = true;
    renderEvidence();
    save();
  });

  renderLetter();
  wireLetter();
  wireShare();
  renderEvidence();

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (ev) => {
      const id = a.getAttribute("href")?.slice(1);
      if (!id || !document.getElementById(id)) return;
      ev.preventDefault();
      history.pushState(null, "", `#${id}`);
      scrollToId(id);
    });
  });

  $("#next").addEventListener("click", () => {
    if (!validateStep(step)) return;
    if (step === TOTAL_STEPS - 1) generate();
    else go(step + 1);
  });
  $("#prev").addEventListener("click", () => go(step - 1));

  $("#print").addEventListener("click", () => window.print());
  $("#download").addEventListener("click", download);
  $("#reset").addEventListener("click", () => {
    if (!window.confirm("Clear the form and start over?")) return;
    try {
      localStorage.removeItem("morespeech.fields");
    } catch {
      /* ignore */
    }
    window.location.reload();
  });

  go(0, { scroll: false });
  observe();
  spy();
  progressBar();
  mobileNav();

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  handleHash(true);
  if (!window.location.hash) {
    window.scrollTo(0, 0);
    window.addEventListener("load", () => window.scrollTo(0, 0), { once: true });
  }
  window.addEventListener("hashchange", () => handleHash(false));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
