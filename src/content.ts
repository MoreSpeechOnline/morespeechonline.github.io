import type { CaseRow, ChainStep, Defense, Stat } from "./types";

/**
 * Every quotation below was checked against primary text (U.S. Code corpus,
 * CourtListener replica) or against a later opinion that reproduces it.
 * Nothing here is quoted from memory.
 */

export const CHAIN: ChainStep[] = [
  {
    id: "action",
    num: "01",
    kicker: "First link",
    title: "The account is the government's",
    lede:
      "A block is only a constitutional problem if the person who blocked you was acting as the government. For an official account, that is the easy part.",
    body: [
      "The test comes from Lindke v. Freed. A public official's social-media activity is governmental when the official possessed authority to speak on the government's behalf and purported to exercise that authority in the posts at issue.",
      "For a federal officer the question is capacity, not state action: the First Amendment addresses Congress in terms, so a federal official cannot hide behind the argument that no \"state\" acted.",
      "The Supreme Court closed the obvious escape hatch in a footnote: an official cannot insulate government business from scrutiny by moving it to a personal page.",
    ],
    quotes: [
      {
        text:
          "a public official's social-media activity constitutes state action under §1983 only if the official (1) possessed actual authority to speak on the State's behalf, and (2) purported to exercise that authority.",
        cite: "Lindke v. Freed, 601 U.S. 187, 198 (2024)",
      },
      {
        text:
          "An official cannot insulate government business from scrutiny by conducting it on a personal page.",
        cite: "Lindke v. Freed, 601 U.S. 187, 202 n.2 (2024)",
      },
    ],
    takeaway:
      "Prove capacity with the office's own documents: the agency link, staff-written posts, announcements of votes, casework.",
  },
  {
    id: "forum",
    num: "02",
    kicker: "Second link",
    title: "The replies are a public forum",
    lede:
      "An official who posts an announcement and leaves the replies open has opened a forum. The government's own message is not the forum — the space beneath it is.",
    body: [
      "The Second Circuit held that an account used as an official vehicle for governance, with interactive features open to the public without limitation, is a public forum.",
      "The distinction that decides the government-speech defense: the official's posts may be government speech, but the replies, reposts, and likes of other users are not.",
      "Even if a court called the thread a nonpublic forum, viewpoint discrimination is barred in every forum — so the fight over the label narrows the remedy, it does not save the official.",
    ],
    quotes: [
      {
        text:
          "The Account was intentionally opened for public discussion when the President, upon assuming office, repeatedly used the Account as an official vehicle for governance and made its interactive features accessible to the public without limitation. We hold that this conduct created a public forum.",
        cite: "Knight First Amendment Inst. v. Trump, 928 F.3d 226, 236 (2d Cir. 2019)",
      },
      {
        text:
          "while the President's tweets can accurately be described as government speech, the retweets, replies, and likes of other users … are not government speech under any formulation.",
        cite: "Knight, 928 F.3d at 239",
      },
    ],
    takeaway:
      "Capture the account with replies open, no stated limit on who may respond, and no published rule governing comment.",
  },
  {
    id: "viewpoint",
    num: "03",
    kicker: "Third link",
    title: "The block is viewpoint discrimination",
    lede:
      "Moderation is a rule about a comment. A block is a status imposed on a person — durable, total, and selected because of what that person said.",
    body: [
      "Viewpoint discrimination is the egregious form of content discrimination: the government must abstain when the speaker's opinion is the reason for the restriction.",
      "Blocking also burdens three separate rights: to speak in the forum, to receive the official's announcements, and to petition the officer responsible.",
      "The existence of workarounds — logging out, searching, posting elsewhere — does not cure it. The Second Circuit rejected that defense directly.",
    ],
    quotes: [
      {
        text:
          "Viewpoint discrimination is thus an egregious form of content discrimination. The government must abstain from regulating speech when the specific motivating ideology or the opinion or perspective of the speaker is the rationale for the restriction.",
        cite: "Rosenberger v. Rector & Visitors of Univ. of Va., 515 U.S. 819, 829 (1995)",
      },
      {
        text: "burdens to speech as well as outright bans run afoul of the First Amendment.",
        cite: "Knight, 928 F.3d at 234",
      },
    ],
    takeaway:
      "The comparison set is the proof: who else said the same thing and stayed unblocked.",
  },
  {
    id: "defenses",
    num: "04",
    kicker: "Fourth link",
    title: "The defenses do not hold",
    lede:
      "Three arguments decide most of these cases. Each has an answer, and two of them are answered by the Supreme Court.",
    body: [
      "Government speech: the doctrine governs the government's own message, not who may answer it.",
      "Personal account: a mixed account does not help, because blocking operates page-wide — the official who blocks a critic from every post necessarily blocked the official ones.",
      "Speech or Debate: the Clause reaches legislative acts. The Court held that a Senator's newsletters and press release were unprotected because they were not essential to deliberations.",
    ],
    quotes: [
      {
        text:
          "the government is not permitted to \"amplify\" favored speech by banning or burdening viewpoints with which it disagrees.",
        cite: "Knight, 928 F.3d at 238",
      },
      {
        text:
          "neither the newsletters nor the press release was 'essential to the deliberations of the Senate' and neither was part of the deliberative process.",
        cite: "Hutchinson v. Proxmire, 443 U.S. 111, 130 (1979)",
      },
    ],
    takeaway:
      "Anticipate all three in the complaint. A filing that answers them survives the motion to dismiss.",
  },
  {
    id: "remedy",
    num: "05",
    kicker: "Fifth link",
    title: "There is a remedy, and it is not money",
    lede:
      "This is the part most guides get wrong. Against a federal official, damages for First Amendment retaliation are foreclosed. What remains is an order.",
    body: [
      "The Supreme Court held that the implied damages remedy does not extend to a First Amendment retaliation claim against a federal officer.",
      "Prospective relief survives. A suit for an injunction is not a suit against the Treasury, and a court can order an officer to stop enforcing an unconstitutional practice.",
      "That is why the filings here ask for a declaration and an injunction, and never for damages: a demand for money invites partial dismissal and, if you are proceeding without prepaying fees, a screening dismissal.",
    ],
    quotes: [
      {
        text: "There is no Bivens cause of action for Boule's First Amendment retaliation claim.",
        cite: "Egbert v. Boule, 596 U.S. 482, 502 (2022)",
      },
      {
        text:
          "where the officer's powers are limited by statute, his actions beyond those limitations are considered individual and not sovereign actions.",
        cite: "Larson v. Domestic & Foreign Commerce Corp., 337 U.S. 682, 689 (1949)",
      },
    ],
    takeaway:
      "Ask for the declaration and the unblocking order. That is the relief a court can actually give.",
  },
];

