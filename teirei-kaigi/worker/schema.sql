-- 定例会議 エンドレスランキングのスキーマ。
-- 1セッション = 1行。sid を主キーにすることで同一セッションの二重送信を遮断する。
CREATE TABLE IF NOT EXISTS scores (
  sid        TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  streak     INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- 上位取得(streak 降順、同値は先着優先)を高速化する。
CREATE INDEX IF NOT EXISTS idx_scores_streak ON scores (streak DESC, created_at ASC);
