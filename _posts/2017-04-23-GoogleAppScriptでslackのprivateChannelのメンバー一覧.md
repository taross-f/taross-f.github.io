---
tags: googleappscript

---


GASでprivate channelのメンバー一覧取りたいってときありますよね。抽選したりとか。

ただ単純な`groups.info`だとdeletedな人いたりIDだけだったりでアレなので`users.list`と突き合わせる形に。


## 使ったライブラリ
https://script.google.com/macros/library/versions/d/1on93YOYfSmV92R5q59NpKmsyWIQD8qnoLYk-gkQBI92C58SPyA2x1-bq
ライブラリ->`M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO`
で追加。ただし`groups.info`がないっぽいです。コントリビュート可能ですね!?


## コード

```js

var slackToken = "TOKEN";
var slackChannelId = "CHANNELID";
var slackEndpoint = "APIENDPOINT";


function _getSlackMembers() {
  // SlackAppになぜかgroups.infoがない…
  var r = UrlFetchApp.fetch(slackEndpoint + "groups.info?token=" + slackToken + "&channel=" + slackChannelId);
  var groupMembers = JSON.parse(r).group.members;

  var slackApp = SlackApp.create(slackToken);
  var allMembers = slackApp.usersList().members;    

  var realMembers = allMembers.filter(function(e,i,array) {
    if (e.deleted) return false;
    return groupMembers.indexOf(e.id) != -1;
  });
  
  return realMembers;
}

```

戻り値はこれのarrayです
https://api.slack.com/types/user
