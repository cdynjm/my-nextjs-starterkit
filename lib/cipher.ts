import CryptoJS from "crypto-js";

const SECRET = process.env.CIPHER_SECRET || "fallback_key";

export function encryptId(id: number | string): string {
  if (typeof id !== "number" && typeof id !== "string") {
    throw new Error("encryptId expects a number or string id");
  }
  
  const numericId = Number(id);
  
  if (Number.isNaN(numericId) || numericId < 0) {
    throw new Error("encryptId received invalid id: " + id);
  }

  const ciphertext = CryptoJS.AES.encrypt(numericId.toString(), SECRET).toString();
  
  return ciphertext;
}

export function decryptId(cipherText: string): string {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}
