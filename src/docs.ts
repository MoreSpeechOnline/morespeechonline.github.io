import type { EvidenceItem, EvidenceRole, Matter } from "./types";

/** HTML-escape every user-supplied string before it reaches the document. */
export const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Exhibit letters are assigned in the order the user added the evidence. */
export const exhibitLetter = (index: number): string =>
  String.fromCharCode(65 + (index % 26)).repeat(index >= 26 ? Math.floor(index / 26) + 1 : 1);

export function exhibitFor(m: Matter, role: EvidenceRole): string | null {
  const i = m.evidence.findIndex((e) => e.role === role);
  return i === -1 ? null : exhibitLetter(i);
}

const ex = (m: Matter, role: EvidenceRole): string => {
  const letter = exhibitFor(m, role);
  return letter ? ` A true copy is attached as Exhibit ${letter}.` : "";
};

const f = (s: string, fallback = ""): string => {
  const v = (s || "").trim();
  return esc(v.length ? v : fallback);
};

export interface Party {
  plaintiffLine: string;
  memberLine: string;
  title: string;
  caseNo: string;
  caseNoPlain: string;
}

export function caption(m: Matter, doi: string, caseNo = "[[CASE NUMBER]]"): string {
  return `<table class="cap">
<tr><td class="court" colspan="2">UNITED STATES DISTRICT COURT<br>FOR THE ${f(m.options.district, "[[DISTRICT]]").toUpperCase()}</td></tr>
<tr>
<td class="left">
<span class="pty">${f(m.plaintiff.name, "[[PLAINTIFF NAME]]")},</span><br>
<span class="role">Plaintiff,</span><br>
<span class="vs">v.</span><br>
<span class="pty">${f(m.member.name, "[[MEMBER NAME]]")}, in her official capacity as ${f(m.member.title, "[[MEMBER TITLE]]")} for ${f(m.member.district, "[[DISTRICT DESCRIPTION]]")},</span><br>
<span class="role">Defendant.</span>
</td>
<td class="right">
Case No. ${esc(caseNo)}<br><br>
<span class="doi">${doi}</span>
</td>
</tr>
</table>`;
}

const sig = (m: Matter, withAddress = true): string => {
  const p = m.plaintiff;
  const line2 = withAddress
    ? `${f(p.street, "[[STREET]]")}<br>${f(p.city, "[[CITY]]")}, ${f(p.state, "[[STATE]]")} ${f(p.zip, "[[ZIP]]")}<br>${f(p.phone, "[[PHONE]]")}`
    : `${f(p.phone, "[[PHONE]]")}`;
  return `<p class="sig keep">Dated: ${f(m.options.serviceDate, "[[DATE]]")}<br>________________________________________<br>${f(p.name, "[[YOUR NAME]]")}<br>Plaintiff, Pro Se<br>${line2}<br>${f(p.email, "[[EMAIL]]")}</p>`;
};

const district = (m: Matter): string => f(m.options.district, "[[DISTRICT]]");

/* ------------------------------------------------------------------ complaint */

