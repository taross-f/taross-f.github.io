---
tags: openvino python
title: OpenVINO 動かしてみた
---

NVIDIA には負けない、という Intel の本気が見れる [OpenVINO](https://docs.openvinotoolkit.org/) について書きます

# OpenVINO とは

インテルが NVIDIA の GPU 一強に待ったをかけるつもりかどうかはわかりませんが、インテルのハードウェア上でのみ動作する推論を行う SDK です。インテルのハードウェアに特化してチューニングされているようで、速度が結構でます。

ゲーミングじゃない PC についてくるような Intel 製の GPU も推論に使うことができて、よくある OSS などの動作と比べてかなり軽快です。安価なエッジでの推論に特に向いていそうです。

学習はできませんが、様々なバックエンドでの学習済みモデルを OpenVINO で扱える形にコンバートるすことができ、既存の資産をそのまま使うことができます。またインテル自身多様な学習済みモデルを提供してくれていて、よく DeepLearning の文脈で出てくるようなモデルは使いやすい状態になっていたりしますね。

# インストール

普通のインストールは公式のリファレンスでちゃんと書いてあるので、今回は Web API として docker で動かすケースをやってみる。

Docker 上で動かすところまでは linux 限定だけど[リファレンス](https://docs.openvinotoolkit.org/latest/_docs_install_guides_installing_openvino_docker_linux.html)がある。Mac でも docker である程度はいけるんだけど、Mac 上のコンテナからホストの Webcam とか X とか GPU にアクセスする方法が非常にめんどくさそう、というかできなそう?

WebAPI としてモデルにデータを食わせて結果を取るだけだったら Docker でいけますね

# サンプル実行
