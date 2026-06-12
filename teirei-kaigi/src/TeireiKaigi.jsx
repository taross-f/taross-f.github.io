import { useState, useEffect, useRef, useCallback } from "react";
import {
  ensureAudio, loadSoundEnabled, isSoundEnabled, setSoundEnabled,
  playClick, playLeave, playCaption, playSilence,
  playStart, playSuccess, playFail, playClear, playTick,
} from "./sound";

// ============================================================
// 定例会議 — 8番出口ライク・ビデオ会議異変探し プロトタイプ v2
// ルール: 異変を感じたら「退出」/ 異変がなければ最後まで残る
// 月曜から金曜まで判断を間違えなければクリア。
// ============================================================

const MEETING_SECONDS = 35;
const DAYS = ["月", "火", "水", "木", "金"];
const ANOMALY_RATE = 0.66;
const USED_STORAGE_KEY = "tk_used_anomalies";
// 図鑑用: 一度でも見破った異変の永続記録。USED と違いリセットしない(全制覇トロフィー判定に使う)。
const DISCOVERED_STORAGE_KEY = "tk_discovered_anomalies";

const BASE_PARTICIPANTS = [
  { id: "tanaka", name: "田中", skin: "#e8b794", shirt: "#3a5a8c", bgType: "plain", bgA: "#2e3440", bgB: "#3b4252", muted: false, host: true },
  { id: "sato", name: "佐藤", skin: "#e3a982", shirt: "#6b4f8c", bgType: "plain", bgA: "#3a3f4b", bgB: "#2b2f38", muted: true, glasses: true },
  { id: "suzuki", name: "鈴木", skin: "#f0c4a0", shirt: "#4a7a5c", bgType: "plain", bgA: "#33383f", bgB: "#23272d", muted: true },
  { id: "takahashi", name: "高橋", skin: "#dba47e", shirt: "#8c6b3a", bgType: "door", bgA: "#3d3a35", bgB: "#28251f", muted: true },
  { id: "watanabe", name: "渡辺", skin: "#ecb28e", shirt: "#7a4a4a", bgType: "plain", bgA: "#2f3a3f", bgB: "#1f282c", muted: true, glasses: true },
];

const SELF = { id: "self", name: "あなた", skin: "#ecbf9b", shirt: "#444b55", bgType: "plain", bgA: "#26292e", bgB: "#191b1f", muted: true, isSelf: true };

const CAPTIONS = [
  "では、本日の定例を始めます。",
  "進捗ですが、概ね予定どおりです。",
  "課題管理表は後ほど共有します。",
  "来週のリリースについてですが…",
  "他に共有事項のある方はいますか。",
  "では、引き続きよろしくお願いします。",
];
const CLOSING = "では、終わります。お疲れさまでした。";

const CREEPY_CAPTIONS = [
  "では、本日の定例を始めます。",
  "進捗ですが、概ね予定どおりです。",
  "あなたの進捗は、全員が知っています。",
  "明日も、ここにいてください。",
  "他に共有事項のある方は、いませんね。",
  "では、引き続き見ています。",
];
const CREEPY_CLOSING = "では、終わります。まだ、いますね。";

