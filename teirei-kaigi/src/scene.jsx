import { useId } from "react";

// ============================================================
// 会議タイルの「映像」: 参加者(Avatar)と、その人の部屋(RoomBackground)。
//
// 座標系: 高さ120・人物の中心 x=80 で共通。タイルの縦横比に合わせて viewBox の
// 横幅だけを変える(sceneViewBox)。横長のタイルでは部屋が左右に広く写り、
// 縦長のタイルでは肩が切れる(実際のカメラと同じ写り方)。
// 部屋は x=-30..190 まで描いてあるので、MIN_ASPECT..MAX_ASPECT のどの比率でも端が切れない。
// ============================================================

export const MIN_ASPECT = 0.75;
export const MAX_ASPECT = 16 / 9;

export function sceneViewBox(aspect) {
  const w = 120 * aspect;
  return `${80 - w / 2} 0 ${w} 120`;
}

const MIRROR = "matrix(-1 0 0 1 160 0)"; // x=80 を軸に左右反転(耳・眉・髪の房など左右対称のパーツ用)

// 2色を t(0..1) で補間する(じわじわ系の色の変化用)。a, b は "#rrggbb"。
function mix(a, b, t) {
  const ca = parseInt(a.slice(1), 16), cb = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(((ca >> sh) & 255) * (1 - t) + ((cb >> sh) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

// ---------- 人物 ----------
// 頭頂(髪の下)y=36・あご y=76。目は頭の高さの中央(y=56.5)に置くと人の顔の比率になる。
const FACE = "M 80 36 C 88.5 36 94.5 42 94.5 52 C 94.5 58 94.2 62.6 92.2 66.6 C 90.2 72 85.8 75.6 80 75.6 C 74.2 75.6 69.8 72 67.8 66.6 C 65.8 62.6 65.5 58 65.5 52 C 65.5 42 71.5 36 80 36 Z";
// 顔の右側の影(画面の光が左前から当たっている想定)
const FACE_SHADE = "M 88.6 39.2 C 92.6 42.6 94.5 47 94.5 52 C 94.5 58 94.2 62.6 92.2 66.6 C 90.2 72 85.8 75.6 80 75.6 C 85 72.8 88.8 67.4 90.2 60.6 C 91.4 54 91.2 45.8 88.6 39.2 Z";
const NECK = "M 73 62 L 87 62 L 87.8 88 L 72.2 88 Z";
const NECK_SHADE = "M 72.6 66 C 75.4 76 84.6 76 87.4 66 L 87.6 76.4 C 84.6 80.4 75.4 80.4 72.4 76.4 Z";
// 肩は首から肩先(x≈30/130)までなだらかに下り、そこから腕へ落ちる
const TORSO = "M 25 122 C 25 108 29 99.4 39 96.4 C 50 93.4 63 90.6 71 84.6 L 89 84.6 C 97 90.6 110 93.4 121 96.4 C 131 99.4 135 108 135 122 Z";
const TORSO_SHADE = "M 113 94.8 C 125 97 133.6 102.4 135 122 L 120.6 122 C 120.4 110 118.4 100.6 113 94.8 Z";

// 髪型。back は顔より奥(ボブ・ロングの後ろ髪)、front は額と頭頂を覆う前髪。
// hideEars: 耳が髪に隠れる髪型。strand: 肩の前に垂れる房(左側のみ定義し、右は MIRROR)。
const HAIR = {
  // 田中: 七三分けの短髪。額は第三の目(thirdeye 異変)のために空けておく。
  sidepart: {
    front: "M 64.6 57 C 62.4 41 69 32 80.5 31.8 C 92 31.6 97.8 40.5 95.4 57 C 94.8 51.5 94.2 47.8 92.8 45.2 C 90 42.6 86.6 41.2 82.6 40.8 C 77.8 40.4 73.2 41.4 69.8 43.2 C 67.4 46.4 65.8 50.8 64.6 57 Z",
    part: "M 74.5 33.4 Q 72 37 71.4 42",
  },
  // 佐藤: ふんわりした前髪あり
  fringe: {
    front: "M 63.6 58 C 60.6 40 68 29.8 80.5 29.8 C 93 29.8 100 40 96.6 58 C 95.6 52 94.6 48.4 93 46.2 Q 90.4 48.6 87.4 46.8 Q 85 45.4 82.8 46.8 Q 79.4 48.8 75.8 46.8 Q 73.2 45.6 70.8 47.2 C 68.4 50 66.6 53 63.6 58 Z",
  },
  // 鈴木: ぱっつん前髪のボブ
  bob: {
    back: "M 61 54 C 60 38 68.5 29.5 80 29.5 C 91.5 29.5 100 38 99 54 L 100.4 73.5 C 100.6 77 98 78.6 94.5 78 C 90 77.4 70 77.4 65.5 78 C 62 78.6 59.4 77 59.6 73.5 Z",
    front: "M 63 62 C 61 41 69 31.4 80 31.4 C 91 31.4 99 41 97 62 C 96.2 54.5 95.4 50.4 93.6 47.6 C 88.4 48.6 71.6 48.6 66.4 47.6 C 64.6 50.4 63.8 54.5 63 62 Z",
    hideEars: true,
  },
  // 高橋: 坊主に近い短髪
  buzz: {
    front: "M 65 53 C 63.8 40 70.5 33.4 80 33.4 C 89.5 33.4 96.2 40 95 53 C 94.5 48 93.8 45 92.5 43 C 88 40.4 72 40.4 67.5 43 C 66.2 45 65.5 48 65 53 Z",
  },
  // 渡辺: センター分けのロング
  long: {
    back: "M 60.5 56 C 59 37.5 68.5 29 80 29 C 91.5 29 101 37.5 99.5 56 L 101.5 98 C 101.5 103 98 105 93 104 L 67 104 C 62 105 58.5 103 58.5 98 Z",
    front: "M 63.4 61 C 61.4 41 69 31 80 31 C 91 31 98.6 41 96.6 61 C 95.8 53 94.2 47.6 91.6 44.4 C 88 41.6 83.4 40.2 80.6 37.4 L 79.4 37.4 C 76.6 40.2 72 41.6 68.4 44.4 C 65.8 47.6 64.2 53 63.4 61 Z",
    strand: "M 64.2 56 C 63 70 61.8 84 60.2 96 C 59.6 100.6 61 104 63.8 104.6 C 66.4 105 68 102.4 68.6 97.6 C 69.8 89.6 70.8 81.6 71 73.6 C 68.8 70 67.2 64.6 66.4 58.5 Z",
    hideEars: true,
  },
  // あなた: 寝ぐせ気味の短髪
  messy: {
    front: "M 64.8 56 C 62.5 40 69.5 31.4 80 31.4 C 90.5 31.4 97.5 40 95.2 56 C 94.5 50.5 94 47.2 92.6 44.6 Q 89.6 44.2 88 41.8 Q 85.4 44 82 42.4 Q 78 44.4 74.4 42.6 Q 71 44.6 67.6 44.6 C 66.2 47.4 65.5 50.6 64.8 56 Z",
  },
};

// 服。胴体(TORSO)を p.shirt で塗った上に重ねる差分だけを描く。
function Outfit({ p, back }) {
  // 後ろ姿(turnAway 異変)は首の後ろの襟だけ。シャツを着ている人は白い襟が見える。
  if (back) {
    const collar = p.outfit === "suit" || p.outfit === "sweater" ? "#e4e5ea" : "rgba(0,0,0,0.3)";
    return <path d="M 71 85.8 C 74 82.6 86 82.6 89 85.8" fill="none" stroke={collar} strokeWidth="1.8" />;
  }
  switch (p.outfit) {
    case "suit": // 田中(司会): ジャケット+白シャツ
      return (
        <g>
          <path d="M 71 84.6 L 80 110 L 89 84.6 Z" fill="#e7e9ec" />
          <path d="M 71 84.6 L 64 93.4 L 71.5 97 L 80 110 L 74.5 94 Z M 89 84.6 L 96 93.4 L 88.5 97 L 80 110 L 85.5 94 Z" fill="rgba(0,0,0,0.22)" />
          <path d="M 71.2 84 L 75 93.2 L 80 88.2 Z M 88.8 84 L 85 93.2 L 80 88.2 Z" fill="#f6f7f9" stroke="rgba(0,0,0,0.18)" strokeWidth="0.4" />
        </g>
      );
    case "sweater": // 佐藤: Vネックのニット+シャツ
      return (
        <g>
          <path d="M 71 84.6 L 80 100 L 89 84.6 Z" fill="#e4e5ea" />
          <path d="M 71.2 84.2 L 74.4 90.6 L 80 87.6 Z M 88.8 84.2 L 85.6 90.6 L 80 87.6 Z" fill="#f2f3f6" stroke="rgba(0,0,0,0.16)" strokeWidth="0.4" />
          <path d="M 70.6 84.6 L 80 100.6 L 89.4 84.6" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="2" strokeLinejoin="round" />
        </g>
      );
    case "blouse": // 鈴木: 丸首のブラウス+細いネックレス
      return (
        <g>
          <path d="M 71 84.6 C 71.6 96 88.4 96 89 84.6 Z" fill={p.skin} />
          <path d="M 71 84.6 C 71.6 96 88.4 96 89 84.6" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.9" />
          <path d="M 72.4 86.2 C 74.4 93 85.6 93 87.6 86.2" fill="none" stroke="#d9c58e" strokeWidth="0.5" />
        </g>
      );
    case "hoodie": // 高橋: パーカー(フードと紐)
      return (
        <g>
          <path d="M 60 91.4 C 61.6 82.4 69 79.8 72.4 83.8 L 87.6 83.8 C 91 79.8 98.4 82.4 100 91.4 C 92 96.8 68 96.8 60 91.4 Z" fill={p.shirt} />
          <path d="M 60 91.4 C 61.6 82.4 69 79.8 72.4 83.8 L 87.6 83.8 C 91 79.8 98.4 82.4 100 91.4 C 92 96.8 68 96.8 60 91.4 Z" fill="rgba(0,0,0,0.18)" />
          <path d="M 71.2 84.8 C 72.8 91.4 87.2 91.4 88.8 84.8" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.4" />
          <path d="M 75.6 92.2 L 74.8 109 M 84.4 92.2 L 85.2 109" stroke="#d8d4cc" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      );
    case "cardigan": // 渡辺: カーディガン+インナー
      return (
        <g>
          <path d="M 71 84.6 L 80 112 L 89 84.6 Z" fill="#d8cdbf" />
          <path d="M 72.2 85.8 C 75.2 89.8 84.8 89.8 87.8 85.8" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
          <path d="M 71 84.6 L 80 112 L 89 84.6" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.2" />
          <circle cx="80" cy="117.5" r="1" fill="rgba(255,255,255,0.35)" />
        </g>
      );
    default: // tee: 丸首のTシャツ
      return <path d="M 70.6 85 C 73.8 91 86.2 91 89.4 85" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.6" />;
  }
}

function Glasses() {
  return (
    <g stroke="#1c1c20" strokeWidth="1.05" fill="rgba(210,225,255,0.07)">
      <rect x="69.4" y="52.6" width="9.2" height="7.6" rx="2.6" />
      <rect x="81.4" y="52.6" width="9.2" height="7.6" rx="2.6" />
      <path d="M 78.6 55.4 Q 80 54.4 81.4 55.4 M 69.4 55.6 L 65.6 54.8 M 90.6 55.6 L 94.4 54.8" fill="none" />
    </g>
  );
}

// 正面を向いた頭: 耳・顔・眉・目・鼻・口・前髪・眼鏡。
function FrontHead({ p, hair, hairColor, eyeFill, thirdOpen, blinkStyle, talking }) {
  const lip = p.lips || "#93574a";
  return (
    <g>
      {!hair.hideEars && (
        <g>
          <ellipse cx="65.8" cy="57.4" rx="2.5" ry="4.4" fill={p.skin} />
          <ellipse cx="94.2" cy="57.4" rx="2.5" ry="4.4" fill={p.skin} />
          <path d="M 65.4 55 Q 64.4 57.4 65.6 60" fill="none" stroke="rgba(90,40,30,0.3)" strokeWidth="0.6" />
          <path d="M 65.4 55 Q 64.4 57.4 65.6 60" transform={MIRROR} fill="none" stroke="rgba(90,40,30,0.3)" strokeWidth="0.6" />
        </g>
      )}
      <path d={FACE} fill={p.skin} />
      <path d={FACE_SHADE} fill="rgba(90,40,25,0.13)" />
      {thirdOpen > 0 && (
        <g>
          <ellipse cx="80" cy="46" rx="2.6" ry={2.4 * thirdOpen} fill="#f1eae6" stroke="rgba(90,60,60,0.6)" strokeWidth="0.4" />
          <ellipse cx="80" cy="46" rx="1.2" ry={Math.max(0.1, 1.4 * thirdOpen)} fill={eyeFill} />
        </g>
      )}
      {/* 眉 */}
      <path d="M 70.6 52.2 Q 73.6 50.6 77.2 51.6" fill="none" stroke={hairColor} strokeWidth={p.browWidth || 1.2} strokeLinecap="round" />
      <path d="M 70.6 52.2 Q 73.6 50.6 77.2 51.6" transform={MIRROR} fill="none" stroke={hairColor} strokeWidth={p.browWidth || 1.2} strokeLinecap="round" />
      <g style={blinkStyle}>
        <ellipse cx="74" cy="56.6" rx="1.75" ry="2.2" fill={eyeFill} />
        <ellipse cx="86" cy="56.6" rx="1.75" ry="2.2" fill={eyeFill} />
      </g>
      {/* 鼻 */}
      <path d="M 80.8 58.6 Q 82.6 62.4 80.4 63.6" fill="none" stroke="rgba(110,55,40,0.42)" strokeWidth="0.9" strokeLinecap="round" />
      {talking ? (
        <ellipse cx="80" cy="68.2" rx="2.5" ry="1.7" fill="#5e2f2a"
          style={{ animation: "tk-talk 0.32s infinite alternate", transformBox: "fill-box", transformOrigin: "center" }} />
      ) : (
        <path d="M 76.8 68 Q 80 69.4 83.2 68" fill="none" stroke={lip} strokeWidth="1.15" strokeLinecap="round" />
      )}
      <path d={hair.front} fill={hairColor} />
      {hair.part && <path d={hair.part} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />}
      <path d="M 72 35.4 Q 80 32.6 88 35.4" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.6" strokeLinecap="round" />
      {p.glasses && <Glasses />}
    </g>
  );
}

// turnAway 異変の後ろ姿: 顔は描かず、後頭部の髪と耳だけ(眼鏡の人はつるが耳にかかる)。
function BackOfHead({ p, hairColor }) {
  return (
    <g>
      <path d="M 80 30 C 92 30 98.6 39 97.6 53 C 97 63 94 70 89 74 C 85 76.6 75 76.6 71 74 C 66 70 63 63 62.4 53 C 61.4 39 68 30 80 30 Z" fill={hairColor} />
      <path d="M 74 34 Q 80 31.6 86 34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 79 41 q 3 -2 3.6 1.4 q -1 3 -4 1.6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
      <ellipse cx="62.8" cy="57.4" rx="2.4" ry="4.4" fill={p.skin} />
      <ellipse cx="97.2" cy="57.4" rx="2.4" ry="4.4" fill={p.skin} />
      {p.glasses && <path d="M 60.4 54.6 L 65.6 55.2 M 99.6 54.6 L 94.4 55.2" stroke="#1c1c20" strokeWidth="1" />}
    </g>
  );
}

export function Avatar({ p, viewBox, talking, syncBlink, idx, frozen, still, progress = 0 }) {
  if (p.cameraOff) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#2a2a30", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 22, fontWeight: 700 }}>
          ?
        </div>
      </div>
    );
  }
  const hair = HAIR[p.hair] || HAIR.messy;
  const hairColor = p.hairColor || "#2b2b2e";
  const blinkStyle = frozen ? {} : {
    animation: `tk-blink ${syncBlink ? "2.4s" : (3.6 + (idx % 4) * 0.7) + "s"} infinite`,
    animationDelay: syncBlink ? "0s" : `${(idx * 1.13) % 3}s`,
    transformBox: "fill-box",
    transformOrigin: "center",
  };
  // 頭のわずかな揺れ(生きている感じ)。silence 異変では全員がその姿勢のまま止まる。
  // (再描画で playState だけ切り替えるため、shorthand の animation は使わず個別に指定する)
  const swayStyle = {
    animationName: "tk-sway",
    animationDuration: `${5.2 + (idx % 3) * 1.3}s`,
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationDelay: `${-idx * 1.7}s`,
    animationPlayState: still ? "paused" : "running",
    transformBox: "view-box",
    transformOrigin: "80px 84px",
  };
  // eyeColor 異変: 目の色を差し替える(既定は黒)。
  const eyeFill = p.eyeColor || "#1f1a19";
  // thirdEye 異変: 額の目が二乗カーブでゆっくり開く(じわじわ系)。
  const thirdOpen = p.thirdEye ? Math.min(1, progress * progress * 1.5) : 0;
  // neckStretch 異変: 頭が二乗カーブで持ち上がり、そのぶん首が伸びる(じわじわ系)。
  const stretch = p.neckStretch ? 20 * progress * progress : 0;
  const lift = p.neckStretch ? { transform: `translateY(${-stretch}px)`, transition: "transform 1.1s linear" } : undefined;
  // turnAway 異変: 途中から後ろを向く(時間経過で発生)。
  const turned = p.turnAwayAt != null && progress >= p.turnAwayAt;
  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" style={{ display: "block", width: "100%", height: "100%" }}>
      {/* 奥から: 後ろ髪 → 首 → 胴体と服 → 頭 → 肩の前に垂れる房。頭まわりは同じ揺れで動かす */}
      {hair.back && !turned && (
        <g style={lift}><path className="tk-sway" style={swayStyle} d={hair.back} fill={hairColor} /></g>
      )}
      <path d={NECK} fill={p.skin} />
      <path d={TORSO} fill={p.shirt} />
      <path d={TORSO_SHADE} fill="rgba(0,0,0,0.16)" />
      <Outfit p={p} back={turned} />
      <g style={lift}>
        {/* 伸びた首。頭と一緒に持ち上がり、下端は動かない首(NECK)と重なって途切れない */}
        {stretch > 0 && <rect x="73" y="62" width="14" height="22" fill={p.skin} />}
        {!turned && <path d={NECK_SHADE} fill="rgba(70,30,20,0.2)" />}
        <g className="tk-sway" style={swayStyle}>
          {turned ? <BackOfHead p={p} hairColor={hairColor} />
            : <FrontHead p={p} hair={hair} hairColor={hairColor} eyeFill={eyeFill} thirdOpen={thirdOpen} blinkStyle={blinkStyle} talking={talking} />}
        </g>
      </g>
      {hair.strand && !turned && (
        <g style={lift}>
          <g className="tk-sway" style={swayStyle} fill={hairColor}>
            <path d={hair.strand} />
            <path d={hair.strand} transform={MIRROR} />
          </g>
        </g>
      )}
    </svg>
  );
}

