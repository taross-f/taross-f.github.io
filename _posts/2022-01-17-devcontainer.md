---
tags: VSCode Docker
title: docker-composeからdevcontainerをつくる
---

表題の通りです。今回対応内容結構めんどくさかったのでGistに書いておくかーって思ったらすでに自分のGistに書いてあったので、blogにも書くことにします


# docker-compose.ymlがある状態のdevcontainer対応

- コマンドパレットで `Remote-Container: Add Development Container Configuration Files...` > `From 'docker-compose.yml'` (ここは環境依存) で該当のymlを選択 > 立ち上げたいserviceを選択
   - ここ昔と文言が変わった気がして同じことを調べ直すはめになった…
- name をわかりやすく修正する


以上

どの環境でも使うExtensionは `Default Extensions` で設定しておくとよい

すくなくとも現時点では以下のような設定にしている
```
"remote.containers.defaultExtensions": [
  "eamodio.gitlens",
  "github.copilot",
  "oderwat.indent-rainbow"
]
```

