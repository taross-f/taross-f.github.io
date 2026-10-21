// ============================================================
// endlessCore.js — エンドレスモードの決定論コア
// クライアント(TeireiKaigi.jsx)とサーバ(worker/index.js)で共有する。
// ここを変えるとスコア検証の互換性が壊れるため、変更時は両者を必ず同時にデプロイすること。
// React等への依存を持たない純粋なESMに保つ(Workerでもそのまま動かすため)。
// ============================================================

export const ANOMALY_RATE = 0.66;
export const MEETING_SECONDS = 35;

// 時間整合チェックの下限(ミリ秒)。
// stay(完走)は35秒のタイマーを最後まで待つので実時間が必須。leave も最低操作時間を課す。
export const MIN_LEAVE_MS = 700;
export const MIN_STAY_MS = 32000;
// 1ラウンドあたりの上限(分単位のゴミ値を弾く。タブのスロットリングを考慮し緩め)。
export const MAX_ROUND_MS = 30 * 60 * 1000;
// セッションの最大有効時間。これを超えた送信は古すぎるとして拒否する。
export const MAX_SESSION_MS = 6 * 60 * 60 * 1000;
// 1回の送信で受け付ける最大ラウンド数(異常な巨大配列を弾く)。
export const MAX_ROUNDS = 1000;

// 異変IDの正本。並び順が乱数列に影響するため並び替え・削除は禁止(末尾追加のみ可)。
// TeireiKaigi.jsx の ANOMALIES.map(a => a.id) と完全一致していること(クライアント起動時に検証)。
export const ANOMALY_IDS = [
  "caption", "title", "speaker", "samename", "reversed", "button", "name",
  "selfname", "clock", "count", "extra", "flip", "blink", "mute", "shadow",
  "rec", "face", "eyecolor", "noblink", "selftalk", "joiner", "silence",
  "timerup", "approach", "grow", "redden", "thirdeye",
];

// 決定論PRNG(mulberry32)。符号なし32bit seed から [0,1) を返す関数を生成する。
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// seed から最大 n ラウンド分の「出現する異変」列を先読み生成する。
// クライアントは sequence[i] を見て描画し、サーバは同じ seed で同じ列を再生成して照合する。
// プール消費は「正解(=見破った異変)は同一ランで再出現しない」を仮定する。エンドレスは
// 正解でのみ継続するため、ゲームオーバー前の各ラウンドは必ず正解であり、この仮定が成り立つ。
// 異変ありラウンド = 退出して正解 → そのIDをプールから除外。
// 異変なしラウンド = 残って正解 → プールは不変。
export function generateSequence(seed, n) {
  const rng = mulberry32(seed);
  const out = [];
  let used = [];
  for (let i = 0; i < n; i++) {
    const hasAnomaly = rng() < ANOMALY_RATE;
    let anomalyId = null;
    if (hasAnomaly) {
      let pool = ANOMALY_IDS.filter((id) => !used.includes(id));
      if (pool.length === 0) {
        pool = ANOMALY_IDS.slice();
        used = [];
      }
      anomalyId = pool[Math.floor(rng() * pool.length)];
      used = used.concat(anomalyId);
    }
    out.push({ hasAnomaly, anomalyId });
  }
  return out;
}

// 操作ログを seed 由来の列に突き合わせ、正式な streak を計算する(サーバ権威の判定)。
// inputs: [{ action: "leave" | "stay", elapsedMs: number }] を各ラウンド1件、時系列順に。
// 返り値: { ok, streak, reason }。ok=false の送信はランキングに採用しない。
//
// 検証内容:
//  1. action と elapsedMs の型・範囲
//  2. 各ラウンドの時間整合(stay は実時間35秒必須、leave も最低時間)
//  3. seed 列との正誤判定で streak を再計算
//  4. ゲームオーバー(不正解)は最後の1件のみ。途中で不正解なのに続いていたら不整合
//  5. 末尾が不正解で終わっている(正規のゲームオーバー)こと
export function replay(seed, inputs) {
  if (!Array.isArray(inputs) || inputs.length === 0) {
    return { ok: false, streak: 0, reason: "empty" };
  }
  if (inputs.length > MAX_ROUNDS) {
    return { ok: false, streak: 0, reason: "too_long" };
  }
  const seq = generateSequence(seed, inputs.length);
  let streak = 0;
  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i];
    if (!inp || (inp.action !== "leave" && inp.action !== "stay")) {
      return { ok: false, streak, reason: "bad_action" };
    }
    const e = Number(inp.elapsedMs);
    if (!Number.isFinite(e) || e < 0 || e > MAX_ROUND_MS) {
      return { ok: false, streak, reason: "bad_time" };
    }
    if (inp.action === "stay" && e < MIN_STAY_MS) {
      return { ok: false, streak, reason: "too_fast_stay" };
    }
    if (inp.action === "leave" && e < MIN_LEAVE_MS) {
      return { ok: false, streak, reason: "too_fast_leave" };
    }
    const has = seq[i].hasAnomaly;
    const correct =
      (inp.action === "leave" && has) || (inp.action === "stay" && !has);
    if (correct) {
      streak++;
      continue;
    }
    // 不正解 = ゲームオーバー。これより後に入力があれば「失敗後も継続」で不整合。
    if (i !== inputs.length - 1) {
      return { ok: false, streak, reason: "continued_after_fail" };
    }
    return { ok: true, streak, reason: "ok" };
  }
  // 全ラウンド正解で終わっている = ゲームオーバーになっていない(正規の送信ではない)。
  return { ok: false, streak, reason: "no_gameover" };
}

// inputs から「最低限かかったはずの実プレイ時間(ms)」を求める。
// サーバが信頼できる時刻(セッション発行〜送信)と突き合わせ、捏造した elapsedMs が
// 実際の経過時間に収まっているかを検証するために使う。
export function minPlayMs(inputs) {
  let total = 0;
  for (const inp of inputs) {
    total += inp && inp.action === "stay" ? MIN_STAY_MS : MIN_LEAVE_MS;
  }
  return total;
}
