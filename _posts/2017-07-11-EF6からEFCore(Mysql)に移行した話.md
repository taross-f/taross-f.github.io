---
tags: entityframeworkcore mysql 

---


## なぜ移行したか
ASP.NETでmysql + entityframework6のプロジェクトで、今後のASP.NET Core化を見据えたときにEntityFrameworkCoreに移行しておいたほうが辛くなさそう。EFCore自体はASP.NET上でも動くみたいなので、先に入れ替えておきたい、という動機。

また現状のコードがEF6のUnitOfWorkだったりDI的なところにがっつり依存しているので、ASP.NET Core化時に辛くなるのが目に見えた、+ 別のDBライブラリ使うのも厳しそうだった。

ので、やってみた。


ただし
[https://docs.microsoft.com/en-us/ef/efcore-and-ef6/porting/](https://docs.microsoft.com/en-us/ef/efcore-and-ef6/porting/)
には、よっぽどのことがない限りEF6からEFCoreに移行するのは薦めない、と書いてある…

featureがあったりなかったりの表がこちら。

[https://docs.microsoft.com/en-us/ef/efcore-and-ef6/features](https://docs.microsoft.com/en-us/ef/efcore-and-ef6/features)

とりあえず既に使ってて必須のものはEFCoreでも問題なさそうなことを確認


## 調査
* [Official](https://www.nuget.org/packages/MySql.Data.EntityFrameworkCore)
prereleaseなのがアレ。プロジェクト的にまだ時間はかかるので早くpreとれてほしい
* [Pomelo](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql)
活発そう。本家よりも早く実装が進んでる。


で、実際につかう環境で実際の使い方に近い形でベンチとってみた。

使いたいのはUnitOfWorkなので

* Select
* Insert -> SaveChanges
* Select -> Update -> SaveChanges
* Select -> Delete -> SaveChanges

のケースに関して実際の環境で測定してみた。

|EF6を100とした所要時間|EF6|Official|Pomelo|
|--|--|--|--|
|Select|100|72|126|
|Update|100|85|105|
|Insert|100|91|101|
|Delete|100|93|113|

速度面とOfficialのほうが安心という点もあり、そのうちpreが取れることを期待してOfficialを選択。

## 主なやったこと
* EntityFramework6を削除
* MySql.Data.EntityFrameworkCore のversion:7.0.7-m61をインストール。
* `using System.Data.Entity;` を `using Microsoft.EntityFrameworkCore;`にreplace。`using System.Data.Entity.*;`を削除
* scafoldのターゲットをEFCoreに修正して実行(詳しくは[こちら](https://taross-f.github.io/EntityFramework%E3%81%AEPOCO%E3%82%92Mysql%E3%81%AE%E3%83%86%E3%83%BC%E3%83%96%E3%83%AB%E3%81%8B%E3%82%89%E7%94%9F%E6%88%90%E3%81%99%E3%82%8B/))
* `IDbSet<>`いなくなってるので`DbSet<>`に置き換え
* `connectionString`をname指定できなくなっているので、connectionStringを直接渡せるように修正
* `DbContext.OnConfiguring()`で`UseMYSql()`することでDBを指定するように修正
* `DbContext.OnModelCreating()`で
* `Context.Database.Log`がなくなってるので消す
    * ちょっと調べた感じMysql側だとまだうまく生成されたSQLだけ吐き出せなそう。[ここ](https://docs.microsoft.com/en-us/ef/core/miscellaneous/logging#other-applications)と同じように実装するも、Categoryが`CommandExecuted`が一切来ない…
    * `SaveChanges().WriteLine()`がもしかしたら欲しい動作っぽいので、あとで試す
* `AddOrUpdate()`が無くなってて、調べると[こんな感じ](https://stackoverflow.com/questions/36208580/what-happened-to-addorupdate-in-ef-7)の拡張メソッド定義で実装するのがいいのでは、と書いてあるが中身は全件Selectしててやばすぎた。
    * Scafold部分を修正して各`DbSet`生成時に拡張メソッドも生成するようにした。生成のタイミングだとKey情報が取れるので処理が楽
* (本筋と違うけど)Ef6のときに`KeyAttribute`に依存していたコードがあったが、CompositeKeyの場合に`KeyAttribute`つけると正しく動作しなくなるため生成時に外れていて動作しなくなっていた。
    * `var ids = context.Model.FindEntityType(typeof(T)).FindPrimaryKey().Properties.Select(x => x.Name);` こんな感じでModel内にFluentで設定したKey情報が入ってるのでそれを利用するように実装を修正した
* UnitTestで使用していた[FakeDbSet](https://www.nuget.org/packages/FakeDbSet/)の代わりにテスト用に用意されている[InMemoryDatabase](https://stormpath.com/blog/tutorial-entity-framework-core-in-memory-database-asp-net-core)を使用するように修正。
    * `FakeDbSet`だとチェックされていなかった整合性チェックが入ったことによりコケるテストを修正(PK違反とかUnique制約など)
* scafoldで使っている[DbSchemaReader](https://github.com/martinjw/dbschemareader)の生成部分の以下を修正
    * `FLOAT`カラムが`BIGINT`で生成されていたので正しく修正
    * `TIMESTAMP`カラムで不要な`IsConcurrencyToken().ValueGeneratedOnAddOrUpdate()`が付与されていたので、生成時に削除するように修正。where句に含まれてしまって意図しない動きになっていた。

## まとめ
破壊的変更が多数あり、情報も少ない(公式のドキュメントが少ない)ため調査が大変だったり手探りだったり。が、全然移行できたので今後の不安がなくなって一安心でした。同じようなことを考えている方の助けになれば幸い