const ANOMALIES = [
  // ---- 文字系 ----
  {
    id: "caption",
    label: "司会の発言が不気味だった",
    apply: (v) => { v.captions = CREEPY_CAPTIONS; v.closing = CREEPY_CLOSING; },
  },
  {
    id: "title",
    label: "会議名が「目次定例」になっていた",
    apply: (v) => { v.title = "目次定例"; },
  },
  {
    id: "speaker",
    label: "字幕の話者が「あなた」になっていた",
    apply: (v) => { v.speaker = "あなた"; },
  },
  {
    id: "samename",
    label: "全員の名前が「田中」になっていた",
    apply: (v) => {
      v.participants = v.participants.map(p => ({ ...p, name: "田中" }));
      v.selfName = "田中";
    },
  },
  {
    id: "reversed",
    label: "字幕が逆さに流れていた",
    apply: (v) => {
      v.captions = CAPTIONS.map(c => [...c].reverse().join(""));
      v.closing = [...CLOSING].reverse().join("");
    },
  },
  {
    id: "button",
    label: "退出ボタンが「脱出」になっていた",
    apply: (v) => { v.leaveLabel = "脱出"; },
  },
  {
    id: "name",
    label: "渡辺さんの名前が「渡部」になっていた",
    apply: (v) => { v.participants = v.participants.map(p => p.id === "watanabe" ? { ...p, name: "渡部" } : p); },
  },
  {
    id: "selfname",
    label: "自分の名前が「私」になっていた",
    apply: (v) => { v.selfName = "私"; },
  },
  {
    id: "clock",
    label: "時計が「10:66」を指していた",
    apply: (v) => { v.clock = "10:66"; },
  },
  {
    id: "count",
    label: "参加者数の表示が「7」になっていた",
    apply: (v) => { v.count = 7; },
  },
  // ---- 視覚系 ----
  {
    id: "extra",
    label: "知らない参加者が1人増えていた",
    apply: (v) => {
      v.participants = [...v.participants];
      v.participants.splice(4, 0, { id: "unknown", name: "user_039", skin: "#777", shirt: "#222", bgType: "dark", bgA: "#0a0a0c", bgB: "#000000", muted: true, cameraOff: true });
      v.count = 7;
    },
  },
  {
    id: "flip",
    label: "鈴木さんの映像が上下反転していた",
    apply: (v) => { v.participants = v.participants.map(p => p.id === "suzuki" ? { ...p, flipped: true } : p); },
  },
  {
    id: "blink",
    label: "全員のまばたきが同期していた",
    apply: (v) => { v.syncBlink = true; },
  },
  {
    id: "mute",
    label: "渡辺さんのミュートが外れていた",
    apply: (v) => { v.participants = v.participants.map(p => p.id === "watanabe" ? { ...p, muted: false } : p); },
  },
  {
    id: "shadow",
    label: "高橋さんの背景に人影があった",
    apply: (v) => { v.participants = v.participants.map(p => p.id === "takahashi" ? { ...p, shadow: true } : p); },
  },
  {
    id: "rec",
    label: "レコーディング中になっていた",
    apply: (v) => { v.recording = true; },
  },
  {
    id: "face",
    label: "田中さんの顔色がおかしかった",
    apply: (v) => { v.participants = v.participants.map(p => p.id === "tanaka" ? { ...p, skin: "#9fbf8e" } : p); },
  },
  // ---- 不気味強化系（静的） ----
  {
    id: "noblink",
    label: "佐藤さんが、一度もまばたきをしていなかった",
    apply: (v) => { v.participants = v.participants.map(p => p.id === "sato" ? { ...p, frozenEyes: true } : p); },
  },
  // ---- 不気味強化系（時間経過で発生） ----
  {
    id: "selftalk",
    label: "ミュート中なのに、自分の口が動いていた",
    apply: (v) => { v.selfTalk = true; },
  },
  {
    id: "joiner",
    label: "会議の途中で、知らない参加者が入ってきた",
    apply: (v) => { v.lateJoiner = true; },
  },
  {
    id: "silence",
    label: "途中から、全員が動きを止めてこちらを見ていた",
    apply: (v) => { v.silenceAt = 0.55; },
  },
  {
    id: "timerup",
    label: "残り時間が、途中から増えていった",
    apply: (v) => { v.timerReverse = true; },
  },
  // ---- じわじわ系（時間経過で進行） ----
  {
    id: "approach",
    label: "高橋さんの背景の人影が、だんだん近づいてきていた",
    apply: (v) => { v.participants = v.participants.map(p => p.id === "takahashi" ? { ...p, shadow: true, approach: true } : p); },
  },
  {
    id: "grow",
    label: "佐藤さんの顔が、だんだん大きくなっていた",
    apply: (v) => { v.participants = v.participants.map(p => p.id === "sato" ? { ...p, grow: true } : p); },
  },
  {
    id: "redden",
    label: "鈴木さんの画面が、だんだん赤く染まっていた",
    apply: (v) => { v.participants = v.participants.map(p => p.id === "suzuki" ? { ...p, redden: true } : p); },
  },
];

// localStorage上の異変IDリストを読み書きする共通ヘルパ。
// 読み込み時に定義から消えたID・配列以外の不正値を除外する。
function loadAnomalyIdList(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const valid = new Set(ANOMALIES.map(a => a.id));
    return arr.filter(id => valid.has(id));
  } catch {
    return [];
  }
}

function saveAnomalyIdList(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* localStorage非対応・プライベートモード等は黙って無視 */
  }
}

