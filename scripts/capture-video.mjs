/**
 * Video of real play, because the dial TURNING is the product.
 *
 * Every still in store/marketing has the same limitation: it cannot show a
 * 60-degree detent, a letter unlocking, a row folding, or the sweep when a
 * word lands. Those are the mechanics the game is actually about, and a
 * campaign built from static frames is advertising the parts that photograph
 * rather than the parts that play.
 *
 * This drives the SHIPPED build with real input and records what happens. No
 * compositing, no re-creation — if the recording looks wrong, the game looks
 * wrong, which is the property that makes it worth having.
 *
 *   npm run build && npx serve -s out -l 4310
 *   node scripts/capture-video.mjs http://localhost:4310
 *
 * Grabs timestamped stills while real input drives the shipped build, then
 * stitches them to .mp4 — every editor takes mp4.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch } from './lib/browser.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url)).replace(/\/scripts$/, '');
const BASE = process.argv[2] || 'http://localhost:4310';
const OUT = path.join(ROOT, 'store', 'video');

/*
 * Board 113 — crafty / cart / tray / cry / fat / fry. Named with its grid for
 * the third time in this repo, because the mistake it prevents keeps
 * recurring: a six-letter word that is NOT a row banks as bonus and turns
 * nothing. A "watch the dial turn" clip where the dial never turns is the
 * whole failure, on camera.
 */
const ROWS = ['CRAFTY', 'CRY', 'FAT', 'TRAY'];

const wait = (page, ms) => page.evaluate((m) => new Promise((r) => setTimeout(r, m)), ms).catch(() => {});

