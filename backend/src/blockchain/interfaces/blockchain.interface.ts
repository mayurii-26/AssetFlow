import { BLOCKCHAIN_EVENTS } from '../constants/events';

/**
 * Core blockchain event structure
 * 
 * Represents a single event to be recorded on the blockchain.
 */
export interface BlockchainEvent {
  /** Unique event identifier */
  eventId: string;
  
  /** Type of blockchain event */
  eventType: BLOCKCHAIN_EVENTS;
  
  /** ISO 8601 timestamp of when the event occurred */
  timestamp: string;
  
  /** ID of the asset involved in this event */
  assetId: string;
  
  /** User or system that initiated the event */
  initiatedBy: string;
  
  /** Event-specific payload data */
  payload: Record<string, any>;
  
  /** Optional metadata for additional context */
  metadata?: {
    department?: string;
    location?: string;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };
}

/**
 * Blockchain event record with cryptographic proof
 * 
 * Represents a recorded event with hash verification data.
 */
export interface BlockchainEventRecord extends BlockchainEvent {
  /** Cryptographic hash of the event */
  eventHash: string;
  
  /** Hash of the previous event (chain linkage) */
  previousHash: string;
  
  /** Block number in the chain */
  blockNumber: number;
  
  /** ISO 8601 timestamp of when the record was created */
  recordedAt: string;
  
  /** Signature or verification proof */
  signature?: string;
  
  /** Record status */
  status: 'pending' | 'confirmed' | 'verified' | 'failed';
}

/**
 * Asset Passport - Complete blockchain history for an asset
 * 
 * Provides a tamper-evident record of all events for a specific asset.
 */
export interface AssetPassport {
  /** Asset identifier */
  assetId: string;
  
  /** Asset name/description */
  assetName: string;
  
  /** Current asset status */
  currentStatus: string;
  
  /** Total number of blockchain events */
  totalEvents: number;
  
  /** Chronological list of all events */
  events: BlockchainEventRecord[];
  
  /** Passport generation timestamp */
  generatedAt: string;
  
  /** Overall verification status */
  verified: boolean;
  
  /** Chain integrity check result */
  chainIntegrity: {
    isValid: boolean;
    brokenLinks: number[];
    message: string;
  };
  
  /** Passport hash for verification */
  passportHash: string;
}

/**
 * Verification result for blockchain events
 * 
 * Contains the outcome of hash verification operations.
 */
export interface VerificationResult {
  /** Whether verification succeeded */
  isValid: boolean;
  
  /** Event or record being verified */
  eventId: string;
  
  /** Expected hash value */
  expectedHash: string;
  
  /** Actual computed hash value */
  computedHash: string;
  
  /** Verification timestamp */
  verifiedAt: string;
  
  /** Detailed verification message */
  message: string;
  
  /** Any errors encountered during verification */
  errors?: string[];
  
  /** Additional verification metadata */
  metadata?: {
    algorithm: string;
    blockNumber?: number;
    chainPosition?: number;
    [key: string]: any;
  };
}

/**
 * Blockchain query filter options
 */
export interface BlockchainQueryFilter {
  /** Filter by asset ID */
  assetId?: string;
  
  /** Filter by event type */
  eventType?: BLOCKCHAIN_EVENTS | BLOCKCHAIN_EVENTS[];
  
  /** Filter by date range - start */
  startDate?: string;
  
  /** Filter by date range - end */
  endDate?: string;
  
  /** Filter by initiator */
  initiatedBy?: string;
  
  /** Pagination - limit */
  limit?: number;
  
  /** Pagination - offset */
  offset?: number;
}
