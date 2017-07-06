---
tags: mysql entityframework
---

要件としてMysql+EntityFrameworkで既存のテーブルからPOCOをGenerateしたくなった。

EFCoreだとScafoldが入っててそもそもEFCoreだけでできたり、SQLServerだったら(ReversePOCOGenerator)[https://marketplace.visualstudio.com/items?itemName=SimonHughes.EntityFrameworkReversePOCOGenerator]のほうがスタンダードなのかも。

ということでMysqlだとどれが正解なんだろ、と探したのでメモ

## DBSchemaReader
(これ)[https://dbschemareader.codeplex.com/]を使う

* Target選ぶと、EF6でもEFCoreでも適切にPOCOをGenerateしてくれる。
* KeyAttributeとかも必要に応じてつけてくれるし、不要だったり動作がおかしくなる場合つけないでくれる。
* FluentAPIでのMapping側も合わせて生成

EFCoreだと複数PKの場合にKeyAttributeがつくとおかしくなるけど、それも対応してくれる(CompositeKeyの場合KeyAttributeをつけない)

### 注意
ただしそのままだとTimestampが自動的に`IsConcurrencyToken()`になるようで、使用側で`AddOrUpdate()`してたりするとWhere句に勝手にTimestampのカラムが入ってきて死にます。
そういうコードの場合は中身の書き換えが必要そう(書き換えた)

あとはContextの単位もカスタマイズしたかったので、外部から渡せる

中身は素朴…本家のHPにもコードベース古いよって書いてある
