---
tags: python
title: facenet動かしてみた
---

今自分のいる会社が人体認識顔識別な技術を使っていて、最近の OSS で自分でも試せそうなものないかなと思って調べてみた part2

part1 は[こちら](https://blog.taross-f.dev/try-tf-pose-estimation/)

# facenet

[![facenet](https://github-link-card.s3.ap-northeast-1.amazonaws.com/davidsandberg/facenet.png)](https://github.com/davidsandberg/facenet)

顔の特徴量を抜き出して比較できる、それぞれの顔で学習しなくても特徴のベクトルの距離で同一人物かどうかを検出できるみたい  
[OpenFace](https://github.com/cmusatyalab/openface)に inspire されてると

# 環境

- PC: MacBook Pro (2016)
- OS: mac OS Mojave
- CPU: 2 GHz Intel Core i5
- Memory: 8 GB 1867 MHz LPDDR3

# インストール

# まとめ

動いた!  
学習なしでもある程度同一人物かどうかわかって素敵ですねー
