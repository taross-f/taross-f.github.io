---
tag: jekyll
title: Jekyll NowにSNSボタン追加した
---

シェアボタンないの不便な気がしたので追加した。

~~twitter とはてブだけ。facebook はアプリ登録しないとだめそうでめんどかったのでいったんやめた~~ facecbook もめんどくないことに気づいた。ので追加(7/28)

## コード

twitter とはてブからそれぞれシェアボタンのパーツとってきて貼る

include/share_bar.html

```html
<div id="share-bar">
  <a
    href="https://twitter.com/share?ref_src=twsrc%5Etfw"
    class="twitter-share-button"
    data-show-count="false"
    >Tweet</a
  ><script
    async
    src="https://platform.twitter.com/widgets.js"
    charset="utf-8"
  ></script>
  <a
    href="http://b.hatena.ne.jp/entry/"
    class="hatena-bookmark-button"
    data-hatena-bookmark-layout="basic-label-counter"
    data-hatena-bookmark-lang="ja"
    title="このエントリーをはてなブックマークに追加"
    ><img
      src="https://b.st-hatena.com/images/entry-button/button-only@2x.png"
      alt="このエントリーをはてなブックマークに追加"
      width="20"
      height="20"
      style="border: none;"/></a
  ><script
    type="text/javascript"
    src="https://b.st-hatena.com/js/bookmark_button.js"
    charset="utf-8"
    async="async"
  ></script>
  <div
    class="fb-share-button"
    data-href="{{page.URL}}"
    data-layout="button_count"
  ></div>
</div>
```

で Post のレイアウトに入れる

layouts/post.html
{% raw %}

```html
<div class="entry">
  {{ content }} {% include share_bar.html %}
</div>
```

{% endraw %}

でなんか詰まりすぎてたので CSS 調整

style.scss

```css
#share-bar {
  margin-top: 30px;
}
```

ちなみにはじめに twitter のボタンを`intent/tweet`でやろうとしたけど、URL エンコードが jekyll 側でうまくできなくて、正しく URL が認識されなかった(埋めてるリンク自体はちゃんとエンコードされてたから、もしかしたら twitter 側の問題かも?)

jekyll でタグをエスケープするときは {％ raw ％} {％ endraw ％}
