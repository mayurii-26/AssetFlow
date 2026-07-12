/**
 * Blockchain Module Configuration
 * 
 * Central configuration constants for blockchain operations.
 */

/**
 * Hashing algorithm configuration
 */
export const HASH_CONFIG = {
  /** Algorithm used for cryptographic hashing */
  ALGORITHM: 'sha256',
  
  /** Output encoding format */
  ENCODING: 'hex' as const,
  
  /** HMAC secret key (should be loaded from environment in production) */
  SECRET_KEY: process.env.BLOCKCHAIN_SECRET_KEY || 'assetflow-blockchain-secret',
} as const;

/**
 * Event record configuration
 */
export const EVENT_CONFIG = {
  /** Maximum payload size in bytes */
  MAX_PAYLOAD_SIZE: 1048576, // 1MB
  
  /** Event retention period in days */
  RETENTION_DAYS: 2555, // ~7 years
  
  /** Enable event compression */
  ENABLE_COMPRESSION: false,
} as const;

/**
 * Verification configuration
 */
export const VERIFICATION_CONFIG = {
  /** Maximum verification attempts before timeout */
  MAX_VERIFICATION_ATTEMPTS: 3,
  
  /** Verification timeout in milliseconds */
  VERIFICATION_TIMEOUT: 5000,
  
  /** Enable strict mode (fails on any inconsistency) */
  STRICT_MODE: true,
} as const;

/**
 * Blockchain metadata
 */
export const BLOCKCHAIN_METADATA = {
  /** Current blockchain schema version */
  VERSION: '1.0.0',
  
  /** System identifier */
  SYSTEM_ID: 'assetflow-enterprise',
  
  /** Blockchain network name */
  NETWORK: process.env.BLOCKCHAIN_NETWORK || 'assetflow-internal',
} as const;