export function complaint(m: Matter): string {
  const p = m.plaintiff, a = m.account, x = m.facts, d = m.member;
  const districtDesc = `${f(d.district, "[[DISTRICT DESCRIPTION]]")}`;

  const indicia: string[] = [];
  if (a.officialLink) indicia.push(`The Account is linked from Defendant's official congressional website, under a heading inviting constituents to follow it.`);
  if (a.staffRun) indicia.push(`The Account is operated by Defendant's official staff.`);
  if (a.announces) indicia.push(`The Account announces official business, including votes, committee action, and district events.`);

  return `<article class="doc" data-doc="complaint">
${caption(m, "Complaint for Declaratory and Injunctive Relief")}
<p class="ni">Plaintiff, appearing pro se, alleges:</p>

<h2>I. Nature of the Action</h2>

<p class="np"><span class="num">1.</span>Defendant is a Member of Congress. She maintains an account on X, the platform formerly known as Twitter, at ${f(a.url, "[[ACCOUNT URL]]")} (the "Account"), and uses it to conduct official business, including announcing votes, describing committee action, publicizing district events, and communicating with constituents.</p>

<p class="np"><span class="num">2.</span>The Account is open to the public. Any X user may read its posts, reply to them, repost them, and quote them. Defendant has not limited who may reply.</p>

<p class="np"><span class="num">3.</span>Plaintiff is a constituent. On ${f(x.postDate, "[[DATE]]")}, Plaintiff replied to a post on the Account, writing: "${f(x.postText, "[[YOUR POST]]")}."${ex(m, "post")}</p>

<p class="np"><span class="num">4.</span>On ${f(x.blockDate, "[[DATE]]")}, Defendant blocked Plaintiff from the Account.${ex(m, "block")} Blocking is not a rule applied to a comment; it is a status imposed on a person. While signed in, Plaintiff can no longer view the Account's posts, reply to them, repost them, or participate in the comment threads beneath them.</p>

<p class="np"><span class="num">5.</span>Defendant blocked Plaintiff because of the viewpoint Plaintiff expressed. Other users who replied to the same posts, including users whose criticism was sharper than Plaintiff's, remain unblocked.</p>

<p class="np"><span class="num">6.</span>The exclusion violates the First Amendment. Plaintiff seeks a declaration that the block is unconstitutional and an injunction requiring Defendant to restore Plaintiff's access and to refrain from viewpoint-based blocking of Plaintiff.</p>

<p class="np"><span class="num">7.</span>Plaintiff seeks no money damages. The relief sought is declaratory and injunctive only.</p>

<h2>II. Parties</h2>

<p class="np"><span class="num">8.</span>Plaintiff ${f(p.name, "[[PLAINTIFF NAME]]")} is a citizen of the United States residing at ${f(p.street, "[[STREET]]")}, ${f(p.city, "[[CITY]]")}, ${f(p.state, "[[STATE]]")} ${f(p.zip, "[[ZIP]]")}. Plaintiff appears pro se. Plaintiff's electronic-mail address is ${f(p.email, "[[EMAIL]]")} and telephone number is ${f(p.phone, "[[PHONE]]")}.</p>

<p class="np"><span class="num">9.</span>Plaintiff is a constituent of Defendant and, at all relevant times, held the X account @${f(p.handle, "[[HANDLE]]")}.</p>

<p class="np"><span class="num">10.</span>Defendant ${f(d.name, "[[MEMBER NAME]]")} is the ${f(d.title, "[[MEMBER TITLE]]")} for ${districtDesc}. She is sued in her official capacity only and may be served at ${f(d.office, "[[OFFICE ADDRESS]]")}.</p>

<h2>III. Jurisdiction and Venue</h2>

<p class="np"><span class="num">11.</span>This Court has subject-matter jurisdiction under 28 U.S.C. § 1331, because this action arises under the Constitution of the United States.</p>

<p class="np"><span class="num">12.</span>Venue is proper under 28 U.S.C. § 1391(b)(2), because a substantial part of the events giving rise to the claim — Plaintiff's speech, the block, and the resulting deprivation of access — occurred in this district, where Plaintiff resides and reads the Account.</p>

<p class="np"><span class="num">13.</span>Venue is also proper under 28 U.S.C. § 1391(e)(1), which permits an action against an officer of the United States acting in an official capacity to be brought in the district where the plaintiff resides, if no real property is involved.</p>

<p class="np"><span class="num">14.</span>The Court may grant declaratory relief under 28 U.S.C. § 2201 and further necessary relief under 28 U.S.C. § 2202.</p>

<p class="np"><span class="num">15.</span>This action does not ask the Court to question anything Defendant said or did in the exercise of legislative functions. It challenges the administration of a public comment channel, which is not a legislative act. <em>See United States v. Brewster</em>, 408 U.S. 501, 515–16 (1972); <em>Hutchinson v. Proxmire</em>, 443 U.S. 111, 130 (1979).</p>

<h2>IV. Facts</h2>

<h3>A. The Account Is an Official Account</h3>

<p class="np"><span class="num">16.</span>The Account's display name is "${f(a.display, "[[DISPLAY NAME]]")}" and its handle is @${f(a.handle, "[[HANDLE]]")}. Its biography states: "${f(a.bio, "[[BIO]]")}."${ex(m, "profile")}</p>

${indicia.map((line, i) => `<p class="np"><span class="num">${17 + i}.</span>${line}</p>`).join("\n")}

<p class="np"><span class="num">${17 + indicia.length}.</span>The Account is not a campaign account. It bears no "Paid for by" disclaimer and solicits no contributions.</p>

<h3>B. Plaintiff Spoke on a Matter of Public Concern</h3>

<p class="np"><span class="num">${18 + indicia.length}.</span>On ${f(x.postDate, "[[DATE]]")}, Defendant posted about ${a.announces ? "her official business" : "a matter of public concern"}.</p>

<p class="np"><span class="num">${19 + indicia.length}.</span>Plaintiff replied: "${f(x.postText, "[[YOUR POST]]")}."</p>

<p class="np"><span class="num">${20 + indicia.length}.</span>Plaintiff's reply addressed Defendant's conduct of her office. It contained no threat, no disclosure of personal information, no obscenity, and no solicitation.</p>

<h3>C. Defendant Blocked Plaintiff</h3>

<p class="np"><span class="num">${21 + indicia.length}.</span>On ${f(x.blockDate, "[[DATE]]")}, Plaintiff attempted to open the Account and was shown the message "${f(x.blockMessage, "[[BLOCK MESSAGE]]")}."</p>

<p class="np"><span class="num">${22 + indicia.length}.</span>Since that date, while signed in as @${f(p.handle, "[[HANDLE]]")}, Plaintiff cannot view the Account's posts, reply to them, repost them, or read the comment threads beneath them.</p>

<p class="np"><span class="num">${23 + indicia.length}.</span>Plaintiff has not been unblocked.</p>

<h3>D. The Block Was Based on Viewpoint</h3>

<p class="np"><span class="num">${24 + indicia.length}.</span>Other users replied to the same post with criticism of Defendant. Those replies remain visible and those users remain unblocked.</p>

${x.comparisonHandle || x.comparisonText ? `<p class="np"><span class="num">${25 + indicia.length}.</span>On information and belief, the user @${f(x.comparisonHandle, "[[HANDLE]]")} wrote "${f(x.comparisonText, "[[COMMENT]]")}," and remains able to reply to the Account.${ex(m, "comparison")}</p>` : ""}

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 26 : 25) + indicia.length}.</span>Defendant has published no rule governing who may comment on the Account.</p>

<h3>E. Injury</h3>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 27 : 26) + indicia.length}.</span>Plaintiff can no longer read the Account's announcements of votes, committee action, and district events — information Defendant distributes there, and in some instances distributes nowhere else in a timely manner.</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 28 : 27) + indicia.length}.</span>Plaintiff can no longer address the audience that gathers beneath the Account's posts, which includes other constituents, reporters, and Defendant's staff.</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 29 : 28) + indicia.length}.</span>Plaintiff can no longer petition Defendant in the channel Defendant created for public response to her official business.</p>

<h2>V. Count One — Viewpoint Discrimination in Violation of the First Amendment</h2>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 30 : 29) + indicia.length}.</span>Plaintiff realleges paragraphs 1 through ${(x.comparisonHandle || x.comparisonText ? 29 : 28) + indicia.length}.</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 31 : 30) + indicia.length}.</span>Defendant acted under color of federal authority. She possessed actual authority to speak on behalf of her office, and she exercised that authority on the Account. <em>See Lindke v. Freed</em>, 601 U.S. 187, 198 (2024).</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 32 : 31) + indicia.length}.</span>The comment space beneath the Account's posts is a public forum. Defendant intentionally opened it for public discussion by using the Account as an official vehicle for governance and by making its interactive features available to the public without limitation. <em>See Knight First Amendment Institute v. Trump</em>, 928 F.3d 226, 236 (2d Cir. 2019).</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 33 : 32) + indicia.length}.</span>Defendant excluded Plaintiff from that forum because of the viewpoint Plaintiff expressed.</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 34 : 33) + indicia.length}.</span>Viewpoint discrimination is barred in every forum. <em>Cornelius v. NAACP Legal Defense &amp; Educational Fund, Inc.</em>, 473 U.S. 788, 806 (1985); <em>Rosenberger v. Rector &amp; Visitors of the University of Virginia</em>, 515 U.S. 819, 829 (1995).</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 35 : 34) + indicia.length}.</span>Defendant has no compelling interest that justifies the exclusion, and no content-neutral rule that explains it. Avoiding criticism is not a governmental interest the First Amendment recognizes.</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 36 : 35) + indicia.length}.</span>The availability of workarounds does not cure the violation. A blocked user's ability to log out, search, or post elsewhere does not restore access to the forum from which she was excluded. <em>See Knight</em>, 928 F.3d at 234.</p>

<h2>VI. Count Two — Denial of the Right to Petition</h2>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 37 : 36) + indicia.length}.</span>Plaintiff realleges paragraphs 1 through ${(x.comparisonHandle || x.comparisonText ? 36 : 35) + indicia.length}.</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 38 : 37) + indicia.length}.</span>The First Amendment secures the right "to petition the Government for a redress of grievances," and that right "extends to all departments of the Government." <em>California Motor Transport Co. v. Trucking Unlimited</em>, 404 U.S. 508, 510 (1972).</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 39 : 38) + indicia.length}.</span>By opening the Account's comment space and using it to discuss official business, Defendant invited petitions from constituents. Plaintiff's reply was such a petition.</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 40 : 39) + indicia.length}.</span>Blocking Plaintiff from that channel denies the petition.</p>

<h2>VII. Count Three — Conduct Beyond Statutory Authority</h2>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 41 : 40) + indicia.length}.</span>Plaintiff realleges paragraphs 1 through ${(x.comparisonHandle || x.comparisonText ? 40 : 39) + indicia.length}.</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 42 : 41) + indicia.length}.</span>No statute, rule of the House or Senate, or regulation authorizes a Member of Congress to exclude a constituent from an official communications channel because of the constituent's viewpoint.</p>

<p class="np"><span class="num">${(x.comparisonHandle || x.comparisonText ? 43 : 42) + indicia.length}.</span>An officer who acts beyond the authority conferred on her acts individually and may be enjoined. <em>See Larson v. Domestic &amp; Foreign Commerce Corp.</em>, 337 U.S. 682, 689 (1949).</p>

${m.evidence.length ? `<h2>Exhibit Index</h2>
<table class="plain">
<thead><tr><th style="width:14%">Exhibit</th><th style="width:40%">Description</th><th>Source</th></tr></thead>
<tbody>
${m.evidence.map((e, i) => `<tr><td>${exhibitLetter(i)}</td><td>${esc(e.caption)}</td><td>${esc(e.url || "Captured by Plaintiff")}</td></tr>`).join("")}
</tbody>
</table>` : ""}

<h2>VIII. Prayer for Relief</h2>

<p class="ni">WHEREFORE, Plaintiff respectfully requests that the Court:</p>

<p class="ni">A. Declare that Defendant's block of Plaintiff from the Account violates the First Amendment;</p>
<p class="ni">B. Enjoin Defendant, her officers, agents, employees, and successors in office from blocking Plaintiff from the Account, and from enforcing against Plaintiff any policy or practice of blocking users because of the viewpoints they express;</p>
<p class="ni">C. Order Defendant to restore Plaintiff's access to the Account within seven days of the Court's order;</p>
<p class="ni">D. Retain jurisdiction to enforce the order; and</p>
<p class="ni">E. Grant such other relief as justice requires.</p>

<p class="ni">Plaintiff does not request money damages.</p>

${sig(m)}

<hr class="sep">

<div class="keep">
<h2>Certificate of Service</h2>

<p class="ni">I certify that on ${f(m.options.serviceDate, "[[DATE]]")} I served a copy of this Complaint and its exhibits on the following persons by certified mail, return receipt requested:</p>

<table class="plain">
<thead><tr><th>Person Served</th><th>Address</th></tr></thead>
<tbody>
<tr><td>${f(d.name, "[[MEMBER]]")}</td><td>${f(d.office, "[[OFFICE]]")}</td></tr>
<tr><td>United States Attorney for the ${district(m)}</td><td>[[UNITED STATES ATTORNEY ADDRESS]]</td></tr>
<tr><td>Attorney General of the United States</td><td>950 Pennsylvania Avenue NW, Washington, D.C. 20530</td></tr>
</tbody>
</table>

${sig(m, false)}
</div>
</article>`;
}

