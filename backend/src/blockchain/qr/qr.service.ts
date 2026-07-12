/**
 * QRPassportService
 *
 * Generates QR codes that encode an asset's blockchain passport URL and
 * retrieves the structured {@link AssetPassport} data underlying the QR code.
 *
 * The QR code payload is a JSON-encoded object containing:
 *  - The asset identifier.
 *  - The passport hash (tamper-evident seal).
 *  - The generation timestamp.
 *  - A verification URL that resolves to the live passport API endpoint.
 *
 * This allows anyone scanning the QR code to independently verify the asset's
 * complete on-chain history via the AssetFlow platform.
 *
 * Dependencies:
 *  - `qrcode` npm package (pure-TypeScript QR generation, no native deps).
 *  - {@link BlockchainService} for generating the underlying passport.
 *
 * @module blockchain/qr
 */

import QRCode from 'qrcode';
import { AssetPassport } from '../interfaces/blockchain.interface';
import { BlockchainService } from '../services/blockchain.service';

// ─── QR payload types ─────────────────────────────────────────────────────────

/**
 * Structured data encoded inside the QR code.
 */
export interface QRPayload {
  /** Asset identifier */
  assetId: string;
  /** Tamper-evident passport hash covering all event hashes */
  passportHash: string;
  /** ISO 8601 generation timestamp */
  generatedAt: string;
  /** Public verification URL */
  verifyUrl: string;
  /** Schema version for forward compatibility */
  version: string;
}

/**
 * Options controlling QR code appearance and output format.
 */
export interface QRCodeOptions {
  /**
   * Output format.
   * - `'dataUrl'` — base-64 PNG data URL (default, ready for `<img src=...>`).
   * - `'svg'`     — inline SVG string.
   * - `'buffer'`  — raw PNG `Buffer`.
   */
  format?: 'dataUrl' | 'svg' | 'buffer';
  /** Error correction level (default: `'M'`). */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  /** Module size in pixels (default: `4`). */
  scale?: number;
  /** Quiet-zone size in modules (default: `4`). */
  margin?: number;
  /** Dark module color (default: `'#000000'`). */
  color?: { dark?: string; light?: string };
  /** Base URL for the verification endpoint (defaults to env var or localhost). */
  baseUrl?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL =
  process.env.ASSET_PASSPORT_BASE_URL ?? 'http://localhost:5000';

const QR_SCHEMA_VERSION = '1.0';

// ─── QRPassportService ────────────────────────────────────────────────────────

/**
 * QRPassportService — singleton service for QR code generation.
 *
 * Key responsibilities:
 *  - Generate QR codes encoding an asset's passport summary.
 *  - Return passport data for a given asset.
 */
export class QRPassportService {
  private static instance: QRPassportService | null = null;

  private readonly blockchainService: BlockchainService;

  /**
   * Private constructor — use {@link QRPassportService.getInstance}.
   */
  private constructor() {
    this.blockchainService = BlockchainService.getInstance();
  }

  // ─── Singleton ──────────────────────────────────────────────────────────────

  /**
   * Returns the singleton instance of QRPassportService.
   */
  public static getInstance(): QRPassportService {
    if (!QRPassportService.instance) {
      QRPassportService.instance = new QRPassportService();
    }
    return QRPassportService.instance;
  }

