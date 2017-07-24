---
tags: unity testrunner
---

Unityプロジェクトでprefabとかでアタッチされてるコンポーネントとかソースとかリソースがmissing referenceになることよくあって、Unity5.6から入ったTestRunnerのPlaymodeでのテストである程度判別できそうで、試してみた。

## TestRunnerのplaymodeについて

[公式](https://docs.unity3d.com/Manual/testing-editortestsrunner.html)

参考はこの動画  
[【Unite 2017 Tokyo】バグを殲滅！Unityにおける実践テスト手法](https://www.youtube.com/watch?v=vlwKZKeRIdE)

と[スライド](https://www.slideshare.net/UnityTechnologiesJapan/unite-2017-tokyounity)  

他もいろいろな人が試しているのでちょっとググれば出てくるので省略

## やりたいこと

* 本格的なUnitTestではなくてとりあえずmissing referenceを見つけたい
* Sceneをロードしないとわからない
* missing referenceになってるとき、Warnレベルでログがでる

なのでログをどうAssertするかって話になる

でも用意されてるメソッドは以下の感じ

```csharp
        // これだと特定のログが出ていることをAssertするので
        // ログが出ているとAssert:OKになっちゃう
		LogAssert.Expect(LogType.Warning, "missing");

        // これだと一切のログが出ていないことをチェックするしかない
		LogAssert.NoUnexpectedReceived();
```


## やれそうなこと

以下のように`[SetUp]`で`LogEnabled`をfalseにすることで`Warning`以上しか出ないようにして、`LogAssert.NoUnexpectedReceived();`ってうやるのがよさそう。もちろん正常動作だったりSceneをLoadしただけでWarn以上のログが出ちゃう場合は引っかかってしまう

```csharp
using UnityEngine;
using UnityEngine.TestTools;
using NUnit.Framework;
using System.Collections;
using UnityEngine.SceneManagement;
using System.Text.RegularExpressions;

public class PlayModeTest {

	[SetUp]
	public void SetUp()
	{
		Debug.logger.logEnabled = false;
	}
	[UnityTest]
	public IEnumerator NewPlayModeTestWithEnumeratorPasses() {
		SceneManager.LoadScene("Test1", LoadSceneMode.Additive);
		yield return null;
		LogAssert.NoUnexpectedReceived();
	}
}

```

[github](https://github.com/taross-f/playmodetest)に`CubeController.cs`の名前を変更して擬似的にmissingにすると試せます。Unity5.6.2p2/macOS Sierraで確認

## まとめ

上記のノリでCIで全Scene/必要なPrefab分のテストを回せばmissing referenceに気づけそうで助かりそう。  
欲を言えば`Unexpected(LogType, Regex)`みたいなメソッドがあるともっとストレートに書けるので欲しい
