/**
 * GitHubリポジトリカードの中身を GitHub API から取得して描画する。
 *
 * 以前は github-readme-stats が返す固定サイズのSVGを <img> で表示していたが、
 * カード幅と画像の内部サイズが一致せず表示が切れていたため、
 * HTML/CSSで組んだカードにライブデータを流し込む方式に変更した。
 * 取得に失敗してもリポジトリ名のリンクとしてそのまま成立する。
 */
(function () {
  "use strict";

  var CACHE_PREFIX = "gh-repo-card:";
  var CACHE_TTL = 6 * 60 * 60 * 1000; // 6時間

  // よく使う言語のみ。未知の言語はフォールバック色になる。
  var LANGUAGE_COLORS = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#dea584",
    Java: "#b07219",
    Kotlin: "#A97BFF",
    Swift: "#F05138",
    "C#": "#178600",
    "C++": "#f34b7d",
    C: "#555555",
    PHP: "#4F5D95",
    Shell: "#89e051",
    HTML: "#e34c26",
    CSS: "#563d7c",
    SCSS: "#c6538c",
    Vue: "#41b883",
    Dart: "#00B4AB",
    Elixir: "#6e4a7e",
    Haskell: "#5e5086",
    Lua: "#000080",
    Dockerfile: "#384d54"
  };
  var DEFAULT_LANGUAGE_COLOR = "#8b949e";

  function readCache(fullName) {
    try {
      var raw = window.localStorage.getItem(CACHE_PREFIX + fullName);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (!entry || typeof entry.t !== "number") return null;
      if (Date.now() - entry.t > CACHE_TTL) return null;
      return entry.d;
    } catch (e) {
      return null;
    }
  }

  function writeCache(fullName, data) {
    try {
      window.localStorage.setItem(
        CACHE_PREFIX + fullName,
        JSON.stringify({ t: Date.now(), d: data })
      );
    } catch (e) {
      /* localStorageが使えない環境では単に諦める */
    }
  }

  function formatCount(value) {
    if (value >= 1000) {
      return (value / 1000).toFixed(value >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
    }
    return String(value);
  }

  function fetchRepo(fullName) {
    var cached = readCache(fullName);
    if (cached) return Promise.resolve(cached);

    return fetch("https://api.github.com/repos/" + fullName, {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API responded with " + res.status);
        return res.json();
      })
      .then(function (json) {
        var data = {
          description: json.description || "",
          language: json.language || "",
          stars: json.stargazers_count || 0,
          forks: json.forks_count || 0
        };
        writeCache(fullName, data);
        return data;
      });
  }

  function fillCard(card, data) {
    var description = card.querySelector('[data-role="description"]');
    if (description && data.description) {
      description.textContent = data.description;
      description.hidden = false;
    }

    var language = card.querySelector('[data-role="language"]');
    if (language && data.language) {
      var dot = language.querySelector(".repo-card__lang-dot");
      var name = language.querySelector('[data-role="language-name"]');
      if (dot) {
        dot.style.backgroundColor =
          LANGUAGE_COLORS[data.language] || DEFAULT_LANGUAGE_COLOR;
      }
      if (name) name.textContent = data.language;
      language.hidden = false;
    }

    [
      ["stars", data.stars],
      ["forks", data.forks]
    ].forEach(function (pair) {
      var stat = card.querySelector('[data-role="' + pair[0] + '"]');
      if (!stat || !pair[1]) return;
      var count = stat.querySelector('[data-role="count"]');
      if (count) count.textContent = formatCount(pair[1]);
      stat.hidden = false;
    });

    card.classList.add("repo-card--loaded");
  }

  function init() {
    var cards = document.querySelectorAll(".repo-card[data-repo]");
    if (!cards.length || typeof window.fetch !== "function") return;

    Array.prototype.forEach.call(cards, function (card) {
      fetchRepo(card.dataset.repo)
        .then(function (data) {
          fillCard(card, data);
        })
        .catch(function () {
          // レート制限やオフライン時はリポジトリ名だけのカードとして表示する
          card.classList.add("repo-card--loaded");
        });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
