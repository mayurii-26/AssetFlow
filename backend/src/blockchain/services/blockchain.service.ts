/**
 * BlockchainService
 *
 * Core service responsible for recording, querying, and verifying blockchain
 * events in the AssetFlow platform. Acts as the single integration point
 * between the application layer, the smart-contract layer (Web3Provider),
 * the cryptographic layer (HashService), and the persistence layer (Prisma).
 *
 * @module blockchain/services
 */

import { BLOCKCHAIN_EVENTS } from '../constants/events';
import { VERIFICATION_CONFIG, BLOCKCHAIN_METADATA } from '../constants/config';
import { Web3Provider } from '../providers/web3.provider';
import { HashService } from '../hashing/hash.service';
import { validateEvent, sanitizeEvent } from '../events/schemas';
import { parseBlockchainError, retryWithBackoff } from '../utils/helpers';
import {
  BlockchainEvent,
  BlockchainEventRecord,
  AssetPassport,
  VerificationResult,
  BlockchainQueryFilter,
} from '../interfaces/blockchain.interface';
import { RecordEventDto, VerifyEventDto } from '../dto/blockchain.dto';
import prisma from '../../lib/prisma';

// ─── Error classes ────────────────────────────────────────────────────────────

/** Thrown when an incoming event DTO fails schema validation. */
export class EventValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(`Event validation failed: ${errors.join('; ')}`);
    this.name = 'EventValidationError';
  }
}

