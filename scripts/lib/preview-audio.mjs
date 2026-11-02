/*
 * THE PREVIEW'S AUDIO IS THE GAME'S AUDIO, RENDERED — not a mix that imitates
 * it.
 *
 * `m9j`: the store preview carried a silent stereo track. That satisfies
 * Apple's specification, which lists stereo audio, and nothing else — and
 * capture-video.mjs said so in its own comment: "The game HAS sound, and a
 * real mix would be better; this only guarantees the file is not rejected for
 * a missing track."
 *
 * The obvious way to fix that is to write a mix by hand in ffmpeg from the
 * frequencies in `src/lib/feedback.ts`. That would be a SECOND SOURCE OF TRUTH
 * for the game's sound, and this repository has now paid four times for
 * exactly that shape of mistake — a fact written down beside the thing it
 * describes, drifting apart from it in silence. The tones are in C major
 * deliberately, `reject` is deliberately out of key, and `feedback.test.ts`
 * exempts it by name so nobody "fixes" it into tune. A hand mix would not know
 * any of that, and the first edit to the real file would make the preview a
 * lie.
 *
 * So the real module is bundled and executed, with its AudioContext replaced
 * by an OfflineAudioContext. The audio in the preview is produced by the code
 * that ships.
 *
 * WHY A CLOCK PROXY. `tone()` schedules against `ac.currentTime + delay`, and
 * an OfflineAudioContext's `currentTime` stays at 0 until `startRendering()`.
 * Every call made before rendering would therefore pile up at t=0 and the
 * whole preview would be one chord. The context is handed over behind a Proxy
 * whose `currentTime` this module sets, so the shipped scheduling code places
 * each event where the timeline says without being modified to do it.
 *
 * `state` is reported as 'running' for the same reason: `audio()` calls
 * `ctx.resume()` on a suspended context, which is meaningless here.
 *
 * ON SHIPPING MUTED. `storage.ts` sets sound OFF by default, a player-board
 * ruling with its reason written down — "a commute, a waiting room, a bed with
 * someone asleep next to it". So this mix is what the game sounds like with
 * sound turned on, which is one toggle away, and store previews autoplay muted
 * in any case. It is not a claim that the game makes noise when installed.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './browser.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const RATE = 48000;

/**
 * Bundle `src/lib/feedback.ts` to an IIFE that puts the real `feedback` object
 * on `window`.
 *
 * Vite's JS API with `configFile: false` so the app's own config — which is a
 * Next build, not a library build — has no say in it.
 */
async function bundleFeedback() {
  const { build } = await import('vite');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sixdial-fb-'));
  const entry = path.join(dir, 'entry.ts');
  fs.writeFileSync(
    entry,
    `import { feedback, setMuted, setHapticsMuted } from ${JSON.stringify(
      path.join(ROOT, 'src', 'lib', 'feedback.ts'),
    )};\n` +
      'setMuted(false);\n' +
      /* Haptics would reach for navigator.vibrate and build a hidden
         <label> on every event. Nothing here can feel them and they are a
         separate channel by design, so they are switched off rather than
         fired into a headless page thousands of times. */
      'setHapticsMuted(true);\n' +
      'window.FB = feedback;\n',
  );
  await build({
    root: dir,
    configFile: false,
    logLevel: 'silent',
    build: {
      lib: { entry, formats: ['iife'], name: 'FBBundle', fileName: () => 'fb.js' },
      outDir: dir,
      emptyOutDir: false,
      minify: false,
      target: 'chrome120',
    },
  });
  const code = fs.readFileSync(path.join(dir, 'fb.js'), 'utf8');
  fs.rmSync(dir, { recursive: true, force: true });
  return code;
}

/** Little-endian 16-bit stereo PCM in a RIFF container. */
function wav(left, right) {
  const frames = left.length;
  const bytes = frames * 4;
  const buf = Buffer.alloc(44 + bytes);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + bytes, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);              // PCM
  buf.writeUInt16LE(2, 22);              // stereo
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 4, 28);       // byte rate
  buf.writeUInt16LE(4, 32);              // block align
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(bytes, 40);
  for (let i = 0; i < frames; i += 1) {
    /* Clamp rather than wrap. A sample over 1.0 written with writeInt16LE
       throws on some values and wraps to full-scale opposite polarity on
       others, which is audible as a click exactly at the loudest moment. */
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  return buf;
}

/**
 * Render a timeline of feedback events to a stereo WAV.
 *
 * `timeline` is `[{ at: ms, kind: 'tap' | 'correct' | ..., step?: n }]` —
 * whatever `feedback` exports, called with the clock parked at `at`.
 * `seconds` is the length of the output, normally the clip's own duration so
 * the track and the picture are the same length.
 *
 * Returns what it rendered, including the peak, so the caller can assert the
 * track is not silent. "It satisfies the spec and nothing else" was the whole
 * defect; a renderer that silently produced silence would reproduce it.
 */
export async function renderMix(timeline, seconds, outWav) {
  const code = await bundleFeedback();
  const browser = await launch();
  try {
    const page = await browser.newPage();
    /* about:blank, not the app. Nothing here needs the game running — only the
       module, which is why this can be asserted without a server. */
    await page.goto('about:blank');
    await page.evaluate(code);

    const rendered = await page.evaluate(
      async ({ timeline, frames, rate }) => {
        const oac = new OfflineAudioContext(2, frames, rate);
        let clock = 0;
        const proxy = new Proxy(oac, {
          get(t, p) {
            if (p === 'currentTime') return clock;
            if (p === 'state') return 'running';
            const v = t[p];
            return typeof v === 'function' ? v.bind(t) : v;
          },
          set(t, p, v) { t[p] = v; return true; },
        });
        window.AudioContext = function () { return proxy; };

        const fb = window.FB;
        const missing = [...new Set(timeline.map((e) => e.kind))]
          .filter((k) => typeof fb[k] !== 'function');
        if (missing.length) return { error: `no such feedback event: ${missing.join(', ')}` };

        for (const e of timeline) {
          clock = e.at / 1000;
          fb[e.kind](...(e.args ?? []));
        }

        const buf = await oac.startRendering();
        const L = buf.getChannelData(0);
        const R = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L;
        let peak = 0;
        for (let i = 0; i < L.length; i += 1) {
          const a = Math.abs(L[i]); if (a > peak) peak = a;
        }
        return { left: Array.from(L), right: Array.from(R), peak, events: timeline.length };
      },
      { timeline, frames: Math.max(1, Math.round(seconds * RATE)), rate: RATE },
    );

    if (rendered.error) throw new Error(rendered.error);
    fs.writeFileSync(outWav, wav(rendered.left, rendered.right));
    return { peak: rendered.peak, events: rendered.events, seconds, wav: outWav };
  } finally {
    await browser.close();
  }
}
