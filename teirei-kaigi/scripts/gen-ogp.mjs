// OGP画像・アプリアイコン生成スクリプト
//
// 使い方:
//   npm i -D @resvg/resvg-js
//   # 日本語フォント(Noto Sans JP)を ./scripts/NotoSansJP.ttf に置く
//   #   例: curl -sL -o scripts/NotoSansJP.ttf \
//   #     https://github.com/googlefonts/noto-cjk/raw/main/Sans/Variable/TTF/Subset/NotoSansJP-VF.ttf
//   node scripts/gen-ogp.mjs
//
// 出力: public/ogp.png (1200x630), public/icon-512.png, public/apple-touch-icon.png
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');
const FONT = join(here, 'NotoSansJP.ttf');
mkdirSync(pub, { recursive: true });

const fontOpt = { fontFiles: [FONT], loadSystemFonts: false, defaultFontFamily: 'Noto Sans JP' };
const toPng = (svg, width) =>
  new Resvg(svg, { font: fontOpt, fitTo: { mode: 'width', value: width } }).render().asPng();

// --- OGP (1200x630) ---------------------------------------------------------
// ゲームの配色を踏襲した参加者タイル
const tiles = [
  { name: '田中',     skin: '#e8b794', shirt: '#3a5a8c', bgA: '#2e3440', bgB: '#3b4252' },
  { name: '佐藤',     skin: '#e3a982', shirt: '#6b4f8c', bgA: '#3a3f4b', bgB: '#2b2f38', glasses: true, muted: true },
  { name: '鈴木',     skin: '#f0c4a0', shirt: '#4a7a5c', bgA: '#33383f', bgB: '#23272d', muted: true, redTint: true },
  { name: '高橋',     skin: '#dba47e', shirt: '#8c6b3a', bgA: '#3d3a35', bgB: '#28251f', muted: true },
  { name: 'user_039', skin: '#777',    shirt: '#222',    bgA: '#0a0a0c', bgB: '#000000', muted: true, anomaly: true },
  { name: 'あなた',   skin: '#ecbf9b', shirt: '#444b55', bgA: '#26292e', bgB: '#191b1f', muted: true, self: true },
];
const cols = 3, gap = 18, gridX = 84, gridY = 168;
const tileW = (1144 - 84 - gap * (cols - 1)) / cols, tileH = 150;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function avatar(cx, cy, t) {
  const r = 26;
  return `
    <rect x="${cx - 34}" y="${cy + 12}" width="68" height="44" rx="16" fill="${t.shirt}"/>
    <circle cx="${cx}" cy="${cy - 12}" r="${r}" fill="${t.skin}"/>
    <path d="M ${cx - 26} ${cy - 14} a 26 26 0 0 1 52 0 l 0 -8 a 26 22 0 0 0 -52 0 z" fill="#2b2b2e"/>
    <ellipse cx="${cx - 9}" cy="${cy - 12}" rx="3.2" ry="4" fill="#222"/>
    <ellipse cx="${cx + 9}" cy="${cy - 12}" rx="3.2" ry="4" fill="#222"/>
    ${t.glasses ? `<g stroke="#222" stroke-width="1.8" fill="none"><circle cx="${cx - 9}" cy="${cy - 12}" r="7"/><circle cx="${cx + 9}" cy="${cy - 12}" r="7"/><line x1="${cx - 2}" y1="${cy - 12}" x2="${cx + 2}" y2="${cy - 12}"/></g>` : ''}
    <ellipse cx="${cx}" cy="${cy + 1}" rx="5" ry="1.8" fill="#8a5a4a"/>`;
}
function tileSvg(t, i) {
  const x = gridX + (i % cols) * (tileW + gap);
  const y = gridY + Math.floor(i / cols) * (tileH + gap);
  const cx = x + tileW / 2, cy = y + tileH / 2 - 6;
  const border = t.self ? '#5ad65a' : (t.anomaly ? '#3a0d10' : '#2c2f35');
  const bg = t.anomaly
    ? `<rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" rx="10" fill="url(#tileDark)"/>`
    : `<rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" rx="10" fill="url(#g${i})"/>`;
  const redTint = t.redTint
    ? `<rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" rx="10" fill="#7a0008" opacity="0.18"/>` : '';
  const grad = `<linearGradient id="g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.bgA}"/><stop offset="1" stop-color="${t.bgB}"/></linearGradient>`;
  const av = t.anomaly
    ? `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Noto Sans JP" font-weight="700" font-size="40" fill="#3a3a3a">?</text>`
    : avatar(cx, cy, t);
  const mic = t.muted ? '#d65a5a' : '#9adb9a';
  const label = `
    <rect x="${x + 8}" y="${y + tileH - 30}" width="${20 + t.name.length * 11}" height="22" rx="5" fill="rgba(0,0,0,0.62)"/>
    <path d="M ${x + 16} ${y + tileH - 25} a 3 3 0 0 1 6 0 l 0 4 a 3 3 0 0 1 -6 0 z" fill="${mic}"/>
    ${t.muted ? `<line x1="${x + 14}" y1="${y + tileH - 26}" x2="${x + 24}" y2="${y + tileH - 14}" stroke="#d65a5a" stroke-width="1.6"/>` : ''}
    <text x="${x + 30}" y="${y + tileH - 13}" font-family="Noto Sans JP" font-weight="700" font-size="14" fill="#e8e8ea">${esc(t.name)}</text>`;
  return { grad, body: `<g>${bg}${redTint}${av}${label}<rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" rx="10" fill="none" stroke="${border}" stroke-width="2"/></g>` };
}
const parts = tiles.map(tileSvg);
const ogpSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="#1a1d22"/><stop offset="1" stop-color="#0c0e11"/></linearGradient>
    <linearGradient id="tileDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0a0c"/><stop offset="1" stop-color="#000000"/></linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.4" r="0.8"><stop offset="0.5" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.6"/></radialGradient>
    ${parts.map((p) => p.grad).join('\n')}
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="56" y="86" width="1088" height="430" rx="18" fill="#141619" stroke="#23262c" stroke-width="1.5"/>
  <text x="84" y="126" font-family="Noto Sans JP" font-weight="700" font-size="22" fill="#e6e6e8">日次定例（木）</text>
  <circle cx="304" cy="119" r="6" fill="#ff5252"/>
  <text x="318" y="126" font-family="Noto Sans JP" font-weight="700" font-size="17" fill="#ff6b6b">REC</text>
  <text x="1116" y="126" text-anchor="end" font-family="Noto Sans JP" font-weight="700" font-size="22" fill="#aab0ba">10:66</text>
  <line x1="56" y1="146" x2="1144" y2="146" stroke="#23262c" stroke-width="1.5"/>
  ${parts.map((p) => p.body).join('\n')}
  <rect width="1200" height="630" fill="url(#vignette)"/>
  <rect x="0" y="516" width="1200" height="114" fill="#0c0e11"/>
  <text x="84" y="566" font-family="Noto Sans JP" font-weight="400" font-size="17" letter-spacing="7" fill="#7f5a8c">DAILY MEETING</text>
  <text x="84" y="606" font-family="Noto Sans JP" font-weight="800" font-size="46" letter-spacing="10" fill="#ffffff">定例会議</text>
  <text x="1116" y="600" text-anchor="end" font-family="Noto Sans JP" font-weight="700" font-size="26" fill="#ff8a8a">異変を感じたら、退出せよ。</text>
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
