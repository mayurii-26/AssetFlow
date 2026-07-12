import { BLOCKCHAIN_EVENTS } from '../constants/events';

/**
 * Data Transfer Object for recording blockchain events
 * 
 * Used when creating new blockchain event records.
 */
export class RecordEventDto {
  /**
   * Type of blockchain event
   * @example BLOCKCHAIN_EVENTS.ASSET_CREATED
   */
  eventType!: BLOCKCHAIN_EVENTS;

  /**
   * Asset identifier
   * @example "AST-2024-00123"
   */
  assetId!: string;

  /**
   * User or system initiating the event
   * @example "john.doe@company.com"
   */
  initiatedBy!: string;

  /**
   * Event-specific data payload
   * @example { "serialNumber": "SN123456", "category": "Laptop" }
   */
  payload!: Record<string, any>;

  /**
   * Optional metadata for additional context
   */
  metadata?: {
    department?: string;
    location?: string;
    ipAddress?: string;
    userAgent?: string;
    notes?: string;
    [key: string]: any;
  };

  /**
   * Optional custom timestamp (defaults to current time)
   */
  timestamp?: string;
}

/**
 * Data Transfer Object for verifying blockchain events
 * 
 * Used when requesting verification of event integrity.
 */
export class VerifyEventDto {
  /**
   * Event ID to verify
   * @example "evt_1234567890abcdef"
   */
  eventId!: string;

  /**
   * Optional: Expected hash for comparison
   */
  expectedHash?: string;

  /**
   * Whether to verify the entire chain up to this event
   * @default false
   */
  verifyChain?: boolean;

  /**
   * Whether to perform strict validation
   * @default true
   */
  strictMode?: boolean;
}

/**
 * Data Transfer Object for querying asset history
 * 
 * Used when retrieving blockchain history for an asset.
 */
export class AssetHistoryDto {
  /**
   * Asset identifier
   * @example "AST-2024-00123"
   */
  assetId!: string;

  /**
   * Filter by specific event types
   */
  eventTypes?: BLOCKCHAIN_EVENTS[];

  /**
   * Start date for filtering (ISO 8601)
   * @example "2024-01-01T00:00:00Z"
   */
  startDate?: string;

  /**
   * End date for filtering (ISO 8601)
   * @example "2024-12-31T23:59:59Z"
   */
  endDate?: string;

  /**
   * Filter by initiator
   */
  initiatedBy?: string;

  /**
   * Maximum number of records to return
   * @default 100
   */
  limit?: number;

  /**
   * Number of records to skip (for pagination)
   * @default 0
   */
  offset?: number;

  /**
   * Sort order
   * @default "desc"
   */
  sortOrder?: 'asc' | 'desc';

  /**
   * Whether to include verification data
   * @default false
   */
  includeVerification?: boolean;

  /**
   * Whether to generate asset passport
   * @default false
   */
  generatePassport?: boolean;
}

/**
 * Data Transfer Object for bulk event recording
 * 
 * Used when recording multiple events in a single transaction.
 */
export class BulkRecordEventDto {
  /**
   * Array of events to record
   */
  events!: RecordEventDto[];

  /**
   * Whether to fail the entire batch if one event fails
   * @default true
   */
  atomic?: boolean;

  /**
   * Batch metadata
   */
  batchMetadata?: {
    batchId?: string;
    description?: string;
    [key: string]: any;
  };
}

/**
 * Response DTO for recorded events
 */
export class RecordEventResponseDto {
  /**
   * Success status
   */
  success!: boolean;

  /**
   * Generated event ID
   */
  eventId!: string;

  /**
   * Generated event hash
   */
  eventHash!: string;

  /**
   * Block number
   */
  blockNumber!: number;

  /**
   * Timestamp of recording
   */
  recordedAt!: string;

  /**
   * Additional response message
   */
  message?: string;
}

/**
 * Response DTO for verification results
 */
export class VerificationResponseDto {
  /**
   * Verification success status
   */
  isValid!: boolean;

  /**
   * Event ID that was verified
   */
  eventId!: string;

  /**
   * Verification message
   */
  message!: string;

  /**
   * Computed hash
   */
  computedHash!: string;

  /**
   * Expected hash (if provided)
   */
  expectedHash?: string;

  /**
   * Verification timestamp
   */
  verifiedAt!: string;

  /**
   * Any errors encountered
   */
  errors?: string[];
}
