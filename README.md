# blog.taross-f.dev

[![CI](https://github.com/taross-f/taross-f.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/taross-f/taross-f.github.io/actions/workflows/ci.yml)

個人技術ブログ + Webツール / ゲーム集。GitHub Pages 上で Jekyll により配信しています。

🔗 https://blog.taross-f.dev/

## 構成

| パス | 内容 |
| --- | --- |
| `_posts/` | ブログ記事（Markdown + YAML front matter） |
| `_layouts/` | レイアウト（default / post / page） |
| `_includes/` | 部品テンプレート |
| `_sass/`, `style.scss` | スタイル（SCSS） |
| `_data/strings.yml` | 多言語（日本語 / 英語）の文言定義 |
| `_config.yml` | サイト設定・プラグイン・除外設定 |
| `apps.md` | Apps ページ（`/apps/`） |
| `<tool-name>/` | 各 Web ツール（静的 HTML、ルート直下に配置） |
| `teirei-kaigi/` | ゲーム「定例会議」のソース（要ビルド、Jekyll 出力からは除外） |
| `apps/teirei-kaigi/` | 上記のビルド成果物（`/apps/teirei-kaigi/` で配信） |

## ローカル開発

Jekyll サイト本体:

```bash
bundle install          # 依存インストール
bundle exec jekyll serve # ローカルサーバー
bundle exec jekyll build # ビルド
```

テスト（Playwright）:

```bash
npm install
npm test
```

## Apps

`/apps/` 配下から各ツールへリンクしています。

### 静的ツール

文字数カウンター / JSON 整形 / JWT 解析 / Base64 / URL エンコード / Unicode 変換 /
PFX・PEM 変換 / CSS 圧縮 / UUID 生成 / OGP 確認 / Unix Timestamp 変換 /
カラーパレット / QR コード / 引用画像生成。

いずれも `<tool-name>/index.html` の単一静的ファイルで、ビルド不要です。

### ビルドが必要なアプリ

**定例会議**（`/apps/teirei-kaigi/`）は Vite + React 製のゲームです。
ソースは `teirei-kaigi/` にあり、ビルド成果物を `apps/teirei-kaigi/` にコミットして配信します。

```bash
cd teirei-kaigi
npm install
npm run build              # dist/ を生成
cp -r dist/* ../apps/teirei-kaigi/   # 成果物を配信ディレクトリへ反映
```

`vite.config.js` の `base` は `/apps/teirei-kaigi/` を設定済みです。
`apps/teirei-kaigi/` のファイルは手で編集せず、必ず再ビルドして更新してください。

## デプロイ

`master` ブランチへの push で GitHub Pages に自動デプロイされます。
独自ドメイン（`blog.taross-f.dev`）は `CNAME` で設定しています。
