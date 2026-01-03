/**
 * Encryption Utility
 * Provides AES-256 encryption/decryption for sensitive data at rest
 * Uses crypto module with AES-256-GCM for authenticated encryption
 */

const crypto = require('crypto');

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const SALT_LENGTH = 64; // 64 bytes for key derivation
const TAG_LENGTH = 16; // 16 bytes for GCM authentication tag
const KEY_LENGTH = 32; // 32 bytes for AES-256
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Derive encryption key from master key using PBKDF2
 * @param {string} masterKey - Master encryption key from environment
 * @returns {Buffer} Derived key
 */
function deriveKey(masterKey) {
  if (!masterKey) {
    throw new Error('DB_ENCRYPTION_KEY is required in environment variables');
  }
  
  // Use a fixed salt for key derivation (in production, consider storing per-organization salts)
  // For now, using the master key itself as salt (simplified approach)
  const salt = crypto.createHash('sha256').update(masterKey).digest();
  
  return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt sensitive data
 * @param {string} text - Plain text to encrypt
 * @param {string} masterKey - Master encryption key from environment
 * @returns {string} Encrypted data (format: iv:tag:encryptedData)
 */
function encrypt(text, masterKey) {
  if (!text) {
    return text;
  }

  try {
    const key = deriveKey(masterKey);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const textBuffer = Buffer.from(text, 'utf8');
    let encrypted = cipher.update(textBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const tag = cipher.getAuthTag();

    // Combine IV, tag, and encrypted data
    const result = Buffer.concat([
      iv,
      tag,
      encrypted
    ]);

    return result.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data (base64 format)
 * @param {string} masterKey - Master encryption key from environment
 * @returns {string} Decrypted plain text
 */
function decrypt(encryptedData, masterKey) {
  if (!encryptedData) {
    return encryptedData;
  }

  try {
    const key = deriveKey(masterKey);
    const dataBuffer = Buffer.from(encryptedData, 'base64');

    // Extract IV, tag, and encrypted data
    const iv = dataBuffer.slice(0, IV_LENGTH);
    const tag = dataBuffer.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = dataBuffer.slice(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

module.exports = {
  encrypt,
  decrypt
};

