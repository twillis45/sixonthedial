/* Build the self-publishing tracker.
   The page must be able to regenerate its own complete source when a viewer
   ticks a box. It does that from a base64 copy of THIS template, which still
   contains both placeholders — a fixed point: decode, substitute state, put the
   same base64 back. Verified below rather than assumed.
   Run: node scripts/build-tracker.js */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TPL = path.join(ROOT, "docs", "tracker-template.html");
const OUT = path.join(ROOT, "docs", "tracker.html");

const tpl = fs.readFileSync(TPL, "utf8");
for (const ph of ["__STATE__", "__SRC__"]) {
  const n = tpl.split(ph).length - 1;
  if (n !== 1) { console.error(`FAIL  ${ph} appears ${n} times, must be exactly 1`); process.exit(1); }
}

const B64 = Buffer.from(tpl, "utf8").toString("base64");
const initial = { done: {}, track: "b" };
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
    .replace("__STATE__", JSON.stringify({ done: { b1e: 1 }, track: "b" }).replace(/</g, "\\u003c"))
    .replace("__SRC__", embedded[1]);
  say(next.startsWith("<!doctype html>"), "regenerated document starts with a doctype");
  const again = next.match(/var SRC="([A-Za-z0-9+/=]+)"/);
  say(again && again[1] === embedded[1], "regenerated page can regenerate again (fixed point holds)");
  say(next.includes('"done":{"b1e":1}'), "regenerated page carries the new state");
  say(next.length === out.length + JSON.stringify({ done: { b1e: 1 }, track: "b" }).length
      - JSON.stringify(initial).length, "only the state block differs");
}
say(out.startsWith("<!doctype html>"), "published page starts with a doctype");
console.log(`\n${(out.length / 1024).toFixed(0)}KB → ${OUT}`);
console.log(fail ? `${fail} CHECK(S) FAILED` : "ALL CHECKS PASSED");
process.exit(fail ? 1 : 0);
