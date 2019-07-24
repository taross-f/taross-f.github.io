---
tags: Python docker
title: DockerでUbuntu16.04のimageにpython3.7をaptで入れる
---

表題の通りの小ネタメモです。

(OpenVINO を動かしたいときなどに) Docker の ubuntu16.04 イメージに Python3.7 を入れたい。でググると、18 系だと結構すんなり入るけど 16 系だとソース落としてビルドして~ってのばかりヒットするので、apt-get で入れるのを残してみた。

# Dokcerfile

```Dockerfile
FROM ubuntu:16.04
RUN apt-get update -y && apt-get install -y software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa && apt-get update -y  && apt-get install -y python3.7
```

最小限になってるといいな。

## 確認

```
$ docker run  eec8157144ee python3.7 --version
Python 3.7.4
```

OK です!
