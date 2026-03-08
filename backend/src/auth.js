import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev_only_change_me";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function toBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromBase64Url(value) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf8");
}

function signValue(value) {
  return crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(value)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith("scrypt$")) {
    return false;
  }

  const [, salt, expectedHash] = storedHash.split("$");
  if (!salt || !expectedHash) {
    return false;
  }

  const computedHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const computedBuffer = Buffer.from(computedHash, "hex");

  if (expectedBuffer.length !== computedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, computedBuffer);
}

export function signAuthToken({ sub, email }) {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      sub,
      email,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
    })
  );

  const signature = signValue(`${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

export function verifyAuthToken(token) {
  if (!token || token.split(".").length !== 3) {
    throw new Error("Invalid token");
  }

  const [header, payload, signature] = token.split(".");
  const expectedSignature = signValue(`${header}.${payload}`);

  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
    throw new Error("Invalid token signature");
  }

  const payloadJson = JSON.parse(fromBase64Url(payload));
  if (!payloadJson.exp || payloadJson.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payloadJson;
}
