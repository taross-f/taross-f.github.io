// 会議の参加者。ゲーム本体(TeireiKaigi.jsx)と OGP 画像の生成(scripts/gen-ogp.mjs)で共有する。
// 見た目: hair(髪型)/outfit(服)/room(部屋の背景)は src/scene.jsx で描き分ける。
export const BASE_PARTICIPANTS = [
  { id: "tanaka", name: "田中", skin: "#e8b794", shirt: "#2f4568", hair: "sidepart", hairColor: "#262220", outfit: "suit", room: "study", browWidth: 1.4, muted: false, host: true },
  { id: "sato", name: "佐藤", skin: "#e3a982", shirt: "#5e4a7a", hair: "fringe", hairColor: "#2a2224", outfit: "sweater", room: "living", muted: true, glasses: true },
  { id: "suzuki", name: "鈴木", skin: "#f0c4a0", shirt: "#4a7a5c", hair: "bob", hairColor: "#3a2a26", outfit: "blouse", room: "window", lips: "#b8655e", browWidth: 1, muted: true },
  { id: "takahashi", name: "高橋", skin: "#dba47e", shirt: "#8c6b3a", hair: "buzz", hairColor: "#34302c", outfit: "hoodie", room: "door", browWidth: 1.4, muted: true },
  { id: "watanabe", name: "渡辺", skin: "#ecb28e", shirt: "#7a4a4a", hair: "long", hairColor: "#2e2420", outfit: "cardigan", room: "shelf", lips: "#a85a55", browWidth: 1, muted: true, glasses: true },
];

export const SELF = { id: "self", name: "あなた", skin: "#ecbf9b", shirt: "#3c424b", hair: "messy", hairColor: "#24211f", outfit: "tee", room: "dark", muted: true, isSelf: true };
