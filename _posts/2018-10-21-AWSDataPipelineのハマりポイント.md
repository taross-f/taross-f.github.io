---
tags: AWS DataPipeline
---

最近AWS Data Pipelineを触っていろいろハマるポイントがあったので、同じ気持ちになる人を減らすためにも残してみる

# そもそもAWS Data Pipeline とは

[AWS Data Pipeline](https://docs.aws.amazon.com/ja_jp/datapipeline/latest/DeveloperGuide/what-is-datapipeline.html)

> AWS Data Pipeline は、データの移動と変換を自動化するために使用できるウェブサービスです

とあります。
ノードベースのUIで依存関係を持たせてジョブを実行でき、またデータ処理用のDBに対するSQLをそのまま書けたり、適切にS3にファイルを吐いたり読んだりできます。スケジュールして実行することもできます

例えば元データからSQLでいい感じに変形しながら抜いてS3に吐き出し、投入先にCOPYで突っ込む、みたいな形で使うといい感じです

# ハマったポイント

## Parametersはコンソールから追加・削除できない
各ノードで使用できるパラメータをParametersとして設定することができますが、コンソールから項目を追加できません。
新たに追加する場合は、Pipeline作成時のJSONに追記する必要があります。
以下はとあるテンプレートほとんどそのままのJSONです。parametersの要素として入れます。

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
    },
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

JSONを読ませてから`Edit in Architect`すると画面から値を変更できます。


## 1回でもActivateしたあとの制限
以下引っかかりました

* 既存ノードが消せない
* 既存ノードの一部の属性が変更できない(NameやTypeなど)
* Scheduleをあとから追加/削除できない

特に試行錯誤中などで、直したり消したりってしたくなると思うんですができません。

対応としては、基本的にJSONを変更するたびExportしておいて、修正する場合はそれを元に新たにPipelineを作り直す形かなと思われます。
また一度Pipelineを動作させたあとすぐに起動できない(Resourceの同時実行制限と言われます)ので、繰り返し実行したいときもJSONから再度Pipelineを作り直すのがよさそうです。

scheduleで一度でも実行していると、手動でActivateしてもscheduleされた時間にしか動きません。そのため既存のスケジュールされているPipelineを再実行したい、といったときにも別のPipelineを作り直す必要があります。逆もしかりであとからscheduleノードを追加することができません。



## 処理の流れがわかりづらい(個人的見解です)

Pipelineのノードとして、実際に処理を行うノード以外にもデータ投入元/先のノードだったり、SNSのノードだったり様々なタイプのノードが表示されます
が、じつは処理としては水色のAcitivityノードだけです。

基本的にはルートから生えている水色のActivityだけを追うと、処理の流れが見えてくると思います。

またノードの配置は自動です。流れを見やすくしたくても、ノードの位置修正はできません。ノードが増えてきたら、もうほぼ読めなくなると思って間違いない


# まとめ

結構癖あるので触り始めはなにこれ…ってなりがちですが、意味がわかればまあなんとかなる。そしてSQLサクッと書けたりするのは便利ですね





