---
tags: AWS DataPipeline
title: AWS DataPipelineのハマりポイント
---

最近 AWS Data Pipeline を触っていろいろハマるポイントがあったので、同じ気持ちになる人を減らすためにも残してみる

# そもそも AWS Data Pipeline とは

[AWS Data Pipeline](https://docs.aws.amazon.com/ja_jp/datapipeline/latest/DeveloperGuide/what-is-datapipeline.html)

> AWS Data Pipeline は、データの移動と変換を自動化するために使用できるウェブサービスです

とあります。
ノードベースの UI で依存関係を持たせてジョブを実行でき、またデータ処理用の DB に対する SQL をそのまま書けたり、適切に S3 にファイルを吐いたり読んだりできます。スケジュールして実行することもできます

例えば元データから SQL でいい感じに変形しながら抜いて S3 に吐き出し、投入先に COPY で突っ込む、みたいな形で使うといい感じです

# ハマったポイント

## Parameters はコンソールから追加・削除できない

各ノードで使用できるパラメータを Parameters として設定することができますが、コンソールから項目を追加できません。
新たに追加する場合は、Pipeline 作成時の JSON に追記する必要があります。
以下はとあるテンプレートほとんどそのままの JSON です。parameters の要素として入れます。

```json
{
  "objects": [
    {
      "*password": "#{*myRDSPassword}",
      "name": "rds_mysql",
      "jdbcProperties": "allowMultiQueries=true",
      "id": "rds_mysql",
      "type": "RdsDatabase",
      "rdsInstanceId": "#{myRDSInstanceId}",
      "username": "#{myRDSUsername}"
    },
    {
      "database": {
        "ref": "rds_mysql"
      },
      "name": "SourceRDSTable",
      "id": "SourceRDSTable",
      "type": "SqlDataNode",
      "table": "#{myRDSTableName}",
      "selectQuery": "select * from #{table}"
    },
    {
      "instanceType": "#{myEC2InstanceType}",
      "name": "Ec2Instance",
      "actionOnTaskFailure": "terminate",
      "securityGroups": "#{myEc2RdsSecurityGrps}",
      "id": "Ec2Instance",
      "type": "Ec2Resource",
      "terminateAfter": "2 Hours"
    }
  ],
  //  **ここにいれる**
  "parameters": [
    {
      "description": "RDS MySQL password",
      "id": "*myRDSPassword",
      "type": "String"
    },
    {
      "description": "Output S3 folder",
      "id": "myOutputS3Loc",
      "type": "AWS::S3::ObjectKey"
    }
  ]
}
```

JSON を読ませてから`Edit in Architect`すると画面から値を変更できます。

## 1 回でも Activate したあとの制限

以下引っかかりました

- 既存ノードが消せない
- 既存ノードの一部の属性が変更できない(Name や Type など)
- Schedule をあとから追加/削除できない

特に試行錯誤中などで、直したり消したりってしたくなると思うんですができません。

対応としては、基本的に JSON を変更するたび Export しておいて、修正する場合はそれを元に新たに Pipeline を作り直す形かなと思われます。
また一度 Pipeline を動作させたあとすぐに起動できない(Resource の同時実行制限と言われます)ので、繰り返し実行したいときも JSON から再度 Pipeline を作り直すのがよさそうです。

schedule で一度でも実行していると、手動で Activate しても schedule された時間にしか動きません。そのため既存のスケジュールされている Pipeline を再実行したい、といったときにも別の Pipeline を作り直す必要があります。逆もしかりであとから schedule ノードを追加することができません。

## 処理の流れがわかりづらい(個人的見解です)

Pipeline の  ノードとして、実際に処理を行うノード以外にもデータ投入元/先のノードだったり、SNS のノードだったり様々なタイプのノードが表示されます
が、じつは処理としては水色の Acitivity ノードだけです。

基本的にはルートから生えている水色の Activity だけを追うと、処理の流れが見えてくると思います。

またノードの配置は自動です。流れを見やすくしたくても、ノードの位置修正はできません。ノードが増えてきたら、もうほぼ読めなくなると思って間違いない

# まとめ

結構癖あるので触り始めはなにこれ…ってなりがちですが、意味がわかればまあなんとかなる。そして SQL サクッと書けたりするのは便利ですね
