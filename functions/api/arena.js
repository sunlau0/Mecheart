const KV_BINDING = "MECHA_HEART_RANKING";
const PLAYER_PREFIX = "player:";
const DEFENSE_PREFIX = "arena:defense:";
const DEFENSE_INDEX_KEY = "arena:defense:index";
const RESULT_PREFIX = "arena:result:";
const CHAMPIONS_KEY = "arena:champions";
const RANKINGS_KEY = "arena:master:rankings";
const OPPONENT_LIMIT = 12;
const masterLeagueBands = [
  { id: "bronze", min: 0 },
  { id: "silver", min: 2500 },
  { id: "gold", min: 6500 },
  { id: "platinum", min: 12000 },
  { id: "diamond", min: 20000 },
  { id: "master", min: 32000 }
];

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function sanitizeToken(value) {
  return String(value || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80).toLowerCase();
}

function sanitizeName(value) {
  const name = String(value || "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);
  return name || "Pilot";
}

function sanitizeDefense(defense) {
  const squad = Array.isArray(defense?.squad) ? defense.squad.map(String).slice(0, 4) : [];
  const positions = defense?.positions && typeof defense.positions === "object" ? defense.positions : {};
  const modules = defense?.modules && typeof defense.modules === "object" ? defense.modules : {};
  const ai = defense?.ai && typeof defense.ai === "object" ? defense.ai : {};
  return {
    squad,
    positions,
    modules,
    ai,
    core: String(defense?.core || ""),
    cost: Math.max(0, Math.floor(Number(defense?.cost) || 0)),
    updatedAt: new Date().toISOString()
  };
}

function masterBandForScore(score) {
  return [...masterLeagueBands].reverse().find((band) => score >= band.min) || masterLeagueBands[0];
}

function normalizeRankings(rankings = []) {
  return rankings
    .filter((entry) => entry && Number.isFinite(Number(entry.score)))
    .map((entry, index) => ({
      playerId: sanitizeToken(entry.playerId),
      name: sanitizeName(entry.name),
      score: Math.max(0, Math.floor(Number(entry.score) || 0)),
      bandId: sanitizeToken(entry.bandId) || masterBandForScore(Number(entry.score) || 0).id,
      team: Array.isArray(entry.team) ? entry.team.map(String).slice(0, 4) : [],
      submittedAt: typeof entry.submittedAt === "string" ? entry.submittedAt : "",
      order: index
    }))
    .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt) || a.order - b.order)
    .slice(0, 10);
}

async function readProfile(store, playerId) {
  return store.get(`${PLAYER_PREFIX}${playerId}`, "json");
}

async function readDefenseIndex(store) {
  const index = await store.get(DEFENSE_INDEX_KEY, "json");
  return Array.isArray(index) ? index : [];
}

async function writeDefenseIndex(store, nextIndex) {
  await store.put(DEFENSE_INDEX_KEY, JSON.stringify(nextIndex.slice(0, 100)));
}

export async function onRequestGet({ request, env }) {
  const store = env?.[KV_BINDING];
  if (!store) return json({ ok: false, message: "KV is not configured.", opponents: [] }, 503);

  const url = new URL(request.url);
  const self = sanitizeToken(url.searchParams.get("playerId"));
  const index = await readDefenseIndex(store);
  const candidates = index.filter((entry) => entry?.playerId && entry.playerId !== self).slice(-OPPONENT_LIMIT * 2).reverse();
  const opponents = [];
  for (const entry of candidates) {
    if (opponents.length >= OPPONENT_LIMIT) break;
    const defense = await store.get(`${DEFENSE_PREFIX}${entry.playerId}`, "json");
    if (!defense?.squad?.length) continue;
    opponents.push({
      playerId: entry.playerId,
      name: sanitizeName(entry.name),
      rating: Math.max(0, Math.floor(Number(entry.rating) || 1000)),
      defense
    });
  }
  const champions = await store.get(CHAMPIONS_KEY, "json") || {};
  const rankings = normalizeRankings(await store.get(RANKINGS_KEY, "json") || []);
  return json({ ok: true, opponents, champions, rankings });
}