/* ------------------------------------------------------------------ summons */

export function summons(m: Matter): string {
  const d = m.member;
  return `<article class="doc" data-doc="summons">
${caption(m, "Request for Issuance of Summons")}
<p class="ni">Plaintiff respectfully requests that the Clerk issue summons for the following defendant and for the United States:</p>
<p class="np"><span class="num">1.</span>${f(d.name, "[[MEMBER]]")}, in her official capacity as ${f(d.title, "[[TITLE]]")} for ${f(d.district, "[[DISTRICT]]")}, at ${f(d.office, "[[OFFICE ADDRESS]]")};</p>
<p class="np"><span class="num">2.</span>the United States Attorney for the ${district(m)}; and</p>
<p class="np"><span class="num">3.</span>the Attorney General of the United States, at 950 Pennsylvania Avenue NW, Washington, D.C. 20530.</p>
${m.options.ifp ? `<p class="ni">Plaintiff further requests that the Clerk deliver the summons and complaint to the United States Marshals Service for service, Plaintiff having been granted leave to proceed in forma pauperis. <em>See</em> 28 U.S.C. § 1915(d).</p>` : ""}
${sig(m)}
</article>`;
}

/* ------------------------------------------------------------------ ifp */

export function ifp(m: Matter): string {
  return `<article class="doc" data-doc="ifp">
${caption(m, "Motion for Leave to Proceed In Forma Pauperis")}
<p class="ni">Plaintiff respectfully moves for leave to proceed in forma pauperis under 28 U.S.C. § 1915(a)(1), and in support states:</p>
<p class="np"><span class="num">1.</span>Plaintiff is unable to pay the fees and costs of this action. The affidavit attached to this motion sets out Plaintiff's assets, income, expenses, and obligations.</p>
<p class="np"><span class="num">2.</span>Plaintiff's action is not frivolous. It asserts that a Member of Congress excluded Plaintiff from a public forum because of the viewpoint Plaintiff expressed, in violation of the First Amendment, and it seeks only declaratory and injunctive relief.</p>
<p class="np"><span class="num">3.</span>Plaintiff requests that the Court direct the United States Marshals Service to serve the summons and complaint under 28 U.S.C. § 1915(d).</p>
<p class="ni">WHEREFORE, Plaintiff requests that the Court grant leave to proceed without prepayment of fees and direct service by the United States Marshals Service.</p>
${sig(m)}
<div class="pagebreak"></div>
${caption(m, "Affidavit in Support of Motion for Leave to Proceed In Forma Pauperis")}
<p class="ni">I, ${f(m.plaintiff.name, "[[YOUR NAME]]")}, being duly sworn, state:</p>
<p class="np"><span class="num">1.</span>I am the plaintiff in this action. I reside at ${f(m.plaintiff.street, "[[STREET]]")}, ${f(m.plaintiff.city, "[[CITY]]")}, ${f(m.plaintiff.state, "[[STATE]]")} ${f(m.plaintiff.zip, "[[ZIP]]")}.</p>
<p class="np"><span class="num">2.</span>I am presently [[employed / unemployed / retired / a student]]. My occupation is [[OCCUPATION]] and my employer is [[EMPLOYER OR "NONE"]].</p>
<p class="np"><span class="num">3.</span>My total monthly income from all sources is $[[AMOUNT]]. Its sources are [[LIST SOURCES]].</p>
<p class="np"><span class="num">4.</span>The monthly income of my spouse or household member is $[[AMOUNT]] [or "not applicable"].</p>
<p class="np"><span class="num">5.</span>I have $[[AMOUNT]] in cash and $[[AMOUNT]] on deposit at [[FINANCIAL INSTITUTION]].</p>
<p class="np"><span class="num">6.</span>I own the following property of value: [[LIST, WITH APPROXIMATE VALUE; OR "No property other than ordinary household goods."]]</p>
<p class="np"><span class="num">7.</span>My average monthly expenses are: rent or mortgage $[[AMOUNT]]; utilities $[[AMOUNT]]; food $[[AMOUNT]]; transportation $[[AMOUNT]]; medical $[[AMOUNT]]; other $[[AMOUNT]].</p>
<p class="np"><span class="num">8.</span>I [[DO / DO NOT]] receive public benefits. [[IF SO, LIST THEM.]]</p>
<p class="np"><span class="num">9.</span>I cannot pay the filing fee or give security for it without depriving myself or my dependents of the necessities of life.</p>
<p class="np"><span class="num">10.</span>I believe I am entitled to the relief sought because a Member of Congress blocked me from an official account used for official business, because of the viewpoint I expressed, in violation of the First Amendment.</p>
<p class="ni">I declare under penalty of perjury that the foregoing is true and correct.</p>
${sig(m, false)}
</article>`;
}

