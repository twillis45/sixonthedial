/* Build the self-publishing tracker.
   The page must be able to regenerate its own complete source when a viewer
   ticks a box. It does that from a base64 copy of THIS template, which still
   contains both placeholders — a fixed point: decode, substitute state, put the
   same base64 back. Verified below rather than assumed.
   Run: node scripts/build-tracker.js */
"use strict";
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = path.join(__dirname, "..");
/* One builder, several self-publishing pages. Pass a name; default is the
   tracker, which is what every existing caller expects. */
const NAME = process.argv[2] || "tracker";
const TPL = path.join(ROOT, "docs", `${NAME}-template.html`);
const OUT = path.join(ROOT, "docs", `${NAME}.html`);

const tpl = fs.readFileSync(TPL, "utf8");
for (const ph of ["__STATE__", "__SRC__"]) {
  const n = tpl.split(ph).length - 1;
  if (n !== 1) { console.error(`FAIL  ${ph} appears ${n} times, must be exactly 1`); process.exit(1); }
}

/*
 * THE PAGE MUST PARSE, which this script did not used to check.
 *
 * Every check below verified the fixed point -- that a tick regenerates a
 * document that can regenerate again -- and none of them verified that the
 * document RUNS. A hand edit left `"})` where `"},` belonged, the builder
 * printed ALL CHECKS PASSED, and the published tracker rendered a blank page.
 * A build check that is happy with a syntactically broken page is not a build
 * check.
 */
{
  const body = tpl.match(/<script>\n"use strict";([\s\S]*?)<\/script>/);
  if (!body) { console.error("FAIL  could not find the inline script to parse"); process.exit(1); }
  try { new vm.Script(body[1]); }
  catch (e) { console.error(`FAIL  inline script does not parse: ${e.message}`); process.exit(1); }

  /* and the data must be well-formed, not merely parseable. Tracker-shaped
     pages carry STAGES/ITEMS; others only have to parse. */
  if (!/var ITEMS=/.test(body[1])) {
    console.log("PASS  inline script parses");
  } else {
  const ctx = { out: null };
  vm.createContext(ctx);
  try {
    const decls = body[1].match(/var STAGES=[\s\S]*?\n\];[\s\S]*?var ITEMS=[\s\S]*?\n\];/);
    new vm.Script(decls[0] + "\nout = {STAGES, ITEMS};").runInContext(ctx);
  } catch (e) {
    console.error(`FAIL  STAGES/ITEMS do not evaluate: ${e.message}`); process.exit(1);
  }
  const items = ctx.out.ITEMS;
  const keys = items.map((i) => i.k);
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (dupes.length) { console.error(`FAIL  duplicate item keys: ${[...new Set(dupes)].join(", ")}`); process.exit(1); }
  const bad = items.filter((i) => !i.k || !i.t || !i.tr || !Number.isInteger(i.s));
  if (bad.length) { console.error(`FAIL  ${bad.length} item(s) missing k/t/tr/s`); process.exit(1); }
  const tracks = [...new Set(items.map((i) => i.tr))].sort();
  console.log(`PASS  inline script parses; ${items.length} items, tracks ${tracks.join("/")}, no duplicate keys`);
  }
}

const B64 = Buffer.from(tpl, "utf8").toString("base64");
/*
 * CARRY THE PUBLISHED STATE FORWARD.
 *
 * This was a hardcoded empty state, so every rebuild silently reset whatever
 * viewers had ticked on the live page — and on 2026-08-28 it tried to: a
 * publish was refused because the page had saved `b4h` from inside itself and
 * this file was about to overwrite it with `{}`. The refusal caught it. Only
 * the refusal caught it, and it would not have fired if the publish had gone
 * out before the tick.
 *
 * The page is the authority on its own state, so read it back off the last
 * build and hand it to the next one. Falls back to empty when there is no
 * previous build to read.
 */
