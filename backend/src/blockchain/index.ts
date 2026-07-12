/**
 * AssetFlow Blockchain Module
 * 
 * Enterprise-grade blockchain infrastructure for immutable asset tracking.
 * Provides cryptographic verification, tamper-evident audit trails, and
 * complete asset lifecycle history.
 * 
 * @module blockchain
 */

// Constants
export * from './constants';

// Configuration
export * from './config/blockchain.config';

// Providers
export { Web3Provider, getWeb3Provider } from './providers/web3.provider';
export type { TransactionOptions, TransactionResult } from './providers/web3.provider';

// Interfaces
export * from './interfaces/blockchain.interface';

// DTOs
export * from './dto/blockchain.dto';

// Event Schemas
export * from './events/schemas';

// Hash Service
export { HashService, hashService } from './hashing/hash.service';

// Utilities
export * from './utils/helpers';

// Core Services
export { BlockchainService, blockchainService, EventValidationError, EventNotFoundError } from './services/blockchain.service';
export { VerificationService, verificationService } from './verification/verification.service';
export { QRPassportService, qrPassportService } from './qr/qr.service';
export type { QRPayload, QRCodeOptions } from './qr/qr.service';