/* ------------------------------------------------------------------ pi */

export function pi(m: Matter): string {
  const a = m.account, x = m.facts;
  return `<article class="doc" data-doc="pi">
${caption(m, "Motion for Preliminary Injunction")}
<p class="ni">Plaintiff respectfully moves under Rule 65 of the Federal Rules of Civil Procedure for a preliminary injunction requiring Defendant to restore Plaintiff's access to the account at ${f(a.url, "[[ACCOUNT URL]]")} and to refrain from blocking Plaintiff because of the viewpoints Plaintiff expresses, pending final judgment.</p>
<p class="ni">The grounds are set out in the accompanying memorandum of law and the declaration of ${f(m.plaintiff.name, "[[YOUR NAME]]")}.</p>
${sig(m)}
<div class="pagebreak"></div>
${caption(m, "Memorandum of Law in Support of Motion for Preliminary Injunction")}
<h2>I. Introduction</h2>
<p class="ni">Plaintiff asks the Court to restore access to a public forum while this case proceeds. Defendant opened her official account to public comment, invited constituents to respond, and then excluded Plaintiff because of the view Plaintiff expressed.</p>
<h2>II. Factual Background</h2>
<p class="np"><span class="num">1.</span>Defendant maintains the Account at ${f(a.url, "[[ACCOUNT URL]]")} and uses it to announce votes, describe committee action, and communicate with constituents.</p>
<p class="np"><span class="num">2.</span>The Account's interactive features are open to the public without limitation, and Defendant has published no rule governing who may reply.</p>
<p class="np"><span class="num">3.</span>On ${f(x.postDate, "[[DATE]]")}, Plaintiff replied to a post on the Account: "${f(x.postText, "[[YOUR POST]]")}."</p>
<p class="np"><span class="num">4.</span>On ${f(x.blockDate, "[[DATE]]")}, Defendant blocked Plaintiff. Plaintiff can no longer view, reply to, or repost the Account's posts.</p>
<p class="np"><span class="num">5.</span>Other users who criticized Defendant in the same thread remain unblocked.</p>
<h2>III. Argument</h2>
<h3>A. Plaintiff Is Likely to Succeed on the Merits</h3>
<p class="np"><span class="num">6.</span><strong>Government action.</strong> A public official's social-media activity is state action only if the official possessed authority to speak on the government's behalf and purported to exercise it. <em>Lindke v. Freed</em>, 601 U.S. 187, 198 (2024). Defendant satisfies both, and "an official cannot insulate government business from scrutiny by conducting it on a personal page." <em>Id.</em> at 202 n.2.</p>
<p class="np"><span class="num">7.</span><strong>Public forum.</strong> An account intentionally opened for public discussion, used as an official vehicle for governance, with interactive features accessible without limitation, is a public forum. <em>Knight First Amendment Institute v. Trump</em>, 928 F.3d 226, 236 (2d Cir. 2019).</p>
<p class="np"><span class="num">8.</span><strong>Viewpoint discrimination.</strong> Defendant excluded Plaintiff because of the viewpoint Plaintiff expressed while leaving harsher critics unblocked. <em>Rosenberger v. Rector &amp; Visitors of the University of Virginia</em>, 515 U.S. 819, 829 (1995); <em>accord Cornelius</em>, 473 U.S. 788, 806 (1985).</p>
<h3>B. Plaintiff Will Suffer Irreparable Harm</h3>
<p class="np"><span class="num">9.</span>The loss of access to a public forum is irreparable. It cannot be measured in money and cannot be repaired after the fact. The harm is continuing: every day the block remains, Plaintiff is excluded from announcements and from the audience beneath the Account's posts.</p>
<h3>C. The Balance of Hardships Favors Plaintiff</h3>
<p class="np"><span class="num">10.</span>Plaintiff loses access to official communications and to a public forum. Defendant loses only the ability to exclude one critic. The injunction does not require her to speak, to follow Plaintiff, or to engage with Plaintiff.</p>
<h3>D. The Public Interest Favors the Order</h3>
<p class="np"><span class="num">11.</span>The public interest lies in enforcing the First Amendment. The government "is not permitted to 'amplify' favored speech by banning or burdening viewpoints with which it disagrees." <em>Knight</em>, 928 F.3d at 238.</p>
<h3>E. No Security Should Be Required</h3>
<p class="np"><span class="num">12.</span>Rule 65(c) permits the Court to require security. Plaintiff proceeds pro se${m.options.ifp ? " and in forma pauperis" : ""}, and the injunction restrains only unlawful exclusion.</p>
<h2>IV. Conclusion</h2>
<p class="np"><span class="num">13.</span>The Court should grant the motion and order Defendant to restore Plaintiff's access to the Account and to refrain from viewpoint-based blocking of Plaintiff pending final judgment.</p>
${sig(m)}
<div class="pagebreak"></div>
${caption(m, "Declaration of " + f(m.plaintiff.name, "[[YOUR NAME]]"))}
<p class="ni">I, ${f(m.plaintiff.name, "[[YOUR NAME]]")}, declare under penalty of perjury as follows:</p>
<p class="np"><span class="num">1.</span>I am the plaintiff in this action. The facts stated in the complaint and in this motion are within my personal knowledge and are true.</p>
<p class="np"><span class="num">2.</span>I hold the X account @${f(m.plaintiff.handle, "[[HANDLE]]")}. On ${f(x.postDate, "[[DATE]]")}, I posted the reply quoted in the complaint.</p>
<p class="np"><span class="num">3.</span>On ${f(x.blockDate, "[[DATE]]")}, I discovered that I had been blocked. Since that date I have been unable to view, reply to, or repost the Account's posts while signed in.</p>
<p class="np"><span class="num">4.</span>I have not threatened Defendant, disclosed her home address, or flooded her account with repeated posts.</p>
<p class="np"><span class="num">5.</span>I rely on the Account for information about [[SPECIFY]]. Since the block I have missed [[DESCRIBE]].</p>
${sig(m, false)}
</article>`;
}

