---
tags: Docker
title: Dockerイメージでnpm installしたときdocker-composeのvolumesで上書きしない
---

`docker run` で動くけど `docker-compose run` で動かないときはこれがあやしい、という小ネタです

具体的な例でいうと、Dockerfile で `RUN npm install` したイメージを docker-compose で使うとき、volumes で開発ディレクトリをマウントするんだけど、その下に DockerImage 内の `node_modules/` ディレクトリを残したい、というときのやり方です

## 対応

[リファレンス](http://docs.docker.jp/compose/compose-file.html#volumes-volume-driver)

1. volumes でホストの開発中のコードを含むディレクトリを指定(よくやる)
1. volumes で DockerImage 内のコードでコンテナ内で残したいディレクトリを指定

こんな感じの Dockerfile

```
FROM node
WORKDIR /app
COPY . /app
RUN npm install http-server -g
RUN npm install && npm run build
CMD http-server ./dist
```

ビルドした Image のディレクトリの状態

```
/app/
  - dist/ # build result
  - node_modules/ # dependency
  - その他動かしたいコード
```

うまくいかない docker-compose.yml

```
version: "3"
services:
  hoge:
    build: .
    volumes:
      - .:/app
```

これだと `docker-compose up` したコンテナ内だと`node_modules/`と`dist/`が無い状態になる(ホスト側で npm install, npm build してなければ)

なので以下のようにしてあげるとホスト側のディレクトリがマウントされた上で、その下に Image 内のディレクトリがマウントされて良い感じです

```
version: "3"
services:
  hoge:
    build: .
    volumes:
      - .:/app
      - /app/node_modules  # ここ
      - /app/dist # ここ
```

### おまけ

上のように構成しておくと docker-compose で環境作るときに、初回だけコンテナ入って `npm install` してね!! 的なのが排除されて良さそうですね

## 参考

[Docker での Node アプリ構築で学んだこと](https://postd.cc/lessons-building-node-app-docker/)