const priorState = (() => {
  const fallback = NAME === "tracker" ? { done: {}, track: "b" } : { tally: {} };
  try {
    const prev = fs.readFileSync(OUT, "utf8");
    const m = prev.match(/<script id="state" type="application\/json">([\s\S]*?)<\/script>/);
    if (!m) return fallback;
    const parsed = JSON.parse(m[1].replace(/\\u003c/g, "<"));
    const n = Object.keys(parsed.done ?? parsed.tally ?? {}).length;
    if (n) console.log(`      carrying ${n} tick(s) forward from the previous build`);
    return parsed;
  } catch { return fallback; }
})();
const initial = priorState;
const TICK = NAME === "tracker" ? { done: { b1e: 1 }, track: "b" } : { tally: { a: [1] } };
const render = state =>
  tpl.replace("__STATE__", JSON.stringify(state).replace(/</g, "\\u003c")).replace("__SRC__", B64);

const out = render(initial);
fs.writeFileSync(OUT, out);

/* ---- verify the fixed point actually holds ---- */
let fail = 0;
const say = (ok, m) => { if (!ok) fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${m}`); };

const embedded = out.match(/var SRC="([A-Za-z0-9+/=]+)"/);
say(!!embedded, "page embeds its own source");
if (embedded) {
  const decoded = Buffer.from(embedded[1], "base64").toString("utf8");
  say(decoded === tpl, "decoded source round-trips to the template exactly");
  /* simulate a tick: regenerate as the page would, and confirm it is stable */
  const next = decoded
    .replace("__STATE__", JSON.stringify(TICK).replace(/</g, "\\u003c"))
    .replace("__SRC__", embedded[1]);
  say(next.startsWith("<!doctype html>"), "regenerated document starts with a doctype");
  const again = next.match(/var SRC="([A-Za-z0-9+/=]+)"/);
  say(again && again[1] === embedded[1], "regenerated page can regenerate again (fixed point holds)");
  say(next.includes(JSON.stringify(TICK).slice(1, 24)), "regenerated page carries the new state");
  say(next.length === out.length + JSON.stringify(TICK).length
      - JSON.stringify(initial).length, "only the state block differs");
}
say(out.startsWith("<!doctype html>"), "published page starts with a doctype");

/*
 * OPEN THE PAGE WE ACTUALLY WROTE.
 *
 * Every check above reads the string, and on 2026-08-27 all of them passed on
 * a tracker that rendered a blank white screen: one item line ended `"})`
 * instead of `"},`, the array threw, and nothing here could see it. Testing
 * the generator is not testing the artifact. This check opens the file in a
 * browser and asserts the board is on the page — and that the done/open toggle
 * actually changes what is on it, which no string check can know.
 */
(async () => {
  const { launch } = await import("./lib/browser.mjs");
  const browser = await launch({ headless: true });
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("file://" + OUT, { waitUntil: "load" });
  await new Promise((r) => setTimeout(r, 400));

  const collapsed = await page.evaluate(() => ({
    items: document.querySelectorAll("li.item").length,
    text: document.body.innerText.trim().length,
  }));
  await page.click("#togdone");
  await new Promise((r) => setTimeout(r, 200));
  const expanded = await page.evaluate(() => document.querySelectorAll("li.item").length);
  await browser.close();

  say(errs.length === 0, `page runs without script errors${errs.length ? " — " + errs.join(" | ") : ""}`);
  say(collapsed.text > 500, `page renders visible text (${collapsed.text} chars)`);
  say(collapsed.items > 0, `open items reach the DOM (${collapsed.items} shown by default)`);
  say(expanded > collapsed.items,
    `the done toggle changes the board (${collapsed.items} -> ${expanded})`);

  console.log(`\n${(out.length / 1024).toFixed(0)}KB → ${OUT}`);
  console.log(fail ? `${fail} CHECK(S) FAILED` : "ALL CHECKS PASSED");
  process.exit(fail ? 1 : 0);
})();

