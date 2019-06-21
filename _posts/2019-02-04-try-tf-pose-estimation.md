---
tags: python
title: tf-pose-estimation動かしてみた
---

今自分のいる会社が人体認識顔識別な技術を使っていて、最近のOSSで自分でも試せそうなものないかなと思って調べてみた。

# tf-pose-estimation

[![tf-pose-estimation](https://github-link-card.s3.ap-northeast-1.amazonaws.com/ildoonet/tf-pose-estimation.png)](https://github.com/ildoonet/tf-pose-estimation)

人体認識とかスケルトン取れたりするみたい

# 環境
* PC: MacBook Pro (2016)
* OS: mac OS Mojave
* CPU: 2 GHz Intel Core i5
* Memory: 8 GB 1867 MHz LPDDR3

# インストール
さくっと動かすだけなので環境分離とか一切してないです。何番煎じかわからないけど。

```sh
$ git clone https://www.github.com/ildoonet/tf-pose-estimation
$ cd tf-openpose
$ brew install pyenv
$ pyenv local 3.6.5 # 3.7だとtensorflowが入らない
$ pip install -r requirements.txt
$ pip install tensorflow
$ pip install matplotlib
$ pip install opencv-python # この辺ドキュメントに書いてない?
$ brew install swig # この辺ドキュメントに書いてない?
$ cd tf_pose/pafprocess/
$ swig -python -c++ pafprocess.i
$ cd ../../
$ python setup.py build_ext --inplace

# 画像でテスト
$ python run.py --model=mobilenet_thin --resize=432x368 --image=./images/p1.jpg
# webcamでテスト
$ python run_webcam.py --model=mobilenet_thin --resize=432x368 --camera=0

```

# まとめ
動いた!  
この最低スペックのmacbook proでもwebcamで動かして1.5FPSくらい  
テストで動かしてもスケルトンだったり顔の要素が表示されて面白い  
[次は顔認識系を試します](https://blog.taross-f.dev/try-facenet/)

<iframe src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=42&l=ur1&category=echo&banner=0XJ2NCN6TEWJHJHZEH02&f=ifr&linkID=514cf9a39a9a2a60f4249e4a53231154&t=tarossf-22&tracking_id=tarossf-22" width="234" height="60" scrolling="no" border="0" marginwidth="0" align="center" style="border:none;" frameborder="0"></iframe>
