// Use require for CommonJS compatibility with crypto-js
const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'boss-factory-genesis-key-change-in-prod';

export const encrypt = (key: string): string => {
  return CryptoJS.AES.encrypt(key, SECRET_KEY).toString();
};

export const encryptKey = encrypt;

export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
