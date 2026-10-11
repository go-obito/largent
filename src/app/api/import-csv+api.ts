import { parseCsvDate, parseCsvRows } from "@/lib/csv";
import { parseCsvAmount } from "@/lib/currency";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 1000;
const JWKS_CACHE_MS = 5 * 60 * 1000;
type JwtHeader = { alg?: string; kid?: string };
type ClerkClaims = { iss?: string; sub?: string; sid?: string; exp?: number; nbf?: number; azp?: string };
type ClerkJwk = JsonWebKey & { kid?: string; alg?: string };
let jwksCache: { issuer: string; keys: ClerkJwk[]; expiresAt: number } | null = null;

function base64UrlBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function decodePart<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlBytes(value))) as T;
}

function clerkIssuer() {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const match = /^pk_(?:test|live)_([A-Za-z0-9+/=_-]+)\$$/.exec(key);
  if (!match) throw new Error("Clerk publishable key is not configured.");
  const frontendApi = atob(match[1].replace(/-/g, "+").replace(/_/g, "/")).replace(/\$$/, "");
  if (!/^[a-zA-Z0-9.-]+$/.test(frontendApi)) throw new Error("Clerk issuer configuration is invalid.");
  return `https://${frontendApi}`;
}

async function clerkKeys(issuer: string) {
  if (jwksCache?.issuer === issuer && jwksCache.expiresAt > Date.now()) return jwksCache.keys;
  const response = await fetch(`${issuer}/.well-known/jwks.json`);
  if (!response.ok) throw new Error("Could not load Clerk verification keys.");
  const data = await response.json() as { keys?: ClerkJwk[] };
  if (!data.keys?.length) throw new Error("Clerk verification keys were unavailable.");
  jwksCache = { issuer, keys: data.keys, expiresAt: Date.now() + JWKS_CACHE_MS };
  return data.keys;
}

async function isAuthenticated(request: Request) {
  const bearer = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") ?? "");
  if (!bearer) return false;

  try {
    const [headerPart, claimsPart, signaturePart, extra] = bearer[1].split(".");
    if (!headerPart || !claimsPart || !signaturePart || extra !== undefined) return false;
    const header = decodePart<JwtHeader>(headerPart);
    const claims = decodePart<ClerkClaims>(claimsPart);
    if (header.alg !== "RS256" || !header.kid) return false;
    const issuer = clerkIssuer();
    if (claims.iss !== issuer || !claims.sub || !claims.sid) return false;
    const now = Math.floor(Date.now() / 1000);
    if (typeof claims.exp !== "number" || claims.exp <= now || (claims.nbf !== undefined && claims.nbf > now)) return false;

    if (claims.azp) {
      const configuredParties = process.env.CLERK_AUTHORIZED_PARTIES?.split(",").map((party) => party.trim()).filter(Boolean);
      const requestOrigin = request.headers.get("origin");
      if (configuredParties?.length && !configuredParties.includes(claims.azp)) return false;
      if (!configuredParties?.length && requestOrigin && claims.azp !== requestOrigin) return false;
    }

    const jwk = (await clerkKeys(issuer)).find((candidate) => candidate.kid === header.kid && candidate.kty === "RSA");
    if (!jwk) return false;
    const publicKey = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const signedContent = new TextEncoder().encode(`${headerPart}.${claimsPart}`);
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, base64UrlBytes(signaturePart), signedContent);
  } catch {
    return false;
  }
}

async function readCsv(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_FILE_BYTES) throw new Error("The CSV file exceeds the 2 MB limit.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("The CSV file is empty.");
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_FILE_BYTES) {
      await reader.cancel();
      throw new Error("The CSV file exceeds the 2 MB limit.");
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function POST(request: Request) {
  if (!(await isAuthenticated(request))) return Response.json({ error: "A valid Clerk session is required." }, { status: 401 });
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "text/csv" && contentType !== "application/csv") {
    return Response.json({ error: "Upload a CSV file." }, { status: 415 });
  }

  let text: string;
  let parsed: string[][];
  try {
    text = await readCsv(request);
    parsed = parseCsvRows(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The CSV could not be read.";
    return Response.json({ error: message }, { status: message.includes("2 MB") ? 413 : 400 });
  }
  if (parsed.length - 1 > MAX_ROWS) return Response.json({ error: `The CSV exceeds the ${MAX_ROWS} row limit.` }, { status: 413 });

  const rawMapping = ["x-date-column", "x-description-column", "x-amount-column"].map((name) => request.headers.get(name));
  if (rawMapping.every((value) => value === null)) {
    return Response.json({ headers: parsed[0], rowCount: parsed.length - 1, preview: parsed.slice(1, 6) }, { headers: { "Cache-Control": "no-store" } });
  }
  const mapping = rawMapping.map((value) => value === null ? Number.NaN : Number(value));
  if (mapping.some((value) => !Number.isInteger(value) || value < 0 || value >= parsed[0].length) || new Set(mapping).size !== 3) {
    return Response.json({ error: "Choose different valid columns for date, description, and amount." }, { status: 400 });
  }

  const rows: { date: string; description: string; amount: number; type: "income" | "expense" }[] = [];
  for (let index = 1; index < parsed.length; index += 1) {
    const row = parsed[index];
    const date = parseCsvDate(row[mapping[0]]);
    const description = row[mapping[1]].trim();
    const amount = parseCsvAmount(row[mapping[2]]);
    if (!date) return Response.json({ error: `Row ${index + 1} has an invalid date.` }, { status: 422 });
    if (!description) return Response.json({ error: `Row ${index + 1} has no description.` }, { status: 422 });
    if (!amount) return Response.json({ error: `Row ${index + 1} has an invalid amount.` }, { status: 422 });
    rows.push({ date, description, amount: amount.amount, type: amount.type });
  }
  return Response.json({ rows }, { headers: { "Cache-Control": "no-store" } });
}