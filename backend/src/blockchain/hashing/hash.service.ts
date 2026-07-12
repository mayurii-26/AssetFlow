import * as crypto from 'crypto';
import { HASH_CONFIG } from '../constants/config';
import { BlockchainEvent } from '../interfaces/blockchain.interface';

/**
 * Hash Service
 * 
 * Provides cryptographic hashing functionality for blockchain operations.
 * Uses SHA-256 algorithm for generating tamper-evident hashes.
 * 
 * @class HashService
 */
export class HashService {
  private readonly algorithm: string;
  private readonly encoding: BufferEncoding;
  private readonly secretKey: string;

  /**
   * Creates an instance of HashService
   */
  constructor() {
    this.algorithm = HASH_CONFIG.ALGORITHM;
    this.encoding = HASH_CONFIG.ENCODING as BufferEncoding;
    this.secretKey = HASH_CONFIG.SECRET_KEY;
  }

  /**
   * Normalizes payload data for consistent hashing
   * 
   * Ensures that the same data always produces the same hash by:
   * - Sorting object keys alphabetically
   * - Removing undefined values
   * - Handling nested objects recursively
   * - Converting to deterministic JSON string
   * 
   * @param payload - The data payload to normalize
   * @returns Normalized JSON string representation
   * 
   * @example
   * const normalized = hashService.normalizePayload({ b: 2, a: 1 });
   * // Returns: '{"a":1,"b":2}'
   */
  public normalizePayload(payload: any): string {
    if (payload === null || payload === undefined) {
      return '';
    }

    // Handle primitive types
    if (typeof payload !== 'object') {
      return String(payload);
    }

    // Handle arrays
    if (Array.isArray(payload)) {
      return JSON.stringify(payload.map((item) => this.normalizePayload(item)));
    }

    // Handle objects - sort keys and recurse
    const sortedKeys = Object.keys(payload).sort();
    const normalizedObj: Record<string, any> = {};

    for (const key of sortedKeys) {
      const value = payload[key];

      // Skip undefined values
      if (value === undefined) {
        continue;
      }

      // Recursively normalize nested objects
      if (typeof value === 'object' && value !== null) {
        normalizedObj[key] = JSON.parse(this.normalizePayload(value));
      } else {
        normalizedObj[key] = value;
      }
    }

    return JSON.stringify(normalizedObj);
  }

  /**
   * Generates a cryptographic hash for blockchain event data
   * 
   * Creates a SHA-256 hash using HMAC for additional security.
   * The hash is deterministic and tamper-evident.
   * 
   * @param data - Data to hash (string or object)
   * @returns Hexadecimal hash string
   * 
   * @example
   * const hash = hashService.generateHash({ assetId: 'AST-001', action: 'created' });
   * // Returns: '5d41402abc4b2a76b9719d911017c592'
   */
  public generateHash(data: string | Record<string, any>): string {
    try {
      // Normalize the input data
      const normalizedData = typeof data === 'string' ? data : this.normalizePayload(data);

      // Create HMAC hash
      const hmac = crypto.createHmac(this.algorithm, this.secretKey);
      hmac.update(normalizedData);

      return hmac.digest(this.encoding);
    } catch (error) {
      throw new Error(`Hash generation failed: ${(error as Error).message}`);
    }
  }

  /**
   * Generates a hash specifically for blockchain events
   * 
   * Creates a hash from the complete event structure, excluding
   * fields that should not affect the hash (like signatures).
   * 
   * @param event - Blockchain event to hash
   * @returns Hexadecimal hash string
   * 
   * @example
   * const eventHash = hashService.generateEventHash(blockchainEvent);
   */
  public generateEventHash(event: BlockchainEvent): string {
    // Create a hashable representation of the event
    const hashableEvent = {
      eventId: event.eventId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      assetId: event.assetId,
      initiatedBy: event.initiatedBy,
      payload: event.payload,
      metadata: event.metadata || {},
    };

    return this.generateHash(hashableEvent);
  }

