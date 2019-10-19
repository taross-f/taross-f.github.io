---
tags: VSCode
title: VisualStudio(Code)の置換のときにマッチしてる値をとる
---

VisualStudio(Code)の置換のときにマッチしてる値を使いたいってときありますよね。

# やり方

マッチしてるかたまりを`$n`でとれます。

## 例:各行ごとにダブルクォーテーションで囲んでカンマつけたい

検索文字列: `^(.+)$`
置換後文字列: `"$1",`

これで

```
hoge
fuga
hage

```

が

```csharp
"hoge",
"fuga",
"hage",

```

になります。

## 使いドコロ

ざーっと CSV とかのデータをコピペしてきて、ダブルクォーテーションで挟んでカンマつけたい、とか。

## 参考

https://msdn.microsoft.com/ja-jp/library/2k3te2cs.aspx
https://msdn.microsoft.com/ja-jp/library/ewy2t5e0.aspx
