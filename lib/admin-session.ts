// Single-operator admin auth: env password in, HMAC-signed cookie out.
//
// The cookie value is `<expiresAtMs>.<hmac>`. There is no session store, so
// the only way to revoke early is to rotate ADMIN_SESSION_SECRET, which
// invalidates every outstanding cookie at once. That is the intended kill switch.
//
// This module is imported by proxy.ts, which runs on the Node.js runtime in
// Next 16, so node:crypto is available there.

import { hmacHex, safeEqual } from "./crypto";

export const ADMIN_COOKIE = "cv_admin";

const SESSION_MS = 1000 * 60 * 60 * 12; // 12 hours

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is missing or too short. Generate one with: openssl rand -hex 32");
  }
  return s;
}

export function createSessionValue(now = Date.now()): string {
  const expiresAt = now + SESSION_MS;
  return `${expiresAt}.${hmacHex(secret(), String(expiresAt))}`;
}

export function verifySessionValue(value: string | undefined | null, now = Date.now()): boolean {
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const expiresAt = value.slice(0, dot);
  const mac = value.slice(dot + 1);
  if (!/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < now) return false;
  return safeEqual(mac, hmacHex(secret(), expiresAt));
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length === 0) return false;
  return safeEqual(candidate, expected);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MS / 1000,
};
