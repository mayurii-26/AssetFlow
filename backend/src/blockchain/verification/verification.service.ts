/**
 * VerificationService
 *
 * Provides high-level verification operations for assets, audit records, and
 * certificates within the AssetFlow blockchain infrastructure.
 *
 * This service sits on top of {@link BlockchainService} and {@link HashService}
 * to offer purpose-built verification helpers rather than exposing raw hashing
 * or Prisma calls directly to callers.
 *
 * Design notes:
 *  - All methods return structured {@link VerificationResult} objects rather
 *    than throwing on invalid hashes, so callers can decide how to handle failures.
 *  - On-chain cross-checking is best-effort: if the node is unreachable the
 *    service still returns a result, but records the limitation in `errors`.
 *
 * @module blockchain/verification
 */

import { HashService } from '../hashing/hash.service';
import { Web3Provider } from '../providers/web3.provider';
import { BLOCKCHAIN_EVENTS } from '../constants/events';
import { VerificationResult } from '../interfaces/blockchain.interface';
import prisma from '../../lib/prisma';

// ─── VerificationService ──────────────────────────────────────────────────────

/**
 * VerificationService — singleton service for verifying blockchain-backed records.
 *
 * Key responsibilities:
 *  - Verify individual assets by checking all their blockchain events.
 *  - Verify audit completions by matching stored audit hashes.
 *  - Verify certificates stored in `DOCUMENT_VERIFIED` events.
 *  - Cross-check hashes against the smart-contract layer.
 *  - Provide constant-time hash comparison to prevent timing attacks.
 */
export class VerificationService {
  private static instance: VerificationService | null = null;

  private readonly hashService: HashService;
  private readonly web3Provider: Web3Provider;

  /**
   * Private constructor — use {@link VerificationService.getInstance}.
   */
  private constructor() {
    this.hashService = new HashService();
    this.web3Provider = Web3Provider.getInstance();
  }

  // ─── Singleton ──────────────────────────────────────────────────────────────

