const KV_BINDING = "MECHA_HEART_RANKING";
const PLAYER_PREFIX = "player:";
const RECOVERY_PREFIX = "recovery:";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function sanitizeToken(value, fallback = "") {
  return String(value || fallback).replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80);
}

function sanitizeName(value) {
  const name = String(value || "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);
  return name || "Pilot";
}

function makePart(length) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function makePlayerId() {
  return `${makePart(4)}${makePart(4)}`.toLowerCase();
}

function makeSecret() {
  return `${makePart(4)}${makePart(4)}${makePart(4)}`.toLowerCase();
}

function makeRecoveryCode(playerId, secret) {
  return `MH-${playerId.slice(0, 4).toUpperCase()}-${playerId.slice(4).toUpperCase()}-${secret.slice(0, 4).toUpperCase()}-${secret.slice(4, 8).toUpperCase()}-${secret.slice(8).toUpperCase()}`;
}

function parseRecoveryCode(code) {
  const clean = sanitizeToken(code).replace(/^MH-?/i, "").replace(/-/g, "").toLowerCase();
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
    ownedModules: Array.isArray(profile?.ownedModules) ? profile.ownedModules.slice(0, 80) : [],
    ownedCores: Array.isArray(profile?.ownedCores) ? profile.ownedCores.slice(0, 20) : [],
    pvpDefense: profile?.pvpDefense && typeof profile.pvpDefense === "object" ? profile.pvpDefense : null,
    pvpStats: {
      rating: Math.max(0, Math.floor(Number(profile?.pvpStats?.rating) || 1000)),
      wins: Math.max(0, Math.floor(Number(profile?.pvpStats?.wins) || 0)),
      losses: Math.max(0, Math.floor(Number(profile?.pvpStats?.losses) || 0))
    },
    createdAt: typeof profile?.createdAt === "string" ? profile.createdAt : now,
    updatedAt: now
  };
}

async function readProfile(store, playerId) {
  return store.get(`${PLAYER_PREFIX}${playerId}`, "json");
}

async function writeProfile(store, profile) {
  await store.put(`${PLAYER_PREFIX}${profile.playerId}`, JSON.stringify(profile));
  await store.put(`${RECOVERY_PREFIX}${profile.playerId}`, profile.playerId);
}

export async function onRequestGet({ request, env }) {
  const store = env?.[KV_BINDING];
  if (!store) return json({ ok: false, message: "KV is not configured." }, 503);

  const url = new URL(request.url);
  const playerId = sanitizeToken(url.searchParams.get("id")).toLowerCase();
  const secret = sanitizeToken(url.searchParams.get("secret")).toLowerCase();
  if (!playerId || !secret) return json({ ok: false, message: "Missing player id or secret." }, 400);

  const profile = await readProfile(store, playerId);
  if (!profile || profile.secret !== secret) return json({ ok: false, message: "Pilot code not found." }, 404);
  return json({ ok: true, profile: normalizeProfile(profile, playerId, secret), recoveryCode: makeRecoveryCode(playerId, secret) });
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

  if (payload?.action === "recover") {
    const parsed = parseRecoveryCode(payload.code);
    if (!parsed) return json({ ok: false, message: "Invalid Pilot Code." }, 400);
    const profile = await readProfile(store, parsed.playerId);
    if (!profile || profile.secret !== parsed.secret) return json({ ok: false, message: "Pilot Code not found." }, 404);
    return json({ ok: true, profile: normalizeProfile(profile, parsed.playerId, parsed.secret), recoveryCode: makeRecoveryCode(parsed.playerId, parsed.secret) });
  }

  const playerId = sanitizeToken(payload?.playerId).toLowerCase() || makePlayerId();
  const secret = sanitizeToken(payload?.secret).toLowerCase() || makeSecret();
  const saved = await readProfile(store, playerId);
  if (saved && saved.secret !== secret) return json({ ok: false, message: "Pilot secret mismatch." }, 403);

  const profile = normalizeProfile({ ...saved, ...payload?.profile }, playerId, secret);
  await writeProfile(store, profile);
  return json({ ok: true, profile, recoveryCode: makeRecoveryCode(playerId, secret) });
}
