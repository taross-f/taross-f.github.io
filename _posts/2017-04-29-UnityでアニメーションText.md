---
tags: Unity DOTween

---

UnityのTextの値を変化させるときにアニメーションさせたい、ってなったのでつくった。DOTweenつかうと簡単ですねー

[gist](https://gist.github.com/taross-f/71bb39ce89840c3f1df3051446ee72f6)

```csharp
using DG.Tweening;
using UnityEngine;
using UnityEngine.UI;

public class AnimationText : MonoBehaviour
{
    Text _text;

    void Awake() { _text = gameObject.GetComponent<Text>(); }

    public void StartCountAnimation(int to, float duration = 0.4f)
    {
        ulong _;
        if (!ulong.TryParse(_text.text, out _)) StartFadeAnimation(to.ToString(), duration);

        DOTween.To(
            () => ulong.Parse(_text.text),
            x => _text.text = ((int)x).ToString(),
            to,
            duration)
            .SetEase(Ease.OutQuad)
            .OnComplete(() => _text.text = to.ToString());
    }

    public void StartFadeAnimation(string to, float duration = 0.4f)
    {
        DOTween.Sequence()
            .Append(_text.DOFade(0, duration / 2))
            .AppendCallback(() => _text.text = to)
            .Append(_text.DOFade(1, duration / 2))
            .Play();
    }
}

```

これをTextにAddComponentしておいて呼べばOK。

数字同士の場合は間をカウントアップ/ダウンするようなアニメーションもできる
