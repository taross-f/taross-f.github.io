// H5 Games Ads(AdSense Ad Placement API)のラッパ。
// index.html で adsbygoogle.js と window.adBreak/adConfig のシムを読み込み済み。
// 広告ブロッカー・vite開発時・H5 Games Ads未承認の環境では、pushしたプレースメントの
// コールバックが一切呼ばれない(または即 adBreakDone になる)。そのため呼び出し側は
// 「広告が出なければ何も起きず、通常フローがそのまま進む」設計を守ること。

import { isSoundEnabled } from "./sound";

function adBreakAvailable() {
  return typeof window !== "undefined" && typeof window.adBreak === "function";
}

// adConfig は一度だけ呼ぶ。ユーザー操作(会議参加など)のタイミングで初期化し、
// その時点のサウンド設定を広告側にも伝える。
let configured = false;
export function initAds() {
  if (configured || !adBreakAvailable()) return;
  configured = true;
  window.adConfig({
    preloadAdBreaks: "on",
    sound: isSoundEnabled() ? "on" : "off",
  });
}

// リワード広告のプレースメント。
// 広告在庫があると onAvailable(showAdFn) が呼ばれるので、呼び出し側はそこで
// 「広告を見て◯◯」ボタンを表示し、タップ時に showAdFn() を実行する。
// onViewed: 最後まで視聴(リワード付与) / onDismissed: 途中で閉じた(付与しない)。
export function requestRewardedAd({ name, onAvailable, onViewed, onDismissed, onDone }) {
  if (!adBreakAvailable()) return;
  window.adBreak({
    type: "reward",
    name,
    beforeReward: (showAdFn) => onAvailable && onAvailable(showAdFn),
    beforeAd: () => {},
    afterAd: () => {},
    adDismissed: () => onDismissed && onDismissed(),
    adViewed: () => onViewed && onViewed(),
    adBreakDone: (info) => onDone && onDone(info),
  });
}

// インタースティシャル広告のプレースメント。
// 実際に広告が表示される場合のみ onShowing が同期的に呼ばれる(通常フローの
// タイマー等をここでキャンセルする)。表示された場合、閉じたあとに onClosed が
// 呼ばれるので、そこで中断していたフローを再開する。
// 表示されない場合(頻度制限・在庫なし・ブロック)は何も呼ばれないか
// adBreakDone のみが呼ばれ、呼び出し側の通常フローがそのまま進む。
export function showInterstitial({ name, onShowing, onClosed, onDone }) {
  if (!adBreakAvailable()) return;
  let showing = false;
  window.adBreak({
    type: "next",
    name,
    beforeAd: () => {
      showing = true;
      if (onShowing) onShowing();
    },
    afterAd: () => {},
    adBreakDone: (info) => {
      if (showing && onClosed) onClosed();
      if (onDone) onDone(info, showing);
    },
  });
}
