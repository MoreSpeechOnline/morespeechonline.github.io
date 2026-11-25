# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static, hand-built: TypeScript compiled with `tsc`, bundled with esbuild, inlined
into a single `index.html` with no runtime dependencies and no backend. Served by
GitHub Pages from the repository root.

## Users

Residents and citizens of the United States who have been blocked on X by a
Member of Congress or a Senator using an account for official business, and who
want to understand whether that is lawful and what can be done about it.

Secondary: journalists, civil-liberties lawyers, and legislative staff who need
the argument and the authorities in one place, and anyone who wants to see the
record of how these suits have gone.

They arrive angry, usually from a phone, usually right after being blocked, and
often with no legal training and no money for a lawyer.

## Product Purpose

Explain, in plain language and with real authority, why viewpoint-based blocking
by a federal official from an official account violates the First Amendment; show
what the courts have actually done with such claims; and generate a printable,
correctly formatted set of court filings the resident can file themselves.

Success is a person who understands the argument well enough to explain it, and
who leaves with documents they can actually file — or with a clear understanding
of why their situation is not one of these cases.

## Positioning

The only place where the legal argument, the coded litigation record, the open
letter to the Department of Justice, and a working filing generator are the same
artifact. The generator is not a form-letter mill: it builds a complaint whose
paragraphs cite the authority, and the site states the weaknesses of its own
theory as plainly as its strengths.

## Operating Context

- Read on phones, often in one sitting, often immediately after a block.
- The reader may print the generated filings on paper, or save them as PDF.
- Nothing may leave the browser: no accounts, no analytics, no server. A person
  documenting a dispute with the government should not have to hand their
  evidence to a third party to get help.
- The subject matter is legal; the site is not a lawyer and says so.

## Capabilities and Constraints

- Six-step builder producing complaint, summons request, in forma pauperis
  motion with affidavit, preliminary injunction motion with memorandum and
  declaration, certificate of service, cover-sheet checklist, and exhibit pages.
- Evidence step: screenshots are downscaled and embedded; they are never
  persisted to storage.
- Printing emits only the filings, in court format.
- Legal content is fixed and checked: quotations come from reporters and the
  United States Code, not from memory. No claim about any named individual.
- Static hosting only; no server-side anything, ever.

## Brand Commitments

The name is **MoreSpeech**, from Brandeis's concurrence in *Whitney v.
California*: "the remedy to be applied is more speech, not enforced silence."
The tone is plain, direct, and unhedged, but never hype. The site is a project of
the Voluntaryist Minister. Gifts are called gifts, never donations. The entire
site was built by DeepSeek V4.1 Flash in omp.sh, and that is stated on the About
page.

## Evidence on Hand

- The full memorandum, `docs/the-argument.md`, with verified quotations and the
  adverse authority stated.
- A coded record of twenty-two blocking suits, 2017–2026: five merits wins, no
  damages awards, one federal-official dismissal.
- The open letter to the Attorney General, `docs/open-letter.md`.
- The pro se filing packet, `docs/filings/`.
- Nothing else. There are no testimonials, no user counts, no press, no
  partners, and future work must not invent them.

## Product Principles

1. **The reader is a litigant, not a lead.** Every screen should leave them
   better able to act or to explain the argument to someone else.
2. **State the weakness.** Credibility is the product; a brief that hides the
   adverse authority is worthless in court and dishonest everywhere else.
3. **Nothing leaves the browser.** Privacy is structural, not a promise.
4. **The documents are the deliverable.** The site succeeds when the filings are
   correct, complete, and printable.
5. **No invented facts.** Names, figures, and examples are either real and cited
   or clearly marked as illustrative.

## Accessibility & Inclusion

Readable at phone size with no horizontal scroll; keyboard-operable throughout;
respects reduced-motion; no dependence on colour alone to carry meaning. The
audience includes people reading under stress and people using screen readers.
