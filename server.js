import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 5173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

const defaultRankings = [
  { name: "Sun", score: 99230 },
  { name: "Candy", score: 86000 },
  { name: "Hayden", score: 85800 },
  { name: "Jeanis", score: 60080 }
];

const leaderboardFile = join(root, ".local-data", "leaderboard.json");
const playerFile = join(root, ".local-data", "players.json");
const arenaFile = join(root, ".local-data", "arena.json");
const masterLeagueBands = [
  { id: "bronze", min: 0 },
  { id: "silver", min: 2500 },
  { id: "gold", min: 6500 },
  { id: "platinum", min: 12000 },
  { id: "diamond", min: 20000 },
  { id: "master", min: 32000 }
];

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

function masterBandForScore(score) {
  return [...masterLeagueBands].reverse().find((band) => score >= band.min) || masterLeagueBands[0];
}

function makeRecordId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeEntry(entry, index) {
  return {
    id: typeof entry?.id === "string" ? entry.id : "",
    name: sanitizeName(entry?.name),
    score: sanitizeScore(entry?.score),
    submittedAt: typeof entry?.submittedAt === "string" ? entry.submittedAt : "",
    order: index
  };
}

function normalizeRankings(rankings) {
  return (Array.isArray(rankings) ? rankings : []).map(normalizeEntry)
    .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt) || a.name.localeCompare(b.name) || a.order - b.order)
    .map(({ order, ...entry }) => entry)
    .slice(0, 10);
}

function withDefaultRankings(rankings) {
  const combined = Array.isArray(rankings) ? [...rankings] : [];
  for (const seed of defaultRankings) {
    const hasSeed = combined.some((entry) =>
      sanitizeName(entry?.name).toLocaleLowerCase() === seed.name.toLocaleLowerCase() &&
      sanitizeScore(entry?.score) === seed.score
    );
    if (!hasSeed) combined.push({ ...seed, id: `seed-${seed.name.toLocaleLowerCase()}` });
  }
  return combined;
}

function normalizeMasterRankings(rankings = []) {
  const bestByPlayer = new Map();
  (Array.isArray(rankings) ? rankings : [])
    .filter((entry) => Number.isFinite(Number(entry?.score)))
    .map((entry, index) => ({
      playerId: sanitizeToken(entry.playerId),
      name: sanitizeName(entry.name),
      score: sanitizeScore(entry.score),
      bandId: sanitizeToken(entry.bandId) || masterBandForScore(entry.score || 0).id,
      team: Array.isArray(entry.team) ? entry.team.map(String).slice(0, 4) : [],
      submittedAt: typeof entry.submittedAt === "string" ? entry.submittedAt : "",
      order: index
    }))
    .forEach((entry) => {
      const key = entry.playerId || entry.name.toLocaleLowerCase();
      const current = bestByPlayer.get(key);
      if (!current || entry.score > current.score || (entry.score === current.score && entry.submittedAt > current.submittedAt)) {
        bestByPlayer.set(key, entry);
      }
    });
  return [...bestByPlayer.values()]
    .sort((a, b) => b.score - a.score || a.submittedAt.localeCompare(b.submittedAt) || a.order - b.order)
    .slice(0, 10);
}

async function readLeaderboard() {
  try {
    const saved = JSON.parse(await readFile(leaderboardFile, "utf8"));
    return normalizeRankings(withDefaultRankings(saved));
  } catch {
    return normalizeRankings(defaultRankings);
  }
}

async function writeLeaderboard(rankings) {
  await mkdir(dirname(leaderboardFile), { recursive: true });
  await writeFile(leaderboardFile, JSON.stringify(rankings, null, 2));
}

async function readStore(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeStore(file, data) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2));
}

function sanitizeToken(value, fallback = "") {
  return String(value || fallback).replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80).toLowerCase();
}