const CLIPS = [
  {
    name: 'store-preview',
    what: 'the App Store / Play submission cut, one continuous vertical run',
    /*
     * SIZED BY THE STORE, NOT BY TASTE.
     *
     * Apple accepts exactly one iPhone preview resolution across every modern
     * display size -- 886x1920 portrait -- and requires 15-30 seconds. The
     * landing-page clips are 6.5s and 6.9s at 1170x2532, so they fail both:
     * under half the duration floor, and the wrong dimensions.
     *
     * 390x844 CSS still renders as a real phone; 1170x2532 is only 0.13% off
     * 886x1920 in aspect, so the master rescales with no visible reframing.
     * What could not be fixed in the encode is length, which is why this clip
     * exists instead of a longer hold on the existing ones -- padding a 7s
     * clip to 15s is a still with a timer on it, not a preview.
     *
     * It opens on gameplay inside a second because that is the one thing every
     * ASO source agrees on: the store autoplays muted, and viewers decide in
     * the first three seconds. No title card, no logo, no menu.
     *
     * The holds are slower than the landing-page clips on purpose, and the
     * first cut proves why they have to be: it mastered to 14.8 seconds, two
     * tenths under Apple's floor, and only the post-encode assertion caught
     * it. There are four rows in the board and no fifth to add, so the
     * remaining seconds come from letting each detent land -- which is what
     * the footage wanted anyway. A 60-degree turn that goes by in 150ms is a
     * transition; one that settles is the mechanic.
     */
    size: { width: 390, height: 844, dsf: 3 },
    play: async (page) => {
      await wait(page, 600);
      for (const w of ROWS.slice(0, 2)) {
        for (const ch of w) { await page.keyboard.press(ch); await wait(page, 170); }
        await page.keyboard.press('Enter');
        await wait(page, 2100);
      }
      const tiles = await page.evaluate(() =>
        [...document.querySelectorAll('button[aria-label^="Letter "]')].map((b) => {
          const r = b.getBoundingClientRect();
          return { L: b.getAttribute('aria-label').match(/Letter (\w)/)[1],
                   x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
        }));
      const pts = ['C', 'R', 'Y'].map((L) => tiles.find((t) => t.L === L)).filter(Boolean);
      if (pts.length === 3) {
        await page.mouse.move(pts[0].x, pts[0].y);
        await page.mouse.down();
        for (const q of pts.slice(1)) { await page.mouse.move(q.x, q.y, { steps: 22 }); await wait(page, 240); }
        await wait(page, 450);
        await page.mouse.up();
      }
      await wait(page, 2100);
      for (const w of ROWS.slice(2, 4)) {
        for (const ch of w) { await page.keyboard.press(ch); await wait(page, 170); }
        await page.keyboard.press('Enter');
        await wait(page, 2100);
      }
      await wait(page, 1800);
    },
  },
  {
    name: 'dial-turns',
    what: 'a row lands and the wheel advances 60 degrees',
    /*
     * 390x844 CSS at 3x, which RENDERS as a phone and records at 1170x2532.
     *
     * The first version passed 1080x1920 as the viewport, reasoning in output
     * pixels. setViewport takes CSS pixels, so 1080 wide is a DESKTOP width —
     * it rendered the two-column rail layout and the clip named "dial turns"
     * did not contain the dial. Three clips converted cleanly, had sensible
     * durations and file sizes, and recorded the wrong thing.
     */
    size: { width: 390, height: 844, dsf: 3 },
    play: async (page) => {
      await wait(page, 1400);
      for (const w of ROWS.slice(0, 2)) {
        for (const ch of w) { await page.keyboard.press(ch); await wait(page, 150); }
        await page.keyboard.press('Enter');
        await wait(page, 1800);
      }
    },
  },
  {
    name: 'drag-to-spell',
    what: 'tracing a word across the wheel with a pointer',
    size: { width: 390, height: 844, dsf: 3 },
    play: async (page) => {
      await wait(page, 1200);
      for (const ch of 'CRAFTY') { await page.keyboard.press(ch); await wait(page, 120); }
      await page.keyboard.press('Enter');
      await wait(page, 1600);
      const tiles = await page.evaluate(() =>
        [...document.querySelectorAll('button[aria-label^="Letter "]')].map((b) => {
          const r = b.getBoundingClientRect();
          return { L: b.getAttribute('aria-label').match(/Letter (\w)/)[1],
                   x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
        }));
      const pts = ['C', 'R', 'Y'].map((L) => tiles.find((t) => t.L === L)).filter(Boolean);
      if (pts.length === 3) {
        await page.mouse.move(pts[0].x, pts[0].y);
        await page.mouse.down();
        for (const q of pts.slice(1)) { await page.mouse.move(q.x, q.y, { steps: 22 }); await wait(page, 220); }
        await wait(page, 400);
        await page.mouse.up();
      }
      await wait(page, 1800);
    },
  },
  {
    name: 'desktop-session',
    what: 'the whole board on a wide screen, three rows falling',
    size: { width: 1440, height: 900, dsf: 2 },
    play: async (page) => {
      await wait(page, 1400);
      for (const w of ROWS) {
        for (const ch of w) { await page.keyboard.press(ch); await wait(page, 130); }
        await page.keyboard.press('Enter');
        await wait(page, 1500);
      }
      await wait(page, 900);
    },
  },
];

fs.mkdirSync(OUT, { recursive: true });
const made = [];

for (const clip of CLIPS) {
  /*
   * A BROWSER PER CLIP, WINDOWED TO THE CLIP, AT REAL DEVICE SCALE.
   *
   * `page.screencast()` records the browser's actual compositing surface, not
   * the emulated viewport, and it ignores deviceScaleFactor entirely. So the
   * first corrected run laid the page out at 390x844 and recorded a 390x844
   * file whose content stopped at ~600px with black underneath: the default
   * window was smaller than the viewport, and the capture followed the window.
   *
   * Two flags fix both halves. --window-size makes the surface match the
   * layout, so nothing is letterboxed. --force-device-scale-factor multiplies
   * the recorded pixels, so a phone clip lands at 1170x2532 instead of a size
   * no one can cut a campaign from.
   */
  const browser = await launch();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60_000);
  await page.setViewport({
    width: clip.size.width, height: clip.size.height,
    deviceScaleFactor: clip.size.dsf,
    isMobile: clip.size.width < 500, hasTouch: clip.size.width < 500,
  });
  /*
   * A clean board every time. A recording that opens on somebody else's
   * half-finished game is the video equivalent of the capture that shot ten
   * frames of the wrong accent.
   */
  await page.evaluateOnNewDocument(() => {
    try { localStorage.removeItem('ngw-wordy/v2'); } catch { /* first run */ }
  });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await wait(page, 900);

  /*
   * THE DIAL HAS TO BE IN FRAME BEFORE RECORDING STARTS.
   *
   * This is the assertion the first run needed and did not have. Everything
   * about that run looked healthy — three files, correct durations, clean mp4
   * conversion — and the clip named for the dial turning did not contain the
   * dial. A recording harness that cannot tell is worse than none, because it
   * produces something shippable.
   */
  const framed = await page.evaluate(() => {
    const disc = document.querySelector('.liquid-disc');
    if (!disc) return { ok: false, why: 'no dial in the DOM' };
    const r = disc.getBoundingClientRect();
    const onScreen = r.top >= 0 && r.bottom <= innerHeight && r.width > 40;
    return { ok: onScreen, why: `dial ${Math.round(r.top)}..${Math.round(r.bottom)} in ${innerHeight}px`,
             w: Math.round(r.width) };
  });
  if (!framed.ok) {
    console.log(`  ✗ ${clip.name} — ${framed.why}; not recording a clip that misses its subject`);
    await page.close();
    await browser.close();
    continue;
  }

  const mp4 = path.join(OUT, `${clip.name}.mp4`);
  /*
   * FRAMES, NOT A SCREENCAST.
   *
   * `page.screencast()` records the browser's compositing surface, which is
   * sized by the OS window and ignores deviceScaleFactor. Three attempts to
   * make the surface agree with the emulated viewport produced, in order: a
   * 390x844 file too small to cut a campaign from, and then a 1500x2270 file
   * whose content sat in the top-left 707x527 with black around it.
   *
   * `page.screenshot()` has no such gap — it renders the emulated viewport at
   * deviceScaleFactor, which is why every still this repo captures comes out
   * the exact size it asked for. So grab stills on a timer while the
   * interaction runs and stitch them. Each frame carries the wall-clock ms it
   * was taken at, and ffmpeg's concat demuxer replays those real durations, so
   * pacing survives the fact that a screenshot is not instantaneous.
   */
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sixdial-frames-'));
  const stamps = [];
  let grabbing = true;
  const started = Date.now();
  const grabber = (async () => {
    while (grabbing) {
      const file = path.join(frameDir, `f${String(stamps.length).padStart(5, '0')}.png`);
      try { await page.screenshot({ path: file, optimizeForSpeed: true }); }
      catch { break; }               // page closed out from under us: stop cleanly
      stamps.push({ file, at: Date.now() - started });
    }
  })();

  await clip.play(page);
  grabbing = false;
  await grabber;

  if (stamps.length < 2) {
    console.log(`  ✗ ${clip.name} — only ${stamps.length} frame(s) captured`);
    await page.close(); await browser.close(); continue;
  }

  /* Per-frame durations from the real timestamps; the last frame holds for the
     median so the clip doesn't end on a zero-length frame. */
  const gaps = stamps.slice(1).map((s2, i) => (s2.at - stamps[i].at) / 1000);
  const median = gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
  const list = path.join(frameDir, 'frames.txt');
  fs.writeFileSync(list, stamps.map((s2, i) =>
    `file '${s2.file}'\nduration ${(gaps[i] ?? median).toFixed(4)}`).join('\n') + `\nfile '${stamps.at(-1).file}'\n`);
  await page.close();
  await browser.close();

  /* yuv420p and the even-dimension filter are not decoration: an odd pixel
     dimension makes H.264 fail outright, and without the pixel format
     QuickTime opens a black frame rather than an error. */
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', list,
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p',
    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-r', '30', mp4],
    { stdio: 'pipe' });
  /* The submission master is encoded from THESE frames, not from the mp4 just
     written -- see the mastering pass. Everything else can drop its frames. */
  const keepFrames = clip.name === 'store-preview';
  if (!keepFrames) fs.rmSync(frameDir, { recursive: true, force: true });

  const bytes = fs.statSync(mp4).size;
  made.push({ name: clip.name, what: clip.what, mp4, bytes, list: keepFrames ? list : null, frameDir: keepFrames ? frameDir : null });
  console.log(`  ✔ ${clip.name.padEnd(18)} ${clip.size.width}x${clip.size.height}  ${(bytes / 1024 / 1024).toFixed(1)}MB`);
}


