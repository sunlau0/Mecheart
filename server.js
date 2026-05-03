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