/** Thrown when a requested record cannot be found in the database. */
export class EventNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Blockchain event not found: ${identifier}`);
    this.name = 'EventNotFoundError';
  }
}

// ─── Genesis / sentinel hash ──────────────────────────────────────────────────

/** Placeholder hash used as the "previous hash" for the very first event. */
const GENESIS_HASH = '0'.repeat(64);

// ─── BlockchainService ────────────────────────────────────────────────────────

/**
 * BlockchainService — singleton service for blockchain operations.
 *
 * Responsibilities:
 *  - Validate, hash, and record events on the smart contract.
 *  - Persist records to the `blockchain_events` table via Prisma.
 *  - Query asset history with optional filters.
 *  - Verify individual events or entire asset chains.
 *  - Generate cryptographically-sealed Asset Passports.
 *  - Verify off-chain document hashes against on-chain records.
 */
export class BlockchainService {
  private static instance: BlockchainService | null = null;

  private readonly hashService: HashService;
  private readonly web3Provider: Web3Provider;

  /**
   * Private constructor — use {@link BlockchainService.getInstance} instead.
   */
  private constructor() {
    this.hashService = new HashService();
    this.web3Provider = Web3Provider.getInstance();
  }

  // ─── Singleton ──────────────────────────────────────────────────────────────

  /**
   * Returns the singleton instance of BlockchainService.
   */
  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  /**
   * Resets the singleton — useful in test environments.
   * @internal
   */
  public static reset(): void {
    BlockchainService.instance = null;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Records a new blockchain event.
   *
   * Pipeline:
   *  1. Validate the incoming DTO against the event schema.
   *  2. Hydrate the full {@link BlockchainEvent} (generate IDs, timestamps, etc.).
   *  3. Sanitize the event data.
   *  4. Generate the event hash via {@link HashService}.
   *  5. Build the chain link hash (links to the previous event for the asset).
   *  6. Attempt to record the event on the smart contract (best-effort; gracefully
   *     degrades if the chain node is unavailable).
   *  7. Persist the record in the `blockchain_events` table via Prisma.
   *  8. Return the complete {@link BlockchainEventRecord}.
   *
   * @param eventDto - Validated data transfer object for the event.
   * @returns The persisted {@link BlockchainEventRecord}.
   * @throws {EventValidationError} When schema validation fails.
   * @throws {Error} On unexpected database or hashing failures.
   *
   * @example
   * ```ts
   * const record = await blockchainService.recordEvent({
   *   eventType: BLOCKCHAIN_EVENTS.ASSET_CREATED,
   *   assetId: 'AST-2024-00123',
   *   initiatedBy: 'admin@company.com',
   *   payload: { assetName: 'MacBook Pro', category: 'Laptops' },
   * });
   * ```
   */
  public async recordEvent(eventDto: RecordEventDto): Promise<BlockchainEventRecord> {
    console.log(`[BlockchainService] recordEvent — assetId=${eventDto.assetId}, type=${eventDto.eventType}`);

    // ── Step 1: Build the full event object ────────────────────────────────
    const eventId = this.hashService.generateEventId();
    const timestamp = eventDto.timestamp ?? new Date().toISOString();

    const rawEvent: BlockchainEvent = {
      eventId,
      eventType: eventDto.eventType,
      timestamp,
      assetId: eventDto.assetId,
      initiatedBy: eventDto.initiatedBy,
      payload: eventDto.payload,
      metadata: eventDto.metadata,
    };

    // ── Step 2: Validate ───────────────────────────────────────────────────
    const validationResult = validateEvent(rawEvent);
    if (!validationResult.isValid) {
      console.warn(`[BlockchainService] Validation failed for assetId=${eventDto.assetId}:`, validationResult.errors);
      throw new EventValidationError(validationResult.errors);
    }

    // ── Step 3: Sanitize ───────────────────────────────────────────────────
    const sanitizedEvent = sanitizeEvent(rawEvent);

    // ── Step 4: Generate event hash ────────────────────────────────────────
    const eventHash = this.hashService.generateEventHash(sanitizedEvent);

    // ── Step 5: Determine previous hash (for chain linkage) ────────────────
    const previousRecord = await this.getLatestEventForAsset(eventDto.assetId);
    const previousHash = previousRecord?.eventHash ?? GENESIS_HASH;
    const blockNumber = (Number(previousRecord?.blockNumber ?? 0)) + 1;

    // Chain hash ties this block to the previous one
    const chainHash = this.hashService.generateChainHash(eventHash, previousHash, blockNumber);

    // ── Step 6: Record on smart contract (best-effort) ─────────────────────
    let transactionHash: string = `local_${eventId}`;
    let onChainBlockNumber = blockNumber;

    try {
      if (this.web3Provider.isReady()) {
        const txResult = await retryWithBackoff(
          () => this.web3Provider.sendTransaction('recordEvent', [
            eventId,
            eventDto.assetId,
            eventDto.eventType,
            eventHash,
          ]),
          VERIFICATION_CONFIG.MAX_VERIFICATION_ATTEMPTS
        );
        transactionHash = txResult.transactionHash;
        onChainBlockNumber = txResult.blockNumber ?? blockNumber;
        console.log(`[BlockchainService] On-chain tx recorded: ${transactionHash}`);
      } else {
        console.warn('[BlockchainService] Web3Provider not ready — persisting off-chain only.');
      }
    } catch (chainError) {
      const parsed = parseBlockchainError(chainError as Error);
      console.warn(`[BlockchainService] Smart contract unavailable (${parsed.code}). Continuing with off-chain record.`);
    }

    // ── Step 7: Persist via Prisma ─────────────────────────────────────────
    const dbRecord = await prisma.blockchainEvent.create({
      data: {
        id: eventId,
        assetId: sanitizedEvent.assetId,
        eventType: sanitizedEvent.eventType,
        eventHash: chainHash,           // Store the chain hash as the primary identifier
        transactionHash,
        blockNumber: BigInt(onChainBlockNumber),
        performedBy: sanitizedEvent.initiatedBy,
        department: sanitizedEvent.metadata?.department ?? null,
        metadata: {
          eventHash,                    // Raw event hash for individual verification
          previousHash,
          payload: sanitizedEvent.payload,
          metadata: sanitizedEvent.metadata,
          timestamp: sanitizedEvent.timestamp,
          version: BLOCKCHAIN_METADATA.VERSION,
        } as any,
        timestamp: new Date(sanitizedEvent.timestamp),
        verificationStatus: 'VERIFIED',
        status: 'SUCCESS',
      },
    });

    console.log(`[BlockchainService] Event persisted — id=${dbRecord.id}, hash=${chainHash.slice(0, 16)}...`);

    // ── Step 8: Return as BlockchainEventRecord ────────────────────────────
    return this.dbRecordToEventRecord(dbRecord, sanitizedEvent, eventHash, previousHash, onChainBlockNumber);
  }

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Retrieves the complete blockchain history for an asset.
   *
   * @param assetId  - Asset identifier.
   * @param filters  - Optional {@link BlockchainQueryFilter} to narrow results.
   * @returns Array of {@link BlockchainEventRecord} ordered by block number.
   *
   * @example
   * ```ts
   * const history = await blockchainService.getAssetHistory('AST-2024-00123', {
   *   eventType: BLOCKCHAIN_EVENTS.ASSET_ALLOCATED,
   *   limit: 20,
   * });
   * ```
   */
  public async getAssetHistory(
    assetId: string,
    filters?: BlockchainQueryFilter
  ): Promise<BlockchainEventRecord[]> {
    console.log(`[BlockchainService] getAssetHistory — assetId=${assetId}`);

    const where: Record<string, any> = { assetId };

    if (filters?.eventType) {
      const types = Array.isArray(filters.eventType) ? filters.eventType : [filters.eventType];
      where['eventType'] = { in: types };
    }

    if (filters?.initiatedBy) {
      where['performedBy'] = filters.initiatedBy;
    }

    if (filters?.startDate || filters?.endDate) {
      where['timestamp'] = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const dbRecords = await prisma.blockchainEvent.findMany({
      where,
      orderBy: { blockNumber: 'asc' },
      take: filters?.limit ?? 100,
      skip: filters?.offset ?? 0,
    });

    return dbRecords.map((r) => this.dbRecordToEventRecord(r));
  }

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Verifies the integrity of a specific blockchain event.
   *
   * Recomputes the event hash from the stored payload and compares it
   * against the recorded hash, optionally also verifying the chain link.
   *
   * @param eventDto - Contains the event ID and optional expected hash.
   * @returns {@link VerificationResult} describing the outcome.
   * @throws {EventNotFoundError} If the event does not exist in the database.
   *
   * @example
   * ```ts
   * const result = await blockchainService.verifyEvent({
   *   eventId: 'evt_1720000000000_a1b2c3d4',
   *   verifyChain: true,
   * });
   * ```
   */
  public async verifyEvent(eventDto: VerifyEventDto): Promise<VerificationResult> {
    console.log(`[BlockchainService] verifyEvent — eventId=${eventDto.eventId}`);

    const verifiedAt = new Date().toISOString();

    // ── Fetch from DB ──────────────────────────────────────────────────────
    const dbRecord = await prisma.blockchainEvent.findUnique({
      where: { id: eventDto.eventId },
    });

    if (!dbRecord) {
      throw new EventNotFoundError(eventDto.eventId);
    }

    const storedMeta = (dbRecord.metadata as Record<string, any>) ?? {};
    const storedEventHash: string = storedMeta['eventHash'] ?? dbRecord.eventHash;

    // ── Recompute hash from stored payload ────────────────────────────────
    const reconstructedEvent: BlockchainEvent = {
      eventId: dbRecord.id,
      eventType: dbRecord.eventType as BLOCKCHAIN_EVENTS,
      timestamp: (storedMeta['timestamp'] as string) ?? dbRecord.timestamp.toISOString(),
      assetId: dbRecord.assetId,
      initiatedBy: dbRecord.performedBy,
      payload: (storedMeta['payload'] as Record<string, any>) ?? {},
      metadata: storedMeta['metadata'] as BlockchainEvent['metadata'],
    };

    const computedHash = this.hashService.generateEventHash(reconstructedEvent);
    const expectedHash = eventDto.expectedHash ?? storedEventHash;
    const isValid = this.hashService.verifyHash(
      this.hashService['normalizePayload'](reconstructedEvent),
      expectedHash
    );

    const errors: string[] = [];

    // ── Optional chain verification ────────────────────────────────────────
    let chainPosition: number | undefined;
    if (eventDto.verifyChain) {
      chainPosition = Number(dbRecord.blockNumber ?? 0);
      const previousHash: string = storedMeta['previousHash'] ?? GENESIS_HASH;
      const storedChainHash = dbRecord.eventHash;
      const chainValid = this.hashService.verifyChainLink(
        storedEventHash,
        previousHash,
        storedChainHash,
        chainPosition
      );
      if (!chainValid) {
        errors.push('Chain link verification failed — the block may have been tampered with.');
      }
    }

    // ── On-chain cross-check (best-effort) ─────────────────────────────────
    if (this.web3Provider.isReady()) {
      try {
        await this.web3Provider.call('getEvent', [eventDto.eventId]);
      } catch {
        errors.push('On-chain cross-check unavailable — node unreachable.');
      }
    }

    const result: VerificationResult = {
      isValid: isValid && errors.length === 0,
      eventId: eventDto.eventId,
      expectedHash,
      computedHash,
      verifiedAt,
      message: isValid && errors.length === 0
        ? 'Event hash verified — data integrity confirmed.'
        : `Verification failed: ${errors.join('; ')}`,
      errors: errors.length > 0 ? errors : undefined,
      metadata: {
        algorithm: 'sha256-hmac',
        blockNumber: Number(dbRecord.blockNumber ?? 0),
        chainPosition,
      },
    };

    console.log(`[BlockchainService] verifyEvent result — isValid=${result.isValid}, eventId=${eventDto.eventId}`);
    return result;
  }

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Generates a cryptographically-sealed Asset Passport.
   *
   * An Asset Passport contains the full ordered history of blockchain events
   * for an asset, a chain integrity report, and a passport hash that covers
   * all event hashes, making the passport itself tamper-evident.
   *
   * @param assetId - Asset identifier.
   * @returns A fully populated {@link AssetPassport}.
   *
   * @example
   * ```ts
   * const passport = await blockchainService.generateAssetPassport('AST-2024-00123');
   * console.log(passport.chainIntegrity.isValid); // true
   * ```
   */
  public async generateAssetPassport(assetId: string): Promise<AssetPassport> {
    console.log(`[BlockchainService] generateAssetPassport — assetId=${assetId}`);

    // Fetch all events in order
    const events = await this.getAssetHistory(assetId);

    // Resolve asset name from the ASSET_CREATED payload if available
    const creationEvent = events.find((e) => e.eventType === BLOCKCHAIN_EVENTS.ASSET_CREATED);
    const assetName: string = (creationEvent?.payload['assetName'] as string) ?? assetId;
    const currentStatus: string = events.length > 0
      ? (events[events.length - 1].eventType as string)
      : 'UNKNOWN';

    // ── Chain integrity check ──────────────────────────────────────────────
    const brokenLinks: number[] = [];
    for (let i = 1; i < events.length; i++) {
      const previous = events[i - 1];
      const current = events[i];
      const storedMeta = (current as any)['_meta'] ?? {};
      const recordedPrevHash: string = storedMeta['previousHash'] ?? GENESIS_HASH;

      if (recordedPrevHash !== GENESIS_HASH && recordedPrevHash !== previous.eventHash) {
        brokenLinks.push(i);
      }
    }

    const chainIntegrityValid = brokenLinks.length === 0;

    // ── Passport hash ──────────────────────────────────────────────────────
    const eventHashes = events.map((e) => e.eventHash);
    const passportHash = this.hashService.generatePassportHash(assetId, eventHashes);

    const passport: AssetPassport = {
      assetId,
      assetName,
      currentStatus,
      totalEvents: events.length,
      events,
      generatedAt: new Date().toISOString(),
      verified: chainIntegrityValid,
      chainIntegrity: {
        isValid: chainIntegrityValid,
        brokenLinks,
        message: chainIntegrityValid
          ? 'All chain links are intact — asset history is unmodified.'
          : `Chain integrity compromised at block(s): ${brokenLinks.join(', ')}.`,
      },
      passportHash,
    };

    console.log(
      `[BlockchainService] Passport generated — assetId=${assetId}, events=${events.length}, integrity=${chainIntegrityValid}`
    );
    return passport;
  }

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Verifies a document hash against the blockchain records.
   *
   * Looks up `DOCUMENT_VERIFIED` events for the given asset (or globally when
   * `assetId` is omitted) and checks whether any recorded payload contains a
   * matching `documentHash` field.
   *
   * @param documentHash - SHA-256 (or HMAC) hash of the document to verify.
   * @param assetId      - Optional asset scope to limit the search.
   * @returns {@link VerificationResult} for the document hash.
   *
   * @example
   * ```ts
   * const result = await blockchainService.verifyDocumentHash(
   *   'abc123...',
   *   'AST-2024-00123'
   * );
   * ```
   */
  public async verifyDocumentHash(
    documentHash: string,
    assetId?: string
  ): Promise<VerificationResult> {
    console.log(`[BlockchainService] verifyDocumentHash — hash=${documentHash.slice(0, 16)}..., assetId=${assetId ?? 'any'}`);

    const verifiedAt = new Date().toISOString();
    const pseudoEventId = `doc_verify_${Date.now()}`;

    const where: Record<string, any> = {
      eventType: BLOCKCHAIN_EVENTS.DOCUMENT_VERIFIED,
      ...(assetId ? { assetId } : {}),
    };

    const records = await prisma.blockchainEvent.findMany({ where });

    for (const record of records) {
      const meta = (record.metadata as Record<string, any>) ?? {};
      const payload = (meta['payload'] as Record<string, any>) ?? {};
      const storedDocHash: string | undefined = payload['documentHash'];

      if (storedDocHash && this.hashService.verifyHash(documentHash, storedDocHash)) {
        return {
          isValid: true,
          eventId: record.id,
          expectedHash: storedDocHash,
          computedHash: documentHash,
          verifiedAt,
          message: 'Document hash verified on-chain — document is authentic.',
          metadata: {
            algorithm: 'sha256-hmac',
            blockNumber: Number(record.blockNumber ?? 0),
          },
        };
      }
    }

    return {
      isValid: false,
      eventId: pseudoEventId,
      expectedHash: '',
      computedHash: documentHash,
      verifiedAt,
      message: 'Document hash not found in blockchain records — document could not be verified.',
      errors: ['No matching document hash found in blockchain events.'],
      metadata: { algorithm: 'sha256-hmac' },
    };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Fetches the most recent blockchain event for an asset (for chain linkage).
   *
   * @param assetId - Asset identifier.
   * @returns The latest DB record or `null` if this is the first event.
   */
  private async getLatestEventForAsset(assetId: string) {
    return prisma.blockchainEvent.findFirst({
      where: { assetId },
      orderBy: { blockNumber: 'desc' },
    });
  }

  /**
   * Maps a raw Prisma `BlockchainEvent` row to the domain
   * {@link BlockchainEventRecord} interface.
   *
   * @param dbRecord      - Raw Prisma record.
   * @param event         - Optional pre-built event object (avoids re-parsing).
   * @param eventHash     - Raw event hash (before chain-linking).
   * @param previousHash  - Previous block's hash.
   * @param blockNumber   - Block position in the asset chain.
   */
  private dbRecordToEventRecord(
    dbRecord: any,
    event?: BlockchainEvent,
    eventHash?: string,
    previousHash?: string,
    blockNumber?: number
  ): BlockchainEventRecord {
    const meta = (dbRecord.metadata as Record<string, any>) ?? {};

    const resolvedEvent: BlockchainEvent = event ?? {
      eventId: dbRecord.id,
      eventType: dbRecord.eventType as BLOCKCHAIN_EVENTS,
      timestamp: (meta['timestamp'] as string) ?? (dbRecord.timestamp as Date).toISOString(),
      assetId: dbRecord.assetId,
      initiatedBy: dbRecord.performedBy,
      payload: (meta['payload'] as Record<string, any>) ?? {},
      metadata: meta['metadata'] as BlockchainEvent['metadata'],
    };

    return {
      ...resolvedEvent,
      eventHash: eventHash ?? (meta['eventHash'] as string) ?? dbRecord.eventHash,
      previousHash: previousHash ?? (meta['previousHash'] as string) ?? GENESIS_HASH,
      blockNumber: blockNumber ?? Number(dbRecord.blockNumber ?? 0),
      recordedAt: (dbRecord.createdAt as Date).toISOString(),
      signature: dbRecord.transactionHash,
      status: this.mapDbStatus(dbRecord.status),
    };
  }

  /**
   * Normalises the raw DB status string into the typed union.
   */
  private mapDbStatus(status: string): BlockchainEventRecord['status'] {
    const map: Record<string, BlockchainEventRecord['status']> = {
      SUCCESS: 'confirmed',
      PENDING: 'pending',
      FAILED: 'failed',
      VERIFIED: 'verified',
    };
    return map[status?.toUpperCase()] ?? 'confirmed';
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

/** Pre-instantiated singleton for import convenience. */
export const blockchainService = BlockchainService.getInstance();
