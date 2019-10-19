---
tags: Jekyll
title: Jekyll Nowでtwitter_cardが表示されない
---

ブログ書いて twitter 投稿してもカードが表示されなくて対応した。

## \_includes/meta.html

```html
+ <meta name="twitter:card" content="summary" />
```

これだけー。

[commit](https://github.com/barryclark/jekyll-now/pull/846/commits/b5624db856a3cac2b4fac59c12eb6994783188d6)

他の twitter card の meta が入ってるのに card の指定がなかったからみたい。一応 PR 投げてみた
