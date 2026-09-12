---
tags: macOS Network Swift Tools
title: Wi-Fiの定期的なレイテンシスパイクの犯人はawdl0だった、のでhawdlを作った
---

自宅の Mac だけ Wi-Fi のレイテンシが定期的に跳ねる、という問題をずっと抱えていた。Meet が止まるし SSH も固まる。でも同じネットワークの他の端末は平気。

ちゃんと測って切り分けていったら犯人は `awdl0` で、AirDrop や Handoff の土台になっている Apple Wireless Direct Link のインターフェースだった。ついでに「誰がそれを上げ続けているのか」まで辿れたので、同じ気持ちになる人を減らすためにも手順ごと残してみる。

最終的に作った [hawdl](https://github.com/taross-f/hawdl) というツールの話も後半に書きます。

結果から書くとこうなりました。

| 指標 | AWDL 有効 | AWDL 停止 |
| --- | --- | --- |
| ping min/avg/max/stddev (ms) | 4.3 / 249 / 1090 / 273 | 2.429 / 3.012 / 3.761 / 0.394 |
| cca | 63〜83% | 19〜21% |
| interferenceTotal | 45〜79 | 5〜10 |
| p95-lat | 358〜526 | 1 |
| beaconRecv/Sched | 39-43 / 48-49 | 49 / 49 |

平均で約 80 倍、ばらつきで約 300〜700 倍。効きすぎて逆に怖い。

# 前提を決めておく

切り分けの前に決めておいたことが 3 つ。ここを曖昧にしたまま測ると絶対に測り直しになります。

- 測定対象: 第 1 ホップ(Mac → ルーター)。インターネット側ではない
- 見る指標: 平均ではなく stddev と max、あと loss
- 比較の型: 1 回に 1 変数だけ変えて前後を測る

平均を見ないのが地味に大事で、この手の問題は平均だけ眺めてると「まあこんなもんか」で終わってしまう。

# 切り分けしていく

## Step 1 ロスか遅延かを分ける

```console
$ ping -c 60 -i 0.25 -q 192.168.0.1
60 packets transmitted, 60 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 4.921/236.760/1090.306/268.352 ms
```

ロス 0%、min は 4.9ms。つまり電波が届いてないんじゃなくて待たされている。

ここで問題の性質が「電波品質」から「キューかスケジューリング」に絞れます。RSSI を見る前にこれを確定させておくと以降の候補が半分に減るのでおすすめ。

あとこの時点で、自分の症状認識が甘かったこともわかる。「定期的にスパイクする」と思ってたけど、avg 236ms / stddev 268ms ってたまに跳ねてるんじゃなくてほぼずっと待たされてますね。

## Step 2 遅延がどこで乗るかを分ける

宛先を変えて min を比べる。avg や max じゃなくて min を見るのがコツで、min は「混んでないときの素の経路コスト」を表します。

| 宛先 | min | avg | max |
| --- | --- | --- | --- |
| 192.168.0.1(GW) | 5.195 | 185.311 | 614.649 |
| 192.168.0.211(LAN 内) | 5.897 | 189.708 | 611.916 |
| 1.1.1.1 | 7.234 | 225.909 | 1058.991 |
| 8.8.8.8 | 8.064 | 237.669 | 1074.322 |

GW と 1.1.1.1 の min 差は 2.3ms。遅延は遠くへ出る前に乗ってます。回線・WAN・ISP は無罪。

ここで一度間違えていて、「LAN 内の別ホスト宛でも同じだから Mac 側の無線機で確定」とメモしてたんですが、LAN ピア宛の ping も AP を経由する(Mac → AP → ピア → AP → Mac)。Mac 側か AP 側かはこの測定では分離できてません。分離できるのは Step 6 まで待つことになります。

## Step 3 電波の強さを潰す

```console
$ system_profiler SPAirPortDataType | grep -E 'Signal|Transmit Rate|Channel'
Channel: 48 (5GHz, 80MHz)
Signal / Noise: -37 dBm / -73 dBm
Transmit Rate: 1200
```

-37dBm は満点に近い。1200Mbps 出てる。電波の強さも無罪。

電波は満点、ロスはゼロ、それでも Meet が止まる。ここからが本題。

## Step 4 自分の負荷を潰す

症状だけ見るとバッファブロートっぽいので、最初はこれを疑ってた。

ただバッファブロートは「負荷がかかると遅延が伸びる」ものなので、負荷と遅延の相関を取れば白黒つきます。ping の `icmp_seq` から送信時刻を復元して、250ms スロットごとの `netstat -I en0 -b` 差分と突き合わせる。

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

遅い瞬間のほうが通信量が少ない。負の相関。バッファブロートではない。

ちなみにこれ「待たされてる間は送れないからバイト数が減っただけ」とも読めて、因果は逆かもしれません。ただバッファブロートなら正の相関が出ないと成立しないので、否定の根拠としては問題ないはず。

## Step 5 ドライバの内部指標を読む

ここからは `airportd` が持ってる内部指標を見ていく。`cca`(チャンネル占有率)、`interferenceTotal`、`p95-lat`、`beaconRecv` / `beaconSched` あたり。

<!-- TODO: ここで使ったコマンドを入れる -->

beacon は AP が一定間隔で撒いてるので、受信数が予定数に届いてなければその間は受信機が留守だったということになる。これが後で効いてきます。

注意点として、`interferenceTotal` にはデコードできなかった電波も入ります。この数字が大きいからといって「Wi-Fi 以外の電波が干渉してる」とは言えない。危うく電子レンジ犯人説に飛びつくところだった。

## Step 6 無線機がどこにいるかを見る

決め手はここ。

```console
$ sudo wdutil info | grep -iE 'channel|rssi|tx rate'
Channel           : 5g48/80
Channel Sequence  : 48++ 0 44++ 0 0 0 0 0 6 0 44++ 0 0 0 0 0
Master Channel    : 6/0
```

`Channel Sequence` は AWDL の 16 スロット availability window。1 スロットが 16TU なので、16 スロットで 1 周およそ 0.26 秒。その内訳が、

- スロット 3, 11 → `44++`(AWDL の社交チャンネル 44、5GHz)
- スロット 9 → `6`(AWDL の社交チャンネル 6、2.4GHz。帯を跨ぐ)

つまり 0.26 秒ごとに無線機が ch48 から離席している。つないでる AP は ch48 にいるので、その間の通信は止まる。Step 5 で見た占有率 83% はこれで、他人の電波で埋まってたんじゃなくて自分の無線機がそこにいなかっただけでした。

Step 2 で分離できてなかった「Mac 側か AP 側か」もこれで Mac 側に確定。AP は ch48 でちゃんと待ってる。

ラジオは 1 本しかないので、Wi-Fi と AWDL は時分割で共有するしかない。出てくる症状はキュー詰まりと同じでも原因はチャンネル離席なので、ルーター側で AQM を入れても直りません。プロトコルの詳細は Stute らの AWDL リバースエンジニアリング論文(MobiCom '18)が詳しいです。

## Step 7 A/B で確定させる

```sh
sudo ifconfig awdl0 down && sleep 8 && ping -c 60 -i 0.25 -q 192.168.0.1
```

`sleep 8` が必須。落とした直後はドライバ再構成の遷移でむしろ悪化します。最初これを入れずに測って `20% loss / avg 1334ms / max 4953ms` を得て、一瞬「効かないじゃん」と誤判定した。あぶなくここで調査を畳むところだった。

整定後。

| 指標 | AWDL 有効 | AWDL 停止 |
| --- | --- | --- |
| ping min/avg/max/stddev (ms) | 4.3 / 249 / 1090 / 273 | 2.429 / 3.012 / 3.761 / 0.394 |
| cca | 63〜83% | 19〜21% |
| interferenceTotal | 45〜79 | 5〜10 |
| p95-lat | 358〜526 | 1 |
| beaconRecv/Sched | 39-43 / 48-49 | 49 / 49 |

beacon が 49/49 になってるのが気持ちいい。取りこぼしゼロ。AP は最初からちゃんと撒いてて、受信側が留守にしてただけですね。

## Step 8 消去法

犯人はもう分かってるんですが、念のため他の容疑者も 1 つずつ潰しておいた。

| 疑ったもの | 確かめかた | 結果 |
| --- | --- | --- |
| 中継機 RE700X | 電源を抜く | cca / interference / p95 が不変 |
| Bluetooth | 2 台つないだまま最終測定 | つないだまま stddev 0.851ms を達成 |
| 近隣 AP | 同一チャンネルの AP を数える | ccaOtherTotal は 3〜13% のみ |
| VPN | `utun*` の有効アドレス | Cisco 常駐だがトンネル未確立 |
| バックグラウンドスキャン | `log stream` 40 秒で scan 要求を数える | 0 件 |
| アプリ | Zoom / Slack / krisp / Music / Teams を順に終了 | 全部変化なし |
| 近くの MacBook Air | Wi-Fi オフでピアを消す | leak 警告は消えたが cca 不変 |

Bluetooth の行が個人的には嬉しいところ。この手の話で真っ先に切られがちなものを、つないだまま stddev 0.851ms まで持っていけた。切らなくていいものを切らずに済むのが、ちゃんと切り分けする理由かなと思います。

## Step 9 保持元を同定する

ここからは発展。AWDL が原因だと分かっても、誰が AWDL を要求し続けてるのかは別の話です。使った覚えのない AirDrop のために、なぜ常時上がってるのか。

手がかりは `wifip2pd` が出してる leak 警告でした。ここに含まれる経過時間は、保持元のプロセスが再起動されるとリセットされる。つまり「アプリを終了して timer が動かなければシロ」と機械的に判定できる。

```console
$ timeout 40 log stream --style compact --predicate 'process == "wifip2pd"' | grep -i leak
Time since oldest service added: 6時間 ...
leakReason: Browse: _airplay-p2p-_airplay-_raop
```

ちなみにこの `leak` はメモリリークではなくて、cancel されてない browse に Apple 自身が付けてる語です。

名指しするには、mDNSResponder を再起動して全クライアントに browse を再登録させて flags を読む。

```
R26: DNSServiceBrowse START -- flags: 0x104000, interface index: 16, client pid: 621 (AirPlayXPCHelper)
```

- `interface index 16` = `awdl0`(`ifconfig` の scopeid `0x10`)
- `0x104000` = `kDNSServiceFlagsIncludeAWDL(0x100000) | ShareConnection(0x4000)`。値は SDK ヘッダで確認しました(`MacOSX.sdk/usr/include/dns_sd.h:474`)

裏取りに `killall AirPlayXPCHelper` を打つと、leak timer が「6 時間」から「1 分」にリセットされた。他を kill してもびくともしなかった timer がこれだけで動いたので、AirPlayXPCHelper が AWDL 込みの browse を張りっぱなしにしてた、でよさそうです。

# 一度落としただけでは勝てない

`killall AirPlayXPCHelper` は launchd に再起動されます。`sudo ifconfig awdl0 down` も、AirDrop / Handoff / Sidecar が起動するたび、あとスリープから復帰するたびに OS が勝手に `up` に戻してくる。cron で定期的に叩く手もあるけど、その間隔ぶんは復活してる時間が残る。

必要なのは「落とす」ことじゃなくて「落ちた状態を維持する」ことでした。

# hawdl を作った

というわけで作ったのが [hawdl](https://github.com/taross-f/hawdl)。Swift 製で、外部パッケージ依存はゼロです。

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

root が要る操作をデーモンに閉じ込めてるので、GUI も CLI も sudo を要求しません。

技術的なところをいくつか。

- 監視は PF_ROUTE。`RTM_IFINFO` を購読するイベント駆動なので、AirDrop を開いた瞬間に落とし返します。ポーリングではない。保険で 30 秒ごとの reconcile も回してて、イベントを取りこぼしても最大 30 秒で復旧する
- インターフェース操作は ioctl。`ifconfig` をサブプロセスで叩かずに `SIOCGIFFLAGS` / `SIOCSIFFLAGS` で `IFF_UP` を直接いじってます。このマクロが `_IOWR()` 由来で Swift から import できないので、C シムを噛ませてる
- フラップ防止の指数バックオフ。10 秒以内に 5 回以上 up されたら 1s → 2s → 4s … と待つ。OS と無限に殴り合って CPU 焼かないための安全弁です
- 終了時は必ず up に戻す。デーモンが死んだのに AirDrop が使えない、という状態は作らない

```console
$ hawdl status
AWDL: held down  blocked=12  last=2025-09-07T10:23:45Z  daemon=0.1.0
```

この `blocked` が、Step 9 で名指しした保持元がどれだけ上げ直してるかの実測値になってます。調査で使った指標がそのままツールの表示になってるのは、ちょっと気に入ってる。

# 副作用

AWDL を止めてる間、以下は動かなくなります。

- AirDrop
- Handoff / ユニバーサルクリップボード
- Sidecar
- ユニバーサルコントロール
- 連係カメラ / 連係マークアップ
- AirPlay の一部(ピアツーピア接続)

必要になったら `hawdl release` かメニューバーから戻せます。デーモンを止めたときも自動で `up` に戻る。

`awdl0` の直接操作は Apple の公式サポート外なので、macOS のアップデートで挙動が変わる可能性はあります。あと制御ソケットのパーミッションが 0666 なので、同一マシンのローカルユーザーなら誰でもトグルできてしまう。共用 Mac では注意してください。

# インストール

```sh
brew tap taross-f/hawdl
brew install --HEAD taross-f/hawdl/hawdl
sudo brew services start hawdl
```

`brew services start` を忘れると何も起きません。CLI もメニューバーアプリも話し相手がいない状態になります。メニューバーアプリも手動で起動が必要。

```sh
open "$(brew --prefix hawdl)/HawdlBar.app"
```

# まとめ

「Mac だけ遅い」「電波は満点なのに会議が止まる」なら、まず `ifconfig awdl0` と `sudo wdutil info` の `Channel Sequence` を見てみるといいです。無線機が接続先のチャンネルにいなければ、それが答え。

とはいえ本来直るべきなのは cancel されない browse のほうで、hawdl は対症療法でしかない。Continuity 機能を日常的に使ってる人にはおすすめしません。AirDrop を捨ててレイテンシを買う、というトレードオフの道具です。

自分は捨てました。stddev 268ms が 0.851ms になるなら安い。