  /**
   * Generates a chain hash linking to the previous block
   * 
   * Creates a hash that includes the previous block's hash,
   * establishing the blockchain's immutable chain structure.
   * 
   * @param currentEventHash - Hash of the current event
   * @param previousHash - Hash of the previous block
   * @param blockNumber - Current block number
   * @returns Combined chain hash
   * 
   * @example
   * const chainHash = hashService.generateChainHash(eventHash, prevHash, 42);
   */
  public generateChainHash(
    currentEventHash: string,
    previousHash: string,
    blockNumber: number
  ): string {
    const chainData = {
      currentHash: currentEventHash,
      previousHash,
      blockNumber,
      timestamp: new Date().toISOString(),
    };

    return this.generateHash(chainData);
  }

  /**
   * Verifies if a hash matches the expected value
   * 
   * Recomputes the hash from the original data and compares it
   * with the provided hash to detect tampering.
   * 
   * @param data - Original data to verify
   * @param expectedHash - Hash to verify against
   * @returns True if hashes match, false otherwise
   * 
   * @example
   * const isValid = hashService.verifyHash(eventData, storedHash);
   * if (!isValid) {
   *   console.error('Data has been tampered with!');
   * }
   */
  public verifyHash(data: string | Record<string, any>, expectedHash: string): boolean {
    try {
      const computedHash = this.generateHash(data);
      return this.constantTimeCompare(computedHash, expectedHash);
    } catch (error) {
      console.error(`Hash verification failed: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Verifies a blockchain event hash
   * 
   * @param event - Event to verify
   * @param expectedHash - Expected hash value
   * @returns True if event hash is valid
   */
  public verifyEventHash(event: BlockchainEvent, expectedHash: string): boolean {
    const computedHash = this.generateEventHash(event);
    return this.constantTimeCompare(computedHash, expectedHash);
  }

  /**
   * Verifies chain integrity between two blocks
   * 
   * @param currentHash - Current block hash
   * @param previousHash - Previous block hash
   * @param storedChainHash - Stored chain hash to verify
   * @param blockNumber - Block number
   * @returns True if chain link is valid
   */
  public verifyChainLink(
    currentHash: string,
    previousHash: string,
    storedChainHash: string,
    blockNumber: number
  ): boolean {
    const computedChainHash = this.generateChainHash(currentHash, previousHash, blockNumber);
    return this.constantTimeCompare(computedChainHash, storedChainHash);
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   * 
   * Uses crypto.timingSafeEqual for secure hash comparison.
   * 
   * @param a - First string to compare
   * @param b - Second string to compare
   * @returns True if strings are equal
   */
  private constantTimeCompare(a: string, b: string): boolean {
    try {
      if (a.length !== b.length) {
        return false;
      }

      const bufferA = Buffer.from(a, this.encoding);
      const bufferB = Buffer.from(b, this.encoding);

      return crypto.timingSafeEqual(bufferA, bufferB);
    } catch {
      return false;
    }
  }

  /**
   * Generates a unique event ID
   * 
   * Creates a unique identifier for blockchain events using
   * timestamp and random bytes.
   * 
   * @returns Unique event ID string
   * 
   * @example
   * const eventId = hashService.generateEventId();
   * // Returns: 'evt_1626789123456_a1b2c3d4'
   */
  public generateEventId(): string {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(4).toString('hex');
    return `evt_${timestamp}_${randomBytes}`;
  }

  /**
   * Generates a hash for an asset passport
   * 
   * Creates a comprehensive hash of all events in an asset's history.
   * 
   * @param assetId - Asset identifier
   * @param eventHashes - Array of all event hashes for the asset
   * @returns Asset passport hash
   */
  public generatePassportHash(assetId: string, eventHashes: string[]): string {
    const passportData = {
      assetId,
      eventCount: eventHashes.length,
      eventHashes: eventHashes.sort(), // Sort for consistency
      generatedAt: new Date().toISOString(),
    };

    return this.generateHash(passportData);
  }

  /**
   * Creates a SHA-256 hash without HMAC (for document verification)
   * 
   * @param data - Data to hash
   * @returns SHA-256 hash string
   */
  public generateSimpleHash(data: string | Buffer): string {
    const hash = crypto.createHash(this.algorithm);
    hash.update(data);
    return hash.digest(this.encoding);
  }
}

// Export singleton instance
export const hashService = new HashService();
