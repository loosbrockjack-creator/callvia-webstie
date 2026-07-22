// Token generation, hashing, and HMAC signing. Node crypto only, no libraries.
// This is importable from proxy.ts because proxy runs on the Node.js runtime
// in Next 16 (the edge runtime is not supported there).

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// 32 bytes = 256 bits of entropy, base64url encoded to 43 URL-safe chars.
// Not guessable, not enumerable, safe to put in a URL.
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function sha256Hex(input: string | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

// Only the hash of a token is ever stored. A database leak cannot be replayed
// into a signature.
export function hashToken(rawToken: string): string {
  return sha256Hex(rawToken);
}

export function tokenLast4(rawToken: string): string {
  return rawToken.slice(-4);
}

export function hmacHex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

// Constant-time compare. Length is compared first because timingSafeEqual
// throws on a length mismatch, and length alone is not a useful side channel here.
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