  /**
   * Returns the singleton instance of VerificationService.
   */
  public static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  /**
   * Resets the singleton — intended for test environments only.
   * @internal
   */
  public static reset(): void {
    VerificationService.instance = null;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Verifies the complete blockchain record for an asset.
   *
   * Iterates every blockchain event stored for the given asset, recomputes each
   * event hash from the persisted payload, and confirms it matches the stored
   * hash.  The result aggregates any individual failures into a single
   * {@link VerificationResult}.
   *
   * @param assetId - Asset identifier (e.g. `"AST-2024-00123"`).
   * @returns {@link VerificationResult} summarising the overall asset status.
   *
   * @example
   * ```ts
   * const result = await verificationService.verifyAsset('AST-2024-00123');
   * if (!result.isValid) {
   *   console.error('Asset integrity compromised:', result.errors);
   * }
   * ```
   */
  public async verifyAsset(assetId: string): Promise<VerificationResult> {
    console.log(`[VerificationService] verifyAsset — assetId=${assetId}`);

    const verifiedAt = new Date().toISOString();
    const errors: string[] = [];

    const records = await prisma.blockchainEvent.findMany({
      where: { assetId },
      orderBy: { blockNumber: 'asc' },
    });

    if (records.length === 0) {
      return this.buildResult(false, assetId, '', '', verifiedAt, [
        `No blockchain events found for asset ${assetId}.`,
      ]);
    }

    let lastVerifiedHash = '';

    for (const record of records) {
      const meta = (record.metadata as Record<string, any>) ?? {};
      const storedEventHash: string = (meta['eventHash'] as string) ?? record.eventHash;
      const payload = (meta['payload'] as Record<string, any>) ?? {};

      // Reconstruct the event for re-hashing
      const reconstructed = {
        eventId: record.id,
        eventType: record.eventType,
        timestamp: (meta['timestamp'] as string) ?? record.timestamp.toISOString(),
        assetId: record.assetId,
        initiatedBy: record.performedBy,
        payload,
        metadata: meta['metadata'] ?? {},
      };

      const computedHash = this.hashService.generateEventHash(reconstructed as any);
      const hashMatches = this.compareHashes(computedHash, storedEventHash);

      if (!hashMatches) {
        errors.push(
          `Hash mismatch on event ${record.id} (block ${record.blockNumber}): ` +
          `stored=${storedEventHash.slice(0, 16)}..., computed=${computedHash.slice(0, 16)}...`
        );
      }

      lastVerifiedHash = computedHash;
    }

    const isValid = errors.length === 0;
    const message = isValid
      ? `Asset ${assetId} verified — all ${records.length} event(s) intact.`
      : `Asset ${assetId} verification failed — ${errors.length} tampered event(s) detected.`;

    console.log(`[VerificationService] verifyAsset result — assetId=${assetId}, isValid=${isValid}`);

    return this.buildResult(isValid, assetId, lastVerifiedHash, lastVerifiedHash, verifiedAt, errors, {
      algorithm: 'sha256-hmac',
      totalEvents: records.length,
    });
  }

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Verifies an audit completion record by its hash.
   *
   * Looks up `AUDIT_COMPLETED` blockchain events and checks whether the
   * provided `auditHash` matches the stored event hash of any record.
   *
   * @param auditHash - Hash to verify (typically the `eventHash` of an audit event).
   * @returns {@link VerificationResult}.
   *
   * @example
   * ```ts
   * const result = await verificationService.verifyAudit('5d41402abc4b...');
   * ```
   */
  public async verifyAudit(auditHash: string): Promise<VerificationResult> {
    console.log(`[VerificationService] verifyAudit — hash=${auditHash.slice(0, 16)}...`);

    const verifiedAt = new Date().toISOString();

    const records = await prisma.blockchainEvent.findMany({
      where: { eventType: BLOCKCHAIN_EVENTS.AUDIT_COMPLETED },
    });

    for (const record of records) {
      const meta = (record.metadata as Record<string, any>) ?? {};
      const storedEventHash: string = (meta['eventHash'] as string) ?? record.eventHash;

      if (this.compareHashes(auditHash, storedEventHash)) {
        return this.buildResult(
          true,
          record.id,
          auditHash,
          storedEventHash,
          verifiedAt,
          undefined,
          {
            algorithm: 'sha256-hmac',
            blockNumber: Number(record.blockNumber ?? 0),
            assetId: record.assetId,
          }
        );
      }
    }

    return this.buildResult(false, `audit_${auditHash.slice(0, 8)}`, auditHash, '', verifiedAt, [
      'Audit hash not found in blockchain records.',
    ]);
  }

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Verifies a certificate by its hash.
   *
   * Searches `DOCUMENT_VERIFIED` events for a payload `documentHash` field that
   * matches the provided `certHash`.
   *
   * @param certHash - Hash of the certificate to verify.
   * @returns {@link VerificationResult}.
   *
   * @example
   * ```ts
   * const result = await verificationService.verifyCertificate(certHash);
   * ```
   */
  public async verifyCertificate(certHash: string): Promise<VerificationResult> {
    console.log(`[VerificationService] verifyCertificate — hash=${certHash.slice(0, 16)}...`);

    const verifiedAt = new Date().toISOString();

    const records = await prisma.blockchainEvent.findMany({
      where: { eventType: BLOCKCHAIN_EVENTS.DOCUMENT_VERIFIED },
    });

    for (const record of records) {
      const meta = (record.metadata as Record<string, any>) ?? {};
      const payload = (meta['payload'] as Record<string, any>) ?? {};
      const storedDocHash: string | undefined = payload['documentHash'];

      if (storedDocHash && this.compareHashes(certHash, storedDocHash)) {
        return this.buildResult(
          true,
          record.id,
          certHash,
          storedDocHash,
          verifiedAt,
          undefined,
          {
            algorithm: 'sha256-hmac',
            blockNumber: Number(record.blockNumber ?? 0),
            assetId: record.assetId,
            documentType: payload['documentType'],
          }
        );
      }
    }

    return this.buildResult(false, `cert_${certHash.slice(0, 8)}`, certHash, '', verifiedAt, [
      'Certificate hash not found in blockchain records.',
    ]);
  }

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Cross-checks a hash against the deployed smart contract.
   *
   * Calls the `verifyHash` view method on the AssetRegistry contract.
   * Returns `false` (rather than throwing) if the node is unreachable so
   * callers can degrade gracefully.
   *
   * @param hash - Hash value to verify on-chain.
   * @returns `true` if the contract confirms the hash; `false` otherwise.
   *
   * @example
   * ```ts
   * const onChain = await verificationService.verifyHashOnChain(eventHash);
   * ```
   */
  public async verifyHashOnChain(hash: string): Promise<boolean> {
    console.log(`[VerificationService] verifyHashOnChain — hash=${hash.slice(0, 16)}...`);

    if (!this.web3Provider.isReady()) {
      console.warn('[VerificationService] Web3Provider not ready — skipping on-chain check.');
      return false;
    }

    try {
      const result = await this.web3Provider.call('verifyHash', [hash]);
      const isVerified = result === true || result === '1' || result === 1;
      console.log(`[VerificationService] On-chain result for hash=${hash.slice(0, 16)}...: ${isVerified}`);
      return isVerified;
    } catch (error) {
      console.warn(`[VerificationService] On-chain verification failed: ${(error as Error).message}`);
      return false;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Performs a constant-time comparison of two hash strings.
   *
   * Delegates to the underlying {@link HashService} which uses
   * `crypto.timingSafeEqual` to prevent timing-based side-channel attacks.
   *
   * @param expected - The reference hash (e.g. stored in DB).
   * @param actual   - The computed/incoming hash.
   * @returns `true` if both hashes are identical.
   *
   * @example
   * ```ts
   * const match = verificationService.compareHashes(storedHash, computedHash);
   * ```
   */
  public compareHashes(expected: string, actual: string): boolean {
    return this.hashService.verifyHash(actual, expected);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Constructs a standardised {@link VerificationResult}.
   *
   * @param isValid      - Whether verification passed.
   * @param eventId      - Identifier for the verified item.
   * @param expectedHash - The reference hash.
   * @param computedHash - The freshly computed hash.
   * @param verifiedAt   - ISO 8601 timestamp.
   * @param errors       - Optional array of error strings.
   * @param metadata     - Optional extra metadata fields.
   */
  private buildResult(
    isValid: boolean,
    eventId: string,
    expectedHash: string,
    computedHash: string,
    verifiedAt: string,
    errors?: string[],
    metadata?: Record<string, any>
  ): VerificationResult {
    return {
      isValid,
      eventId,
      expectedHash,
      computedHash,
      verifiedAt,
      message: isValid
        ? 'Verification successful — integrity confirmed.'
        : `Verification failed: ${errors?.join('; ') ?? 'unknown error'}`,
      errors: errors && errors.length > 0 ? errors : undefined,
      metadata: {
        algorithm: 'sha256-hmac',
        ...metadata,
      },
    };
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

/** Pre-instantiated singleton for import convenience. */
export const verificationService = VerificationService.getInstance();
