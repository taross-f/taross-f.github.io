---
excerpt_separator: <!--more-->
tags: hipchat chrome
title: Hipchatにボタンを追加するGoogleChrome拡張
---

## TL;DR

hipchat に Re:ボタンと quote ボタンを追加する chrome 拡張を作ったよ

<!--more-->

## 背景

業務で他のチャットツールと使っていたが、もろもろの事情により hipchat に移行したところメンバーから hipchat がつかいづらいという声があがった

→ のでつくった

hipchat にない返信ボタンをつくったり、quote コマンドを 1 ボタンでいけたら多少は楽になるんじゃないかという考え

## モノ

[https://github.com/taross-f/HipchatButtons](https://github.com/taross-f/HipchatButtons)

## ソース

- ボタンがなかったら追加する、ってのを 5 秒毎にやってるだけ(room 変わったり発言あったりするので)
- ボタンクリックで発言内容をとって input につっこむだけ
- hipchat はフロントが react で素直に突っ込むとうまく動かないところを適当に遅延させてなんとかやり過ごしている

```js
$(function() {
  console.log("hipchat buttons loading...");

  setInterval(function() {
    var buttons = $(".msg-line > .hc-dropdown");

    buttons.each(function(_, element) {
      var b = $(element);
      if (b.children(".btn-addon").length) return; // if already button exists, do nothing

      // add quote button
      var quoteButton = $(
        "<button style='height:18px;' class='btn btn-success btn-addon btn-xs'>Qt:</button>"
      );
      quoteButton.bind("click", function() {
        setTimeout(function() {
          // delay to avoid React clears message-input
          $("#hc-message-input").val("/quote " + b.next(".msg-line").text());
        }, 100);
      });
      b.append(quoteButton);

      // add Re: button
      var reButton = $(
        "<button style='height:18px;' class='btn btn-addon btn-primary btn-xs'>Re:</button>"
      );
      reButton.bind("click", function() {
        setTimeout(function() {
          var name = b
            .parents(".hc-chat-msg")
            .children(".sender-name")
            .text();
          if (!name.startsWith("@"))
            name = b
              .parents(".hc-chat-msg")
              .children(".sender-name")
              .attr("aria-label");
          $("#hc-message-input").val(
            "Re: " +
              b
                .parents(".hc-chat-msg")
                .children(".sender-name")
                .text() +
              " "
          );
        }, 100);
      });
      b.append(reButton);
    }, this);
  }, 5000);
});
```

## 既知の問題

- ボタンをあとから入れるので、一旦表示されたあとスクロールが微妙にずれる。(改行が変わってしまうところがあるため。scroll のさせかたがわからない…) 一番気持ち悪い
- `s/foo/bar` 対応はしてない
- quote はそのあとに半角スペースなど何かしら入れないと投稿できない

## おまけ

結局 hipchat からもとのチャットツールに戻りました。拡張だけでそれぞれの要望を満たすのはムズカシイねー
