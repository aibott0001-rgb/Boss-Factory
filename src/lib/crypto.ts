import CryptoJS from 'crypto-js';

// In production, this should be a long, random string stored in .env
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'boss-factory-genesis-secret-2024-change-me-in-prod';

/**
 * Encrypts a plain text API key using AES-256
 */
export const encrypt = (key: string): string => {
  if (!key) return '';
  return CryptoJS.AES.encrypt(key, SECRET_KEY).toString();
};

/**
 * Decrypts an AES-256 encrypted string back to plain text
 */
export const decrypt = (ciphertext: string): string => {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

// Alias for backward compatibility
export const encryptKey = encrypt;
export const decryptKey = decrypt;
