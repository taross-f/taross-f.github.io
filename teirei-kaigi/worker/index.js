// ============================================================
// 定例会議 エンドレスモード ランキング Worker (Cloudflare Workers + D1)
//
// ルート:
//   GET  /session  … seed と署名付きセッションを発行する
//   POST /submit   … 操作ログをサーバ側で再生・検証し、正式スコアを記録する
//   GET  /top      … 上位ランキングを返す
//
// チート対策の要:
//   - スコア値そのものは受け取らない。操作ログを seed 由来の列に突き合わせて再計算する。
//   - seed は HMAC 署名付きで配布し、改ざんを検出する(鍵は Worker 内のみ)。
//   - sid に UNIQUE 制約を張り、同一セッションの二重送信を遮断する。
//   - 信頼できるサーバ時刻(発行 iat 〜 送信 now)と操作ログの所要時間を突き合わせ、
//     瞬間周回(実時間を伴わない高スコア)を物理的に拒否する。
// ============================================================

import {
  replay,
  minPlayMs,
  MAX_SESSION_MS,
  MEETING_SECONDS,
} from "../src/endlessCore.js";

const TOP_LIMIT = 100;
const NAME_MAX = 12;
// 時間整合の許容ゆるみ(クロック差・初期化遅延を吸収)。
const TIME_SLACK_MS = 5000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.ALLOW_ORIGIN || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    try {
      if (url.pathname === "/session" && request.method === "GET") {
        return await handleSession(env, origin);
      }
      if (url.pathname === "/submit" && request.method === "POST") {
        return await handleSubmit(request, env, origin);
      }
      if (url.pathname === "/top" && request.method === "GET") {
        return await handleTop(env, origin);
      }
      return json({ error: "not_found" }, 404, origin);
    } catch (err) {
      return json({ error: "internal", detail: String(err && err.message) }, 500, origin);
    }
  },
};

// ---- GET /session ----
async function handleSession(env, origin) {
  const seed = crypto.getRandomValues(new Uint32Array(1))[0] >>> 0;
  const sid = hex(crypto.getRandomValues(new Uint8Array(16)));
  const iat = Date.now();
  const sig = await sign(env, `${seed}.${sid}.${iat}`);
  return json({ seed, sid, iat, sig }, 200, origin);
}

// ---- POST /submit ----
async function handleSubmit(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_json" }, 400, origin);
  }

  const { seed, sid, iat, sig, name, inputs } = body || {};
  if (
    !Number.isFinite(seed) ||
    typeof sid !== "string" ||
    !Number.isFinite(iat) ||
    typeof sig !== "string" ||
    !Array.isArray(inputs)
  ) {
    return json({ error: "bad_request" }, 400, origin);
  }

  // 1) 署名検証(seed/sid/iat が当方発行のまま改ざんされていないこと)
  const expected = await sign(env, `${seed >>> 0}.${sid}.${iat}`);
  if (!timingSafeEqual(expected, sig)) {
    return json({ error: "bad_sig" }, 401, origin);
  }

  // 2) セッションの鮮度(古すぎ・未来は拒否)
  const now = Date.now();
  const age = now - iat;
  if (age < -TIME_SLACK_MS || age > MAX_SESSION_MS) {
    return json({ error: "stale_session" }, 401, origin);
  }

  // 3) 操作ログを seed 列で再生し、正式 streak を再計算
  const result = replay(seed >>> 0, inputs);
  if (!result.ok) {
    return json({ error: "invalid_play", reason: result.reason }, 422, origin);
  }

  // 4) 時間整合: 信頼できる経過時間(now - iat)と操作ログの所要時間を突き合わせる
  const minTotal = minPlayMs(inputs);
  if (age + TIME_SLACK_MS < minTotal) {
    // 実時間が足りない = 瞬間周回の捏造
    return json({ error: "too_fast" }, 422, origin);
  }
  let claimed = 0;
  for (const inp of inputs) claimed += Number(inp.elapsedMs) || 0;
  if (claimed > age + TIME_SLACK_MS + MEETING_SECONDS * 1000) {
    // 申告した所要時間の合計が、実経過時間を超えている = 不整合
    return json({ error: "time_mismatch" }, 422, origin);
  }

  const streak = result.streak;
  const cleanName = sanitizeName(name);

  // 5) 記録(sid の UNIQUE 制約で二重送信を遮断)
  try {
    await env.DB.prepare(
      "INSERT INTO scores (sid, name, streak, created_at) VALUES (?, ?, ?, ?)"
    )
      .bind(sid, cleanName, streak, now)
      .run();
  } catch (err) {
    // UNIQUE 制約違反 = 同一セッションの再送信
    if (String(err && err.message).includes("UNIQUE")) {
      return json({ error: "already_submitted" }, 409, origin);
    }
    throw err;
  }

  // 6) 順位と上位を返す
  const rankRow = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM scores WHERE streak > ?"
  )
    .bind(streak)
    .first();
  const rank = (rankRow ? rankRow.c : 0) + 1;
  const top = await fetchTop(env);

  return json({ ok: true, streak, rank, top }, 200, origin);
}

// ---- GET /top ----
async function handleTop(env, origin) {
  const top = await fetchTop(env);
  return json({ top }, 200, origin, { "Cache-Control": "public, max-age=30" });
}

async function fetchTop(env) {
  const rows = await env.DB.prepare(
    "SELECT name, streak FROM scores ORDER BY streak DESC, created_at ASC LIMIT ?"
  )
    .bind(TOP_LIMIT)
    .all();
  return (rows.results || []).map((r) => ({ name: r.name, streak: r.streak }));
}

// ---- helpers ----
function sanitizeName(name) {
  if (typeof name !== "string") return "名無し";
  // 制御文字を除去し、前後空白を落とし、長さを制限する
  const clean = name
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, NAME_MAX);
  return clean.length > 0 ? clean : "名無し";
}

async function sign(env, message) {
  const secret = env.HMAC_SECRET;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return hex(new Uint8Array(mac));
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function hex(bytes) {
  let s = "";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return s;
}

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(obj, status, origin, extra) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...cors(origin),
      ...(extra || {}),
    },
  });
}
