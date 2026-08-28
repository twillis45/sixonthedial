/*
 * Does PRODUCTION actually serve the file that decides whether the app shows
 * an address bar?
 *
 * `src/lib/assetlinks.test.ts` is thorough and checks the wrong thing for this
 * purpose: it validates the LOCAL file's shape. Android never reads the local
 * file. It fetches https://<origin>/.well-known/assetlinks.json over the
 * network, and every way that fetch can go wrong is invisible from inside the
 * repo:
 *
 *   - a host that answers 200 for everything, including a 404 page
 *   - a redirect. Digital Asset Links does NOT follow them. A host that
 *     helpfully sends /.well-known/assetlinks.json -> /assetlinks.json breaks
 *     verification while a browser shows the file perfectly.
 *   - the wrong content-type. It must be application/json; text/plain fails
 *     verification and looks identical in a browser.
 *   - a stale deploy: the repo has both fingerprints, production still has one.
 *
 * Every one of those surfaces the same way — an address bar — and every one
 * gets misdiagnosed as an app fault, because the app is the thing you are
 * looking at. One session was already lost to that on 2026-08-27.
 *
 * THIS CHECK MUST NOT PASS WHEN IT CANNOT REACH THE HOST. A network check that
 * treats "no answer" as "fine" is the exact shape this repo has been bitten by
 * repeatedly: absence and success look identical to a naive query. Offline is
 * an ERROR here, not a pass.
 *
 *   node scripts/check-assetlinks.mjs [origin]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = (process.argv[2] ?? 'https://sixonthedial.com').replace(/\/$/, '');
const URL_ = `${ORIGIN}/.well-known/assetlinks.json`;

const local = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public', '.well-known', 'assetlinks.json'), 'utf8')
);

const fails = [];
const ok = (m, cond) => {
  console.log(`  ${cond ? '✔' : '✗'}  ${m}`);
  if (!cond) fails.push(m);
};

console.log(`assetlinks, as Android would fetch it\n  ${URL_}\n`);

/* The repo half first: there must BE something to compare against. */
const localFp = (local?.[0]?.target?.sha256_cert_fingerprints ?? []).slice().sort();
const localPkg = local?.[0]?.target?.package_name;
ok(`the repo carries a package name (${localPkg})`, typeof localPkg === 'string' && localPkg.length > 0);
ok(`the repo carries ${localFp.length} fingerprint(s)`, localFp.length > 0);
if (fails.length) {
  console.log('\n✖ nothing to compare against — fix the local file first');
  process.exit(1);
}

let res;
try {
  /* manual, because Digital Asset Links does not follow redirects and neither
     should the thing claiming to check it */
  res = await fetch(URL_, { redirect: 'manual', headers: { accept: 'application/json' } });
} catch (err) {
  console.log(`  ✗  could not reach ${ORIGIN} — ${err.message}`);
  console.log('\n✖ UNREACHABLE. This is a failure, not a pass: an unchecked');
  console.log('  assetlinks file is exactly what this guard exists to prevent.');
  process.exit(1);
}

ok(`answers 200 with no redirect (got ${res.status})`, res.status === 200);
const ct = res.headers.get('content-type') ?? '';
ok(`content-type is application/json (got "${ct || 'none'}")`, /^application\/json\b/.test(ct));

let served = null;
const body = await res.text();
try { served = JSON.parse(body); } catch { /* reported below */ }
ok('the body parses as JSON', served !== null);

if (served) {
  const t = served?.[0]?.target ?? {};
  ok('delegates handle_all_urls to an android_app',
    served?.[0]?.relation?.includes('delegate_permission/common.handle_all_urls') &&
    t.namespace === 'android_app');
  ok(`serves the package that ships (${localPkg})`, t.package_name === localPkg);
  const servedFp = (t.sha256_cert_fingerprints ?? []).slice().sort();
  ok(`serves all ${localFp.length} fingerprint(s) the repo carries`,
    localFp.length === servedFp.length && localFp.every((f, i) => f === servedFp[i]));
  if (localFp.length !== servedFp.length) {
    for (const f of localFp) if (!servedFp.includes(f)) console.log(`       missing: ${f}`);
    for (const f of servedFp) if (!localFp.includes(f)) console.log(`       extra:   ${f}`);
  }
}

if (fails.length) {
  console.log(`\n✖ ${fails.length} problem(s). Android would fall back to a Custom Tab`);
  console.log('  WITH AN ADDRESS BAR, silently, and the app would look repackaged.');
  process.exit(1);
}
console.log('\n✔ production serves what the app will be signed against');
