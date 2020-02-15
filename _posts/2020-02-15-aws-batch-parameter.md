---
tags: AWS Batch CloudWatch
title: CloudWatch EventsからAWS BatchにJSONでParameterを渡す方法
---

表題のとおり、CloudWatch Events から Batch を呼びたい、Trigger ごとにパラメータを変えたい、そのためにジョブ定義を複数作るまでもない、みたいなときの小ネタです。

Lambda とかだと直感的に渡した JSON が起動する Function の `event` に渡ってくるんですが、Batch だとそんなにすんなりいかなくてちょっと困った記録です。

ちなみに AWS Batch とは [初めて触る AWS Batch](https://dev.classmethod.jp/cloud/aws/aws-batch-overview/) を見ていただければ。クラメソさんのブログにはいつもお世話になってます

# やりかた

## Batch の準備

まずはジョブ定義とコンピューティング環境を作ります。 [リファレンス](https://docs.aws.amazon.com/ja_jp/batch/latest/userguide/Batch_GetStarted.html)

簡単のため、ただ echo するだけのジョブ定義を作ってみます。


コマンドに `echo helloworld` といれます。

![echo_helloworld](https://raw.githubusercontent.com/taross-f/taross-f.github.io/master/images/2020-02-15%2013.00.31.png)

ジョブ定義からジョブの送信して完了後ログを確認すると


```
helloworld
```
![hello_world_log](https://raw.githubusercontent.com/taross-f/taross-f.github.io/master/images/2020-02-15%2013.03.01.png)

となっていることが確認できます。とりあえず起動自体は OK ですね。

## Parameter 使用するジョブ定義に変更

次にジョブ定義を Parameter 参照する形に変更します

パラメータに `message : default` の項目を追加しつつ、コマンドを `echo Ref::message` とします。`Ref::XXX` で起動時にパラメータを `XXX` で渡すと置換して実行してくれます

![param](https://raw.githubusercontent.com/taross-f/taross-f.github.io/master/images/2020-02-15%2013.08.24.png)


そのままジョブ定義からジョブの送信して完了後ログを確認すると

```
default
```

となっていることが確認できます。

## CloudWatch Events からパラメータを渡して起動

本題です。

↑ で作ったジョブ定義に対して CloudWatch Events のルールを作ります。

ターゲットを `Batchジョブのキュー` を選択して、入力の設定から `定数(JSONテキスト)` を選択します。そこに以下のように設定します

`{"Parameters": {"message": "hello hello hello how low"}}`

`Parameters` の中に渡す必要があります。Keyは大文字始まりでもOKです。

![cloudwatch](https://raw.githubusercontent.com/taross-f/taross-f.github.io/master/images/2020-02-15%2013.51.33.png)

これで Trigger を適切に設定して起動してあげると、完了後ログは以下のようになります。

```
hello hello hello how low
```

![how_low](https://raw.githubusercontent.com/taross-f/taross-f.github.io/master/images/2020-02-15%2013.51.19.png)

パラメータ無事うけとれました

# まとめ

これで定時バッチなどで環境変数違いで複数ジョブ定義を作らなくても、パラメータで切り替えるようにできるようになりました。
この辺を CloudFormation のテンプレートにして運用していたりします(それも結構ハマったんですがまた別の話)
