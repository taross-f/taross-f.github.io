# 定例会議 エンドレスランキング Worker

エンドレスモードの連続正解数(streak)をオンラインランキング化する Cloudflare Worker。
**スコア値は受け取らず、操作ログをサーバ側で再生・検証して再計算する**ことでチートを防ぐ。

## 仕組み(チート対策)

1. `GET /session` で seed と署名付きセッション(`sid`/`iat`/`sig`)を発行。ゲームの判定乱数は
   この seed の決定論PRNG(`src/endlessCore.js`)から先読み生成され、クライアントとサーバで一致する。
2. クライアントは **スコアではなく操作ログ**(各ラウンドの `leave`/`stay` と所要時間)を送る。
3. `POST /submit` で Worker が:
   - HMAC 署名を検証(seed 改ざん検出。鍵は Worker 内のみ)
   - `sid` の UNIQUE 制約で二重送信を遮断
   - seed 列に操作ログを突き合わせて streak を再計算(`replay`)
   - 信頼できるサーバ時刻(発行〜送信)と所要時間を突き合わせ、瞬間周回を拒否
   - 検証を通った streak だけを D1 に記録
4. `GET /top` で上位100件を返す。

> 注意: クライアント描画ゲームの性質上、「画面データを読んで自動回答するボット」は完全には防げない。
> 本実装が潰すのは(a)スコア捏造POSTと(b)瞬間周回。これが現実的なチートの大半。

## デプロイ手順

```bash
cd teirei-kaigi/worker
npm i -g wrangler        # 未導入なら
wrangler login

# 1) D1 を作成し、出力された database_id を wrangler.toml に貼る
wrangler d1 create teirei-kaigi-ranking

# 2) スキーマを適用(本番)
wrangler d1 execute teirei-kaigi-ranking --remote --file=./schema.sql

# 3) HMAC 署名鍵を登録(ランダムな長い文字列。例: openssl rand -hex 32)
wrangler secret put HMAC_SECRET

# 4) デプロイ
wrangler deploy
```

デプロイ後に表示される URL(例 `https://teirei-kaigi-ranking.<account>.workers.dev`)を、
ビルド時の環境変数 `VITE_RANKING_API` に設定する:

```bash
cd teirei-kaigi
VITE_RANKING_API="https://teirei-kaigi-ranking.<account>.workers.dev" npm run build
# dist/ の中身を apps/teirei-kaigi/ に差し替えてコミット
```

`VITE_RANKING_API` 未設定でビルドした場合、ランキングは無効化され、ゲームは
従来どおり自己ベストのみで動作する(後方互換)。

## ローカル確認

```bash
wrangler d1 execute teirei-kaigi-ranking --local --file=./schema.sql
wrangler dev   # http://localhost:8787/session などを叩ける
```
