import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl } from '@/lib/site';
import { withBase } from '@/lib/basePath';
import themes from '../../../data/themes.json';
import kit from '../../../data/press-kit.json';

export const metadata: Metadata = {
  title: 'Press kit',
  description:
    'Facts, approved copy and images for writing about Six on the Dial — including what the game does not claim.',
  alternates: { canonical: absoluteUrl('/press/') },
};

/*
 * THE COUNTS ARE COUNTED, NOT TYPED — the same rule layout.tsx states for the
 * meta description, and it binds harder here. This is the page a journalist
 * quotes from, so a stale literal does not just become wrong, it becomes wrong
 * in somebody else's byline. Both numbers are read at build time from the files
 * that define them; `npm run check:press` then asserts the rendered page agrees
 * with those same files, so a hand-edit to the prose fails the build.
 */
const boards = themes.puzzles.length;
const packs = new Set(themes.puzzles.map((p) => p.theme)).size;

/*
 * The shipped catalogue total, read from the export's own data file rather than
 * from anything summarising it. Server component, static export: this runs once
 * at build and only the number reaches the page.
 */
const catalogue: { puzzles: unknown[] } = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public', 'data', 'puzzles.json'), 'utf8')
);
const puzzles = catalogue.puzzles.length;

/*
 * Why this page exists, and why it is unusually blunt.
 *
 * Store row 2.6 wanted a press kit. What a press kit normally is — a logo, some
 * screenshots and a paragraph of adjectives — would have been half a day. This
 * one carries two things that are not normally in one, and both are load-bearing:
 *
 *   THE STATUS BLOCK, first, before anything aspirational. The web game is live;
 *   the store versions are not released; there are no player numbers because
 *   there are no players to count. A press page that opens with a pitch for an
 *   unreleased app is a sales document, and a journalist who finds out later
 *   that "available now" meant a web build stops trusting the rest of it.
 *
 *   WHAT WE DO NOT CLAIM, last. docs/LISTING.md is a claim ledger — every
 *   sentence paired with the check behind it — and it ends with the claims
 *   deliberately withheld. Publishing that half is the only way the withholding
 *   survives contact with somebody writing the article for us.
 */
