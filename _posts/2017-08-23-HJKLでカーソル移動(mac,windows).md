---
tags: Nac Windows
title: HJKLでカーソル移動(Mac,Windows)
---

## キーボード環境について

職場 Windows 個人 Mac なのもあって、JIS キーボードでなるべく同様のカスタマイズ可能なものだけ取り入れてるんですが、hjkl でカーソル移動って便利なのでどっちも同じような感じでできないかやりたくなった。特にキーボード無刻印にしたらカーソルキーに移動するのがだるいのもあった。のでやってみた。ちなみに別に Vimmer なわけではありません

ちょろっと調べたら Mac はいろいろ手がありそうだったので、Windows 側で導入簡単である程度求めるものができるものを探して環境を揃えられそうなやつを入れることにする

## Windows

以下のツールを使うことに。

[enthumble](http://jp.enthumble.com/)

決め手は、DL>インストール>設定を選ぶだけで無変換+hjkl でカーソル移動できちゃう簡単さ。すごい  
さらにあとから気付いたけど 無変換+n で backspace, 無変換+m で delete もできてこれが地味に便利だった

今回の話とは関係ないけど 無変換/変換 で IME On/Off 切り替えるようにするのもインストールするだけで出来てしまっていい感じ。いままでは GoogleIME でポチポチ設定変えてたので楽ちんポン

問題はフリー版だと Hotkey として**無変換**しか使えない点。これは後述するけど Mac 側での対応が難しい(hammerspoon で muhenkan が hotkey に無いっぽい)ので、Windows 側の Capslock を無変換にするようにする。

[KeySwap for XP](http://www.vector.co.jp/soft/winnt/util/se228667.html)

XP!!?? ってなるけど Win10 で問題なく動きました。これでレジストリ書き換えもサクッと。

## Mac

以下を使う
[hammerspoon](http://www.hammerspoon.org/)

[Karabiner の Vi Mode カーソル移動（Ctrl+hjkl）を Sierra でも再現する](http://qiita.com/deg84/items/792bf6b2adf467df9bdc)を参考にした。 ~~というかほぼ丸パクり~~

一応 win 版の対応であった delete/backspace の動きを追加したりしている

```lua
local function keyCode(key, modifiers)
   modifiers = modifiers or {}
   return function()
      hs.eventtap.event.newKeyEvent(modifiers, string.lower(key), true):post()
      hs.timer.usleep(1000)
      hs.eventtap.event.newKeyEvent(modifiers, string.lower(key), false):post()
   end
end

local function remapKey(modifiers, key, keyCode)
   hs.hotkey.bind(modifiers, key, keyCode, nil, keyCode)
end

remapKey({'ctrl'}, 'h', keyCode('left'))
remapKey({'ctrl'}, 'j', keyCode('down'))
remapKey({'ctrl'}, 'k', keyCode('up'))
remapKey({'ctrl'}, 'l', keyCode('right'))
remapKey({'ctrl'}, 'n', keyCode('delete'))
remapKey({'ctrl'}, 'm', keyCode('delete', {'fn'}))


remapKey({'ctrl', 'shift'}, 'h', keyCode('left', {'shift'}))
remapKey({'ctrl', 'shift'}, 'j', keyCode('down', {'shift'}))
remapKey({'ctrl', 'shift'}, 'k', keyCode('up', {'shift'}))
remapKey({'ctrl', 'shift'}, 'l', keyCode('right', {'shift'}))
remapKey({'ctrl', 'shift'}, 'n', keyCode('delete', {'shift'}))
remapKey({'ctrl', 'shift'}, 'm', keyCode('delete', {'fn', 'shift'}))

remapKey({'ctrl', 'cmd'}, 'h', keyCode('left', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'j', keyCode('down', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'k', keyCode('up', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'l', keyCode('right', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'n', keyCode('delete', {'cmd'}))
remapKey({'ctrl', 'cmd'}, 'm', keyCode('delete', {'fn', 'cmd'}))

remapKey({'ctrl', 'shift', 'cmd'}, 'h', keyCode('left', {'shift', 'cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'j', keyCode('down', {'shift', 'cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'k', keyCode('up', {'shift', 'cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'l', keyCode('right', {'shift', 'cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'n', keyCode('delete', {'shift','cmd'}))
remapKey({'ctrl', 'shift', 'cmd'}, 'm', keyCode('delete', {'fn', 'shift', 'cmd'}))

remapKey({'ctrl', 'alt'}, 'h', keyCode('left', {'alt'}))
remapKey({'ctrl', 'alt'}, 'j', keyCode('down', {'alt'}))
remapKey({'ctrl', 'alt'}, 'k', keyCode('up', {'alt'}))
remapKey({'ctrl', 'alt'}, 'l', keyCode('right', {'alt'}))
remapKey({'ctrl', 'alt'}, 'n', keyCode('delete', {'alt'}))
remapKey({'ctrl', 'alt'}, 'm', keyCode('delete', {'fn', 'alt'}))

remapKey({'ctrl', 'shift', 'alt'}, 'h', keyCode('left', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'j', keyCode('down', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'k', keyCode('up', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'l', keyCode('right', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'n', keyCode('delete', {'shift', 'alt'}))
remapKey({'ctrl', 'shift', 'alt'}, 'm', keyCode('delete', {'fn', 'shift', 'alt'}))

remapKey({'ctrl', 'cmd', 'alt'}, 'h', keyCode('left', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'j', keyCode('down', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'k', keyCode('up', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'l', keyCode('right', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'n', keyCode('delete', {'cmd', 'alt'}))
remapKey({'ctrl', 'cmd', 'alt'}, 'm', keyCode('delete', {'fn', 'cmd', 'alt'}))


```

## まとめ

ホームポジションから離れづらくなった。便利。
