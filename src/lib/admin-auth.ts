import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getLoginAttempts, saveLoginAttempts } from "./beats-store";

const RESET_TOKEN_TTL_MS = 45 * 60 * 1000;
const SESSION_TTL_MS = 60 * 60 * 24 * 7 * 1000;

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "";
}

export function safeEqual(a: string, b: string): boolean {
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

// ── Persistent login lockout ─────────────────────────────────────────────────
// 5 wrong tries per IP per 15 min, and 30 site-wide per 15 min (stops guesses spread across many IPs).

const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_IP = 5;
const MAX_FAILS_TOTAL = 30;

export async function loginLocked(ip: string): Promise<boolean> {
  const { byIp, total } = await getLoginAttempts();
  const now = Date.now();
  const mine = byIp[ip];
  return (!!mine && mine.reset > now && mine.count >= MAX_FAILS_PER_IP) || (total.reset > now && total.count >= MAX_FAILS_TOTAL);
}

export async function recordLoginFailure(ip: string): Promise<void> {
  const attempts = await getLoginAttempts();
  const now = Date.now();
  for (const [key, entry] of Object.entries(attempts.byIp)) if (entry.reset <= now) delete attempts.byIp[key];
  const bump = (e?: { count: number; reset: number }) =>
    e && e.reset > now ? { count: e.count + 1, reset: e.reset } : { count: 1, reset: now + LOCKOUT_WINDOW_MS };
  attempts.byIp[ip] = bump(attempts.byIp[ip]);
  attempts.total = bump(attempts.total);
  await saveLoginAttempts(attempts);
}

export async function clearLoginFailures(ip: string): Promise<void> {
  const attempts = await getLoginAttempts();
  if (!attempts.byIp[ip]) return;
  delete attempts.byIp[ip];
  await saveLoginAttempts(attempts);
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