export const STATS: Stat[] = [
  {
    value: 22,
    label: "blocking suits coded",
    note: "Social-media blocking cases retrievable in the CourtListener replica, 2017–2026.",
  },
  {
    value: 5,
    label: "merits wins",
    note: "Injunction or declaratory judgment for the plaintiff.",
  },
  {
    value: 0,
    suffix: "",
    label: "damages awards",
    note: "No compensatory or punitive award exists in the set.",
  },
  {
    value: 1,
    suffix: ".00",
    label: "the only money judgment",
    note: "Nominal damages in Felts v. Green, plus $20,338.50 in fees.",
  },
];

export const CASES: CaseRow[] = [
  {
    name: "Knight First Amendment Inst. v. Trump",
    court: "2d Cir.",
    year: "2019",
    outcome: "moot",
    note: "Held the interactive space a public forum; vacated as moot after the change of administration.",
  },
  {
    name: "Davison v. Randall",
    court: "4th Cir.",
    year: "2019",
    outcome: "win",
    note: "County chair's Facebook page; interactive portion a public forum; ban affirmed unlawful.",
  },
  {
    name: "Garnier v. O'Connor-Ratcliff",
    court: "9th Cir.",
    year: "2025",
    outcome: "win",
    note: "Post-Lindke remand: blocking was state action; declaratory and injunctive relief affirmed.",
  },
  {
    name: "Felts v. Green",
    court: "E.D. Mo.",
    year: "2022",
    outcome: "win",
    note: "$1.00 nominal damages, fees, and declaratory relief; injunction mooted by resignation.",
  },
  {
    name: "Czosnyka v. Gardiner",
    court: "N.D. Ill.",
    year: "2023",
    outcome: "win",
    note: "Summary judgment for plaintiffs; permanent injunction; no qualified immunity for equitable relief.",
  },
  {
    name: "Lindke v. Freed",
    court: "6th Cir. / S. Ct.",
    year: "2024",
    outcome: "survived",
    note: "Vacated and remanded for the two-part test; still pending after nine years.",
  },
  {
    name: "Pinkhasov v. Vernikov",
    court: "E.D.N.Y.",
    year: "2024",
    outcome: "survived",
    note: "Motion to dismiss denied; blocking based on the plaintiff's criticism.",
  },
  {
    name: "Raven v. Sajet",
    court: "D.D.C.",
    year: "2024",
    outcome: "lost",
    note: "Federal official; dismissed because the profile had been stripped of its official markers.",
  },
  {
    name: "Dingwell v. Cossette",
    court: "D. Conn.",
    year: "2020",
    outcome: "lost",
    note: "Qualified immunity granted: the right was not clearly established before Knight (2019).",
  },
];

