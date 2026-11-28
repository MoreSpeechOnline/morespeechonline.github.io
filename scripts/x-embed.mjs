/**
 * Turn a post on X into a self-contained embed card.
 *
 *   node scripts/x-embed.mjs add https://x.com/GodIsVoluntary/status/1740063311081788
 *   node scripts/x-embed.mjs list
 *
 * X's own embed is a <blockquote> that only becomes a card once
 * platform.twitter.com/widgets.js runs: two third-party requests, an iframe,
 * and a cookie surface the page otherwise does not have. This does the same
 * work at build time instead. The post's text, date, counts and avatar are
 * fetched once, stored in src/embeds.json, and rendered into the page as plain
 * HTML. The avatar is inlined, so the finished site still makes no network
 * requests of its own.
 *
 * Sources, both public and unauthenticated:
 *   https://publish.x.com/oembed?url=…&omit_script=1   the post's text and date
 *   https://cdn.syndication.twimg.com/tweet-result?id=…  counts and avatar
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const store = join(root, "src", "embeds.json");

const UA = "Mozilla/5.0 (compatible; MoreSpeech build; +https://morespeech.online)";

const escapeAttr = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Pull the numeric status id out of any of the shapes X accepts. */
export function statusId(url) {
  const m = String(url).match(/status(?:es)?\/(\d{8,25})/);
  if (!m) throw new Error(`not a post URL: ${url}`);
  return m[1];
}

/** Keep only what an embed may contain: paragraphs, line breaks, links, emphasis. */
function cleanText(html) {
  return html
    .replace(/\s+ref_src=[^ >]*/g, "")
    .replace(/\s+target="[^"]*"/g, "")
    .replace(/\s+rel="[^"]*"/g, "")
    .replace(/<a\s+href="([^"]+)"[^>]*>/g, '<a href="$1" target="_blank" rel="noopener">')
    .replace(/<(?!\/?(?:a|b|strong|i|em|br)\b)[^>]+>/g, "");
}

async function getJson(url) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

/** 400×400 avatar in, 96×96 PNG data URI out — the only image the card needs. */
async function avatarDataUri(url) {
  // The 48 px circle only ever needs 96 px of source; ask for the small file.
  const small = String(url).replace(/_(normal|bigger|mini|400x400)\.(\w+)$/, "_normal.$2");
  const res = await fetch(small, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`avatar ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

export async function fetchPost(url) {
  const id = statusId(url);
  const canonical = `https://x.com/i/status/${id}`;
  const oembed = await getJson(
    `https://publish.x.com/oembed?url=${encodeURIComponent(canonical)}&omit_script=1&dnt=true&hide_thread=true`,
  );
  const syn = await getJson(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=a`);

  // The blockquote is <p>TEXT</p>&mdash; Name (@handle) <a>TIME</a>
  const body = oembed.html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const stamp = oembed.html.match(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>\s*<\/blockquote>/);
  const user = syn.user ?? {};
  const iso = syn.created_at ?? null;

  return {
    id,
    url: `https://x.com/${user.screen_name ?? "i"}/status/${id}`,
    author: {
      name: oembed.author_name ?? user.name ?? "",
      handle: user.screen_name ?? "",
      avatar: user.profile_image_url_https ? await avatarDataUri(user.profile_image_url_https) : "",
      verified: Boolean(user.verified || user.is_blue_verified),
    },
    text: cleanText(body ? body[1] : ""),
    stamped: stamp ? stamp[2].trim() : "",
    iso,
    stats: {
      replies: syn.conversation_count ?? 0,
      reposts: syn.retweet_count ?? 0,
      likes: syn.favorite_count ?? 0,
    },
    fetched: new Date().toISOString().slice(0, 10),
  };
}

const nf = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function timeOf(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function dateOf(iso, fallback) {
  if (!iso) return fallback;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/**
 * The card X draws, drawn here: header with avatar, name and handle; the post
 * text at X's own measure; the timestamp; the count row; and a link out.
 */
export function renderPost(post, { caption = "" } = {}) {
  const a = post.author;
  const when = [timeOf(post.iso), dateOf(post.iso, post.stamped)].filter(Boolean).join(" · ");
  const stat = (n, label) => `<span><b>${nf.format(n)}</b> ${label}</span>`;
  return `<figure class="x-embed">
  <a class="x-embed-card" href="${escapeAttr(post.url)}" target="_blank" rel="noopener">
    <div class="x-head">
      ${a.avatar ? `<img class="x-avatar" src="${a.avatar}" alt="" width="48" height="48">` : '<span class="x-avatar x-avatar-fallback" aria-hidden="true"></span>'}
      <span class="x-who"><b>${escapeAttr(a.name)}</b>${a.verified ? '<svg class="x-check" viewBox="0 0 24 24" aria-label="Verified"><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81C14.67 2.63 13.43 1.75 12 1.75s-2.67.88-3.34 2.19c-1.39-.46-2.9-.2-3.91.81s-1.27 2.52-.81 3.91C2.63 9.33 1.75 10.57 1.75 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"/></svg>' : ""}<span class="x-handle">@${escapeAttr(a.handle)}</span></span>
      <svg class="x-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </div>
    <div class="x-text">${post.text}</div>
    <p class="x-when">${escapeAttr(when)}</p>
    <p class="x-stats">${stat(post.stats.replies, "Replies")}${stat(post.stats.reposts, "Reposts")}${stat(post.stats.likes, "Likes")}</p>
    <p class="x-read">Read on X <span aria-hidden="true">↗</span></p>
  </a>${caption ? `\n  <figcaption>${caption}</figcaption>` : ""}
</figure>`;
}

function load() {
  try {
    return JSON.parse(readFileSync(store, "utf8"));
  } catch {
    return {};
  }
}

function save(all) {
  writeFileSync(store, JSON.stringify(all, null, 2) + "\n");
}

/** Replace every <!-- x-embed: URL --> in a page with the stored card. */
export function fillEmbeds(html, { caption = "" } = {}) {
  const all = load();
  return html.replace(/<!--\s*x-embed:\s*(\S+?)\s*-->/g, (_m, url) => {
    let id;
    try {
      id = statusId(url);
    } catch {
      return `<p class="x-embed-missing">Not a post link: ${escapeAttr(url)}</p>`;
    }
    const post = all[id];
    if (!post) {
      // No stored copy: link out rather than fail the build.
      return `<p class="x-embed-missing"><a href="${escapeAttr(url)}" target="_blank" rel="noopener">Post on X</a> — run <code>node scripts/x-embed.mjs add ${escapeAttr(url)}</code> to embed it.</p>`;
    }
    return renderPost(post, { caption });
  });
}

const [, , cmd, arg] = process.argv;
if (cmd === "add" && arg) {
  const post = await fetchPost(arg);
  const all = load();
  all[post.id] = post;
  save(all);
  console.log(`stored ${post.id} — ${post.author.name} (@${post.author.handle}), ${post.stats.likes} likes`);
} else if (cmd === "list") {
  const all = load();
  for (const p of Object.values(all)) {
    console.log(`${p.id}  ${p.author.handle.padEnd(18)} ${p.text.replace(/<[^>]+>/g, "").slice(0, 60)}`);
  }
  if (!Object.keys(all).length) console.log("none stored");
} else if (cmd) {
  console.error("usage: node scripts/x-embed.mjs add <post-url> | list");
  process.exit(2);
}
