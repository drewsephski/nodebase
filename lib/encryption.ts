import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_ENV = 'ENCRYPTION_KEY';

/**
 * Encrypts plaintext using AES-256-GCM
 * @param plaintext The text to encrypt
 * @returns Encrypted string in format: iv:tag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const encryptionKey = process.env[ENCRYPTION_KEY_ENV];
  
  if (!encryptionKey) {
    throw new Error(`Encryption key not found in environment variables (${ENCRYPTION_KEY_ENV})`);
  }

  if (encryptionKey.length !== 64) {
    throw new Error(`Encryption key must be 64 characters (32 bytes) long, got ${encryptionKey.length}`);
  }

  const key = Buffer.from(encryptionKey, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  cipher.setAAD(Buffer.from('n8n-credentials', 'utf8'));
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts ciphertext using AES-256-GCM
 * @param encryptedText The encrypted text in format: iv:tag:ciphertext
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedText: string): string {
  const encryptionKey = process.env[ENCRYPTION_KEY_ENV];
  
  if (!encryptionKey) {
    throw new Error(`Encryption key not found in environment variables (${ENCRYPTION_KEY_ENV})`);
  }

  if (encryptionKey.length !== 64) {
    throw new Error(`Encryption key must be 64 characters (32 bytes) long, got ${encryptionKey.length}`);
  }

  const key = Buffer.from(encryptionKey, 'hex');
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted text format. Expected: iv:tag:ciphertext');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(Buffer.from('n8n-credentials', 'utf8'));
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generates a new encryption key for development setup
 * @returns 64-character hex string (32 bytes)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Masks sensitive credential data for display purposes
 * @param data The credential data object
 * @returns Masked version with sensitive fields partially hidden
 */
export function maskCredentialData(data: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...data };
  
  // Common sensitive field names
  const sensitiveFields = [
    'apiKey', 'api_key', 'token', 'secret', 'password', 'key',
    'accessToken', 'access_token', 'refreshToken', 'refresh_token',
    'clientSecret', 'client_secret', 'privateKey', 'private_key'
  ];
  
  for (const field of sensitiveFields) {
    if (masked[field] && typeof masked[field] === 'string') {
      const value = masked[field];
      if (value.length > 8) {
        // Show first 4 and last 4 characters
        masked[field] = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
      } else {
        // Show asterisks for shorter values
        masked[field] = '*'.repeat(value.length);
      }
    }
  }
  
  return masked;
}