  /**
   * Resets the singleton — intended for test environments only.
   * @internal
   */
  public static reset(): void {
    QRPassportService.instance = null;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Generates a QR code for an asset's blockchain passport.
   *
   * Workflow:
   *  1. Retrieve the fully verified {@link AssetPassport} for `assetId`.
   *  2. Build a compact {@link QRPayload} embedding the passport hash and a
   *     verification URL.
   *  3. Encode the payload as a JSON string and render it as a QR code using
   *     the `qrcode` package.
   *  4. Return the QR code in the requested format (default: base-64 PNG data URL).
   *
   * @param assetId - Asset identifier (e.g. `"AST-2024-00123"`).
   * @param options - Optional {@link QRCodeOptions} for format and appearance.
   * @returns QR code as a data URL string, SVG string, or Buffer depending on
   *          the `format` option.
   *
   * @example
   * ```ts
   * // Returns a base-64 PNG suitable for <img src="...">
   * const dataUrl = await qrPassportService.generateQRCode('AST-2024-00123');
   *
   * // Returns an inline SVG string
   * const svg = await qrPassportService.generateQRCode('AST-2024-00123', { format: 'svg' });
   *
   * // Returns a raw Buffer (e.g. for writing to disk or attaching to email)
   * const buffer = await qrPassportService.generateQRCode('AST-2024-00123', { format: 'buffer' });
   * ```
   */
  public async generateQRCode(
    assetId: string,
    options: QRCodeOptions = {}
  ): Promise<string> {
    console.log(`[QRPassportService] generateQRCode — assetId=${assetId}, format=${options.format ?? 'dataUrl'}`);

    // ── Step 1: Fetch the asset passport ──────────────────────────────────
    const passport = await this.blockchainService.generateAssetPassport(assetId);

    // ── Step 2: Build QR payload ──────────────────────────────────────────
    const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    const verifyUrl = `${baseUrl}/api/blockchain/passport/${assetId}`;

    const payload: QRPayload = {
      assetId,
      passportHash: passport.passportHash,
      generatedAt: passport.generatedAt,
      verifyUrl,
      version: QR_SCHEMA_VERSION,
    };

    const payloadString = JSON.stringify(payload);

    // ── Step 3: Resolve shared qrcode options ─────────────────────────────
    const sharedOptions = {
      errorCorrectionLevel: (options.errorCorrectionLevel ?? 'M') as QRCode.QRCodeErrorCorrectionLevel,
      scale: options.scale ?? 4,
      margin: options.margin ?? 4,
      color: {
        dark: options.color?.dark ?? '#000000',
        light: options.color?.light ?? '#ffffff',
      },
    };

    // ── Step 4: Generate QR code ──────────────────────────────────────────
    let output: string;

    try {
      const format = options.format ?? 'dataUrl';

      if (format === 'svg') {
        output = await QRCode.toString(payloadString, {
          ...sharedOptions,
          type: 'svg',
        });
      } else if (format === 'buffer') {
        // toBuffer accepts only 'png' type; serialize as base64 string
        const bufferOptions: QRCode.QRCodeToBufferOptions = {
          ...sharedOptions,
          type: 'png',
        };
        const buffer = await QRCode.toBuffer(payloadString, bufferOptions);
        output = buffer.toString('base64');
      } else {
        // Default: data URL
        const dataUrlOptions: QRCode.QRCodeToDataURLOptions = {
          ...sharedOptions,
          type: 'image/png',
        };
        output = await QRCode.toDataURL(payloadString, dataUrlOptions);
      }
    } catch (error) {
      const msg = (error as Error).message;
      console.error(`[QRPassportService] QR generation failed for assetId=${assetId}: ${msg}`);
      throw new Error(`Failed to generate QR code for asset ${assetId}: ${msg}`);
    }

    console.log(`[QRPassportService] QR code generated successfully — assetId=${assetId}`);
    return output;
  }

  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Retrieves the full {@link AssetPassport} for a given asset.
   *
   * This method is a thin wrapper over
   * {@link BlockchainService.generateAssetPassport} exposed from this service
   * so that callers only need to depend on `QRPassportService` when working
   * with passports and QR codes.
   *
   * @param assetId - Asset identifier.
   * @returns Fully populated {@link AssetPassport} with chain integrity info.
   *
   * @example
   * ```ts
   * const passport = await qrPassportService.getPassportData('AST-2024-00123');
   * console.log(passport.chainIntegrity.isValid); // true
   * console.log(passport.totalEvents);            // 7
   * ```
   */
  public async getPassportData(assetId: string): Promise<AssetPassport> {
    console.log(`[QRPassportService] getPassportData — assetId=${assetId}`);

    const passport = await this.blockchainService.generateAssetPassport(assetId);

    console.log(
      `[QRPassportService] Passport data retrieved — assetId=${assetId}, ` +
      `events=${passport.totalEvents}, integrity=${passport.chainIntegrity.isValid}`
    );

    return passport;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Builds the public verification URL for an asset passport.
   *
   * @param baseUrl - Base API URL.
   * @param assetId - Asset identifier.
   * @returns Absolute verification URL.
   */
  private buildVerifyUrl(baseUrl: string, assetId: string): string {
    return `${baseUrl.replace(/\/$/, '')}/api/blockchain/passport/${assetId}`;
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

/** Pre-instantiated singleton for import convenience. */
export const qrPassportService = QRPassportService.getInstance();
