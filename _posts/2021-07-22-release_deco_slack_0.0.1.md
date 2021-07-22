---
tags: Python
title: メソッドの開始終了を通知するパッケージをリリースした
---

# deco-slackをリリースしました

[deco-slack](https://pypi.org/project/deco-slack/) というPythonのパッケージをリリースしました。なんぞや、というとメソッドにデコレータをくっつけると、そのメソッドの開始、終了、エラーをSlackに通知してくれるというものです。それだけです

もともと社内で似たようなものを作って使っていたんですが、いろんなバッチとかにコピペしまくっていてこれならパッケージにしたほうが楽そうなのと、依存していたSlackSDKがv1系でLegacyになっちゃってるので、バージョンアップして書き直しました

# 使い方

`pip install deco-slack` 

でインストールできます

Slack関連のTOKENやら設定が必要です

SlackBotを作成して、`chat:write.public` scopeをつけたトークンを発行して、 `SLACK_TOKEN` の環境変数に設定します。通知を飛ばしたいChannel名を #なしで `SLACK_CHANNEL` の環境変数に設定します

そこまで終わればあとはdecoratorで start, success, error の引数にdictで [attachments](https://api.slack.com/reference/messaging/attachments) を渡します。そのままSlackのAPIに渡されます。使うイメージとしてはバッチの大元のメソッドをデコレートしておくとその通知が楽にできる感じです
Legacyと書かれてるんですが、layout block ほど凝ったことをやる想定じゃなかったので…

不要な引数は渡さなければ無視されます。なので例えばエラーのときだけ教えてほしい、とかsuccessとerrorだけほしい、とかも対応可能です

attachmentもたくさんパラメータあるんですが、少なくとも例に書いたパラメータ程度でも通知としては使えると思います

# 例

```
from deco_slack import deco_slack


@deco_slack(
    # These parameters are all optional
    start={
        "text": "start text",
        "title": 'start',
        "color": "good"
    },
    success={
        "text": "success text",
        "title": 'success',
        "color": "good"
    },
    error={
        "title": 'error',
        "color": "danger",
        "stacktrace": True # Set True if you need stacktrace in a notification
    },
)
def test1():
  print('test1')


@deco_slack(
    success={
        "text": "success text",
        "title": 'success',
        "color": "good"
    },
    error={
        "title": 'error',
        "color": "danger",
        "stacktrace": True
    },
)
def error1():
  raise ValueError('error occured.')
```

結果はこんな感じになります

![結果](https://user-images.githubusercontent.com/1595823/126581297-83a2bf11-6c48-4057-b70e-ecccd3bdbb47.png)

# TODO
successのときに処理結果をもとに情報を表示したいですね。例えば正常終了件数、みたいな。デコレータだと扱いが難しくて、メソッドを渡すことで実現できそうなんですが未実装です


# リポジトリ

<a href="https://github.com/taross-f/deco-slack"><img src="https://github-link-card.s3.ap-northeast-1.amazonaws.com/taross-f/deco-slack.png" width="460px"></a>

