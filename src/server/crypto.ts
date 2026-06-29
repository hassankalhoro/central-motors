import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/* AES-256-GCM encryption for secrets at rest (e.g. the SMTP password configured
 * in the admin). Key comes from ENCRYPTION_KEY (64 hex chars = 32 bytes). Format
 * of the stored string: ivHex:authTagHex:cipherHex. */

function key(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length < 64) {
    throw new Error("ENCRYPTION_KEY must be set to at least 32 bytes (64 hex chars).");
  }
  return Buffer.from(hex.slice(0, 64), "hex");
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptSecret(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Malformed encrypted secret.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}
