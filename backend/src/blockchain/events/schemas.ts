import { BLOCKCHAIN_EVENTS } from '../constants/events';
import { BlockchainEvent } from '../interfaces/blockchain.interface';

/**
 * Event Schema Validator
 * 
 * Defines validation rules and schema structure for blockchain events.
 */

/**
 * Base event schema - common fields for all events
 */
export const BASE_EVENT_SCHEMA = {
  eventId: { type: 'string', required: true },
  eventType: { type: 'enum', values: Object.values(BLOCKCHAIN_EVENTS), required: true },
  timestamp: { type: 'string', format: 'iso8601', required: true },
  assetId: { type: 'string', required: true },
  initiatedBy: { type: 'string', required: true },
  payload: { type: 'object', required: true },
} as const;

/**
 * Payload schemas for specific event types
 */
export const EVENT_PAYLOAD_SCHEMAS = {
  [BLOCKCHAIN_EVENTS.ASSET_CREATED]: {
    assetName: { type: 'string', required: true },
    category: { type: 'string', required: true },
    serialNumber: { type: 'string', required: false },
    purchaseDate: { type: 'string', format: 'iso8601', required: false },
    purchaseValue: { type: 'number', required: false },
    supplier: { type: 'string', required: false },
    warrantyExpiry: { type: 'string', format: 'iso8601', required: false },
  },

  [BLOCKCHAIN_EVENTS.ASSET_ALLOCATED]: {
    allocatedTo: { type: 'string', required: true },
    allocationType: { type: 'string', required: true }, // 'employee' | 'department'
    department: { type: 'string', required: false },
    location: { type: 'string', required: false },
    expectedReturnDate: { type: 'string', format: 'iso8601', required: false },
    notes: { type: 'string', required: false },
  },

  [BLOCKCHAIN_EVENTS.ASSET_TRANSFERRED]: {
    fromUser: { type: 'string', required: true },
    toUser: { type: 'string', required: true },
    fromDepartment: { type: 'string', required: false },
    toDepartment: { type: 'string', required: false },
    transferReason: { type: 'string', required: false },
    approvedBy: { type: 'string', required: false },
    transferDate: { type: 'string', format: 'iso8601', required: true },
  },

  [BLOCKCHAIN_EVENTS.ASSET_RETURNED]: {
    returnedBy: { type: 'string', required: true },
    returnCondition: { type: 'string', required: true }, // 'good' | 'damaged' | 'needs_repair'
    returnDate: { type: 'string', format: 'iso8601', required: true },
    receivedBy: { type: 'string', required: true },
    damageNotes: { type: 'string', required: false },
    location: { type: 'string', required: false },
  },

  [BLOCKCHAIN_EVENTS.MAINTENANCE_REQUESTED]: {
    issueDescription: { type: 'string', required: true },
    priority: { type: 'string', required: true }, // 'low' | 'medium' | 'high' | 'urgent'
    requestedBy: { type: 'string', required: true },
    estimatedCost: { type: 'number', required: false },
    vendorName: { type: 'string', required: false },
    scheduledDate: { type: 'string', format: 'iso8601', required: false },
  },

  [BLOCKCHAIN_EVENTS.MAINTENANCE_COMPLETED]: {
    completedDate: { type: 'string', format: 'iso8601', required: true },
    performedBy: { type: 'string', required: true },
    workDescription: { type: 'string', required: true },
    actualCost: { type: 'number', required: false },
    partsReplaced: { type: 'array', required: false },
    warrantyStatus: { type: 'string', required: false },
    nextMaintenanceDate: { type: 'string', format: 'iso8601', required: false },
  },

  [BLOCKCHAIN_EVENTS.AUDIT_COMPLETED]: {
    auditDate: { type: 'string', format: 'iso8601', required: true },
    auditedBy: { type: 'string', required: true },
    auditStatus: { type: 'string', required: true }, // 'found' | 'missing' | 'damaged' | 'surplus'
    condition: { type: 'string', required: false },
    location: { type: 'string', required: false },
    discrepancies: { type: 'array', required: false },
    photos: { type: 'array', required: false },
  },

  [BLOCKCHAIN_EVENTS.DOCUMENT_VERIFIED]: {
    documentType: { type: 'string', required: true }, // 'invoice' | 'warranty' | 'certificate' | 'receipt'
    documentId: { type: 'string', required: true },
    verifiedBy: { type: 'string', required: true },
    verificationDate: { type: 'string', format: 'iso8601', required: true },
    documentHash: { type: 'string', required: false },
    expiryDate: { type: 'string', format: 'iso8601', required: false },
    status: { type: 'string', required: true }, // 'valid' | 'invalid' | 'expired'
  },

  [BLOCKCHAIN_EVENTS.ASSET_DISPOSED]: {
    disposalDate: { type: 'string', format: 'iso8601', required: true },
    disposalMethod: { type: 'string', required: true }, // 'sold' | 'scrapped' | 'donated' | 'recycled'
    disposalReason: { type: 'string', required: true },
    approvedBy: { type: 'string', required: true },
    disposalValue: { type: 'number', required: false },
    disposedTo: { type: 'string', required: false },
    certificateNumber: { type: 'string', required: false },
  },
} as const;

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validates a blockchain event against the schema
 * 
 * @param event - The blockchain event to validate
 * @returns Validation result with errors if any
 */
