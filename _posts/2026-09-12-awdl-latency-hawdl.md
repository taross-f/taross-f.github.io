---
tags: macOS Network Swift Tools
title: Wi-Fiの定期的なレイテンシスパイクの犯人はawdl0だった、のでhawdlを作った
---

自宅の Mac だけ、Wi-Fi のレイテンシが定期的に跳ねる問題をずっと抱えていました。Meet が止まる、SSH が固まる。でも同じネットワークの他の端末は平気。

測定して切り分けていったら、犯人は `awdl0` — AirDrop や Handoff の土台になっている Apple Wireless Direct Link のインターフェースでした。さらに「誰がそれを上げ続けているのか」まで辿れたので、その調査手順と、最終的に作った [hawdl](https://github.com/taross-f/hawdl) というツールの話を書きます。

結果だけ先に書くと、こうなりました。

| 指標 | AWDL 有効 | AWDL 停止 |
| --- | --- | --- |
| ping min/avg/max/stddev (ms) | 4.3 / 249 / 1090 / 273 | 2.429 / 3.012 / 3.761 / 0.394 |
| cca | 63〜83% | 19〜21% |
| interferenceTotal | 45〜79 | 5〜10 |
| p95-lat | 358〜526 | 1 |
| beaconRecv/Sched | 39-43 / 48-49 | 49 / 49 |

平均で約80倍、ばらつきで約300〜700倍です。

## 前提を固定する

切り分けを始める前に決めておいたことが3つあります。ここを曖昧にすると必ず測り直しになります。

- **測定対象**: 第1ホップ（Mac → ルーター）。インターネット側ではない
- **見る指標**: 平均ではなく stddev と max、そして loss
- **比較の型**: 1回に1変数だけ変えて前後を測る

平均を見ないのが重要です。この問題は「たまに跳ねる」ので、平均だけ眺めていると「まあこんなもんか」で終わります。

## Step 1 ロスか遅延かを分ける

```console
$ ping -c 60 -i 0.25 -q 192.168.0.1
60 packets transmitted, 60 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 4.921/236.760/1090.306/268.352 ms
```

ロス 0%、min は 4.9ms。**電波が届いていないのではなく、待たされている**。

ここで問題の性質が「電波品質」から「キューかスケジューリング」に絞られます。RSSI を見る前にこれを確定させると、以降の候補が半分に減ります。

ついでに、この時点で自分の症状認識が甘かったこともわかります。「定期的にスパイクする」と思っていたけれど、avg 236ms / stddev 268ms というのは、たまに跳ねているのではなく**大半のパケットが待たされている**状態です。

## Step 2 遅延がどこで乗るかを分ける

宛先を変えて min を比べます。avg や max ではなく min を見るのがコツで、min は「混んでいないときの素の経路コスト」を表します。

| 宛先 | min | avg | max |
| --- | --- | --- | --- |
| 192.168.0.1（GW） | 5.195 | 185.311 | 614.649 |
| 192.168.0.211（LAN 内） | 5.897 | 189.708 | 611.916 |
| 1.1.1.1 | 7.234 | 225.909 | 1058.991 |
| 8.8.8.8 | 8.064 | 237.669 | 1074.322 |

GW と 1.1.1.1 の min 差は 2.3ms。**遅延は遠くへ出る前に乗っています**。回線・WAN・ISP は無罪。

ここで一度、判断を間違えました。「LAN 内の別ホスト宛でも同症状だから Mac 側の無線機で確定」とメモしたのですが、LAN ピア宛の ping も AP を経由します（Mac → AP → ピア → AP → Mac）。Mac 側か AP 側かは、この測定では**分離できていません**。分離できるのはもっと後、Step 6 の無線機の居場所を見てからです。

## Step 3 電波の強さを潰す

```console
$ system_profiler SPAirPortDataType | grep -E 'Signal|Transmit Rate|Channel'
Channel: 48 (5GHz, 80MHz)
Signal / Noise: -37 dBm / -73 dBm
Transmit Rate: 1200
```

-37dBm は満点に近い値です。1200Mbps 出ている。電波の強さも無罪。

**電波は満点、ロスはゼロ、それでも Meet が止まる。** この逆説が、この記事の本当の入口です。

## Step 4 自分の負荷を潰す（バッファブロート判定）

症状だけ見ると、いわゆるバッファブロートに似ています。自分は最初これを疑っていました。

ただバッファブロートは「**負荷がかかると遅延が伸びる**」ものなので、負荷と遅延の相関を取れば白黒つきます。ping の `icmp_seq` から送信時刻を復元して、250ms スロットごとの `netstat -I en0 -b` 差分と突き合わせます。

```sh
ping -i 0.25 -c 80 192.168.0.1 | grep -o 'icmp_seq=[0-9]* .*time=[0-9.]' \
  | sed 's/icmp_seq=//; s/ .*time=/ /' > seq_rtt.txt &
prev=$(netstat -I en0 -b | awk 'NR==2{print $7+$10}')
for i in $(seq 0 79); do
  sleep 0.25
  cur=$(netstat -I en0 -b | awk 'NR==2{print $7+$10}')
  echo "$i $((cur-prev))" >> slot_bytes.txt
  prev=$cur
done
join seq_rtt.txt slot_bytes.txt | awk '$2>150{h+=$3;hn++} $2<50{l+=$3;ln++} END{
  printf "高遅延 %.0f bytes / 低遅延 %.0f bytes\n", h/hn, l/ln}'
```

```
高遅延スロット(n=38) 平均 69631 bytes
低遅延スロット(n=34) 平均 101268 bytes
```

**遅い瞬間のほうが通信量が少ない。負の相関です。バッファブロートではありません。**

ちなみにこの負の相関は「待たされている間は送れないからバイト数が減っただけ」とも読めて、因果としては逆向きの可能性があります。ただバッファブロートなら正の相関が出ないと成立しないので、**否定の根拠としては無傷**です。

## Step 5 ドライバの内部指標を読む

ここからは `airportd` が持っている内部指標を見ます。`cca`（チャンネル占有率）、`interferenceTotal`、`p95-lat`、`beaconRecv` / `beaconSched` あたりです。

<!-- TODO: ここで使ったコマンドを入れる -->

beacon は AP が一定間隔で撒いているので、**受信数が予定数に届いていなければ、その時間は受信機が留守だった**ということになります。これが後で効いてきます。

⚠️ 注意点として、`interferenceTotal` には**デコードできなかった電波も入ります**。この数字が大きいことをもって「Wi-Fi 以外の電波が干渉している」と断定してはいけません。電子レンジ犯人説に飛びつきかけたのですが、この指標だけでは言えません。

## Step 6 無線機がどこにいるかを見る

決め手はここでした。

```console
$ sudo wdutil info | grep -iE 'channel|rssi|tx rate'
Channel           : 5g48/80
Channel Sequence  : 48++ 0 44++ 0 0 0 0 0 6 0 44++ 0 0 0 0 0
Master Channel    : 6/0
```

`Channel Sequence` は AWDL の 16 スロット availability window です。1 スロットが 16TU なので、16 スロットで 1 周およそ 0.26 秒。そのうち、

- スロット 3, 11 → `44++`（AWDL の社交チャンネル 44、5GHz）
- スロット 9 → `6`（AWDL の社交チャンネル 6、2.4GHz。**帯を跨ぐ**）

つまり **0.26 秒ごとに、無線機が ch48 から離席しています**。接続している AP は ch48 にいるので、その間の通信は止まる。Step 5 で見た占有率 83% の正体はこれで、他人の電波で埋まっていたのではなく、**自分の無線機がそこにいなかった**わけです。

Step 2 で分離できていなかった「Mac 側か AP 側か」も、これで Mac 側に確定します。AP は ch48 で待っている。留守にしているのは Mac です。

ラジオは 1 本しかないので、Wi-Fi と AWDL は時分割で共有するしかありません。表面に出てくる症状はキュー詰まりと同じでも、原因はチャンネル離席です。**だからルーター側で AQM を入れても絶対に直りません。** プロトコルの詳細は Stute らの AWDL リバースエンジニアリング論文（MobiCom '18）が詳しいです。

## Step 7 A/B で確定させる

```sh
sudo ifconfig awdl0 down && sleep 8 && ping -c 60 -i 0.25 -q 192.168.0.1
```

**`sleep 8` が必須です。** 落とした直後はドライバ再構成の遷移でむしろ悪化します。自分は最初これを入れずに測って `20% loss / avg 1334ms / max 4953ms` を得て、一瞬「効かなかった」と誤判定しました。危うくここで調査を畳むところでした。

整定後:

| 指標 | AWDL 有効 | AWDL 停止 |
| --- | --- | --- |
| ping min/avg/max/stddev (ms) | 4.3 / 249 / 1090 / 273 | 2.429 / 3.012 / 3.761 / 0.394 |
| cca | 63〜83% | 19〜21% |
| interferenceTotal | 45〜79 | 5〜10 |
| p95-lat | 358〜526 | 1 |
| beaconRecv/Sched | 39-43 / 48-49 | 49 / 49 |

beacon が 49/49 になっているのが気持ちいいところです。取りこぼしがゼロになった。AP は最初から正しく撒いていて、受信側が留守にしていただけでした。

## Step 8 消去法（1回に1変数）

犯人が分かった後ですが、念のため他の容疑者も 1 つずつ潰しています。

| 疑ったもの | 確かめかた | 結果 |
| --- | --- | --- |
| 中継機 RE700X | 電源を抜く | cca / interference / p95 が不変 |
| Bluetooth | 2台つないだまま最終測定 | つないだまま stddev 0.851ms を達成 |
| 近隣AP | 同一チャンネルの AP を数える | ccaOtherTotal は 3〜13% のみ |
| VPN | `utun*` の有効アドレス | Cisco 常駐だがトンネル未確立 |
| バックグラウンドスキャン | `log stream` 40秒で scan 要求を数える | 0件 |
| アプリ | Zoom / Slack / krisp / Music / Teams を順に終了 | 全部変化なし |
| 近くの MacBook Air | Wi-Fi オフでピアを消す | leak 警告は消えたが cca 不変 |

Bluetooth の行が個人的には効いています。この手の話で真っ先に切られるものを、**つないだまま stddev 0.851ms を出せた**。切らなくていいものを切らずに済ませられるのが、ちゃんと切り分けをする理由です。

## Step 9 保持元を同定する

ここからは発展です。AWDL が原因だとわかっても、**誰が AWDL を要求し続けているのか**は別の問題です。使った覚えのない AirDrop のために、なぜ常時上がっているのか。

手がかりは `wifip2pd` が出している leak 警告でした。ここに含まれる経過時間は、**保持元のプロセスが再起動されるとリセットされます**。つまり「アプリを終了して timer が動かなければシロ」と機械的に判定できます。

```console
$ timeout 40 log stream --style compact --predicate 'process == "wifip2pd"' | grep -i leak
Time since oldest service added: 6時間 ...
leakReason: Browse: _airplay-p2p-_airplay-_raop
```

なお、この `leak` はメモリリークではありません。**cancel されていない browse** に Apple 自身が付けている語です。

名指しするには、`mDNSResponder` を再起動して全クライアントに browse を再登録させ、flags を読みます。

```
R26: DNSServiceBrowse START -- flags: 0x104000, interface index: 16, client pid: 621 (AirPlayXPCHelper)
```

- `interface index 16` = `awdl0`（`ifconfig` の scopeid `0x10`）
- `0x104000` = `kDNSServiceFlagsIncludeAWDL(0x100000) | ShareConnection(0x4000)`
  値は SDK ヘッダで確認しました（`MacOSX.sdk/usr/include/dns_sd.h:474`）

裏取りとして `killall AirPlayXPCHelper` を打つと、leak timer が「6時間」から「1分」にリセットされました。他のプロセスを kill してもびくともしなかった timer が、これだけで動いた。

**`AirPlayXPCHelper` が AWDL 込みの browse を張りっぱなしにしていた**、が結論です。

## それでも一度落としただけでは勝てない

`killall AirPlayXPCHelper` は launchd に再起動されます。`sudo ifconfig awdl0 down` も、AirDrop / Handoff / Sidecar が起動するたび、そしてスリープから復帰するたびに OS が勝手に `up` に戻します。cron で定期的に叩く手もありますが、その間隔のぶんだけ復活している時間が残ります。

必要なのは「落とす」ことではなく、**「落ちた状態を維持する」**ことでした。

## hawdl を作った

というわけで作ったのが [hawdl](https://github.com/taross-f/hawdl) です。Swift 製で、外部パッケージ依存はゼロ。

```
┌─────────────┐     ┌──────────┐
│ HawdlBar.app│     │ hawdl CLI│   ← ユーザー権限
└──────┬──────┘     └────┬─────┘
       └────────┬────────┘
         Unix domain socket
         /var/run/hawdl.sock
                │
         ┌──────▼──────┐
         │   hawdld    │              ← root (LaunchDaemon)
         │  PF_ROUTE 監視              │
         │  SIOCSIFFLAGS で down       │
         │  desired state 永続化        │
         └─────────────┘
```

root 権限が必要な操作をデーモンに閉じ込めてあるので、GUI も CLI も sudo を要求しません。

技術的なポイントをいくつか。

- **監視は PF_ROUTE**。`RTM_IFINFO` を購読するイベント駆動なので、AirDrop を開いた瞬間に落とし返します。ポーリングではありません。保険として 30 秒ごとの reconcile も回していて、イベントを取りこぼしても最大 30 秒で復旧します
- **インターフェース操作は ioctl**。`ifconfig` をサブプロセスで叩かず、`SIOCGIFFLAGS` / `SIOCSIFFLAGS` で `IFF_UP` を直接操作します。これらのマクロは `_IOWR()` 由来で Swift から import できないので、C シムを噛ませています
- **フラップ防止の指数バックオフ**。10 秒以内に 5 回以上 up されたら 1s → 2s → 4s … と待ちます。OS と無限に殴り合って CPU を焼かないための安全弁です
- **終了時は必ず up に戻す**。デーモンが死んだのに AirDrop が使えない、という状態は作りません

```console
$ hawdl status
AWDL: held down  blocked=12  last=2025-09-07T10:23:45Z  daemon=0.1.0
```

この `blocked` が、Step 9 で名指しした保持元がどれだけ上げ直しているかの実測値になります。調査で使った指標が、そのままツールの表示になっているのが気に入っています。

## 副作用

AWDL を止めている間、以下は**動作しなくなります**。

- AirDrop
- Handoff / ユニバーサルクリップボード
- Sidecar
- ユニバーサルコントロール
- 連係カメラ / 連係マークアップ
- AirPlay の一部（ピアツーピア接続）

必要になったら `hawdl release` かメニューバーから戻せます。デーモンを止めたときも自動で `up` に戻ります。

`awdl0` の直接操作は Apple の公式サポート外です。macOS のアップデートで挙動が変わる可能性があります。あと、制御ソケットのパーミッションが 0666 なので、同一マシンのローカルユーザーなら誰でもトグルできます。共用 Mac では注意してください。

## インストール

```sh
brew tap taross-f/hawdl
brew install --HEAD taross-f/hawdl/hawdl
sudo brew services start hawdl
```

**`brew services start` を忘れると何も起きません。** CLI もメニューバーアプリも話し相手がいない状態になります。メニューバーアプリも手動で起動が必要です。

```sh
open "$(brew --prefix hawdl)/HawdlBar.app"
```

## まとめ

「Mac だけ遅い」「電波は満点なのに会議が止まる」なら、まず `ifconfig awdl0` と `sudo wdutil info` の `Channel Sequence` を見てください。無線機が接続先のチャンネルにいないなら、それが答えです。

ただ、本来直るべきなのは **cancel されない browse のほう**で、hawdl は対症療法です。Continuity 機能を日常的に使っている人には勧めません。AirDrop を捨ててレイテンシを買う、というトレードオフの道具です。

自分は買いました。stddev 268ms が 0.851ms になるなら安いものでした。
