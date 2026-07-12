/**
 * Blockchain API Routes
 *
 * Provides REST endpoints for the AssetFlow blockchain infrastructure.
 * All blockchain business logic is delegated to BlockchainService —
 * these handlers are thin controllers.
 *
 * Endpoints:
 *   POST   /api/blockchain/events          — Record a new blockchain event
 *   GET    /api/blockchain/events/:assetId — Get full event history for an asset
 *   POST   /api/blockchain/verify          — Verify a hash or event on-chain
 *   GET    /api/blockchain/passport/:assetId — Generate / retrieve asset passport
 *   GET    /api/blockchain/health          — Blockchain node connectivity check
 *
 * @module routes/blockchain
 */

import { Router, Request, Response, NextFunction } from "express";
import { BlockchainService } from "../blockchain/services/blockchain.service";
import { QRPassportService } from "../blockchain/qr/qr.service";
import { VerificationService } from "../blockchain/verification/verification.service";
import {
  validateRecordEventBody,
  validateAssetIdParam,
  validateVerifyBody,
  blockchainErrorHandler,
} from "../blockchain/middleware/blockchain.middleware";
import { BLOCKCHAIN_EVENTS } from "../blockchain/constants/events";
import { Web3Provider } from "../blockchain/providers/web3.provider";

const router = Router();

// ─── Service singletons ───────────────────────────────────────────────────────

const blockchainService  = BlockchainService.getInstance();
const qrService          = QRPassportService.getInstance();
const verificationService = VerificationService.getInstance();

// ─── GET /api/blockchain/health ───────────────────────────────────────────────

/**
 * Health check — confirms blockchain node is reachable and reports status.
 */
router.get("/health", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = Web3Provider.getInstance();
    const ready    = provider.isReady();

    let blockNumber: number | null = null;
    if (ready) {
      try { blockNumber = await provider.getBlockNumber(); } catch { /* degraded */ }
    }

    res.json({
      success: true,
      data: {
        status:      ready ? "connected" : "disconnected",
        blockNumber,
        network:     "hardhat-local",
        chainId:     31337,
        checkedAt:   new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/blockchain/events/:assetId ─────────────────────────────────────

/**
 * Returns the full immutable event history for a given asset.
 * Accepts optional query params: eventType, startDate, endDate, limit, offset.
 */
router.get(
  "/events/:assetId",
  validateAssetIdParam,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { assetId } = req.params;
      const { eventType, startDate, endDate, limit, offset } = req.query;

      const filters = {
        ...(eventType  && { eventType:  eventType as BLOCKCHAIN_EVENTS }),
        ...(startDate  && { startDate:  String(startDate) }),
        ...(endDate    && { endDate:    String(endDate) }),
        ...(limit      && { limit:      Number(limit) }),
        ...(offset     && { offset:     Number(offset) }),
      };

      const history = await blockchainService.getAssetHistory(assetId, filters);

      res.json({
        success: true,
        data:    history,
        total:   history.length,
        assetId,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /api/blockchain/events ─────────────────────────────────────────────

/**
 * Records a new blockchain event.
 *
 * Body: { assetId, eventType, initiatedBy, payload?, metadata? }
 *
 * This endpoint is primarily used for direct integration testing.
 * In production, business modules call BlockchainService.recordEvent() directly.
 */
router.post(
  "/events",
  validateRecordEventBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { assetId, eventType, initiatedBy, payload, metadata } = req.body;

      const record = await blockchainService.recordEvent({
        assetId,
        eventType,
        initiatedBy,
        payload:   payload  ?? {},
        metadata:  metadata ?? {},
      });

      res.status(201).json({
        success: true,
        data:    record,
        message: "Event recorded on blockchain",
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── POST /api/blockchain/verify ─────────────────────────────────────────────

/**
 * Verifies a hash or event against on-chain records.
 *
 * Body (at least one required): { hash?, assetId?, eventId? }
 */
router.post(
  "/verify",
  validateVerifyBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { hash, assetId, eventId } = req.body;

      let result;

      if (hash) {
        // Verify a document/arbitrary hash on-chain
        result = await blockchainService.verifyDocumentHash(hash, assetId);
      } else if (eventId) {
        // Verify a specific event by its ID
        result = await blockchainService.verifyEvent({ eventId, assetId });
      } else {
        // Verify overall asset integrity
        result = await verificationService.verifyAsset(assetId);
      }

      res.json({
        success: true,
        data:    result,
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── GET /api/blockchain/passport/:assetId ───────────────────────────────────

/**
 * Returns the complete Asset Passport:
 * asset info + full blockchain history + chain integrity + QR code.
 */
router.get(
  "/passport/:assetId",
  validateAssetIdParam,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { assetId } = req.params;
      const { qr } = req.query; // ?qr=true to include QR data URL

      const passport = await blockchainService.generateAssetPassport(assetId);

      let qrCode: string | null = null;
      if (qr === "true") {
        try {
          qrCode = await qrService.generateQRCode(assetId);
        } catch {
          // QR generation is non-critical — return passport without it
          qrCode = null;
        }
      }

      res.json({
        success: true,
        data: {
          ...passport,
          ...(qrCode !== null && { qrCode }),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── GET /api/blockchain/qr/:assetId ─────────────────────────────────────────

/**
 * Returns a QR code image (data URL) for the given asset.
 * Scanning the QR redirects to the asset passport endpoint.
 */
router.get(
  "/qr/:assetId",
  validateAssetIdParam,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { assetId } = req.params;
      const qrCode = await qrService.generateQRCode(assetId);

      res.json({
        success: true,
        data: {
          assetId,
          qrCode, // base64 data URL: "data:image/png;base64,..."
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── Blockchain-scoped error handler ─────────────────────────────────────────

router.use(blockchainErrorHandler);

export default router;