export function validateEvent(event: Partial<BlockchainEvent>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate base schema
  for (const [field, schema] of Object.entries(BASE_EVENT_SCHEMA)) {
    if (schema.required && !event[field as keyof BlockchainEvent]) {
      errors.push(`Missing required field: ${field}`);
    }

    if (event[field as keyof BlockchainEvent]) {
      const value = event[field as keyof BlockchainEvent];

      if (schema.type === 'string' && typeof value !== 'string') {
        errors.push(`Field '${field}' must be a string`);
      }

      if (schema.type === 'enum' && schema.values && !schema.values.includes(value as any)) {
        errors.push(`Field '${field}' must be one of: ${schema.values.join(', ')}`);
      }

      if (schema.format === 'iso8601' && typeof value === 'string' && !isValidISO8601(value)) {
        errors.push(`Field '${field}' must be a valid ISO 8601 timestamp`);
      }
    }
  }

  // Validate payload schema for specific event types
  if (event.eventType && EVENT_PAYLOAD_SCHEMAS[event.eventType]) {
    const payloadSchema = EVENT_PAYLOAD_SCHEMAS[event.eventType];
    const payload = event.payload || {};

    for (const [field, schema] of Object.entries(payloadSchema)) {
      if (schema.required && payload[field] === undefined) {
        errors.push(`Missing required payload field for ${event.eventType}: ${field}`);
      }

      if (payload[field] !== undefined) {
        const value = payload[field];

        if (schema.type === 'string' && typeof value !== 'string') {
          errors.push(`Payload field '${field}' must be a string`);
        }

        if (schema.type === 'number' && typeof value !== 'number') {
          errors.push(`Payload field '${field}' must be a number`);
        }

        if (schema.type === 'array' && !Array.isArray(value)) {
          errors.push(`Payload field '${field}' must be an array`);
        }

        if (schema.format === 'iso8601' && typeof value === 'string' && !isValidISO8601(value)) {
          errors.push(`Payload field '${field}' must be a valid ISO 8601 timestamp`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validates ISO 8601 timestamp format
 * 
 * @param timestamp - Timestamp string to validate
 * @returns True if valid ISO 8601 format
 */
function isValidISO8601(timestamp: string): boolean {
  const date = new Date(timestamp);
  return date instanceof Date && !isNaN(date.getTime()) && timestamp === date.toISOString();
}

/**
 * Sanitizes event data before recording
 * 
 * @param event - Event to sanitize
 * @returns Sanitized event
 */
export function sanitizeEvent(event: BlockchainEvent): BlockchainEvent {
  return {
    ...event,
    eventId: event.eventId.trim(),
    assetId: event.assetId.trim(),
    initiatedBy: event.initiatedBy.trim().toLowerCase(),
    timestamp: new Date(event.timestamp).toISOString(),
    payload: sanitizePayload(event.payload),
  };
}

/**
 * Sanitizes payload object
 * 
 * @param payload - Payload to sanitize
 * @returns Sanitized payload
 */
function sanitizePayload(payload: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
