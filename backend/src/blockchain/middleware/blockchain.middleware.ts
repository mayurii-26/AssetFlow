/**
 * Blockchain Middleware
 *
 * Express middleware for blockchain request validation, error handling,
 * and graceful degradation when the blockchain node is unavailable.
 *
 * @module blockchain/middleware
 */

import { Request, Response, NextFunction } from 'express';
import { BLOCKCHAIN_EVENTS } from '../constants/events';

// ─── Allowed event types set (fast O(1) lookup) ───────────────────────────────

const VALID_EVENT_TYPES = new Set<string>(Object.values(BLOCKCHAIN_EVENTS));

// ─── Middleware: validate recordEvent body ─────────────────────────────────────

/**
 * Validates the request body for POST /blockchain/events.
 * Ensures required fields are present and eventType is a known value.
 */
export function validateRecordEventBody(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { assetId, eventType, initiatedBy, payload } = req.body ?? {};

  const errors: string[] = [];

  if (!assetId || typeof assetId !== 'string' || !assetId.trim()) {
    errors.push('assetId is required and must be a non-empty string');
  }

  if (!eventType || typeof eventType !== 'string') {
    errors.push('eventType is required');
  } else if (!VALID_EVENT_TYPES.has(eventType)) {
    errors.push(
      `eventType "${eventType}" is invalid. Valid values: ${[...VALID_EVENT_TYPES].join(', ')}`,
    );
  }

  if (!initiatedBy || typeof initiatedBy !== 'string' || !initiatedBy.trim()) {
    errors.push('initiatedBy is required and must be a non-empty string');
  }

  if (payload !== undefined && (typeof payload !== 'object' || Array.isArray(payload))) {
    errors.push('payload must be a plain object when provided');
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, error: 'Validation failed', details: errors });
    return;
  }

  next();
}

// ─── Middleware: validate assetId param ───────────────────────────────────────

/**
 * Validates that req.params.assetId is present and non-empty.
 */
export function validateAssetIdParam(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { assetId } = req.params;
  if (!assetId || !assetId.trim()) {
    res.status(400).json({ success: false, error: 'assetId param is required' });
    return;
  }
  next();
}

// ─── Middleware: validate verification request ────────────────────────────────

/**
 * Validates the request body for POST /blockchain/verify.
 * Requires at least a hash or assetId to be provided.
 */
export function validateVerifyBody(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { hash, assetId, eventId } = req.body ?? {};

  if (!hash && !assetId && !eventId) {
    res.status(400).json({
      success: false,
      error: 'At least one of hash, assetId, or eventId must be provided',
    });
    return;
  }

  if (hash && (typeof hash !== 'string' || !/^[a-f0-9]{64}$/i.test(hash))) {
    res.status(400).json({
      success: false,
      error: 'hash must be a valid 64-character hex SHA-256 string',
    });
    return;
  }

  next();
}

// ─── Middleware: blockchain error handler ─────────────────────────────────────

/**
 * Express error-handling middleware specifically for blockchain errors.
 * Must be registered AFTER blockchain routes.
 *
 * Gracefully degrades blockchain errors so the rest of the ERP continues
 * to function even when the local Hardhat node is unavailable.
 */
export function blockchainErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Pass non-blockchain errors to the global handler
  if (!isBlockchainError(err)) {
    next(err);
    return;
  }

  console.error('[BlockchainMiddleware] Blockchain error:', err.message);

  // Known validation error
  if (err.name === 'EventValidationError') {
    res.status(400).json({
      success: false,
      error: 'Invalid blockchain event',
      details: (err as any).errors ?? [err.message],
    });
    return;
  }

  // Record not found
  if (err.name === 'EventNotFoundError') {
    res.status(404).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Web3 / node connectivity
  if (isConnectivityError(err)) {
    res.status(503).json({
      success: false,
      error: 'Blockchain node is unavailable. The record has been saved locally and will be synced when the node comes online.',
      degraded: true,
    });
    return;
  }

  // Generic blockchain error
  res.status(500).json({
    success: false,
    error: 'Blockchain operation failed',
    message: err.message,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isBlockchainError(err: Error): boolean {
  return (
    err.name === 'EventValidationError' ||
    err.name === 'EventNotFoundError' ||
    err.name === 'Web3ProviderError' ||
    isConnectivityError(err) ||
    err.message.includes('blockchain') ||
    err.message.includes('contract') ||
    err.message.includes('Web3')
  );
}

function isConnectivityError(err: Error): boolean {
  const msg = err.message.toLowerCase();
  return (
    msg.includes('connect') ||
    msg.includes('econnrefused') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('not initialized') ||
    msg.includes('provider')
  );
}
