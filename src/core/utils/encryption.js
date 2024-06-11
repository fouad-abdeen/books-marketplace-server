import crypto from "crypto";
import { env } from "../config/env.config.js";

const algorithm = "aes-256-ctr";

// Ensure the secret key is 32 bytes long by deriving it securely using SHA-256 hash function
const secretKey = crypto
  .createHash("sha256")
  .update(env.auth.encryptionSecretKey)
  .digest();

/**
 * Encrypts a given text using AES-256-CTR algorithm.
 *
 * @param {string} text - The text to encrypt.
 * @returns {string} - The initialization vector and encrypted text concatenated as a hex string.
 */
export const encrypt = (text) => {
  try {
    // Generate a random initialization vector (IV) of 16 bytes
    const iv = crypto.randomBytes(16);
    // Create a cipher instance using the algorithm, secret key, and IV
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    // Encrypt the text and concatenate the resulting Buffer objects
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);

    // Return the IV and encrypted text, both in hexadecimal format, separated by a colon
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw error;
  }
};

/**
 * Decrypts a given encrypted string using AES-256-CTR algorithm.
 *
 * @param {string} hash - The encrypted string containing the IV and encrypted text, separated by a colon.
 * @returns {string} - The decrypted text.
 */
export const decrypt = (hash) => {
  try {
    // Split the input string into the IV and encrypted text components
    const [iv, encryptedText] = hash.split(":");
    // Convert the IV and encrypted text from hexadecimal format to Buffer objects
    const ivBuffer = Buffer.from(iv, "hex");
    const encryptedTextBuffer = Buffer.from(encryptedText, "hex");

    // Create a decipher instance using the algorithm, secret key, and IV
    const decipher = crypto.createDecipheriv(algorithm, secretKey, ivBuffer);

    // Decrypt the text and concatenate the resulting Buffer objects
    const decrypted = Buffer.concat([
      decipher.update(encryptedTextBuffer),
      decipher.final(),
    ]);

    // Return the decrypted text as a UTF-8 string
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
};
