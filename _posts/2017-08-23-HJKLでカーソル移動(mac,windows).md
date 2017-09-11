---
tags: mac windows utility

---

## キーボード環境について
職場Windows個人Macなのもあって、JISキーボードでなるべく同様のカスタマイズ可能なものだけ取り入れてるんですが、hjklでカーソル移動って便利なのでどっちも同じような感じでできないかやりたくなった。特にキーボード無刻印にしたらカーソルキーに移動するのがだるいのもあった。のでやってみた。ちなみに別にVimmerなわけではありません

ちょろっと調べたらMacはいろいろ手がありそうだったので、Windows側で導入簡単である程度求めるものができるものを探して環境を揃えられそうなやつを入れることにする

## Windows

以下のツールを使うことに。

[enthumble](http://jp.enthumble.com/)

決め手は、DL>インストール>設定を選ぶだけで無変換+hjklでカーソル移動できちゃう簡単さ。すごい  
さらにあとから気付いたけど 無変換+n でbackspace, 無変換+m でdeleteもできてこれが地味に便利だった  

今回の話とは関係ないけど 無変換/変換 でIME On/Off切り替えるようにするのもインストールするだけで出来てしまっていい感じ。いままではGoogleIMEでポチポチ設定変えてたので楽ちんポン

問題はフリー版だとHotkeyとして**無変換**しか使えない点。これは後述するけどMac側での対応が難しい(hammerspoonでmuhenkanがhotkeyに無いっぽい)ので、Windows側のCapslockを無変換にするようにする。

[KeySwap for XP](http://www.vector.co.jp/soft/winnt/util/se228667.html)

XP!!?? ってなるけどWin10で問題なく動きました。これでレジストリ書き換えもサクッと。


## Mac


以下を使う
[hammerspoon](http://www.hammerspoon.org/)

[KarabinerのVi Mode カーソル移動（Ctrl+hjkl）をSierraでも再現する](http://qiita.com/deg84/items/792bf6b2adf467df9bdc)を参考にした。 ~~というかほぼ丸パクり~~

一応win版の対応であったdelete/backspaceの動きを追加したりしている

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
