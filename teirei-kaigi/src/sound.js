// ============================================================
// サウンドエンジン — Web Audio APIによるファミコン風効果音
// 依存なし・音声ファイル不要。矩形波/三角波のオシレータで都度合成する。
// ブラウザの自動再生制限のため、AudioContextはユーザー操作中に
// ensureAudio() で生成・resumeすること(タイトルの「会議に参加」等)。
// ============================================================

let ctx = null;
let masterGain = null;
let enabled = true;

const SOUND_KEY = "tk_sound";

// localStorageから前回のON/OFFを復元(初期値ON)。
export function loadSoundEnabled() {
  try {
    enabled = localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    enabled = true;
  }
  return enabled;
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(on) {
  enabled = !!on;
  try {
    localStorage.setItem(SOUND_KEY, enabled ? "on" : "off");
  } catch {
    /* プライベートモード等は黙って無視 */
  }
  if (ctx && masterGain) {
    // 急な切替時のプチノイズを避けて滑らかに増減
    masterGain.gain.setTargetAtTime(enabled ? 0.5 : 0, ctx.currentTime, 0.02);
  }
}

// AudioContextを遅延生成・resume。必ずユーザー操作のハンドラ内から呼ぶ。
export function ensureAudio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = enabled ? 0.5 : 0;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// 単発トーン。矩形波がファミコン感の核。クリックノイズ防止に短いアタック/リリースを付与。
function tone({ freq, start = 0, dur = 0.08, type = "square", gain = 0.4, slideTo = null }) {
  if (!ctx || !enabled) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(masterGain);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function play(notes) {
  if (!ensureAudio() || !enabled) return;
  notes.forEach(tone);
}

// ---- ボタン音 ----
// 通常ボタン: 軽い2音ブリップ。
export function playClick() {
  play([
    { freq: 660, dur: 0.05, gain: 0.35 },
    { freq: 880, start: 0.045, dur: 0.05, gain: 0.3 },
  ]);
}

// 退出ボタン: 下降する決定音(通常ボタンと区別)。
export function playLeave() {
  play([
    { freq: 540, dur: 0.06, gain: 0.4 },
    { freq: 392, start: 0.055, dur: 0.11, gain: 0.4, slideTo: 330 },
  ]);
}

// ---- 字幕に合わせた音 ----
// ファミコンのテキスト送り風。字幕の長さに応じて短いブリップを連打する。
// 異変の有無で音は変えない(早期に異変を悟らせないため)。
export function playCaption(text) {
  if (!ensureAudio() || !enabled) return;
  const len = Math.min((text || "").length, 14);
  const n = Math.max(3, Math.ceil(len / 2));
  const notes = [];
  for (let i = 0; i < n; i++) {
    notes.push({ freq: 720 + (i % 2) * 90, start: i * 0.045, dur: 0.028, gain: 0.16 });
  }
  play(notes);
}

// 字幕が「……」沈黙になったとき: テキスト送りの代わりに低い不穏な単音。
export function playSilence() {
  play([{ freq: 174, dur: 0.5, type: "triangle", gain: 0.3, slideTo: 130 }]);
}

// ---- 進行音 ----
// 会議参加: 上昇アルペジオ。
export function playStart() {
  play([
    { freq: 523, start: 0.0, dur: 0.09, gain: 0.35 },
    { freq: 659, start: 0.08, dur: 0.09, gain: 0.35 },
    { freq: 784, start: 0.16, dur: 0.13, gain: 0.35 },
  ]);
}

// 正解で翌日へ: 明るい3音ジングル。
export function playSuccess() {
  play([
    { freq: 659, start: 0.0, dur: 0.09, gain: 0.38 },
    { freq: 880, start: 0.09, dur: 0.09, gain: 0.38 },
    { freq: 1047, start: 0.18, dur: 0.16, gain: 0.38 },
  ]);
}

// 失敗: 下降する不協和なブザー。
export function playFail() {
  play([
    { freq: 330, start: 0.0, dur: 0.18, type: "square", gain: 0.4, slideTo: 196 },
    { freq: 233, start: 0.16, dur: 0.34, type: "square", gain: 0.4, slideTo: 110 },
  ]);
}

// 全クリア: 長めの勝利ジングル。
export function playClear() {
  play([
    { freq: 523, start: 0.0, dur: 0.12, gain: 0.38 },
    { freq: 659, start: 0.12, dur: 0.12, gain: 0.38 },
    { freq: 784, start: 0.24, dur: 0.12, gain: 0.38 },
    { freq: 1047, start: 0.36, dur: 0.28, gain: 0.4 },
    { freq: 784, start: 0.6, dur: 0.1, gain: 0.3 },
    { freq: 1047, start: 0.7, dur: 0.3, gain: 0.4 },
  ]);
}

// 終了間際のカウントダウン: 残り数秒で鳴る短いティック。
export function playTick() {
  play([{ freq: 880, dur: 0.04, type: "square", gain: 0.22 }]);
}