/* ------------------------------------------------------------------ service */

export function service(m: Matter): string {
  const d = m.member;
  return `<article class="doc" data-doc="service">
${caption(m, "Certificate of Service")}
<p class="ni">I certify that on ${f(m.options.serviceDate, "[[DATE]]")} I served the following documents:</p>
<p class="ni">[[LIST DOCUMENTS SERVED]]</p>
<p class="ni">on the following persons, by the means stated:</p>
<p class="np"><span class="num">1.</span>${f(d.name, "[[MEMBER]]")}, at ${f(d.office, "[[OFFICE ADDRESS]]")}, by certified mail, return receipt requested, Article No. [[TRACKING]];</p>
<p class="np"><span class="num">2.</span>the United States Attorney for the ${district(m)}, by certified mail, return receipt requested, Article No. [[TRACKING]]; and</p>
<p class="np"><span class="num">3.</span>the Attorney General of the United States, at 950 Pennsylvania Avenue NW, Washington, D.C. 20530, by certified mail, return receipt requested, Article No. [[TRACKING]].</p>
<p class="ni">I declare under penalty of perjury that the foregoing is true and correct.</p>
${sig(m, false)}
</article>`;
}

/* ------------------------------------------------------------------ cover sheet */

export function coversheet(m: Matter): string {
  const d = m.member;
  return `<article class="doc" data-doc="coversheet">
<h2 class="sheet-title">Filing Checklist &amp; Civil Cover Sheet</h2>
<p class="ni">This page is for you, not for the court. Complete the court's current JS-44 form from its website; do not retype it. The entries below are what this case requires.</p>
<table class="plain">
<thead><tr><th style="width:32%">JS-44 box</th><th>Entry</th></tr></thead>
<tbody>
<tr><td>Plaintiff</td><td>${f(m.plaintiff.name, "[[YOUR NAME]]")}, ${f(m.plaintiff.street, "[[STREET]]")}, ${f(m.plaintiff.city, "[[CITY]]")}, ${f(m.plaintiff.state, "[[STATE]]")} ${f(m.plaintiff.zip, "[[ZIP]]")}</td></tr>
<tr><td>Attorney for Plaintiff</td><td>PRO SE — ${f(m.plaintiff.phone, "[[PHONE]]")} / ${f(m.plaintiff.email, "[[EMAIL]]")}</td></tr>
<tr><td>Defendant</td><td>${f(d.name, "[[MEMBER]]")}, official capacity, ${f(d.office, "[[OFFICE]]")}</td></tr>
<tr><td>Basis of jurisdiction</td><td>Box 3 — Federal Question; check "U.S. Government Defendant"; 28 U.S.C. § 1331</td></tr>
<tr><td>Nature of suit</td><td>440 — Other Civil Rights</td></tr>
<tr><td>Origin</td><td>1 — Original Proceeding</td></tr>
<tr><td>Cause of action</td><td>First Amendment — viewpoint discrimination; right to petition. 28 U.S.C. §§ 1331, 2201</td></tr>
<tr><td>Requested in complaint</td><td>Money: No. Other: declaratory and injunctive relief. Jury: No</td></tr>
<tr><td>Related cases</td><td>None, unless you have filed previously about this block</td></tr>
</tbody>
</table>

<h2 class="sheet-title">Order of filing</h2>
<p class="np"><span class="num">1.</span>Complaint, civil cover sheet, and request for issuance of summons.</p>
<p class="np"><span class="num">2.</span>${m.options.ifp ? "Motion to proceed in forma pauperis with affidavit and proposed order — or pay the filing fee." : "Pay the filing fee, or file the in forma pauperis motion instead."}</p>
<p class="np"><span class="num">3.</span>${m.options.pi ? "Motion for preliminary injunction with memorandum, declaration, and proposed order." : "Optionally, a motion for a preliminary injunction asking to be unblocked while the case proceeds."}</p>
<p class="np"><span class="num">4.</span>Serve the defendant, the United States Attorney, and the Attorney General; then file the certificate of service.</p>

<h2 class="sheet-title">Serve all four</h2>
<p class="np"><span class="num">1.</span>${f(d.name, "[[MEMBER]]")}, personally, at ${f(d.office, "[[OFFICE]]")}.</p>
<p class="np"><span class="num">2.</span>The Member in her official capacity, through the United States Attorney for the ${district(m)}.</p>
<p class="np"><span class="num">3.</span>The Attorney General of the United States, 950 Pennsylvania Avenue NW, Washington, D.C. 20530.</p>
<p class="np"><span class="num">4.</span>A courtesy copy to the House or Senate Office of General Counsel.</p>
<p class="ni"><em>Send by certified mail, return receipt requested, and keep the green cards. Rule 4(m) gives you a limited time — currently 90 days — to complete service.</em></p>
</article>`;
}

/* ------------------------------------------------------------------ exhibits */

export function exhibits(m: Matter): string {
  if (m.evidence.length === 0) return "";
  return m.evidence
    .map(
      (e: EvidenceItem, i: number) => `<article class="doc exhibit-page" data-doc="exhibit-${i}">
<p class="exhibit-tab">EXHIBIT ${exhibitLetter(i)}</p>
<p class="ni"><strong>${esc(e.caption || "Capture")}</strong></p>
${e.url ? `<p class="ni"><em>Source: ${esc(e.url)}</em></p>` : ""}
${e.dataUrl ? `<img class="exhibit-img" src="${e.dataUrl}" alt="${esc(e.caption)}">` : `<p class="ni"><em>[Attach the capture here, or print this page and tape the screenshot to it.]</em></p>`}
</article>`,
    )
    .join("\n");
}
