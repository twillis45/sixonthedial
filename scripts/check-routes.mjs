/*
 * The route sweep, as an ENUMERATION.
 *
 * Doctrine, stage 5: "Write the enumerating route sweep, not a checklist. Only
 * enumeration fails when a NEW route arrives ungated." A checklist that says
 * "no server routes today" is true and worthless — it passes forever, including
 * on the day somebody adds one.
 *
 * This project is a Next.js STATIC EXPORT (`output: 'export'` in
 * next.config.ts) served from GitHub Pages. There is no server, so the correct
 * assertion is not "the routes are gated" but "no server-execution surface
 * exists at all" — and the moment one does, this fails and somebody has to
 * decide whether it is gated, rather than discovering it in production.
 *
 * WHY THIS IS A REAL RISK AND NOT A FORMALITY. `output: 'export'` makes the
 * BUILD fail on a server route, which sounds like sufficient protection. It is
 * not: the guard disappears the moment anyone removes that line to "just try
 * something", and a static site quietly becoming a server is exactly the change
 * that arrives without a threat model. This check is independent of the build
 * flag, so removing the flag does not also remove the alarm.
 *
 *   node scripts/check-routes.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');

/* Every way Next.js can execute code on a server. Named individually so a new
   mechanism has to be added deliberately rather than slipping under a regex. */
const SERVER_SURFACES = [
  { what: 'a route handler', test: (f) => /(^|\/)route\.(ts|js|tsx|jsx)$/.test(f) },
  { what: 'an API directory', test: (f) => /(^|\/)api\//.test(f) },
  { what: 'middleware', test: (f) => /(^|\/)middleware\.(ts|js)$/.test(f) },
];
const SERVER_MARKERS = [
  { what: "a 'use server' directive", re: /^\s*['"]use server['"]/m },
  { what: 'getServerSideProps', re: /\bgetServerSideProps\b/ },
  { what: 'next/server import', re: /from\s+['"]next\/server['"]/ },
];

/*
 * A PUBLIC allowlist, per the doctrine: a surface may be here only with a
 * written reason. Empty is the correct state for a static export — an entry
 * appearing is itself a decision worth reviewing.
 */
const ALLOWLIST = [];

const walk = (dir) => {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
};

const files = walk(SRC).map((f) => path.relative(ROOT, f));
const found = [];

for (const f of files) {
  for (const s of SERVER_SURFACES) if (s.test(f)) found.push(`${f} — ${s.what}`);
  if (!/\.(ts|tsx|js|jsx|mjs)$/.test(f)) continue;
  const body = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of SERVER_MARKERS) if (m.re.test(body)) found.push(`${f} — ${m.what}`);
}

const ungated = found.filter((f) => !ALLOWLIST.some((a) => f.startsWith(a)));

console.log(`route sweep — enumerated ${files.length} source files under src/\n`);
console.log(`  ✔  static export asserted in next.config.ts: ${/output:\s*['"]export['"]/.test(fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8')) ? 'yes' : 'NO'}`);
console.log(`  ${ungated.length === 0 ? '✔' : '✗'}  server-execution surfaces found: ${ungated.length}`);
console.log(`  ✔  PUBLIC allowlist entries: ${ALLOWLIST.length}`);

if (ungated.length) {
  console.log('');
  for (const f of ungated) console.log(`  ✗  ${f}`);
  console.log(`\n✖ ${ungated.length} server-execution surface(s) with no caller gate and no allowlist entry.`);
  console.log('  This project ships as a static export with no backend. A route here is');
  console.log('  a new threat model, not a new feature — gate it, or allowlist it with a');
  console.log('  written reason, before it deploys.');
  process.exit(1);
}
console.log('\n✔ no server-execution surface exists — nothing to gate, and a new one would fail this');