// 見破り済み(正しく退出できた)異変。全種類を見破るまで被らせず、揃ったらリセット。
const loadUsedAnomalies = () => loadAnomalyIdList(USED_STORAGE_KEY);
const saveUsedAnomalies = (used) => saveAnomalyIdList(USED_STORAGE_KEY, used);

// 図鑑(永続)。リセットされる USED と独立。全種類揃ったら「全制覇」トロフィーを表示する。
const loadDiscovered = () => loadAnomalyIdList(DISCOVERED_STORAGE_KEY);
const saveDiscovered = (discovered) => saveAnomalyIdList(DISCOVERED_STORAGE_KEY, discovered);

// 異変IDを永続リスト(+対応するReact state)に重複なく追記する。
function recordAnomalyId(id, load, save, setState) {
  const list = load();
  if (!list.includes(id)) {
    const next = [...list, id];
    save(next);
    setState(next);
  }
}

// 未見破りの異変から1つ選ぶ(出現させるだけ。記録は正しく退出できたときに行う)。
// 全種類見破り済みならリセットして全異変から選ぶ。
// 戻り値: { anomalyId, recorded } — recordedはリセット反映後の見破り済みリスト。
function pickAnomaly(recorded) {
  let pool = ANOMALIES.filter(a => !recorded.includes(a.id));
  let nextRecorded = recorded;
  if (pool.length === 0) {
    pool = ANOMALIES;
    nextRecorded = [];
  }
  const id = pool[Math.floor(Math.random() * pool.length)].id;
  return { anomalyId: id, recorded: nextRecorded };
}

function buildView(anomalyId) {
  const v = {
    participants: BASE_PARTICIPANTS.map(p => ({ ...p })),
    selfName: "あなた",
    recording: false,
    clock: "10:0" + (3 + Math.floor(Math.random() * 6)),
    syncBlink: false,
    count: 6,
    title: "日次定例",
    speaker: "田中",
    captions: CAPTIONS,
    closing: CLOSING,
    leaveLabel: "退出",
    selfTalk: false,
    lateJoiner: false,
    silenceAt: null,
    timerReverse: false,
  };
  if (anomalyId) {
    const a = ANOMALIES.find(a => a.id === anomalyId);
    if (a) a.apply(v);
  }
  return v;
}

// ---------- Avatar ----------
function Avatar({ p, talking, syncBlink, idx, frozen }) {
  if (p.cameraOff) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#2a2a30", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 22, fontWeight: 700 }}>
          ?
        </div>
      </div>
    );
  }
  const blinkStyle = frozen ? {} : {
    animation: `tk-blink ${syncBlink ? "2.4s" : (3.6 + (idx % 4) * 0.7) + "s"} infinite`,
    animationDelay: syncBlink ? "0s" : `${(idx * 1.13) % 3}s`,
    transformOrigin: "center",
  };
  return (
    <svg viewBox="0 0 120 90" preserveAspectRatio="xMidYMax slice" style={{ width: "100%", height: "100%", transform: p.flipped ? "rotate(180deg)" : "none" }}>
      <rect x="35" y="62" width="50" height="34" rx="12" fill={p.shirt} />
      <circle cx="60" cy="42" r="19" fill={p.skin} />
      <path d="M 41 40 a 19 19 0 0 1 38 0 l 0 -6 a 19 16 0 0 0 -38 0 z" fill="#2b2b2e" />
      <g style={blinkStyle}>
        <ellipse cx="53" cy="42" rx="2.4" ry="3" fill="#222" />
        <ellipse cx="67" cy="42" rx="2.4" ry="3" fill="#222" />
      </g>
      {p.glasses && (
        <g stroke="#222" strokeWidth="1.4" fill="none">
          <circle cx="53" cy="42" r="5.6" />
          <circle cx="67" cy="42" r="5.6" />
          <line x1="58.6" y1="42" x2="61.4" y2="42" />
        </g>
      )}
      <ellipse cx="60" cy="52" rx="4" ry={talking ? 3 : 1.2} fill="#8a5a4a"
        style={talking ? { animation: "tk-talk 0.32s infinite alternate", transformOrigin: "60px 52px" } : {}} />
    </svg>
  );
}

