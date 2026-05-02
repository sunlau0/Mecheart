const DEFAULT_RANKINGS = [
  { name: "Sun", score: 99230 },
  { name: "Candy", score: 86000 },
  { name: "Hayden", score: 85800 },
  { name: "Jeanis", score: 60080 }
];

const KV_BINDING = "MECHA_HEART_RANKING";
const LEADERBOARD_KEY = "top10";
const TOP_LIMIT = 10;

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function sanitizeName(value) {
  const name = String(value || "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);
  return name || "Pilot";
}

function sanitizeScore(value) {
  const score = Math.floor(Number(value));
  if (!Number.isFinite(score) || score < 0) return 0;
  return Math.min(score, 999999999);
}

function normalizeRankings(rankings) {
  const bestByName = new Map();
  for (const entry of Array.isArray(rankings) ? rankings : []) {
    const name = sanitizeName(entry?.name);
    const score = sanitizeScore(entry?.score);
    const key = name.toLocaleLowerCase();
    const previous = bestByName.get(key);
    if (!previous || score > previous.score) bestByName.set(key, { name, score });
  }
  return [...bestByName.values()]
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, TOP_LIMIT);
}

async function readRankings(env) {
  const store = env?.[KV_BINDING];
  if (!store) {
    return { rankings: normalizeRankings(DEFAULT_RANKINGS), writable: false };
  }

  const saved = await store.get(LEADERBOARD_KEY, "json");
  const rankings = normalizeRankings([...(saved || []), ...DEFAULT_RANKINGS]);
  return { rankings, writable: true, store };
}

export async function onRequestGet({ env }) {
  const { rankings, writable } = await readRankings(env);
  return json({ rankings, writable });
}

export async function onRequestPost({ request, env }) {
  const { rankings, writable, store } = await readRankings(env);
  if (!writable || !store) {
    return json({
      rankings,
      writable: false,
      accepted: false,
      message: "排行榜 KV 未綁定，暫時只能顯示預設排名。"
    }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ rankings, writable, accepted: false, message: "提交資料格式錯誤。" }, 400);
  }

  const entry = {
    name: sanitizeName(payload?.name),
    score: sanitizeScore(payload?.score)
  };
  const updated = normalizeRankings([...rankings, entry]);
  await store.put(LEADERBOARD_KEY, JSON.stringify(updated));
  const rank = updated.findIndex((item) => item.name.toLocaleLowerCase() === entry.name.toLocaleLowerCase() && item.score === entry.score) + 1;

  return json({
    rankings: updated,
    writable: true,
    accepted: rank > 0,
    rank,
    entry,
    message: rank > 0 ? `已入榜：第 ${rank} 位` : "未能進入 Top 10。"
  });
}
