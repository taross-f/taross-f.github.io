---
tags: VSCode Golang
title: VisualStudioCodeでGo言語開発環境を作ってみた
---

先日社内でちょっとしたプログラミングコンテストをやるとのことで、速度重視で並列処理なら Go でしょ(?)
と思ったので Go でやってみようとなった。

で、エディタどうしようかなと思ってちょっと調べたら VisualStudioCode でやればいい感じぽいので、環境をつくってみた

## 手順

### ダウンロード

[VisualStudioCode](https://code.visualstudio.com/)

[golang](https://golang.org/dl/)

適当に featured の項目から DL します

### VisualStudioCode 設定

![s1](https://raw.githubusercontent.com/taross-f/taross-f.github.io/master/images/go_screenshot01.png "screenshot")

Code を開いたあと左の下の拡張機能のタブから go で検索してインストールします。

### ディレクトリ構成

[https://golang.org/doc/code.html](https://golang.org/doc/code.html)

ここにしたがって、プロジェクトの root 直下に

```
bin/
pkg/
src/
```

のディレクトリを作ります。

### GOPATH など

src の下にディレクトリを切って hoge.go を置きます。

すると上からにゅるっと GOPATH 設定してね、と出てきます

![s1](https://raw.githubusercontent.com/taross-f/taross-f.github.io/master/images/go_screenshot02.png "screenshot")

`Set GOPATH in workspacesettings`をクリックすると、settings.json が開けません、と出るので作成をクリックすると setting.json ができるので、ここに root にするディレクトリのパスを以下のように書きます。

```
{
    "go.gopath": "/path/to/root"
}
```

で code 再起動

すると今度は

![s1](https://raw.githubusercontent.com/taross-f/taross-f.github.io/master/images/go_screenshot03.png "screenshot")

こんな感じに golint がないですよ、と表示が出るので install ALL します。すると出力を見ると

```
Installing 10 tools
  gocode
  gopkgs
  go-outline
  go-symbols
  guru
  gorename
  godef
  goreturns
  golint
  gotests

Installing gocode SUCCEEDED
Installing gopkgs SUCCEEDED
Installing go-outline SUCCEEDED
Installing go-symbols SUCCEEDED
Installing guru SUCCEEDED
Installing gorename SUCCEEDED
Installing godef SUCCEEDED
Installing goreturns SUCCEEDED
Installing golint SUCCEEDED
Installing gotests SUCCEEDED

All tools successfully installed. You're ready to Go :).
```

のように必要なものをいろいろ入れてくれます。
これで晴れて`You're ready to Go`になったようです。

## 機能

普通の IDE レベルの機能が入ってくれます。

- 保存時に毎回 format をかける(lint)
- 変数名を書き換えできる
- メソッドにマウスオーバーで詳細確認できる
- 定義にジャンプ･参照表示ができる
- 常にコンパイルエラーがあったら表示する
- import を自動追加

などなど。

## まとめ

基本的に上からにゅるっと出て来る info の言いなりになってるだけで開発環境できちゃうので楽チンでした。
VisualStudioCode 自体も細かくアップデートされているのでどんどん便利になってますね。

結局プロコン優勝して高級焼肉ゲット済み。たいしたコード書いてないんですが、C#とくらべても 10 倍弱のスピードでました。

## 参考

プラグインの本体

https://github.com/Microsoft/vscode-go

[ちょっとまえにせっかく書いた](http://qiita.com/t_furuya/items/753419d178c81600ce78) のでブログにも転載
