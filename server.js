import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 5173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
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
    .slice(0, 10);
}

async function readLeaderboard() {
  try {
    const saved = JSON.parse(await readFile(leaderboardFile, "utf8"));
    return normalizeRankings([...(saved || []), ...defaultRankings]);
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
        const entry = { name: sanitizeName(payload.name), score: sanitizeScore(payload.score) };
        const updated = normalizeRankings([...rankings, entry]);
        await writeLeaderboard(updated);
        const rank = updated.findIndex((item) => item.name.toLocaleLowerCase() === entry.name.toLocaleLowerCase() && item.score === entry.score) + 1;
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
