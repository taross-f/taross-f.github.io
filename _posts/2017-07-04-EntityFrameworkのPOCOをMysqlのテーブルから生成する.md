---
tags: MySQL EntityFramework
title: EntityFrameworkのPOCOをMySQLのテーブルから生成する
---

要件として Mysql+EntityFramework で既存のテーブルから POCO(Plain Old CLR Object) を Generate したくなった。

EFCore だと Scafold が入っててそもそも EFCore だけでできたり、SQLServer だったら[ReversePOCOGenerator](https://marketplace.visualstudio.com/items?itemName=SimonHughes.EntityFrameworkReversePOCOGenerator)のほうがスタンダードなのかも。

ということで Mysql だとどれが正解なんだろ、と探したのでメモ

## DBSchemaReader

[これ](https://dbschemareader.codeplex.com/)を使う

- Target 選ぶと、EF6 でも EFCore でも適切に POCO を Generate してくれる。
- KeyAttribute とかも必要に応じてつけてくれるし、不要だったり動作がおかしくなる場合つけないでくれる。
- FluentAPI での Mapping 側も合わせて生成

EFCore だと複数 PK の場合に KeyAttribute がつくとおかしくなるけど、それも対応してくれる(CompositeKey の場合 KeyAttribute をつけない)

### 注意

ただしそのままだと`Timestamp`のカラムが自動的に`IsConcurrencyToken()`になるようで、使用側で`AddOrUpdate()`してたりすると Where 句に勝手に入ってきて死にます。
使用側でそういうコードの場合(`OptimisticConcurrencyException`が出るとき)は中身の書き換えが必要そう(そういうコードだったので書き換えて使ってます)

中身は素朴…本家の HP にもコードベース古いよって書いてありますね
