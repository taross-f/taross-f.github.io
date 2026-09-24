// OGP画像・アプリアイコン生成スクリプト
//
// 使い方:
//   npm i
//   # 日本語フォント(Noto Sans JP の静的ウェイト版 TTF)を ./scripts/fonts/ に置く。
//   # 可変フォント(VF)だと resvg が font-weight を反映せず全部細字になるので、静的版を使うこと。
//   #   例: npm pack @expo-google-fonts/noto-sans-jp && tar xzf expo-google-fonts-noto-sans-jp-*.tgz
//   #       mkdir -p scripts/fonts && cp package/{400Regular,700Bold,800ExtraBold}/*.ttf scripts/fonts/
//   npm run gen:ogp
//
// 出力: public/ogp.png (1200x630), public/icon-512.png, public/apple-touch-icon.png
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');
const fontDir = join(here, 'fonts');
const fontFiles = readdirSync(fontDir).filter((f) => f.endsWith('.ttf')).map((f) => join(fontDir, f));
if (fontFiles.length === 0) throw new Error(`no .ttf in ${fontDir}`);
mkdirSync(pub, { recursive: true });

const fontOpt = { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Noto Sans JP' };
const toPng = (svg, width) =>
  new Resvg(svg, { font: fontOpt, fitTo: { mode: 'width', value: width } }).render().asPng();

// --- OGP (1200x630) ---------------------------------------------------------
// 実際の会議画面(src/TeireiKaigi.jsx)をそのまま縮小した左パネル + タイトルの右パネル。
// タイムライン上の縮小表示(横500px前後)でも読めるよう、文字は大きく・太く。
// 異変は「知らない参加者 user_039」ひとつだけ(og:image:alt と対応)。
const F = `font-family="Noto Sans JP"`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ゲームの PARTICIPANTS / SELF と同じ配色・並び(自分は4番目)。user_039 はゲーム同様カメラオフ。
const tiles = [
  { name: '田中',     skin: '#e8b794', shirt: '#3a5a8c', bgA: '#2e3440', bgB: '#3b4252', talking: true },
  { name: '佐藤',     skin: '#e3a982', shirt: '#6b4f8c', bgA: '#3a3f4b', bgB: '#2b2f38', muted: true, glasses: true },
  { name: '鈴木',     skin: '#f0c4a0', shirt: '#4a7a5c', bgA: '#33383f', bgB: '#23272d', muted: true },
  { name: 'あなた',   skin: '#ecbf9b', shirt: '#444b55', bgA: '#26292e', bgB: '#191b1f', muted: true },
  { name: 'user_039', bgA: '#0a0a0c', bgB: '#000000', muted: true, cameraOff: true },
  { name: '高橋',     skin: '#dba47e', shirt: '#8c6b3a', bgA: '#3d3a35', bgB: '#28251f', muted: true, door: true },
];

// 会議ウィンドウ
const win = { x: 40, y: 40, w: 700, h: 550 };
const headerH = 50, pad = 14, gap = 10, cols = 3;
const tileW = (win.w - pad * 2 - gap * (cols - 1)) / cols;
const tileH = tileW * 3 / 4; // ゲームと同じ 4:3
const gridX = win.x + pad, gridY = win.y + headerH + pad;
const toolbarH = 68;
const toolbarY = win.y + win.h - toolbarH;

// ゲームの Avatar と同じ形状(viewBox 120x90 を 4:3 タイルに等倍フィット)
function avatar(t) {
  if (t.cameraOff) {
    return `<circle cx="60" cy="45" r="13" fill="#2a2a30"/>
      <text x="60" y="50.5" text-anchor="middle" ${F} font-weight="700" font-size="14" fill="#555">?</text>`;
  }
  return `
    <rect x="35" y="62" width="50" height="34" rx="12" fill="${t.shirt}"/>
    <circle cx="60" cy="42" r="19" fill="${t.skin}"/>
    <path d="M 41 40 a 19 19 0 0 1 38 0 l 0 -6 a 19 16 0 0 0 -38 0 z" fill="#2b2b2e"/>
    <ellipse cx="53" cy="42" rx="2.4" ry="3" fill="#222"/>
    <ellipse cx="67" cy="42" rx="2.4" ry="3" fill="#222"/>
    ${t.glasses ? `<g stroke="#222" stroke-width="1.4" fill="none"><circle cx="53" cy="42" r="5.6"/><circle cx="67" cy="42" r="5.6"/><line x1="58.6" y1="42" x2="61.4" y2="42"/></g>` : ''}
    <ellipse cx="60" cy="52" rx="4" ry="${t.talking ? 3 : 1.2}" fill="#8a5a4a"/>`;
}
function micIcon(x, y, s, muted) {
  const c = muted ? '#d65a5a' : '#9adb9a';
  return `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="0 0 16 16">
    <rect x="6" y="2" width="4" height="7" rx="2" fill="${c}"/>
    <path d="M 4 8 a 4 4 0 0 0 8 0 M 8 12 l 0 2" stroke="${c}" stroke-width="1.2" fill="none"/>
    ${muted ? `<line x1="3" y1="2" x2="13" y2="13" stroke="${c}" stroke-width="1.6"/>` : ''}
  </svg>`;
}
function tileSvg(t, i) {
  const x = gridX + (i % cols) * (tileW + gap);
  const y = gridY + Math.floor(i / cols) * (tileH + gap);
  const grad = `<linearGradient id="g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.bgA}"/><stop offset="1" stop-color="${t.bgB}"/></linearGradient>
    <clipPath id="c${i}"><rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" rx="8"/></clipPath>`;
  const door = t.door
    ? `<rect x="${x + tileW * 0.66}" y="${y + tileH * 0.1}" width="${tileW * 0.22}" height="${tileH * 0.78}" rx="2" fill="#1c1a16" stroke="#4a4438"/>` : '';
  const fs = 15, labelW = 34 + t.name.length * (/^[\x00-\x7f]+$/.test(t.name) ? 8.6 : 15);
  const label = `
    <rect x="${x + 7}" y="${y + tileH - 33}" width="${labelW}" height="26" rx="5" fill="rgba(0,0,0,0.62)"/>
    ${micIcon(x + 12, y + tileH - 28, 16, t.muted)}
    <text x="${x + 31}" y="${y + tileH - 14.5}" ${F} font-weight="700" font-size="${fs}" fill="#e8e8ea">${esc(t.name)}</text>`;
  const border = t.talking ? '#5ad65a' : '#2c2f35';
  const body = `<g clip-path="url(#c${i})">
      <rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" fill="url(#g${i})"/>
      ${door}
      <svg x="${x}" y="${y}" width="${tileW}" height="${tileH}" viewBox="0 0 120 90" preserveAspectRatio="xMidYMax slice">${avatar(t)}</svg>
    </g>
    ${label}
    <rect x="${x + 1}" y="${y + 1}" width="${tileW - 2}" height="${tileH - 2}" rx="8" fill="none" stroke="${border}" stroke-width="2.5"/>`;
  return { grad, body };
}
const parts = tiles.map(tileSvg);
const gridBottom = gridY + tileH * 2 + gap;
const captionY = (gridBottom + toolbarY) / 2;
const caption = '田中：「進捗ですが、概ね予定どおりです。」';
const captionW = caption.length * 16 + 24;

const btn = (x, label, w) => `
  <rect x="${x}" y="${toolbarY + 14}" width="${w}" height="40" rx="8" fill="#23262c"/>
  <text x="${x + w / 2}" y="${toolbarY + 39.5}" text-anchor="middle" ${F} font-weight="700" font-size="15" fill="#8a8f99">${label}</text>`;

// 右パネル(タイトル)
const px = 790;
const ogpSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="vignette" cx="0.3" cy="0.5" r="0.9"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient>
    <clipPath id="win"><rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="14"/></clipPath>
    ${parts.map((p) => p.grad).join('\n')}
  </defs>
  <rect width="1200" height="630" fill="#0e1013"/>

  <!-- 会議画面 -->
  <g clip-path="url(#win)">
    <rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" fill="#141619"/>
    <text x="${win.x + 18}" y="${win.y + 32}" ${F} font-weight="700" font-size="18" fill="#e6e6e8">日次定例（木）</text>
    <text x="${win.x + 158}" y="${win.y + 32}" ${F} font-weight="400" font-size="16" fill="#aab0ba">10:05</text>
    <text x="${win.x + win.w - 18}" y="${win.y + 32}" text-anchor="end" ${F} font-weight="400" font-size="16" fill="#aab0ba">会議終了まで 0:17</text>
    <line x1="${win.x}" y1="${win.y + headerH}" x2="${win.x + win.w}" y2="${win.y + headerH}" stroke="#23262c" stroke-width="1.5"/>
    ${parts.map((p) => p.body).join('\n')}
    <rect x="${win.x + win.w / 2 - captionW / 2}" y="${captionY - 16}" width="${captionW}" height="32" rx="5" fill="rgba(0,0,0,0.5)"/>
    <text x="${win.x + win.w / 2}" y="${captionY + 6}" text-anchor="middle" ${F} font-weight="400" font-size="16" fill="#c9cdd6">${esc(caption)}</text>
    <line x1="${win.x}" y1="${toolbarY}" x2="${win.x + win.w}" y2="${toolbarY}" stroke="#23262c" stroke-width="1.5"/>
    ${btn(win.x + 16, 'ミュート', 90)}
    ${btn(win.x + 114, 'ビデオ', 78)}
    ${btn(win.x + 200, '参加者 6', 94)}
    <rect x="${win.x + win.w - 16 - 118}" y="${toolbarY + 12}" width="118" height="44" rx="8" fill="#d64545"/>
    <text x="${win.x + win.w - 16 - 59}" y="${toolbarY + 41}" text-anchor="middle" ${F} font-weight="800" font-size="18" fill="#fff">退出</text>
  </g>
  <rect x="${win.x}" y="${win.y}" width="${win.w}" height="${win.h}" rx="14" fill="none" stroke="#2a2d34" stroke-width="1.5"/>
  <rect width="1200" height="630" fill="url(#vignette)"/>

  <!-- タイトル -->
  <text x="${px}" y="200" ${F} font-weight="700" font-size="18" letter-spacing="6" fill="#8a8f99">DAILY MEETING</text>
  <text x="${px - 4}" y="292" ${F} font-weight="800" font-size="84" letter-spacing="2" fill="#ffffff">定例会議</text>
  <line x1="${px}" y1="336" x2="${px + 60}" y2="336" stroke="#d64545" stroke-width="4"/>
  <text ${F} font-weight="700" font-size="27" fill="#e6e6e8">
    <tspan x="${px}" y="394">異変を感じたら、<tspan fill="#ff8a8a">退出</tspan>。</tspan>
    <tspan x="${px}" y="440">なければ、最後まで残る。</tspan>
  </text>
  <text x="${px}" y="520" ${F} font-weight="400" font-size="18" fill="#8a8f99">8番出口ライクな</text>
  <text x="${px}" y="548" ${F} font-weight="400" font-size="18" fill="#8a8f99">ビデオ会議異変探しゲーム</text>
</svg>`;
writeFileSync(join(pub, 'ogp.png'), toPng(ogpSvg, 1200));

// --- アプリアイコン ---------------------------------------------------------
const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a1d22"/><stop offset="1" stop-color="#0a0b0e"/></linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
    <linearGradient id="t1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e3440"/><stop offset="1" stop-color="#23272d"/></linearGradient>
    <linearGradient id="t2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0a0c"/><stop offset="1" stop-color="#000"/></linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect x="104" y="104" width="140" height="116" rx="16" fill="url(#t1)" stroke="#2c2f35" stroke-width="3"/>
  <circle cx="174" cy="150" r="22" fill="#e8b794"/><rect x="150" y="172" width="48" height="34" rx="12" fill="#3a5a8c"/>
  <rect x="268" y="104" width="140" height="116" rx="16" fill="url(#t1)" stroke="#2c2f35" stroke-width="3"/>
  <circle cx="338" cy="150" r="22" fill="#e3a982"/><rect x="314" y="172" width="48" height="34" rx="12" fill="#6b4f8c"/>
  <rect x="104" y="244" width="140" height="116" rx="16" fill="url(#t2)" stroke="#3a0d10" stroke-width="3"/>
  <text x="174" y="318" text-anchor="middle" font-family="Noto Sans JP" font-weight="700" font-size="64" fill="#3a3a3a">?</text>
  <rect x="268" y="244" width="140" height="116" rx="16" fill="url(#t1)" stroke="#5ad65a" stroke-width="3"/>
  <circle cx="338" cy="290" r="22" fill="#ecbf9b"/><rect x="314" y="312" width="48" height="34" rx="12" fill="#444b55"/>
  <rect width="512" height="512" rx="112" fill="url(#vig)"/>
  <rect x="160" y="392" width="192" height="60" rx="14" fill="#d64545"/>
  <text x="256" y="433" text-anchor="middle" font-family="Noto Sans JP" font-weight="800" font-size="30" fill="#fff" letter-spacing="4">退出</text>
</svg>`;
writeFileSync(join(pub, 'icon-512.png'), toPng(iconSvg, 512));
writeFileSync(join(pub, 'apple-touch-icon.png'), toPng(iconSvg, 180));

console.log('Generated: ogp.png, icon-512.png, apple-touch-icon.png');