function TileBackground({ p, progress }) {
  if (p.bgType === "door") {
    // approach: 人影が二乗カーブで手前に近づく(序盤はほぼ気づけない)
    const ap = p.approach ? progress * progress : 0;
    const shadowTransform = p.approach
      ? `translateX(${-34 * ap}%) scale(${1 + 2.6 * ap})`
      : "none";
    return (
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${p.bgA}, ${p.bgB})` }}>
        <div style={{ position: "absolute", right: "12%", top: "10%", width: "22%", height: "78%", background: "#1c1a16", borderRadius: 2, border: "1px solid #4a4438" }} />
        {p.shadow && (
          <div style={{
            position: "absolute", right: "15%", top: "26%", width: "16%", height: "62%",
            transform: shadowTransform, transformOrigin: "50% 100%",
            transition: "transform 1.1s linear",
          }}>
            <div style={{ width: "46%", aspectRatio: "1", borderRadius: "50%", background: "rgba(5,5,8,0.9)", margin: "0 auto" }} />
            <div style={{ width: "100%", height: "70%", background: "rgba(5,5,8,0.9)", borderRadius: "40% 40% 0 0", marginTop: -2 }} />
          </div>
        )}
      </div>
    );
  }
  return <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${p.bgA}, ${p.bgB})` }} />;
}

function MicIcon({ muted }) {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" style={{ flexShrink: 0 }}>
      <rect x="6" y="2" width="4" height="7" rx="2" fill={muted ? "#d65a5a" : "#9adb9a"} />
      <path d="M 4 8 a 4 4 0 0 0 8 0 M 8 12 l 0 2" stroke={muted ? "#d65a5a" : "#9adb9a"} strokeWidth="1.2" fill="none" />
      {muted && <line x1="3" y1="2" x2="13" y2="13" stroke="#d65a5a" strokeWidth="1.6" />}
    </svg>
  );
}