// ---------- 部屋 ----------
// 部屋ごとに壁の色・家具を描き分ける。人物より彩度とコントラストを落とし、
// 周辺減光(ビネット)をかけて、カメラの奥にある空間に見せる。

function Books({ shelfY, items }) {
  // items: [x, 幅, 高さ, 色, 傾き(度)]
  return items.map(([x, w, h, c, tilt = 0], i) => (
    <rect key={i} x={x} y={shelfY - h} width={w} height={h} fill={c}
      transform={tilt ? `rotate(${tilt} ${x + w} ${shelfY})` : undefined} />
  ));
}

// 田中: 書斎。左に本棚、右に額。
function StudyRoom({ uid }) {
  return (
    <g>
      <linearGradient id={`${uid}w`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3b4352" />
        <stop offset="1" stopColor="#2c323d" />
      </linearGradient>
      <rect x="-40" y="-10" width="240" height="140" fill={`url(#${uid}w)`} />
      <rect x="-34" y="4" width="88" height="126" fill="#4a3a2b" />
      <rect x="-30" y="8" width="80" height="122" fill="#2a221b" />
      {[34, 64, 94].map(y => <rect key={y} x="-30" y={y} width="80" height="3" fill="#5a4632" />)}
      <Books shelfY={34} items={[[-26, 5, 20, "#6b3a35"], [-20.5, 4, 22, "#3a4f6b"], [-16, 6, 19, "#7a6a4a"], [-9.5, 4.5, 23, "#4a5a3c"], [-4.5, 5, 20, "#8a7f6a"], [1, 4, 21, "#593845"], [5.5, 6, 18, "#36495c"], [12, 4, 22, "#6d5a3a"], [26, 14, 4, "#7b4b3a"], [26, 14, 3.4, "#46566b"], [43, 4.5, 20, "#5b3b3b", -12]]} />
      <Books shelfY={64} items={[[-24, 5, 21, "#405870"], [-18.5, 5.5, 23, "#7a4a3a"], [-12.5, 4, 19, "#6a6a5a"], [-8, 5, 22, "#3e5440"], [-2.5, 4.5, 20, "#7b6b4e"], [2.5, 5, 23, "#4b3b5a"], [8, 4, 18, "#8a5a40"], [17, 6, 20, "#55606b", 10], [30, 5, 22, "#6b4a3a"], [35.5, 4.5, 21, "#3a4a5e"], [40.5, 5, 19, "#7a704f"]]} />
      <Books shelfY={94} items={[[-26, 6, 22, "#5a4a3a"], [-19.5, 5, 24, "#3b4b5e"], [-14, 4.5, 21, "#6a3e3e"], [-9, 5.5, 23, "#4e5e48"], [6, 18, 13, "#c9c3b4"], [30, 5, 22, "#46566b"], [35.5, 5, 20, "#7c5c3c"], [41, 5, 23, "#5c3c4c"]]} />
      {/* 額装 */}
      <rect x="110" y="20" width="30" height="24" fill="#1e1d1c" />
      <rect x="112.5" y="22.5" width="25" height="19" fill="#c8c1b0" />
      <rect x="116" y="25.5" width="18" height="13" fill="#7d8a7a" />
      <path d="M 116 38.5 L 121.5 31 L 125 35 L 128.5 30 L 134 38.5 Z" fill="#596955" />
    </g>
  );
}

// 観葉植物の葉: [cx, cy, rx, ry, 傾き(度), 奥/手前, 茎あり]。茎の根元は (122, 96)。
const LEAVES = [
  [114, 62, 5, 11, -35, "back", false], [126, 56, 5, 12, 10, "back", true],
  [136, 66, 5, 11, 48, "back", true], [108, 76, 4.5, 10, -62, "back", true],
  [120, 70, 4.5, 10, -12, "front", true], [131, 76, 4.5, 10, 30, "front", false],
];
const LEAF_COLOR = { back: "#3f6448", front: "#4d7a56" };
const LEAF_WITHERED = { back: "#6f5f3a", front: "#86704a" };

// 佐藤: リビング。左にポスター、右に観葉植物とフロアランプの明かり。
// wither 異変: 葉が二乗カーブで茶色く枯れ、根元から外側へ垂れていく(じわじわ系)。
function LivingRoom({ uid, p, progress }) {
  const w = p.wither ? progress * progress : 0;
  // 葉と茎は根元を中心に同じ角度だけ外側へ垂れる
  const droop = (cx) => p.wither
    ? { transform: `rotate(${(cx < 122 ? -1 : 1) * 38 * w}deg)`, transformBox: "view-box", transformOrigin: "122px 96px", transition: "transform 1.1s linear" }
    : undefined;
  return (
    <g>
      <radialGradient id={`${uid}w`} cx="0.85" cy="0.2" r="0.9">
        <stop offset="0" stopColor="#5a4d40" />
        <stop offset="1" stopColor="#393029" />
      </radialGradient>
      <rect x="-40" y="-10" width="240" height="140" fill={`url(#${uid}w)`} />
      <rect x="10" y="14" width="34" height="42" fill="#d4ccbc" />
      <rect x="13" y="17" width="28" height="36" fill="#2f3b48" />
      <circle cx="31" cy="27" r="4.5" fill="#d9a35a" />
      <path d="M 13 53 L 21 38 L 27 46 L 33 36 L 41 53 Z" fill="#4a5b6a" />
      {/* フロアランプ */}
      <rect x="148.5" y="16" width="1.6" height="110" fill="#2a2420" />
      <path d="M 141 4 L 157 4 L 161 18 L 137 18 Z" fill="#e8d6b0" />
      <path d="M 137 18 L 161 18 L 149 30 Z" fill="rgba(255,220,160,0.10)" />
      {/* 観葉植物(茎は葉の上に描く) */}
      {LEAVES.map(([cx, cy, rx, ry, a, layer], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${a} ${cx} ${cy})`} style={droop(cx)}
          fill={p.wither ? mix(LEAF_COLOR[layer], LEAF_WITHERED[layer], w) : LEAF_COLOR[layer]} />
      ))}
      {LEAVES.filter((l) => l[6]).map(([cx, cy], i) => (
        <path key={i} d={`M 122 96 L ${cx} ${cy}`} style={droop(cx)}
          stroke={p.wither ? mix("#355a3e", "#5e5034", w) : "#355a3e"} strokeWidth="0.9" />
      ))}
      <path d="M 112 94 L 132 94 L 129.5 122 L 114.5 122 Z" fill="#7a5a44" />
    </g>
  );
}

// 鈴木: 窓辺。左にブラインド越しの昼の光、右に小さな棚。
// dusk 異変: 窓の外と部屋が二乗カーブで夜のように暗くなっていく(じわじわ系)。
function WindowRoom({ uid, p, progress }) {
  const d = p.dusk ? progress * progress : 0;
  const fade = (opacity) => ({ opacity, transition: "opacity 1.1s linear" });
  return (
    <g>
      <linearGradient id={`${uid}w`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#56595b" />
        <stop offset="1" stopColor="#3a3c3f" />
      </linearGradient>
      <rect x="-40" y="-10" width="240" height="140" fill={`url(#${uid}w)`} />
      <rect x="-24" y="6" width="76" height="76" fill="#8c9298" />
      <rect x="-21" y="9" width="70" height="70" fill="#b8c8d6" />
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x="-21" y={9 + i * 4.7} width="70" height="3.2" fill="#d9dee2" />
      ))}
      <rect x="13.4" y="9" width="0.6" height="70" fill="rgba(0,0,0,0.12)" />
      {p.dusk && <rect x="-21" y="9" width="70" height="70" fill="#111727" style={fade(0.9 * d)} />}
      <rect x="-26" y="82" width="80" height="3" fill="#9aa0a6" />
      {/* 窓からの光 */}
      <path d="M 52 9 L 92 30 L 92 120 L 52 85 Z" fill="rgba(255,255,255,0.03)" />
      {/* 棚とサボテン・マグ */}
      <rect x="110" y="66" width="44" height="2.6" fill="#7b6650" />
      <path d="M 116 66 L 128 66 L 126.5 56 L 117.5 56 Z" fill="#b5694a" />
      <rect x="119.4" y="42" width="5.2" height="15" rx="2.6" fill="#5f8a5a" />
      <rect x="115.6" y="47" width="3.6" height="7" rx="1.8" fill="#5f8a5a" />
      <rect x="134" y="58" width="7" height="8" rx="1" fill="#d6d2c8" />
      <path d="M 141 60 q 3 2 0 4" fill="none" stroke="#d6d2c8" strokeWidth="1" />
      {p.dusk && <rect x="-40" y="-10" width="240" height="140" fill="#0a0c14" style={fade(0.42 * d)} />}
    </g>
  );
}

// 高橋: 廊下へのドアが半開きの部屋。shadow / approach 異変の人影はこの廊下に立つ。
function DoorRoom({ uid, p, progress }) {
  // approach: 人影が二乗カーブで手前(画面中央寄り)に近づく(序盤はほぼ気づけない)
  const ap = p.approach ? progress * progress : 0;
  return (
    <g>
      <linearGradient id={`${uid}w`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3a342d" />
        <stop offset="0.6" stopColor="#4a423a" />
        <stop offset="1" stopColor="#3e372f" />
      </linearGradient>
      <linearGradient id={`${uid}h`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2c2823" />
        <stop offset="1" stopColor="#1d1a17" />
      </linearGradient>
      <rect x="-40" y="-10" width="240" height="140" fill={`url(#${uid}w)`} />
      {/* カレンダー */}
      <rect x="18" y="18" width="26" height="34" fill="#d8d4cc" />
      <rect x="18" y="18" width="26" height="7" fill="#9c3b34" />
      <g fill="rgba(0,0,0,0.18)">
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={20.5 + (i % 5) * 4.4} y={28.5 + Math.floor(i / 5) * 5.6} width="2.6" height="2.6" />
        ))}
      </g>
      {/* ドア枠・廊下・開いたドア */}
      <rect x="98.5" y="7" width="31" height="100" fill="#5c5348" />
      <rect x="102" y="10.5" width="24" height="96.5" fill={`url(#${uid}h)`} />
      <rect x="102" y="80" width="24" height="27" fill="rgba(0,0,0,0.25)" />
      <path d="M 102 10.5 L 109.5 14 L 109.5 103 L 102 107 Z" fill="#6c6155" />
      <circle cx="107.8" cy="60" r="0.9" fill="#b8ad98" />
      {p.shadow && (
        <g fill="rgba(6,6,8,0.92)" style={{
          transform: `translate(${-17 * ap}px, 0px) scale(${1 + 1.4 * ap})`,
          transformBox: "view-box", transformOrigin: "117px 58px",
          transition: "transform 1.1s linear",
        }}>
          <ellipse cx="117" cy="37.5" rx="3.9" ry="4.6" />
          <path d="M 115 41.5 L 119 41.5 L 119.2 45.2 C 122.2 46.2 124.2 47.8 124.6 52 L 125.4 107 L 108.6 107 L 109.4 52 C 109.8 47.8 111.8 46.2 114.8 45.2 Z" />
        </g>
      )}
    </g>
  );
}

