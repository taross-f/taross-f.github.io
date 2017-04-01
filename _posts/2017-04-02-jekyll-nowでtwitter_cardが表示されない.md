ブログ書いてtwitter投稿してもカードが表示されなくて対応した。


## _includes/meta.html

```html

+    <meta name="twitter:card" content="summary" />


```
これだけー。

https://github.com/barryclark/jekyll-now/pull/846/commits/b5624db856a3cac2b4fac59c12eb6994783188d6

他のtwitter cardのmetaが入ってるのにcardの指定がなかったからみたい。一応PR投げてみた