---
tags: macOS Network Swift Tools
title: Wi-Fiのレイテンシがawdl0を止めたら改善したのでhawdlを作った
---

自宅で接続するときに、wifiのレイテンシが定期的に大きくなってweb会議に支障をきたすことが続いていた。同じネットワークの他の端末では起きていない。

Claudeに協力してもらいながら調べていったところ、`awdl0`を止めると改善しました。AirDropなどで使われるApple Wireless Direct Linkのインターフェースです。

ただ一度止めてもOSが有効に戻してしまうので、停止した状態を維持するための[hawdl](https://github.com/taross-f/hawdl)というツールを作りました。調べた内容も書いておきます。

# pingで確認

ルーターにpingを打ってみる。

```console
$ ping -c 60 -i 0.25 -q 192.168.0.1
60 packets transmitted, 60 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 4.921/236.760/1090.306/268.352 ms
```

パケットロスはないけど、平均で236ms、最大で1秒以上かかっている。定期的に遅くなるという認識だったけど、平均でも結構遅いですね。

宛先を変えても測ってみました。値はすべてmsです。

| 宛先 | min | avg | max |
| --- | --- | --- | --- |
| 192.168.0.1(GW) | 5.195 | 185.311 | 614.649 |
| 192.168.0.211(LAN内) | 5.897 | 189.708 | 611.916 |
| 1.1.1.1 | 7.234 | 225.909 | 1058.991 |
| 8.8.8.8 | 8.064 | 237.669 | 1074.322 |

インターネットに出る前から遅いので、自宅のLAN内を調べることに。

LAN内の別端末宛でも同じなのでMac側の問題かと思ったんですが、これもアクセスポイント(AP)を経由するので、まだMacとAPのどちらかはわからない。

# 電波や通信量を確認

```console
$ system_profiler SPAirPortDataType | grep -E 'Signal|Transmit Rate|Channel'
Channel: 48 (5GHz, 80MHz)
Signal / Noise: -37 dBm / -73 dBm
Transmit Rate: 1200
```

信号強度は-37dBm、表示上の接続速度は1200Mbps。電波が弱いわけではなさそう。

通信量が多くて遅くなっているのかもと思って、pingとあわせて`netstat -I en0 -b`の値も確認しました。250msごとの通信量を比べた結果がこれ。

```text
高遅延スロット(n=38) 平均 69631 bytes
低遅延スロット(n=34) 平均 101268 bytes
```

今回の測定では、遅いときのほうが通信量は少なかった。これだけで原因を除外はできないけど、通信量が増えたときに遅くなる、という感じでもないので別のところを調べる。

# awdl0を止めてみる

`wdutil info`でチャンネルの情報を確認すると、接続先のch48以外にもch44やch6が出ていました。

```console
$ sudo wdutil info | grep -iE 'channel|rssi|tx rate'
Channel           : 5g48/80
Channel Sequence  : 48++ 0 44++ 0 0 0 0 0 6 0 44++ 0 0 0 0 0
Master Channel    : 6/0
```

AWDLの通信でチャンネルが切り替わることが影響していそうなので、`awdl0`を停止して同じ宛先にpingを打ってみました。

```sh
sudo ifconfig awdl0 down && sleep 8 && ping -c 60 -i 0.25 -q 192.168.0.1
```

停止直後に測ったときは`20% loss / avg 1334ms / max 4953ms`とむしろ悪くなっていたんですが、8秒待ってから測り直すと改善しました。この環境では少し待つ必要があったようです。

`airportd`の内部指標もあわせて比較しています。

| 指標 | AWDL有効 | AWDL停止 |
| --- | --- | --- |
| ping min/avg/max/stddev (ms) | 4.3 / 249 / 1090 / 273 | 2.429 / 3.012 / 3.761 / 0.394 |
| cca | 63〜83% | 19〜21% |
| interferenceTotal | 45〜79 | 5〜10 |
| p95-lat | 358〜526 | 1 |
| beaconRecv/Sched | 39-43 / 48-49 | 49 / 49 |

pingの平均が249msから3msになって、ばらつきもかなり小さくなった。beaconの受信数も予定数と一致するようになっています。

少なくとも自分の環境では、awdl0を止めることで遅延が改善することがわかりました。

原因はわかったんですが、念のため他の要因も確認しておきました。

| 確認したもの | やったこと | 結果 |
| --- | --- | --- |
| 中継機 RE700X | 電源を抜く | cca / interference / p95に変化なし |
| Bluetooth | 2台つないだまま測定 | stddev 0.851ms |
| 近隣AP | 同一チャンネルのAPを確認 | ccaOtherTotalは3〜13% |
| バックグラウンドスキャン | `log stream`で40秒間のscan要求を確認 | 0件 |
| アプリ | Zoom / Slack / krisp / Music / Teamsを順に終了 | 変化なし |
| 近くのMacBook Air | Wi-Fiをオフにする | leak警告は消えたがccaに変化なし |

# hawdlを作った

`sudo ifconfig awdl0 down`で止めても、AirDropなどを使ったりスリープから復帰したりするとOSが`up`に戻してしまう。そのたびに手動で止めるのも面倒なので、[hawdl](https://github.com/taross-f/hawdl)を作りました。

Swift製で、外部パッケージへの依存はありません。メニューバーアプリとCLIから操作できます。

root権限で動くデーモンの`hawdld`がawdl0を監視して、OSが有効に戻したら再度停止します。メニューバーアプリとCLIはUnix domain socket経由でデーモンに接続するので、普段の操作ではsudoは不要です。

監視には`PF_ROUTE`の`RTM_IFINFO`を使っています。イベントを取りこぼした場合に備えて、30秒ごとの状態確認も入れています。

インターフェースの操作は`ifconfig`を呼ばずに、ioctlの`SIOCGIFFLAGS` / `SIOCSIFFLAGS`で直接変更するようにしました。このマクロがSwiftからimportできないので、そこだけCのコードを挟んでいます。

OSが短時間に何度も有効に戻す場合は、停止するまでの待ち時間を延ばすようにしています。10秒以内に5回以上戻されたら、1秒、2秒、4秒と間隔を空ける。

`hawdl status`では現在の状態を確認できます。`blocked`に、OSが有効に戻したのを何回止めたかが出ます。

## インストール

```sh
brew install taross-f/hawdl/hawdl
sudo brew services start hawdl
```

完全修飾名で指定すればtapも一緒に追加されるので、先に`brew tap taross-f/hawdl`を打つ必要はありません。最新リリースをソースからビルドします。リリースではなく`main`を追いたい場合は`brew install --HEAD taross-f/hawdl/hawdl`です。

CLIやメニューバーアプリを使うにはデーモンの起動が必要なので、`sudo brew services start hawdl`まで実行してください。

メニューバーアプリは別途起動します。

```sh
open "$(brew --prefix hawdl)/HawdlBar.app"
```

## AirDropなどを使うとき

AWDLを止めている間は、AirDropやSidecarなどの連係機能が使えなくなることがあります。Handoff、ユニバーサルクリップボード、ユニバーサルコントロール、連係カメラ、ピアツーピアのAirPlayなどにも影響します。

必要なときは`hawdl release`かメニューバーから解除できます。デーモンの通常終了時にも`up`に戻すようにしています。

`awdl0`を直接操作しているので、macOSのアップデートで挙動が変わる可能性はあります。制御ソケットのパーミッションは0666で、同じMacの他のユーザーも操作できるため、共用Macで使う場合は注意してください。

自分の環境ではこれでレイテンシが改善しました。AirDropなどが使えなくなるのは不便なので、必要なときは戻しながら使うことになります。