export default function PressPage() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-[760px] px-5 py-10 md:py-16">
      <Link
        href="/"
        className="text-meta text-text-secondary underline decoration-edge-mid underline-offset-4 hover:text-text-primary"
      >
        ← Back to the game
      </Link>

      <p className="mt-8 text-kicker font-semibold uppercase tracking-[0.14em] text-text-muted">
        Press kit
      </p>
      <h1 className="mt-2 text-hero font-semibold tracking-[-0.02em] text-text-primary">
        Six on the Dial
      </h1>
      <p className="mt-3 text-item leading-snug text-text-secondary">
        A six-letter word game with hand-written clues. Every answer on a board is
        spelled from the same six letters, and every row carries a line somebody
        wrote by hand.
      </p>

      {/* ── The honest state, before anything else ───────────────────── */}
      <section
        aria-labelledby="status"
        className="mt-10 rounded-2xl border border-carbon-border bg-carbon-panel px-5 py-5"
      >
        <h2
          id="status"
          className="text-kicker font-semibold uppercase tracking-[0.14em] text-text-muted"
        >
          Where this actually stands
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-body leading-relaxed text-text-secondary">
          <li>
            <strong className="font-semibold text-text-primary">Live on the web</strong>{' '}
            at sixonthedial.com. Free to play, no account, nothing to install.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">
              Not released on the App Store or Google Play.
            </strong>{' '}
            Both wrappers are built and signed; neither has been submitted.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">
              No player numbers, downloads or ratings
            </strong>{' '}
            — not withheld, absent. The game collects no analytics of any kind, so
            there is no figure to give and there never will be one from us.
          </li>
          <li>
            <strong className="font-semibold text-text-primary">
              The price of the themed packs is not set.
            </strong>{' '}
            They will be sold outright, once, with no subscription. That is the
            whole of what is decided.
          </li>
        </ul>
      </section>

      {/* ── Fact sheet ────────────────────────────────────────────────── */}
      <h2 className="mt-12 text-title font-semibold tracking-[-0.01em] text-text-primary">
        Fact sheet
      </h2>
      <dl className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-carbon-border bg-carbon-border sm:grid-cols-[minmax(0,11rem)_1fr]">
        <Fact term="Name">Six on the Dial</Fact>
        <Fact term="Maker">No Guesswork Systems LLC — Todd Willis, sole developer</Fact>
        <Fact term="Platform">
          Web, playable in any modern browser. Android and iOS wrappers built, not
          released.
        </Fact>
        <Fact term="Price">Free to play. Themed packs sold outright; price not announced.</Fact>
        <Fact term="Catalogue">
          {puzzles} puzzles, of which {boards} are themed boards across {packs} packs.
        </Fact>
        <Fact term="Clues">
          Every row on every board carries a written clue. None are dictionary
          definitions.
        </Fact>
        <Fact term="Data collected">
          None. No account, no analytics, no advertising, no cookies. The shipped
          content-security policy allows the app to talk to its own origin and
          nothing else.
        </Fact>
        <Fact term="Contrast and targets">
          Held to WCAG AA by an automated check that runs on the built site, not by
          eye.
        </Fact>
        <Fact term="Contact">
          <a
            href="mailto:info@noguessworksystems.com"
            className="text-text-primary underline decoration-edge-mid underline-offset-4"
          >
            info@noguessworksystems.com
          </a>
        </Fact>
      </dl>

      {/* ── Copy you can lift ─────────────────────────────────────────── */}
      <h2 className="mt-12 text-title font-semibold tracking-[-0.01em] text-text-primary">
        Copy you can lift
      </h2>
      <p className="mt-3 text-body leading-relaxed text-text-secondary">
        Both of these are checked sentences — every claim in them is one the game
        can be held to. Use them as they are.
      </p>

      <h3 className="mt-6 text-kicker font-semibold uppercase tracking-[0.14em] text-text-muted">
        One line
      </h3>
      <blockquote className="mt-2 rounded-xl border-l-2 border-edge-mid bg-carbon-panel px-4 py-3 text-body leading-relaxed text-text-primary">
        Six on the Dial is a daily six-letter word game: every word you need is
        spelled from the same six letters, and every row carries a clue somebody
        wrote by hand.
      </blockquote>

      <h3 className="mt-6 text-kicker font-semibold uppercase tracking-[0.14em] text-text-muted">
        One paragraph
      </h3>
      <blockquote className="mt-2 rounded-xl border-l-2 border-edge-mid bg-carbon-panel px-4 py-3 text-body leading-relaxed text-text-primary">
        Six letters sit on a dial. Six rows to fill, one board a day, and every
        answer is spelled from those six letters and nothing else. Each row carries
        a clue written by hand — not a definition scraped from a dictionary, but a
        line about the thing itself. Alongside the daily board are themed packs:
        the cookout, the barbershop, Sunday dinner, 90s R&amp;B, spades, the HBCU
        yard. The clues in those packs are researched, and the research is cited in
        the repository the game is built from. There is no account, no advertising
        and no analytics — nothing about a player&rsquo;s game leaves their device,
        because the app has no way to send it.
      </blockquote>

      {/* ── The framing rules ─────────────────────────────────────────── */}
      <h2 className="mt-12 text-title font-semibold tracking-[-0.01em] text-text-primary">
        Two things we ask
      </h2>
      <p className="mt-3 text-body leading-relaxed text-text-secondary">
        Neither is a legal restriction. Both are things this project decided about
        itself, and both are easy to get wrong in good faith.
      </p>

      <ol className="mt-5 flex flex-col gap-5">
        <Ask n={1} title="The dial is not a first, an only or a unique anything.">
          Word games built on a letter wheel are an established category and
          Wordscapes leads it. What is unusual here is the clue writing, not the
          input. Any sentence that makes the wheel the novelty is a sentence this
          project would have to correct.
        </Ask>
        <Ask n={2} title="The packs are not an explainer.">
          Most of the themed packs describe Black American cultural life, and they
          are written to be recognised by the people they are about — not to
          introduce anyone to anything. Framing them as a lesson, a tour or a
          teaching moment inverts what they are for. &ldquo;Made for the people in
          them first&rdquo; is the framing that holds.
        </Ask>
      </ol>

      {/* ── Images ────────────────────────────────────────────────────── */}
      <h2 className="mt-12 text-title font-semibold tracking-[-0.01em] text-text-primary">
        Images
      </h2>
      <p className="mt-3 text-body leading-relaxed text-text-secondary">
        Free to use in coverage of the game. Every shot below is a real frame from
        the shipped build, captured by script — none is a mockup of a screen that
        does not exist. Each has a framed device version alongside it.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {kit.shots.map((s) => (
          <figure key={s.id} className="flex flex-col">
            <a
              href={withBase(`/press/${s.flat}`)}
              className="block overflow-hidden rounded-2xl border border-carbon-border bg-carbon-panel"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimiser; these are already sized for the page */}
              <img
                src={withBase(`/press/${s.flat}`)}
                alt={s.alt}
                loading="lazy"
                className="block h-auto w-full"
              />
            </a>
            <figcaption className="mt-3 text-meta leading-relaxed text-text-muted">
              <span className="font-semibold text-text-secondary">{s.title}.</span>{' '}
              {s.caption}{' '}
              <a
                href={withBase(`/press/${s.framed}`)}
                className="whitespace-nowrap text-text-secondary underline decoration-edge-mid underline-offset-4"
              >
                Framed version
              </a>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* ── The withheld half of the ledger ───────────────────────────── */}
      <h2 className="mt-12 text-title font-semibold tracking-[-0.01em] text-text-primary">
        What this game does not claim
      </h2>
      <p className="mt-3 text-body leading-relaxed text-text-secondary">
        The store copy is written as a ledger: every claim paired with the check
        behind it, and a sentence with no check does not ship. These are the ones
        deliberately left out, published here so they are not accidentally added
        back on our behalf.
      </p>
      <ul className="mt-4 flex flex-col gap-3 text-body leading-relaxed text-text-secondary">
        <li>
          <strong className="font-semibold text-text-primary">
            Any claim about how many people play it.
          </strong>{' '}
          There is no telemetry, and no released store build to count.
        </li>
        <li>
          <strong className="font-semibold text-text-primary">
            &ldquo;Addictive&rdquo;, &ldquo;you won&rsquo;t put it down&rdquo;, or any
            other retention claim.
          </strong>{' '}
          Retention has not been measured on a single real player.
        </li>
        <li>
          <strong className="font-semibold text-text-primary">
            Learning outcomes of any kind.
          </strong>{' '}
          See the second ask above.
        </li>
        <li>
          <strong className="font-semibold text-text-primary">
            &ldquo;Accessible&rdquo; as a bare adjective.
          </strong>{' '}
          Contrast and target sizes are measured and hold. That is a narrower
          statement than the word invites, and the narrower one is the true one.
        </li>
        <li>
          <strong className="font-semibold text-text-primary">
            Community review of the themed packs.
          </strong>{' '}
          The clues are researched and cited, and they are read by a standing
          review bench before they ship. A bench is structured perspective, not
          community consultation — no pack has yet been read by a paid reader
          from the community it describes, and that is a budgeted step still
          ahead of us, not a box already ticked. Please do not write that it has
          been.
        </li>
      </ul>

      <p className="mt-12 text-meta leading-relaxed text-text-muted">
        Questions, interview requests, or a fact you want checked before you print
        it:{' '}
        <a
          href="mailto:info@noguessworksystems.com"
          className="text-text-secondary underline decoration-edge-mid underline-offset-4"
        >
          info@noguessworksystems.com
        </a>
        . See also{' '}
        <Link
          href="/privacy"
          className="text-text-secondary underline decoration-edge-mid underline-offset-4"
        >
          Privacy
        </Link>{' '}
        and{' '}
        <Link
          href="/terms"
          className="text-text-secondary underline decoration-edge-mid underline-offset-4"
        >
          Terms
        </Link>
        .
      </p>
    </main>
  );
}

/** One row of the fact sheet. Grid gap-px over a border-coloured ground draws
    the rules, so a row can wrap on a phone without a table's fixed columns. */
function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="bg-carbon-panel px-4 pt-4 text-kicker font-semibold uppercase tracking-[0.1em] text-text-muted sm:py-4">
        {term}
      </dt>
      <dd className="bg-carbon-panel px-4 pb-4 text-body leading-relaxed text-text-secondary sm:py-4">
        {children}
      </dd>
    </>
  );
}

function Ask({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span
        aria-hidden="true"
        className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-edge-mid text-meta font-semibold tabular-nums text-text-secondary"
      >
        {n}
      </span>
      <div>
        <p className="text-body font-semibold leading-snug text-text-primary">{title}</p>
        <p className="mt-1.5 text-body leading-relaxed text-text-secondary">{children}</p>
      </div>
    </li>
  );
}