function makeLocalPart(length) {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

function makeRecoveryCode(playerId, secret) {
  const id = String(playerId || "").toUpperCase();
  const key = String(secret || "").toUpperCase();
  return `MH-${id.slice(0, 4)}-${id.slice(4, 8)}-${key.slice(0, 4)}-${key.slice(4, 8)}-${key.slice(8, 12)}`;
}

function parseRecoveryCode(code) {
  const clean = String(code || "").replace(/^MH-?/i, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  if (clean.length < 20) return null;
  return { playerId: clean.slice(0, 8), secret: clean.slice(8, 20) };
}

function normalizeProfile(profile, playerId, secret) {
  const now = new Date().toISOString();
  return {
    version: 1,
    playerId,
    secret,
    name: sanitizeName(profile?.name),
    ownedModules: Array.isArray(profile?.ownedModules) ? profile.ownedModules : [],
    ownedCores: Array.isArray(profile?.ownedCores) ? profile.ownedCores : [],
    pvpDefense: profile?.pvpDefense || null,
    pvpStats: profile?.pvpStats || { rating: 1000, wins: 0, losses: 0 },
    createdAt: profile?.createdAt || now,
    updatedAt: now
  };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function sendJson(res, body, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    if (url.pathname === "/api/leaderboard") {
      const rankings = await readLeaderboard();
      if (req.method === "GET") {
        sendJson(res, { rankings, writable: true });
        return;
      }
      if (req.method === "POST") {
        const payload = await readJsonBody(req);
        const entry = {
          id: makeRecordId(),
          name: sanitizeName(payload.name),
          score: sanitizeScore(payload.score),
          submittedAt: new Date().toISOString()
        };
        const updated = normalizeRankings([...rankings, entry]);
        await writeLeaderboard(updated);
        const rank = updated.findIndex((item) => item.id === entry.id) + 1;
        sendJson(res, {
          rankings: updated,
          writable: true,
          accepted: rank > 0,
          rank,
          entry,
          message: rank > 0 ? `已入榜：第 ${rank} 位` : "未能進入 Top 10。"
        });
        return;
      }
      sendJson(res, { message: "Method not allowed" }, 405);
      return;
    }

    if (url.pathname === "/api/player") {
      const players = await readStore(playerFile, {});
      if (req.method === "GET") {
        const playerId = sanitizeToken(url.searchParams.get("id"));
        const secret = sanitizeToken(url.searchParams.get("secret"));
        const profile = players[playerId];
        if (!profile || profile.secret !== secret) {
          sendJson(res, { ok: false, message: "Pilot code not found." }, 404);
          return;
        }
        sendJson(res, { ok: true, profile, recoveryCode: makeRecoveryCode(playerId, secret) });
        return;
      }
      if (req.method === "POST") {
        const payload = await readJsonBody(req);
        if (payload.action === "recover") {
          const parsed = parseRecoveryCode(payload.code);
          const profile = parsed ? players[parsed.playerId] : null;
          if (!profile || profile.secret !== parsed.secret) {
            sendJson(res, { ok: false, message: "Pilot Code not found." }, 404);
            return;
          }
          sendJson(res, { ok: true, profile, recoveryCode: makeRecoveryCode(parsed.playerId, parsed.secret) });
          return;
        }
        const playerId = sanitizeToken(payload.playerId, makeLocalPart(8));
        const secret = sanitizeToken(payload.secret, makeLocalPart(12));
        if (players[playerId] && players[playerId].secret !== secret) {
          sendJson(res, { ok: false, message: "Pilot secret mismatch." }, 403);
          return;
        }
        const profile = normalizeProfile({ ...players[playerId], ...payload.profile }, playerId, secret);
        players[playerId] = profile;
        await writeStore(playerFile, players);
        sendJson(res, { ok: true, profile, recoveryCode: makeRecoveryCode(playerId, secret) });
        return;
      }
    }

    if (url.pathname === "/api/arena") {
      const players = await readStore(playerFile, {});
      const arena = await readStore(arenaFile, { defenses: {}, champions: {}, rankings: [] });
      if (req.method === "GET") {
        const self = sanitizeToken(url.searchParams.get("playerId"));
        const opponents = Object.entries(arena.defenses || {})
          .filter(([playerId]) => playerId !== self)
          .slice(-12)
          .reverse()
          .map(([playerId, defense]) => ({
            playerId,
            name: players[playerId]?.name || "Pilot",
            rating: players[playerId]?.pvpStats?.rating || 1000,
            defense
          }));
        sendJson(res, { ok: true, opponents, champions: arena.champions || {}, rankings: normalizeMasterRankings(arena.rankings || []) });
        return;
      }
      if (req.method === "POST") {
        const payload = await readJsonBody(req);
        const playerId = sanitizeToken(payload.playerId);
        const secret = sanitizeToken(payload.secret);
        const profile = players[playerId];
        if (!profile || profile.secret !== secret) {
          sendJson(res, { ok: false, message: "Pilot profile not found." }, 403);
          return;
        }
        if (payload.action === "result") {
          const runScore = sanitizeScore(payload.masterLeague?.score);
          const runDefense = payload.masterLeague?.defense;
          const submittedBandId = sanitizeToken(payload.masterLeague?.bandId);
          const runBand = masterLeagueBands.find((band) => band.id === submittedBandId) || masterBandForScore(runScore);
          const challengedBandId = sanitizeToken(payload.masterLeague?.championBandId);
          profile.pvpStats = profile.pvpStats || { rating: 1000, wins: 0, losses: 0 };
          profile.pvpStats.wins += payload.won ? 1 : 0;
          profile.pvpStats.losses += payload.won ? 0 : 1;
          profile.pvpStats.rating = Math.max(100, profile.pvpStats.rating + (payload.won ? 18 : -10) + Math.floor((payload.score || 0) / 2000));
          if (runScore > 0 && runDefense?.squad?.length) {
            profile.masterLeague = {
              score: Math.max(runScore, profile.masterLeague?.score || 0),
              bandId: runBand.id,
              updatedAt: new Date().toISOString()
            };
            arena.champions = arena.champions || {};
            const championRecord = {
              playerId,
              name: profile.name,
              teamName: profile.name,
              rating: profile.pvpStats.rating,
              masterScore: runScore,
              defense: runDefense,
              updatedAt: profile.masterLeague.updatedAt
            };
            if (payload.won && challengedBandId) {
              arena.champions[challengedBandId] = { ...championRecord, bandId: challengedBandId };
              const currentTop = arena.champions.overall;
              if (!currentTop || runScore > sanitizeScore(currentTop.masterScore)) arena.champions.overall = championRecord;
            }
            arena.rankings = normalizeMasterRankings([
              {
                playerId,
                name: profile.name,
                score: runScore,
                bandId: runBand.id,
                team: runDefense.squad,
                submittedAt: new Date().toISOString()
              },
              ...(arena.rankings || [])
            ]);
          }
          players[playerId] = profile;
          await writeStore(playerFile, players);
          await writeStore(arenaFile, arena);
          sendJson(res, { ok: true, pvpStats: profile.pvpStats, masterLeague: profile.masterLeague, champions: arena.champions || {}, rankings: normalizeMasterRankings(arena.rankings || []) });
          return;
        }
        profile.name = sanitizeName(payload.name || profile.name);
        profile.pvpDefense = payload.defense;
        players[playerId] = profile;
        arena.defenses = arena.defenses || {};
        arena.defenses[playerId] = payload.defense;
        await writeStore(playerFile, players);
        await writeStore(arenaFile, arena);
        sendJson(res, { ok: true, defense: payload.defense, pvpStats: profile.pvpStats || { rating: 1000, wins: 0, losses: 0 } });
        return;
      }
    }

    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = normalize(join(root, pathname));

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": types[extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, () => {
  console.log(`Cosmic Heart Squad running at http://localhost:${port}`);
});
