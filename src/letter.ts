/**
 * The open letter to the Department of Justice.
 *
 * One source, two outputs: the site renders these blocks, and build.mjs writes
 * open-letter-doj.md from the same data, so the two cannot drift.
 *
 * Inline emphasis is limited to **bold** and *italic*; everything else is plain
 * text and is escaped on the way into HTML.
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "quote"; text: string; cite: string }
  | { kind: "list"; items: string[] }
  | { kind: "sig"; text: string };

export const LETTER = {
  org: "MoreSpeech",
  site: "morespeech.online",
  date: "November 24, 2026",
  to: [
    "Office of the Attorney General",
    "U.S. Department of Justice",
    "950 Pennsylvania Avenue NW",
    "Washington, D.C. 20530",
  ],
  cc: [
    "Assistant Attorney General, Civil Rights Division",
    "U.S. Department of Justice",
    "950 Pennsylvania Avenue NW",
    "Washington, D.C. 20530",
  ],
  re: "Request that the Department investigate and prosecute viewpoint-based blocking of constituents by Members of Congress under 18 U.S.C. §§ 241 and 242",
  blocks: [
    {
      kind: "p",
      text: "Dear Attorney General:",
    },
    {
      kind: "p",
      text: "MoreSpeech is a civic project that helps residents understand their rights when a federal official blocks them from a social-media account the official uses for public business. We write to ask the Department to investigate — and, where the elements are met, to prosecute — Members of Congress and Senators who block constituents from official accounts because of the views those constituents express.",
    },
    {
      kind: "p",
      text: "This is not a request for a policy preference. Sections 241 and 242 of Title 18 are the statutes Congress wrote to punish precisely this conduct: the use of official power to injure a person in the exercise of a right secured by the Constitution. The right is settled. The conduct is documented. The Department is the only authority that can enforce the criminal law against it.",
    },

    { kind: "h", text: "1. The conduct" },
    {
      kind: "p",
      text: "A Member of Congress maintains an account on X. The account carries the office's name and title; the Member's staff write and post to it; it announces votes, committee action, district events, and constituent services. The Member leaves the reply function open to the public without limitation.",
    },
    {
      kind: "p",
      text: "A constituent replies critically. The Member blocks that constituent. Blocking is not a rule applied to a comment; it is a status imposed on a person. The constituent can no longer read the office's announcements, reply to them, repost them, or address the audience that gathers beneath them. The exclusion is total, durable, and person-specific.",
    },
    {
      kind: "p",
      text: "The pattern is not hypothetical. It is the fact pattern of the published blocking litigation, and it repeats across administrations, chambers, and platforms.",
    },

    { kind: "h", text: "2. The right" },
    {
      kind: "p",
      text: "A public official's social-media activity is governmental when the official possessed authority to speak on the government's behalf and purported to exercise that authority. The Supreme Court supplied that test in *Lindke v. Freed*, 601 U.S. 187, 198 (2024), and closed the obvious escape hatch in the same opinion:",
    },
    {
      kind: "quote",
      text: "An official cannot insulate government business from scrutiny by conducting it on a personal page.",
      cite: "Lindke, 601 U.S. at 202 n.2",
    },
    {
      kind: "p",
      text: "Once an official opens an account to public comment and uses it to govern, the interactive space is a public forum. The Second Circuit held so directly:",
    },
    {
      kind: "quote",
      text: "The Account was intentionally opened for public discussion when the President, upon assuming office, repeatedly used the Account as an official vehicle for governance and made its interactive features accessible to the public without limitation. We hold that this conduct created a public forum.",
      cite: "Knight First Amendment Inst. v. Trump, 928 F.3d 226, 236 (2d Cir. 2019)",
    },
    {
      kind: "p",
      text: "Viewpoint discrimination is barred in every forum, public or not. *Cornelius v. NAACP Legal Defense & Educational Fund, Inc.*, 473 U.S. 788, 806 (1985); *Rosenberger v. Rector & Visitors of the University of Virginia*, 515 U.S. 819, 829 (1995). The government may not do indirectly what it could not do directly:",
    },
    {
      kind: "quote",
      text: "the government is not permitted to \"amplify\" favored speech by banning or burdening viewpoints with which it disagrees.",
      cite: "Knight, 928 F.3d at 238",
    },
    {
      kind: "p",
      text: "These holdings are not novel and they are not close. They are the settled application of doctrine that predates the platforms.",
    },

    { kind: "h", text: "3. The statutes" },
    {
      kind: "p",
      text: "Section 242 punishes whoever, \"under color of any law, statute, ordinance, regulation, or custom, willfully subjects any person in any State, Territory, Commonwealth, Possession, or District to the deprivation of any rights, privileges, or immunities secured or protected by the Constitution or laws of the United States.\" 18 U.S.C. § 242.",
    },
    {
      kind: "p",
      text: "The statute reaches federal officers. It says \"any law,\" not \"any State law,\" and the Supreme Court read it that way in the decision that saved it from vagueness: \"He who acts under color of law may be a federal officer or a state officer. He may act under color of federal law or of state law.\" *Screws v. United States*, 325 U.S. 91, 108 (1945). The Ninth Circuit rejected the contrary reading outright and affirmed § 242 convictions of federal agents. *United States v. Otherson*, 637 F.2d 1276 (9th Cir. 1981).",
    },
    {
      kind: "p",
      text: "Willfulness is the element that separates a crime from an error, and it is a fact about purpose. It means the specific intent to deprive a person of a federal right — not knowledge that the conduct is unconstitutional, and not legal training. After *Knight* (2019), the reasoning adopted across the circuits, and *Lindke* (2024), no official can plausibly claim the line was unknown.",
    },
    {
      kind: "p",
      text: "Section 241 reaches the coordination that makes a practice possible: two or more persons conspiring to \"injure, oppress, threaten, or intimidate any person ... in the free exercise or enjoyment of any right or privilege secured to him by the Constitution or laws of the United States, **or because of his having so exercised the same**.\" 18 U.S.C. § 241. That final clause is a retaliation provision written into the statute in 1870. A constituent blocked for criticising an official has been injured because she exercised the right.",
    },

    { kind: "h", text: "4. Why the Department" },
    {
      kind: "p",
      text: "Private litigation cannot do this work. The Supreme Court has held that the implied damages remedy against federal officers does not extend to First Amendment retaliation claims. *Egbert v. Boule*, 596 U.S. 482, 502 (2022). What remains is prospective relief that lapses when the Member leaves office, obtained by each constituent, alone, at her own expense, in her own district.",
    },
    {
      kind: "p",
      text: "In the decisions we could locate and code — twenty-two suits filed between 2017 and 2026 — five produced a merits judgment for the plaintiff, none produced a compensatory or punitive damages award, and one federal-official case was dismissed at the pleading stage. That is not a failure of the theory; it is the predictable result of asking individuals to enforce a public right with private money.",
    },
    {
      kind: "p",
      text: "The criminal civil-rights statutes exist for exactly this reason. They are enforced by the United States, against officials, without requiring the victim to fund a lawsuit. The Civil Rights Division has jurisdiction over both sections. The Department therefore has the authority, the tools, and — we respectfully submit — the responsibility.",
    },

    { kind: "h", text: "5. The limits we acknowledge" },
    {
      kind: "p",
      text: "We do not ask the Department to act on a theory we have not tested. Three limits belong in the record:",
    },
    {
      kind: "list",
      items: [
        "**No appellate decision has yet applied § 242 to expressive conduct by a federal officer.** That federal officers are covered is settled (*Screws*; *Otherson*). That viewpoint-based exclusion from a comment thread is the kind of deprivation § 242 reaches is our reading of the text, not a holding.",
        "**The Speech or Debate Clause will be litigated.** It protects legislative acts, not the administration of a constituent-communications channel; the Supreme Court held that a Senator's newsletters and press release were unprotected because they were not \"essential to the deliberations of the Senate.\" *Hutchinson v. Proxmire*, 443 U.S. 111, 130 (1979). But the argument will be made and must be met.",
        "**Some blocks are lawful.** Threats, doxxing, spam, and commercial solicitation may be excluded. A prosecution that does not distinguish viewpoint from conduct would be both unjust and self-defeating.",
      ],
    },
    {
      kind: "p",
      text: "Those limits are why we ask for investigation and published criteria rather than for a particular indictment.",
    },

    { kind: "h", text: "6. What we ask" },
    {
      kind: "list",
      items: [
        "**Open a preliminary investigation** into viewpoint-based blocking of constituents by Members of Congress and Senators from accounts used for official business.",
        "**Issue public guidance** stating that excluding a constituent from such an account because of the constituent's viewpoint violates the First Amendment, and that 18 U.S.C. § 242 applies to a federal official who does so willfully.",
        "**Publish the criteria** the Department will use in evaluating referrals and complaints in this area, so that residents, courts, and offices alike can know what the Department considers chargeable.",
        "**Preserve the evidence.** Block lists, moderation records, and staff communications concerning blocking are the core of any case and are routinely held in systems that overwrite themselves.",
        "**Respond in writing within sixty days** to the undersigned, stating whether the Department has opened an inquiry and, if not, why not.",
      ],
    },

    { kind: "h", text: "7. What this letter is not" },
    {
      kind: "p",
      text: "It is not an accusation against any named individual. It does not assert that every block is a crime, or that any particular Member has committed one. It is not a comment on any pending case. It is a request that the Department exercise authority it already holds, under statutes it already enforces, against conduct the courts have already held unconstitutional — and that it say publicly how it will exercise that authority.",
    },
    {
      kind: "p",
      text: "The First Amendment does not guarantee that officials will listen. It guarantees that they may not use the power of office to prevent citizens from speaking to one another about them. When an official does that, the injury is not only to the person blocked. It is to the arrangement the Constitution presumes: that the government answers to the governed, and that the answer can be given out loud.",
    },
    {
      kind: "p",
      text: "We respectfully request the Department's response.",
    },
    {
      kind: "sig",
      text: "Respectfully submitted,\n\n**MoreSpeech**\nmorespeech.online\n\nOn behalf of the signers below.",
    },
  ] as Block[],
  enclosures: [
    "Legal memorandum, \"Blocking as Censorship\" (21 pp.)",
    "Filing packet for individual complainants (28 pp.)",
  ],
  signerNote:
    "Signers affirm that they have read this letter and that they are residents or citizens of the United States. To add a name, print the letter, sign it, and mail it to the address above; this page has no server and collects nothing.",
};

const mdInline = (s: string): string => s;

/** Render the letter as Markdown, for the repository and for download. */
export function letterMarkdown(): string {
  const out: string[] = [];
  out.push(`# An Open Letter to the Attorney General of the United States`);
  out.push("");
  out.push(`*${LETTER.org} · ${LETTER.site} · ${LETTER.date}*`);
  out.push("");
  out.push(LETTER.to.join("  \n"));
  out.push("");
  out.push("**Cc:** " + LETTER.cc.join(", "));
  out.push("");
  out.push(`**Re:** ${LETTER.re}`);
  out.push("");
  for (const b of LETTER.blocks) {
    if (b.kind === "h") {
      out.push(`## ${b.text}`);
      out.push("");
    } else if (b.kind === "p") {
      out.push(mdInline(b.text));
      out.push("");
    } else if (b.kind === "quote") {
      out.push(`> ${b.text}`);
      out.push(`>`);
      out.push(`> — ${b.cite}`);
      out.push("");
    } else if (b.kind === "list") {
      for (const item of b.items) out.push(`- ${item}`);
      out.push("");
    } else if (b.kind === "sig") {
      for (const line of b.text.split("\n")) out.push(line);
      out.push("");
      out.push("________________________________________");
      out.push("");
      out.push("Name: ______________________________");
      out.push("");
      out.push("City / State: ______________________");
      out.push("");
    }
  }
  out.push("### Enclosures");
  out.push("");
  for (const e of LETTER.enclosures) out.push(`- ${e}`);
  out.push("");
  out.push(`*${LETTER.signerNote}*`);
  out.push("");
  return out.join("\n");
}