// 渡辺: 壁付けの棚に小物と植物、左に写真立て。
function ShelfRoom({ uid }) {
  return (
    <g>
      <linearGradient id={`${uid}w`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3c4a49" />
        <stop offset="1" stopColor="#2b3534" />
      </linearGradient>
      <rect x="-40" y="-10" width="240" height="140" fill={`url(#${uid}w)`} />
      <rect x="8" y="20" width="26" height="20" fill="#e2ddd2" />
      <rect x="10.5" y="22.5" width="21" height="15" fill="#8a7a6a" />
      <circle cx="17" cy="28" r="2.4" fill="#c9a98a" />
      <circle cx="24" cy="27.5" r="2.4" fill="#b8987a" />
      <rect x="22" y="44" width="16" height="12" fill="#e2ddd2" />
      <rect x="24" y="46" width="12" height="8" fill="#6f8796" />
      {/* 棚 */}
      <rect x="104" y="44" width="60" height="2.6" fill="#6e5a48" />
      <rect x="108" y="74" width="56" height="2.6" fill="#6e5a48" />
      <Books shelfY={44} items={[[124, 4, 15, "#9a6a4a"], [128.5, 4.5, 17, "#4a6a7a"], [133.5, 4, 14, "#c8b88a"], [140, 4, 16, "#6a4a5a", -16]]} />
      <path d="M 109 44 L 119 44 L 118 36 L 110 36 Z" fill="#c9c2b4" />
      <g fill="#5b8a5c">
        <ellipse cx="111" cy="31" rx="2.4" ry="5.5" transform="rotate(-28 111 31)" />
        <ellipse cx="114" cy="29" rx="2.4" ry="6.5" />
        <ellipse cx="117.5" cy="31" rx="2.4" ry="5.5" transform="rotate(28 117.5 31)" />
      </g>
      <path d="M 152 44 C 150 38 151 33 154 31 C 157 33 158 38 156 44 Z" fill="#a8b8c0" />
      <rect x="114" y="66" width="12" height="8" rx="1" fill="#3a3430" />
      <rect x="130" y="62" width="6" height="12" fill="#c87a4a" />
      <rect x="138" y="60" width="9" height="14" fill="#e0dad0" />
      <path d="M 148 74 C 147 70 149 64 154 62 C 156 66 155 71 152 74 Z" fill="#5b8a5c" />
    </g>
  );
}

// あなた: 夜の自室。右にカーテン、左に暗いポスター。モニターの明かりだけが顔を照らす。
function DarkRoom({ uid }) {
  return (
    <g>
      <radialGradient id={`${uid}w`} cx="0.5" cy="0.55" r="0.7">
        <stop offset="0" stopColor="#2c3038" />
        <stop offset="1" stopColor="#1a1c21" />
      </radialGradient>
      <rect x="-40" y="-10" width="240" height="140" fill={`url(#${uid}w)`} />
      <rect x="8" y="16" width="30" height="42" fill="#262a31" />
      <rect x="11" y="19" width="24" height="36" fill="#30353e" />
      <path d="M 11 55 L 23 30 L 35 55 Z" fill="#3a404a" />
      <rect x="108" y="4" width="90" height="1.6" fill="#3a3d44" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={110 + i * 9.4} y="5.6" width="9.4" height="126" fill={i % 2 ? "#1d2330" : "#242b3a"} />
      ))}
    </g>
  );
}

const ROOMS = { study: StudyRoom, living: LivingRoom, window: WindowRoom, door: DoorRoom, shelf: ShelfRoom, dark: DarkRoom };

export function RoomBackground({ p, viewBox, progress }) {
  const uid = useId().replace(/:/g, "");
  if (p.cameraOff) return <div style={{ position: "absolute", inset: 0, background: "#0a0a0c" }} />;
  const Room = ROOMS[p.room] || DarkRoom;
  const [vx, , vw] = viewBox.split(" ").map(Number);
  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}>
      <radialGradient id={`${uid}v`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.5" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.4" />
      </radialGradient>
      {/* 奥にある部屋はわずかにぼかして、ピントが人物に合っているように見せる */}
      <g style={{ filter: "blur(0.35px)" }}>
        <Room uid={uid} p={p} progress={progress} />
      </g>
      {/* 周辺減光は見えている範囲(viewBox)に合わせる */}
      <rect x={vx} y="0" width={vw} height="120" fill={`url(#${uid}v)`} />
    </svg>
  );
}
