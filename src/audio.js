// ===== Web Audio で合成する効果音とオルゴールBGM（外部音源なし） =====
let ctx = null;
let master, sfxBus, musicBus;
let sfxOn = true;
let musicOn = true;
let musicTimer = null;
let nextNoteTime = 0;
let step = 0;

export function initAudio() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.7;
      master.connect(ctx.destination);
      sfxBus = ctx.createGain();
      sfxBus.gain.value = 1;
      sfxBus.connect(master);
      musicBus = ctx.createGain();
      musicBus.gain.value = musicOn ? 0.2 : 0;
      musicBus.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    startMusic();
  } catch {
    ctx = null;
  }
}

function tone(freq, dur, { type = 'sine', vol = 0.3, when = 0, slide = 0, attack = 0.005, bus } = {}) {
  if (!ctx) return;
  const out = bus || sfxBus;
  if (out === sfxBus && !sfxOn) return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur, { vol = 0.2, from = 800, to = 3000, when = 0, q = 1.2 } = {}) {
  if (!ctx || !sfxOn) return;
  const t = ctx.currentTime + when;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(sfxBus);
  src.start(t);
}

const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568];

export const sfx = {
  click: () => tone(880, 0.07, { type: 'triangle', vol: 0.12 }),
  select: () => { tone(660, 0.08, { type: 'triangle', vol: 0.14 }); tone(990, 0.08, { type: 'triangle', vol: 0.08, when: 0.03 }); },
  swap: () => { tone(520, 0.08, { type: 'triangle', vol: 0.14 }); tone(780, 0.1, { type: 'triangle', vol: 0.12, when: 0.05 }); },
  nope: () => { tone(330, 0.12, { type: 'square', vol: 0.06 }); tone(247, 0.16, { type: 'square', vol: 0.06, when: 0.11 }); },
  pop: (combo = 1) => {
    const f = SCALE[Math.min(combo - 1, SCALE.length - 1)];
    tone(f, 0.18, { vol: 0.26, slide: -f * 0.4 });
    tone(f * 2, 0.12, { type: 'triangle', vol: 0.07, when: 0.02 });
    noise(0.08, { vol: 0.08, from: 2000, to: 6000 });
  },
  line: () => { noise(0.35, { vol: 0.25, from: 400, to: 5000, q: 2 }); tone(1200, 0.3, { type: 'sawtooth', vol: 0.04, slide: 1200 }); },
  bomb: () => { tone(140, 0.45, { vol: 0.55, slide: -100 }); noise(0.4, { vol: 0.3, from: 1200, to: 200 }); },
  rainbow: () => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.12, when: i * 0.05 })),
  special: () => { tone(1047, 0.2, { type: 'triangle', vol: 0.14 }); tone(1568, 0.3, { type: 'sine', vol: 0.1, when: 0.06 }); },
  curtain: () => noise(0.9, { vol: 0.12, from: 300, to: 1500, q: 0.6 }),
  win: () => [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.45, { type: 'triangle', vol: 0.16, when: i * 0.09 })),
  lose: () => [523, 466, 415, 349].forEach((f, i) => tone(f, 0.4, { type: 'triangle', vol: 0.14, when: i * 0.16 })),
  star: (i) => { tone([1047, 1319, 1568][i] || 1568, 0.5, { type: 'triangle', vol: 0.18 }); tone(([1047, 1319, 1568][i] || 1568) * 2, 0.3, { vol: 0.06, when: 0.04 }); },
  achieve: () => [1175, 1568, 2093].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.12, when: i * 0.08 })),
};

// ---- オルゴール風ワルツ（オリジナル曲） ----
const m = (n) => 440 * Math.pow(2, (n - 69) / 12);
// [ベース音, 和音(2音), メロディ(拍ごと: midi or [midi, 拍数] or null)]
const BARS = [
  [48, [64, 67], [76, 79, 84]],
  [45, [64, 69], [81, 76, 72]],
  [41, [65, 69], [81, 84, 81]],
  [43, [65, 71], [[79, 2], null, 77]],
  [48, [64, 67], [76, 79, 76]],
  [40, [67, 71], [74, 76, 79]],
  [41, [65, 69], [81, 79, 77]],
  [43, [67, 71], [[74, 3], null, null]],
  [45, [64, 69], [84, 83, 81]],
  [41, [65, 69], [81, 79, 77]],
  [48, [64, 67], [76, 79, 84]],
  [43, [67, 71], [[83, 2], null, 86]],
  [41, [65, 69], [84, 81, 77]],
  [43, [65, 71], [79, 83, 86]],
  [48, [64, 67], [[84, 3], null, null]],
  [48, [64, 67], [79, 76, 72]],
];
const BEAT = 60 / 138;

function musicBox(freq, when, len = 1.4, vol = 0.22) {
  tone(freq, len, { vol, when, attack: 0.004, bus: musicBus });
  tone(freq * 2, len * 0.5, { vol: vol * 0.25, when, attack: 0.004, bus: musicBus });
}

function schedule() {
  if (!ctx) return;
  while (nextNoteTime < ctx.currentTime + 0.25) {
    const bar = BARS[Math.floor(step / 3) % BARS.length];
    const beat = step % 3;
    const when = nextNoteTime - ctx.currentTime;
    if (beat === 0) tone(m(bar[0]), 1.0, { type: 'triangle', vol: 0.16, when, bus: musicBus });
    else bar[1].forEach((n) => tone(m(n), 0.35, { type: 'sine', vol: 0.05, when, bus: musicBus }));
    const mel = bar[2][beat];
    if (mel != null) {
      const [n, len] = Array.isArray(mel) ? mel : [mel, 1];
      musicBox(m(n), when, 0.6 + len * BEAT);
    }
    nextNoteTime += BEAT;
    step++;
  }
}

function startMusic() {
  if (!ctx || musicTimer) return;
  nextNoteTime = ctx.currentTime + 0.1;
  musicTimer = setInterval(schedule, 40);
}

export function setSfx(on) { sfxOn = on; }
export function setMusic(on) {
  musicOn = on;
  if (musicBus && ctx) musicBus.gain.setTargetAtTime(on ? 0.2 : 0, ctx.currentTime, 0.1);
}
