// Shared types for the MoreSpeech single-page application.

export interface Quote {
  text: string;
  cite: string;
}

export interface ChainStep {
  id: string;
  num: string;
  kicker: string;
  title: string;
  lede: string;
  body: string[];
  quotes: Quote[];
  takeaway: string;
}

export type Outcome = "win" | "survived" | "lost" | "settled" | "moot";

export interface CaseRow {
  name: string;
  court: string;
  year: string;
  outcome: Outcome;
  note: string;
}

export interface Defense {
  question: string;
  verdict: string;
  answer: string[];
  quote?: Quote;
}

export interface Stat {
  value: number | string;
  suffix?: string;
  label: string;
  note: string;
}

export interface Plaintiff {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  handle: string;
}

export interface Member {
  name: string;
  title: string;
  district: string;
  office: string;
}

export interface AccountInfo {
  handle: string;
  url: string;
  display: string;
  bio: string;
  officialLink: boolean;
  staffRun: boolean;
  announces: boolean;
  campaign: boolean;
}

export interface Facts {
  postDate: string;
  postText: string;
  blockDate: string;
  blockMessage: string;
  stillBlocked: boolean;
  comparisonHandle: string;
  comparisonText: string;
}

export interface Options {
  district: string;
  ifp: boolean;
  pi: boolean;
  serviceDate: string;
}

export interface Matter {
  plaintiff: Plaintiff;
  member: Member;
  account: AccountInfo;
  facts: Facts;
  options: Options;
  evidence: EvidenceItem[];
}

export type EvidenceRole = "profile" | "post" | "block" | "comparison" | "other";

export interface EvidenceItem {
  id: string;
  kind: "image" | "link";
  role: EvidenceRole;
  caption: string;
  url: string;
  dataUrl?: string;
}

export type DocId = "complaint" | "summons" | "ifp" | "pi" | "service" | "coversheet";
