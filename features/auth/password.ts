import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Passwords are never stored. We keep a salted scrypt hash, which is slow to compute
// on purpose so that a stolen database cannot be turned back into passwords.

const LOG_N = 15; // 2^15 iterations
const R = 8;
const P = 1;
const KEYLEN = 64;

export const MIN_PASSWORD_LENGTH = 8;

function derive(password: string, salt: Buffer, logN: number, r: number, p: number, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, keylen, { N: 2 ** logN, r, p, maxmem: 256 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, LOG_N, R, P, KEYLEN);
  return ["scrypt", LOG_N, R, P, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, logN, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await derive(password, Buffer.from(salt, "base64"), Number(logN), Number(r), Number(p), expected.length);
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Spent when the e-mail is unknown, so a wrong e-mail takes as long as a wrong password. */
export async function burnTime(password: string) {
  await derive(password, Buffer.alloc(16), LOG_N, R, P, KEYLEN);
}
