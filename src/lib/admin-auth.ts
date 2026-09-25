import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const RESET_TOKEN_TTL_MS = 45 * 60 * 1000;
const SESSION_TTL_MS = 60 * 60 * 24 * 7 * 1000;

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// ── Password hashing (scrypt, no external dependency) ──────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64).toString("hex");
  return safeEqual(candidate, hash);
}

// ── Session cookie (independent of credential storage — no I/O to verify) ──────

export function signSession(email: string): string {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `${email}.${expiry}`;
  const hmac = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

export function verifySession(token: string): string | null {
  // Email may itself contain dots, so parse from the right: the last two
  // "."-separated segments are always expiry + hmac; everything before is the email.
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const hmac = parts.pop()!;
  const expiry = parts.pop()!;
  const email = parts.join(".");
  const payload = `${email}.${expiry}`;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  if (!safeEqual(hmac, expected)) return null;
  if (Date.now() > Number(expiry)) return null;
  return email;
}

export async function isAuthenticated(): Promise<boolean> {
  if (!sessionSecret()) return false;
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  if (!token) return false;
  return verifySession(token) !== null;
}

// ── Password reset tokens (self-invalidating on password change) ───────────────

export function signResetToken(email: string, passwordHash: string): string {
  const expiry = Date.now() + RESET_TOKEN_TTL_MS;
  const payload = `${email}.${expiry}`;
  const hmac = createHmac("sha256", sessionSecret() + passwordHash).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

export function verifyResetToken(token: string, passwordHash: string): string | null {
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const hmac = parts.pop()!;
  const expiry = parts.pop()!;
  const email = parts.join(".");
  const payload = `${email}.${expiry}`;
  const expected = createHmac("sha256", sessionSecret() + passwordHash).update(payload).digest("hex");
  if (!safeEqual(hmac, expected)) return null;
  if (Date.now() > Number(expiry)) return null;
  return email;
}