export const DEFENSES: Defense[] = [
  {
    question: "\"It was a personal account.\"",
    verdict: "Rebuttable",
    answer: [
      "The label is not the test. The test is authority plus its exercise: did the official have authority to speak for the office, and did she use it here?",
      "If she mixed personal and official posts, the defense gets worse, not better: blocking is page-wide, so a block aimed at a critic necessarily reaches the official posts too.",
      "What defeats the claim is an account stripped of every official marker — no title, no agency link, a disclaimer, and nothing but personal content.",
    ],
    quote: {
      text:
        "The bluntness of Facebook's blocking tool highlights the cost of a 'mixed use' social-media account.",
      cite: "Lindke, 601 U.S. at 204",
    },
  },
  {
    question: "\"This is government speech.\"",
    verdict: "Answered",
    answer: [
      "The doctrine protects the government's own message. It does not license the government to silence everyone else's.",
      "The posts can be government speech and the replies still are not. A reply is identified as coming from its author, not from the office.",
      "The government may not amplify favored speech by burdening the viewpoints it dislikes.",
    ],
    quote: {
      text:
        "the retweets, replies, and likes of other users … are not government speech under any formulation.",
      cite: "Knight, 928 F.3d at 239",
    },
  },
  {
    question: "\"The Speech or Debate Clause bars this suit.\"",
    verdict: "Answered",
    answer: [
      "The Clause covers legislative acts: voting, committee work, investigations. It has never covered everything a Member touches.",
      "The Supreme Court refused to extend it to newsletters and a press release, because they were not part of the deliberative process.",
      "Running a comment channel and choosing who may use it is administration of a communications channel, not legislation.",
    ],
    quote: {
      text:
        "the Clause protects only 'legislative' acts by a member of Congress or an aide, and only official, formal acts (or perhaps their functional equivalent) deserve the adjective 'legislative.'",
      cite: "Bastien v. Office of Sen. Ben Nighthorse Campbell, 390 F.3d 1301, 1305–06 (10th Cir. 2004)",
    },
  },
];

export const CANNOT = [
  "Money damages from the Member — the Supreme Court foreclosed that claim against federal officers.",
  "Punishment of the Member, an apology, or a finding of bad faith.",
  "An order that she stay on X, or that she follow you, or that she reply to you.",
  "Attorney's fees — you are representing yourself, so there is no fee to shift.",
];

export const CAN = [
  "A declaration that the block violates the First Amendment.",
  "An injunction ordering your account unblocked while the Member is in office.",
  "An order barring future viewpoint-based blocking of you.",
  "Relief while the case is pending, if you ask for it and the court agrees.",
];

export const SITE = {
  name: "MoreSpeech",
  domain: "morespeech.online",
  tweet:
    "My Member of Congress blocked me for criticising her, so I generated a First Amendment complaint and filed it. The comment section is a public forum. If it happened to you:",
};

export const EVIDENCE_ROLES: Array<{ id: string; label: string; hint: string }> = [
  { id: "profile", label: "Account profile", hint: "Display name, handle, bio, link to the official site" },
  { id: "post", label: "Your post", hint: "The reply that got you blocked, with its timestamp" },
  { id: "block", label: "Block notice", hint: "What the screen said when you tried to open the account" },
  { id: "comparison", label: "Unblocked critic", hint: "Someone who said the same thing and stayed unblocked" },
  { id: "other", label: "Other", hint: "Anything else you want in the record" },
];

export const DISTRICTS = [
  "District of Columbia",
  "Northern District of Alabama", "Middle District of Alabama", "Southern District of Alabama",
  "District of Alaska", "District of Arizona", "Eastern District of Arkansas", "Western District of Arkansas",
  "Central District of California", "Eastern District of California", "Northern District of California", "Southern District of California",
  "District of Colorado", "District of Connecticut", "District of Delaware",
  "Northern District of Florida", "Middle District of Florida", "Southern District of Florida",
  "Northern District of Georgia", "Middle District of Georgia", "Southern District of Georgia",
  "District of Hawaii", "District of Idaho",
  "Northern District of Illinois", "Central District of Illinois", "Southern District of Illinois",
  "Northern District of Indiana", "Southern District of Indiana",
  "Northern District of Iowa", "Southern District of Iowa", "District of Kansas",
  "Eastern District of Kentucky", "Western District of Kentucky",
  "Eastern District of Louisiana", "Middle District of Louisiana", "Western District of Louisiana",
  "District of Maine", "District of Maryland", "District of Massachusetts",
  "Eastern District of Michigan", "Western District of Michigan", "District of Minnesota",
  "Northern District of Mississippi", "Southern District of Mississippi",
  "Eastern District of Missouri", "Western District of Missouri", "District of Montana",
  "District of Nebraska", "District of Nevada", "District of New Hampshire", "District of New Jersey",
  "District of New Mexico", "Eastern District of New York", "Northern District of New York",
  "Southern District of New York", "Western District of New York",
  "Eastern District of North Carolina", "Middle District of North Carolina", "Western District of North Carolina",
  "District of North Dakota", "Northern District of Ohio", "Southern District of Ohio",
  "Eastern District of Oklahoma", "Northern District of Oklahoma", "Western District of Oklahoma",
  "District of Oregon", "Eastern District of Pennsylvania", "Middle District of Pennsylvania", "Western District of Pennsylvania",
  "District of Rhode Island", "District of South Carolina", "District of South Dakota",
  "Eastern District of Tennessee", "Middle District of Tennessee", "Western District of Tennessee",
  "Eastern District of Texas", "Northern District of Texas", "Southern District of Texas", "Western District of Texas",
  "District of Utah", "District of Vermont",
  "Eastern District of Virginia", "Western District of Virginia",
  "Eastern District of Washington", "Western District of Washington",
  "Northern District of West Virginia", "Southern District of West Virginia",
  "Eastern District of Wisconsin", "Western District of Wisconsin", "District of Wyoming",
];