/*
 * THE SUBMISSION MASTER.
 *
 * The capture above is graded for a landing page; a store preview is a
 * different file with different rules, and measuring the landing-page clips
 * against Apple's published spec failed five of nine checks. Four of those are
 * encode-level and get fixed here:
 *
 *   886x1920   the only iPhone preview resolution Apple accepts, for every
 *              modern display size from 6.1" to 6.9"
 *   High L4.0  the capture lands at L5.0 purely because 1170x2532 is a lot of
 *              macroblocks; at 886x1920 the same footage fits inside 4.0
 *   ~11 Mbps   Apple targets 10-12; the capture sits near 1, which is fine for
 *              a web page and reads as mush next to a 12 Mbps neighbour
 *   silent AAC Apple's table lists stereo audio as a specification. A silent
 *              256k stereo track satisfies it. The game HAS sound, and a real
 *              mix would be better -- this only guarantees the file is not
 *              rejected for a missing track.
 *
 * Duration is the one thing no encode can fix, which is why store-preview is
 * captured long rather than stretched.
 */
const submission = made.find((m) => m.name === 'store-preview');
if (submission) {
  const out = path.join(OUT, 'store-preview__886x1920.mp4');
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', submission.list,
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-vf', 'scale=886:1920:flags=lanczos',
    '-c:v', 'libx264', '-profile:v', 'high', '-level:v', '4.0',
    '-crf', '16', '-maxrate', '12M', '-bufsize', '24M',
    '-pix_fmt', 'yuv420p', '-r', '30',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
    '-shortest', '-movflags', '+faststart', out], { stdio: 'pipe' });
  for (const m of made) if (m.frameDir) fs.rmSync(m.frameDir, { recursive: true, force: true });

  /* Assert the spec rather than trust the flags: a silent -shortest can clip
     the video, and a level ceiling is a request the encoder may decline. */
  const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-of', 'json',
    '-show_entries', 'stream=codec_type,width,height,level,duration,channels,bit_rate', out]).toString());
  const v = probe.streams.find((x) => x.codec_type === 'video');
  const a = probe.streams.find((x) => x.codec_type === 'audio');
  const secs = Number(v.duration);
  const bad = [];
  if (v.width !== 886 || v.height !== 1920) bad.push(`${v.width}x${v.height}, need 886x1920`);
  if (v.level > 40) bad.push(`H.264 level ${v.level / 10}, need <= 4.0`);
  if (secs < 15 || secs > 30) bad.push(`${secs.toFixed(1)}s, Apple requires 15-30s`);
  if (!a || a.channels !== 2) bad.push('no stereo audio track');
  if (bad.length) console.log(`\n\u2716 store-preview__886x1920.mp4 is NOT submittable: ${bad.join('; ')}`);
  else {
    const mbps = (Number(v.bit_rate) / 1e6).toFixed(1);
    const note = Number(v.bit_rate) < 10e6 ? `; ${mbps} Mbps, under Apple's 10-12 target -- a target, not a floor, and CRF 16 says the picture is there` : `; ${mbps} Mbps`;
    console.log(`\n\u2714 store-preview__886x1920.mp4 meets Apple's preview spec (${secs.toFixed(1)}s, 886x1920, L${v.level / 10}, stereo${note})`);
  }
}

console.log(`\n${made.length} clips -> store/video/`);
for (const m of made) console.log(`  ${m.name}: ${m.what}`);