export async function onRequestPost({ request, env }) {
  const store = env?.[KV_BINDING];
  if (!store) return json({ ok: false, message: "KV is not configured." }, 503);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Invalid JSON." }, 400);
  }

  const playerId = sanitizeToken(payload?.playerId);
  const secret = sanitizeToken(payload?.secret);
  const profile = await readProfile(store, playerId);
  if (!profile || profile.secret !== secret) return json({ ok: false, message: "Pilot profile not found." }, 403);

  if (payload?.action === "result") {
    const won = Boolean(payload.won);
    const score = Math.max(0, Math.floor(Number(payload.score) || 0));
    const runScore = Math.max(0, Math.floor(Number(payload.masterLeague?.score) || 0));
    const runDefense = sanitizeDefense(payload.masterLeague?.defense);
    const submittedBandId = sanitizeToken(payload.masterLeague?.bandId);
    const runBand = masterLeagueBands.find((band) => band.id === submittedBandId) || masterBandForScore(runScore);
    const challengedBandId = sanitizeToken(payload.masterLeague?.championBandId);
    profile.pvpStats = profile.pvpStats || { rating: 1000, wins: 0, losses: 0 };
    profile.pvpStats.wins = Math.max(0, Math.floor(Number(profile.pvpStats.wins) || 0)) + (won ? 1 : 0);
    profile.pvpStats.losses = Math.max(0, Math.floor(Number(profile.pvpStats.losses) || 0)) + (won ? 0 : 1);
    profile.pvpStats.rating = Math.max(100, Math.floor(Number(profile.pvpStats.rating) || 1000) + (won ? 18 : -10) + Math.floor(score / 2000));
    let champions = await store.get(CHAMPIONS_KEY, "json") || {};
    if (runScore > 0 && runDefense.squad.length === 4) {
      profile.masterLeague = {
        score: Math.max(runScore, Math.floor(Number(profile.masterLeague?.score) || 0)),
        bandId: runBand.id,
        updatedAt: new Date().toISOString()
      };
      const championRecord = {
        playerId,
        name: sanitizeName(profile.name),
        teamName: sanitizeName(profile.name),
        rating: profile.pvpStats.rating,
        masterScore: runScore,
        defense: runDefense,
        updatedAt: profile.masterLeague.updatedAt
      };
      if (won && challengedBandId) {
        champions[challengedBandId] = { ...championRecord, bandId: challengedBandId };
        if (!champions.overall || runScore > Math.floor(Number(champions.overall.masterScore) || 0)) champions.overall = championRecord;
      }
      await store.put(CHAMPIONS_KEY, JSON.stringify(champions));
      const rankings = normalizeRankings([
        {
          playerId,
          name: profile.name,
          score: runScore,
          bandId: runBand.id,
          team: runDefense.squad,
          submittedAt: new Date().toISOString()
        },
        ...(await store.get(RANKINGS_KEY, "json") || [])
      ]);
      await store.put(RANKINGS_KEY, JSON.stringify(rankings));
      profile.masterLeague.rank = rankings.findIndex((entry) => entry.playerId === playerId && entry.score === runScore) + 1 || null;
    }
    profile.updatedAt = new Date().toISOString();
    await store.put(`${PLAYER_PREFIX}${playerId}`, JSON.stringify(profile));
    await store.put(`${RESULT_PREFIX}${playerId}:${Date.now()}`, JSON.stringify({
      playerId,
      opponentId: sanitizeToken(payload.opponentId),
      won,
      score,
      createdAt: profile.updatedAt
    }));
    const rankings = normalizeRankings(await store.get(RANKINGS_KEY, "json") || []);
    return json({ ok: true, pvpStats: profile.pvpStats, masterLeague: profile.masterLeague, champions, rankings });
  }

  const defense = sanitizeDefense(payload?.defense);
  if (defense.squad.length !== 4) return json({ ok: false, message: "Defense squad must contain 4 units." }, 400);

  profile.pvpDefense = defense;
  profile.name = sanitizeName(payload?.name || profile.name);
  profile.updatedAt = new Date().toISOString();
  await store.put(`${PLAYER_PREFIX}${playerId}`, JSON.stringify(profile));
  await store.put(`${DEFENSE_PREFIX}${playerId}`, JSON.stringify(defense));

  const index = await readDefenseIndex(store);
  const nextEntry = {
    playerId,
    name: profile.name,
    rating: Math.max(0, Math.floor(Number(profile?.pvpStats?.rating) || 1000)),
    updatedAt: defense.updatedAt
  };
  const nextIndex = [...index.filter((entry) => entry?.playerId !== playerId), nextEntry];
  await writeDefenseIndex(store, nextIndex);

  return json({ ok: true, defense, pvpStats: profile.pvpStats || { rating: 1000, wins: 0, losses: 0 } });
}
