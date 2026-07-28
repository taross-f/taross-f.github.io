---
layout: page
title: Apps
permalink: /apps/
---

{% assign github_owner = "taross-f" %}
{% assign github_repos = "deco-slack,quotto,google_hjkl,yt2mp3" | split: "," %}

<div class="github-repos">
{% for repo in github_repos %}
  <a
    class="repo-card"
    href="https://github.com/{{ github_owner }}/{{ repo }}"
    target="_blank"
    rel="noopener"
    data-repo="{{ github_owner }}/{{ repo }}"
  >
    <span class="repo-card__head">
      <svg class="repo-card__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>
      <span class="repo-card__title">
        <span class="repo-card__owner">{{ github_owner }}/</span><span class="repo-card__name">{{ repo }}</span>
      </span>
    </span>
    <span class="repo-card__description" data-role="description" hidden></span>
    <span class="repo-card__meta">
      <span class="repo-card__lang" data-role="language" hidden>
        <span class="repo-card__lang-dot"></span><span data-role="language-name"></span>
      </span>
      <span class="repo-card__stat" data-role="stars" hidden data-i18n-title="apps.github.stars" title="Stars">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>
        <span data-role="count"></span>
      </span>
      <span class="repo-card__stat" data-role="forks" hidden data-i18n-title="apps.github.forks" title="Forks">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>
        <span data-role="count"></span>
      </span>
    </span>
  </a>
{% endfor %}
</div>

## <span data-i18n="apps.text_tools">📝 テキストツール</span>

### [<span data-i18n="apps.character_counter.title">文字数カウンター</span>](/character-counter/)
<span data-i18n="apps.character_counter.description">テキストの文字数、単語数、行数をカウントします。</span>

### [<span data-i18n="apps.json_formatter.title">JSON整形ツール</span>](/json-formatter/)
<span data-i18n="apps.json_formatter.description">JSONデータを整形・検証します。</span>

### [<span data-i18n="apps.jwt_analyzer.title">JWT解析ツール</span>](/jwt-analyzer/)
<span data-i18n="apps.jwt_analyzer.description">JWT（JSON Web Token）を解析します。</span>

## <span data-i18n="apps.conversion_tools">🔄 変換ツール</span>

### [<span data-i18n="apps.base64_tool.title">Base64エンコーダー/デコーダー</span>](/base64-tool/)
<span data-i18n="apps.base64_tool.description">Base64形式でテキストをエンコード・デコードします。</span>

### [<span data-i18n="apps.url_encoder.title">URLエンコード/デコード</span>](/url-encoder/)
<span data-i18n="apps.url_encoder.description">URL用のパーセントエンコーディングを相互変換します。</span>

### [<span data-i18n="apps.unicode_converter.title">Unicode変換ツール</span>](/unicode-converter/)
<span data-i18n="apps.unicode_converter.description">テキストとUnicodeエスケープシーケンスを相互変換します。</span>

### [<span data-i18n="apps.pfx_pem_converter.title">PFX/PEM変換ツール</span>](/pfx-pem-converter/)
<span data-i18n="apps.pfx_pem_converter.description">証明書ファイルのPFX(P12)とPEM形式を相互変換します。</span>

## <span data-i18n="apps.dev_tools">🔧 開発者ツール</span>

### [<span data-i18n="apps.css_compressor.title">CSS圧縮ツール</span>](/css-compressor/)
<span data-i18n="apps.css_compressor.description">CSSコードを圧縮してファイルサイズを削減します。</span>

### [<span data-i18n="apps.uuid_generator.title">UUID生成ツール</span>](/uuid-generator/)
<span data-i18n="apps.uuid_generator.description">各種UUID（v1、v4等）を生成します。</span>

### [<span data-i18n="apps.ogp_checker.title">OGP確認ツール</span>](/ogp-checker/)
<span data-i18n="apps.ogp_checker.description">WebページのOGPメタタグを確認・検証します。</span>

### [<span data-i18n="apps.timestamp_converter.title">Unix Timestamp変換ツール</span>](/timestamp-converter/)
<span data-i18n="apps.timestamp_converter.description">Unix Timestampと日時を相互変換します。</span>

## <span data-i18n="apps.design_tools">🎨 デザインツール</span>

### [<span data-i18n="apps.color_palette.title">カラーパレット生成ツール</span>](/color-palette/)
<span data-i18n="apps.color_palette.description">デザインプロジェクト用の美しいカラーパレットを生成します。</span>

### [<span data-i18n="apps.qr_generator.title">QRコード生成ツール</span>](/qr-generator/)
<span data-i18n="apps.qr_generator.description">テキストやURLからQRコードを生成します。</span>

### [<span data-i18n="apps.quote_generator.title">引用画像生成ツール</span>](/quote-generator/)
<span data-i18n="apps.quote_generator.description">ソーシャルメディア用の美しい引用画像を作成します。</span>

## <span data-i18n="apps.games">🎮 ゲーム</span>

### [<span data-i18n="apps.teirei_kaigi.title">定例会議</span>](/apps/teirei-kaigi/)
<span data-i18n="apps.teirei_kaigi.description">8番出口ライクなビデオ会議異変探しゲーム。異変を感じたら退出、なければ最後まで残れ。</span>

<script src="{{ site.baseurl }}/assets/js/github-repo-cards.js" defer></script>