function SpeakerIcon({ on }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M 3 6 L 6 6 L 9 3 L 9 13 L 6 10 L 3 10 Z" fill="currentColor" />
      {on ? (
        <path d="M 11 5 a 4 4 0 0 1 0 6 M 12.5 3.5 a 6.5 6.5 0 0 1 0 9" stroke="currentColor" strokeWidth="1.2" fill="none" />
      ) : (
        <path d="M 11 5.5 L 14 10.5 M 14 5.5 L 11 10.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      )}
    </svg>
  );
}

function TrophyIcon({ size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M6 3h12v3a6 6 0 0 1-12 0V3z" fill="#ffd35a" stroke="#caa12e" strokeWidth="0.8" />
      <path d="M6 4H3v2a3 3 0 0 0 3 3M18 4h3v2a3 3 0 0 1-3 3" fill="none" stroke="#caa12e" strokeWidth="1.4" />
      <path d="M9 11h6l-.5 4h-5L9 11z" fill="#ffd35a" />
      <rect x="9.5" y="15" width="5" height="2" rx="0.6" fill="#caa12e" />
      <rect x="7.5" y="17" width="9" height="2.4" rx="1" fill="#e0b94a" />
    </svg>
  );
}

function StarIcon({ size = 16, filled }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.4l-5.8 3.0 1.1-6.47-4.7-4.58 6.5-.95z"
        fill={filled ? "#ffd35a" : "none"} stroke={filled ? "#caa12e" : "#4a4f58"} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function Tile({ p, talking, syncBlink, idx, selfName, progress, silenced }) {
  const name = p.isSelf ? selfName : p.name;
  // じわじわ系: 序盤は気づけないよう二乗カーブで進行させる
  const growScale = p.grow ? 1 + 1.6 * progress * progress : 1;
  const redOpacity = p.redden ? 0.65 * Math.pow(progress, 1.5) : 0;
  const frozen = !!p.frozenEyes || silenced;
  return (
    <div style={{
      position: "relative", borderRadius: 8, overflow: "hidden",
      width: "100%", height: "100%", minHeight: 0, aspectRatio: "4/3",
      border: talking ? "2px solid #5ad65a" : "2px solid #2c2f35", background: "#222",
    }}>
      <TileBackground p={p} progress={progress} />
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${growScale})`,
        transformOrigin: "50% 40%",
        transition: "transform 1.1s linear",
      }}>
        <Avatar p={p} talking={talking} syncBlink={syncBlink} idx={idx} frozen={frozen} />
      </div>
      {p.redden && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "#7a0008", opacity: redOpacity, mixBlendMode: "multiply",
          transition: "opacity 1.1s linear",
        }} />
      )}
      <div style={{
        position: "absolute", left: 6, bottom: 6, display: "flex", alignItems: "center", gap: 4,
        background: "rgba(0,0,0,0.62)", borderRadius: 4, padding: "2px 6px", fontSize: 11, color: "#e8e8ea",
      }}>
        <MicIcon muted={p.muted} />
        <span>{name}</span>
      </div>
    </div>
  );
}

// ---------- Main ----------
export default function TeireiKaigi() {
  const [phase, setPhase] = useState("title"); // title | meeting | transition | clear | anomalies
  const [dayIdx, setDayIdx] = useState(0);
  const [view, setView] = useState(null);
  const [anomalyId, setAnomalyId] = useState(null);
  const [usedAnomalies, setUsedAnomalies] = useState(loadUsedAnomalies);
  const [discovered, setDiscovered] = useState(loadDiscovered);
  const [timeLeft, setTimeLeft] = useState(MEETING_SECONDS);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [transition, setTransition] = useState(null);
  const [soundOn, setSoundOn] = useState(loadSoundEnabled);
  const timerRef = useRef(null);
  const stateRef = useRef({});
  stateRef.current = { anomalyId, dayIdx, usedAnomalies };

  const totalAnomalies = ANOMALIES.length;
  // discovered は loadAnomalyIdList で検証・重複排除済みなので件数はそのまま長さでよい。
  const discoveredSet = new Set(discovered); // 図鑑リストの一覧表示で使う
  const discoveredCount = discovered.length;
  const allDiscovered = discoveredCount >= totalAnomalies;

  const startMeeting = useCallback((day) => {
    let nextAnomaly = null;
    if (Math.random() < ANOMALY_RATE) {
      // 見破り済みリストは最新の永続値から読む(失敗で月曜に戻っても引き継ぐ)
      // 出現時点では記録せず、全種類見破り済みだった場合のリセットのみ反映する
      const picked = pickAnomaly(loadUsedAnomalies());
      nextAnomaly = picked.anomalyId;
      saveUsedAnomalies(picked.recorded);
      setUsedAnomalies(picked.recorded);
    }
    setAnomalyId(nextAnomaly);
    setView(buildView(nextAnomaly));
    setDayIdx(day);
    setTimeLeft(MEETING_SECONDS);
    setCaptionIdx(0);
    setPhase("meeting");
    playStart();
  }, []);

  // タイトル/クリア画面からの参加: ユーザー操作中にAudioContextを起こす。
  const joinFromTitle = useCallback(() => {
    ensureAudio();
    startMeeting(0);
  }, [startMeeting]);

  const toggleSound = useCallback(() => {
    ensureAudio();
    const next = !isSoundEnabled();
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playClick();
  }, []);

  function fail(kind) {
    clearInterval(timerRef.current);
    playFail();
    // 見破り済みリストは永続化したまま月曜へ(見逃した異変は再挑戦できる)
    setTransition({
      kind: "fail",
      title: kind === "stayed" ? "異変のある会議に、最後まで残ってしまった" : "接続が切断されました",
      sub: "月曜日に戻ります",
    });
    setPhase("transition");
    setTimeout(() => startMeeting(0), 2400);
  }

  function succeed(byLeaving) {
    clearInterval(timerRef.current);
    const { anomalyId: aId, dayIdx: d } = stateRef.current;
    // 異変ありの会議を正しく退出できたときだけ「見破った」として記録する。
    // ローテーション用(リセットあり)と図鑑用(永続)の両方に追記する。
    if (byLeaving && aId) {
      recordAnomalyId(aId, loadUsedAnomalies, saveUsedAnomalies, setUsedAnomalies);
      recordAnomalyId(aId, loadDiscovered, saveDiscovered, setDiscovered);
    }
    if (d >= DAYS.length - 1) {
      playClear();
      setPhase("clear");
      return;
    }
    playSuccess();
    const label = byLeaving && aId ? ANOMALIES.find(a => a.id === aId)?.label : null;
    setTransition({
      kind: "advance",
      title: byLeaving ? "ミーティングを退出しました" : "会議が終了しました",
      sub: `${DAYS[d + 1]}曜日の定例へ`,
      detail: label,
    });
    setPhase("transition");
    setTimeout(() => startMeeting(d + 1), 2400);
  }

  // timer — 0になったら「最後まで残った」判定
  useEffect(() => {
    if (phase !== "meeting") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (stateRef.current.anomalyId !== null) fail("stayed");
          else succeed(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, dayIdx, anomalyId]);

  // captions
  useEffect(() => {
    if (phase !== "meeting") return;
    const iv = setInterval(() => setCaptionIdx(i => i + 1), 5000);
    return () => clearInterval(iv);
  }, [phase, dayIdx]);

  function onLeave() {
    playLeave();
    if (stateRef.current.anomalyId !== null) succeed(true);
    else fail("wrong");
  }

  const progress = (MEETING_SECONDS - timeLeft) / MEETING_SECONDS;
  const silenced = !!(view && view.silenceAt != null && progress >= view.silenceAt);
  const joinerVisible = !!(view && view.lateJoiner && progress >= 0.45);

  const LATE_JOINER = { id: "late_joiner", name: "user_039", skin: "#777", shirt: "#222", bgType: "dark", bgA: "#0a0a0c", bgB: "#000000", muted: true, cameraOff: true };

  const tiles = view
    ? [
        ...view.participants.slice(0, 3),
        SELF,
        ...view.participants.slice(3),
        ...(joinerVisible ? [LATE_JOINER] : []),
      ]
    : [];

  const currentCaption = view
    ? (silenced ? "……" : (timeLeft <= 5 ? view.closing : view.captions[captionIdx % view.captions.length]))
    : "";

  // timerup異変: 実時間は進み続けるが、表示だけが0:17で折り返して増えていく
  const displayTime = view && view.timerReverse && timeLeft < 17 ? 34 - timeLeft : timeLeft;
  const displayCount = view ? (joinerVisible ? view.count + 1 : view.count) : 0;

  // 字幕に合わせた効果音: 字幕が変わるたびにファミコン風テキスト送り音。
  // 「……」の沈黙時は送り音の代わりに低い不穏な単音を鳴らす。
  const prevCaptionRef = useRef("");
  useEffect(() => {
    if (phase !== "meeting") { prevCaptionRef.current = ""; return; }
    if (currentCaption === prevCaptionRef.current) return;
    prevCaptionRef.current = currentCaption;
    if (silenced) playSilence();
    else if (currentCaption) playCaption(currentCaption);
  }, [phase, currentCaption, silenced]);

  // 終了間際のカウントダウン音(残り3秒)。
  useEffect(() => {
    if (phase !== "meeting") return;
    if (timeLeft > 0 && timeLeft <= 3) playTick();
  }, [phase, timeLeft]);

  return (
    <div className="tk-root" style={{
      background: "#141619", color: "#e6e6e8",
      fontFamily: "'Hiragino Sans','Noto Sans JP',system-ui,sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        /* dvh で実際の表示領域に合わせ、画面外スクロールを防ぐ(モバイルのアドレスバー対策) */
        .tk-root { height: 100vh; height: 100dvh; overflow: hidden; }
        @keyframes tk-blink { 0%, 92% { transform: scaleY(1); } 94%, 97% { transform: scaleY(0.08); } 100% { transform: scaleY(1); } }
        @keyframes tk-talk { from { transform: scaleY(0.45); } to { transform: scaleY(1.3); } }
        @keyframes tk-fadein { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tk-recblink { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
        @keyframes tk-trophyglow { 0%,100% { box-shadow: 0 0 12px rgba(255,211,90,0.18); } 50% { box-shadow: 0 0 22px rgba(255,211,90,0.4); } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01s !important; } }
        .tk-btn { border: none; border-radius: 8px; padding: 10px 16px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .tk-btn:focus-visible { outline: 2px solid #7ab8ff; outline-offset: 2px; }
      `}</style>

      {phase === "title" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", animation: "tk-fadein 0.6s" }}>
          <div style={{ fontSize: 13, letterSpacing: "0.4em", color: "#8a8f99", marginBottom: 12 }}>DAILY MEETING</div>
          <h1 style={{ fontSize: 44, fontWeight: 800, margin: "0 0 16px", letterSpacing: "0.12em" }}>定例会議</h1>
          {allDiscovered && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
              background: "linear-gradient(180deg,#2a2410,#1c1a12)", border: "1px solid #6b561e",
              borderRadius: 999, padding: "6px 16px", color: "#ffd35a", fontWeight: 700, fontSize: 13,
              boxShadow: "0 0 18px rgba(255,211,90,0.25)", animation: "tk-trophyglow 2.4s ease-in-out infinite",
            }}>
              <TrophyIcon size={20} /> 全異変 制覇
            </div>
          )}
          <div style={{ maxWidth: 420, fontSize: 14, lineHeight: 2, color: "#b8bcc4", textAlign: "left" }}>
            <p style={{ margin: "0 0 8px" }}>毎日の定例会議。だが、何かがおかしい日がある。</p>
            <p style={{ margin: "0 0 8px" }}>異変を感じたら、すぐに <b style={{ color: "#ff8a8a" }}>退出</b>。<br />異変がなければ、<b style={{ color: "#fff" }}>最後まで残る</b>。</p>
            <p style={{ margin: 0 }}>月曜から金曜まで判断を間違えなければクリア。<br />異変のある会議に残り続けてはいけない。</p>
          </div>
          <button className="tk-btn" onClick={joinFromTitle}
            style={{ marginTop: 36, background: "#3a6df0", color: "#fff", padding: "14px 48px", fontSize: 15 }}>
            会議に参加
          </button>
          <button className="tk-btn" onClick={() => { playClick(); setPhase("anomalies"); }}
            style={{ marginTop: 16, background: "#23262c", color: "#e6e6e8", display: "flex", alignItems: "center", gap: 7, padding: "10px 24px" }}>
            <StarIcon size={15} filled={allDiscovered} /> 異変図鑑
            <span style={{ color: "#8a8f99", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{discoveredCount} / {totalAnomalies}</span>
          </button>
          <button className="tk-btn" onClick={toggleSound} aria-pressed={soundOn}
            aria-label={soundOn ? "サウンドをオフにする" : "サウンドをオンにする"}
            style={{ marginTop: 12, background: "transparent", color: "#8a8f99", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
            <SpeakerIcon on={soundOn} /> サウンド {soundOn ? "ON" : "OFF"}
          </button>
          <a href="https://x.com/taross__f" target="_blank" rel="noopener noreferrer"
            style={{ marginTop: 40, fontSize: 12, color: "#5f6570", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
            </svg>
            @taross__f
          </a>
        </div>
      )}

      {phase === "meeting" && view && (
        <>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #23262c", fontSize: 12, color: "#aab0ba" }}>
            <span style={{ fontWeight: 700, color: "#e6e6e8" }}>{view.title}（{DAYS[dayIdx]}）</span>
            <span>{view.clock}</span>
            {view.recording && (
              <span style={{ color: "#ff6b6b", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5252", animation: "tk-recblink 1.2s infinite" }} />
                レコーディング中
              </span>
            )}
            <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", color: timeLeft <= 10 && !view.timerReverse ? "#ff8a8a" : "#aab0ba" }}>
              会議終了まで 0:{String(displayTime).padStart(2, "0")}
            </span>
            <button className="tk-btn" onClick={toggleSound} aria-pressed={soundOn}
              aria-label={soundOn ? "サウンドをオフにする" : "サウンドをオンにする"}
              style={{ background: "transparent", color: "#8a8f99", padding: "4px 6px", display: "flex", alignItems: "center" }}>
              <SpeakerIcon on={soundOn} />
            </button>
          </div>

          {/* grid */}
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: 12, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gridAutoRows: "1fr" }}>
            {tiles.map((p, i) => (
              <Tile key={p.id} p={p} idx={i}
                talking={silenced ? false : (p.host === true || (view.selfTalk && p.isSelf && progress > 0.4))}
                syncBlink={view.syncBlink} selfName={view.selfName}
                progress={progress} silenced={silenced} />
            ))}
          </div>

          {/* caption */}
          <div style={{ textAlign: "center", padding: "4px 16px 10px", fontSize: 13, color: "#c9cdd6", minHeight: 24 }}>
            <span style={{ background: "rgba(0,0,0,0.5)", borderRadius: 4, padding: "3px 10px" }}>
              {view.speaker}：「{currentCaption}」
            </span>
          </div>

          {/* toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px 16px", borderTop: "1px solid #23262c", flexWrap: "wrap" }}>
            <button className="tk-btn" style={{ background: "#23262c", color: "#8a8f99" }} disabled>ミュート</button>
            <button className="tk-btn" style={{ background: "#23262c", color: "#8a8f99" }} disabled>ビデオ</button>
            <button className="tk-btn" style={{ background: "#23262c", color: "#8a8f99" }} disabled>参加者 {displayCount}</button>
            <div style={{ flex: 1 }} />
            <button className="tk-btn" onClick={onLeave} style={{ background: "#d64545", color: "#fff", padding: "10px 28px" }}>
              {view.leaveLabel}
            </button>
          </div>
        </>
      )}

      {phase === "transition" && transition && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", animation: "tk-fadein 0.4s", background: transition.kind === "fail" ? "#0c0d0f" : "#141619" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: transition.kind === "fail" ? "#ff8a8a" : "#e6e6e8", lineHeight: 1.6 }}>{transition.title}</div>
          <div style={{ marginTop: 10, fontSize: 14, color: "#8a8f99" }}>{transition.sub}</div>
          {transition.detail && (
            <div style={{ marginTop: 18, fontSize: 12, color: "#5f6570" }}>（{transition.detail}）</div>
          )}
        </div>
      )}

      {phase === "clear" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", animation: "tk-fadein 0.8s" }}>
          <div style={{ fontSize: 13, letterSpacing: "0.3em", color: "#8a8f99", marginBottom: 14 }}>FRIDAY 10:30</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>金曜日の定例が終了しました</div>
          <div style={{ fontSize: 14, color: "#b8bcc4", lineHeight: 2 }}>今週も、何事もなく終わった。<br />良い週末を。</div>
          <button className="tk-btn" onClick={() => { playClick(); setPhase("title"); }}
            style={{ marginTop: 32, background: "#23262c", color: "#e6e6e8", padding: "12px 36px" }}>
            タイトルへ
          </button>
        </div>
      )}

      {phase === "anomalies" && (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", animation: "tk-fadein 0.4s" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid #23262c" }}>
            <button className="tk-btn" onClick={() => { playClick(); setPhase("title"); }}
              aria-label="タイトルへ戻る"
              style={{ background: "#23262c", color: "#e6e6e8", padding: "6px 12px" }}>
              ← 戻る
            </button>
            <span style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 7 }}>
              <StarIcon size={16} filled={allDiscovered} /> 異変図鑑
            </span>
            <span style={{ marginLeft: "auto", fontSize: 13, color: "#8a8f99", fontVariantNumeric: "tabular-nums" }}>
              {discoveredCount} / {totalAnomalies}
            </span>
          </div>

          {/* completion banner */}
          {allDiscovered && (
            <div style={{
              margin: "14px 16px 0", padding: "14px 16px", borderRadius: 10, textAlign: "center",
              background: "linear-gradient(180deg,#2a2410,#1c1a12)", border: "1px solid #6b561e", color: "#ffd35a",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              boxShadow: "0 0 18px rgba(255,211,90,0.2)",
            }}>
              <TrophyIcon size={40} />
              <div style={{ fontWeight: 800, fontSize: 16 }}>全異変 制覇</div>
              <div style={{ fontSize: 12, color: "#caa66a" }}>すべての異変を見破りました。お見事です。</div>
            </div>
          )}

          {/* progress bar */}
          <div style={{ margin: "14px 16px 0" }}>
            <div style={{ height: 6, borderRadius: 3, background: "#23262c", overflow: "hidden" }}>
              <div style={{
                width: `${(discoveredCount / totalAnomalies) * 100}%`, height: "100%",
                background: allDiscovered ? "linear-gradient(90deg,#caa12e,#ffd35a)" : "#3a6df0",
                transition: "width 0.4s",
              }} />
            </div>
          </div>

          {/* list */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 16, display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", alignContent: "start" }}>
            {ANOMALIES.map((a, i) => {
              const found = discoveredSet.has(a.id);
              return (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                  background: found ? "#1d2128" : "#191b1f",
                  border: found ? "1px solid #2c3b58" : "1px solid #23262c",
                }}>
                  <span style={{
                    flexShrink: 0, width: 26, textAlign: "right", fontSize: 12,
                    color: "#5f6570", fontVariantNumeric: "tabular-nums",
                  }}>{String(i + 1).padStart(2, "0")}</span>
                  <StarIcon size={16} filled={found} />
                  <span style={{
                    fontSize: 13, lineHeight: 1.5,
                    color: found ? "#e6e6e8" : "#5f6570",
                    fontStyle: found ? "normal" : "italic",
                  }}>
                    {found ? a.label : "？？？（未発見）"}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", padding: "8px 16px 14px", fontSize: 11, color: "#5f6570" }}>
            異変を正しく見破る（退出する）と図鑑に記録されます。
          </div>
        </div>
      )}
    </div>
  );
}
