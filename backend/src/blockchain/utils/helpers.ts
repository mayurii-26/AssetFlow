import { BLOCKCHAIN_EVENTS } from '../constants/events';

/**
 * Blockchain Utility Helpers
 * 
 * Common utility functions for blockchain operations.
 */

/**
 * Formats a blockchain address for display
 * 
 * Truncates long addresses for UI display while preserving uniqueness.
 * 
 * @param address - Full blockchain address or identifier
 * @param prefixLength - Number of characters to show at start (default: 6)
 * @param suffixLength - Number of characters to show at end (default: 4)
 * @returns Formatted address string
 * 
 * @example
 * formatAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6')
 * // Returns: '0x742d...bEb6'
 */
export function formatAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!address || address.length <= prefixLength + suffixLength) {
    return address;
  }

  const prefix = address.slice(0, prefixLength);
  const suffix = address.slice(-suffixLength);

  return `${prefix}...${suffix}`;
}

/**
 * Formats a timestamp for display
 * 
 * Converts ISO 8601 timestamps to human-readable format.
 * 
 * @param timestamp - ISO 8601 timestamp string
 * @param format - Output format ('short' | 'long' | 'relative')
 * @returns Formatted timestamp string
 * 
 * @example
 * formatTimestamp('2024-01-15T10:30:00Z', 'short')
 * // Returns: '2024-01-15 10:30'
 * 
 * formatTimestamp('2024-01-15T10:30:00Z', 'relative')
 * // Returns: '2 hours ago'
 */
export function formatTimestamp(
  timestamp: string,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  switch (format) {
    case 'short':
      return date.toISOString().slice(0, 16).replace('T', ' ');

    case 'long':
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });

    case 'relative':
      return getRelativeTime(date);

    default:
      return date.toISOString();
  }
}

/**
 * Gets relative time string (e.g., "2 hours ago")
 * 
 * @param date - Date to compare
 * @returns Relative time string
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Parses blockchain error messages into user-friendly format
 * 
 * @param error - Error object or message
 * @returns Parsed error message
 * 
 * @example
 * parseBlockchainError(new Error('Hash verification failed'))
 * // Returns: { type: 'VERIFICATION_ERROR', message: '...', code: 'HASH_MISMATCH' }
 */
export function parseBlockchainError(error: Error | string): {
  type: string;
  message: string;
  code: string;
  originalError?: string;
} {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const originalError = typeof error === 'string' ? undefined : error.stack;

  // Common blockchain error patterns
  const errorPatterns = [
    {
      pattern: /hash.*verification.*failed/i,
      type: 'VERIFICATION_ERROR',
      code: 'HASH_MISMATCH',
      message: 'Hash verification failed. The data may have been tampered with.',
    },
    {
      pattern: /chain.*integrity/i,
      type: 'INTEGRITY_ERROR',
      code: 'CHAIN_BROKEN',
      message: 'Blockchain chain integrity error detected.',
    },
    {
      pattern: /invalid.*event/i,
      type: 'VALIDATION_ERROR',
      code: 'INVALID_EVENT',
      message: 'Event validation failed. Check event structure and required fields.',
    },
    {
      pattern: /missing.*required.*field/i,
      type: 'VALIDATION_ERROR',
      code: 'MISSING_FIELD',
      message: 'Required field is missing from the event data.',
    },
    {
      pattern: /duplicate.*event/i,
      type: 'DUPLICATE_ERROR',
      code: 'DUPLICATE_EVENT',
      message: 'This event has already been recorded on the blockchain.',
    },
    {
      pattern: /timeout/i,
      type: 'TIMEOUT_ERROR',
      code: 'OPERATION_TIMEOUT',
      message: 'Blockchain operation timed out. Please try again.',
    },
  ];

  for (const { pattern, type, code, message } of errorPatterns) {
    if (pattern.test(errorMessage)) {
      return { type, message, code, originalError };
    }
  }

  // Default error response
  return {
    type: 'UNKNOWN_ERROR',
    message: 'An unexpected blockchain error occurred.',
    code: 'UNKNOWN',
    originalError: errorMessage,
  };
}

/**
 * Validates event type
 * 
 * @param eventType - Event type to validate
 * @returns True if valid event type
 */
export function isValidEventType(eventType: string): eventType is BLOCKCHAIN_EVENTS {
  return Object.values(BLOCKCHAIN_EVENTS).includes(eventType as BLOCKCHAIN_EVENTS);
}

/**
 * Gets human-readable event type label
 * 
 * @param eventType - Blockchain event type
 * @returns Human-readable label
 * 
 * @example
 * getEventTypeLabel(BLOCKCHAIN_EVENTS.ASSET_CREATED)
 * // Returns: 'Asset Created'
 */
export function getEventTypeLabel(eventType: BLOCKCHAIN_EVENTS): string {
  const labels: Record<BLOCKCHAIN_EVENTS, string> = {
    [BLOCKCHAIN_EVENTS.ASSET_CREATED]: 'Asset Created',
    [BLOCKCHAIN_EVENTS.ASSET_ALLOCATED]: 'Asset Allocated',
    [BLOCKCHAIN_EVENTS.ASSET_TRANSFERRED]: 'Asset Transferred',
    [BLOCKCHAIN_EVENTS.ASSET_RETURNED]: 'Asset Returned',
    [BLOCKCHAIN_EVENTS.MAINTENANCE_REQUESTED]: 'Maintenance Requested',
    [BLOCKCHAIN_EVENTS.MAINTENANCE_COMPLETED]: 'Maintenance Completed',
    [BLOCKCHAIN_EVENTS.AUDIT_COMPLETED]: 'Audit Completed',
    [BLOCKCHAIN_EVENTS.DOCUMENT_VERIFIED]: 'Document Verified',
    [BLOCKCHAIN_EVENTS.ASSET_DISPOSED]: 'Asset Disposed',
  };

  return labels[eventType] || eventType;
}

/**
 * Truncates hash for display
 * 
 * @param hash - Full hash string
 * @param length - Number of characters to show (default: 16)
 * @returns Truncated hash
 * 
 * @example
 * truncateHash('5d41402abc4b2a76b9719d911017c592')
 * // Returns: '5d41402abc4b2a76...'
 */
export function truncateHash(hash: string, length: number = 16): string {
  if (!hash || hash.length <= length) {
    return hash;
  }

  return `${hash.slice(0, length)}...`;
}

/**
 * Calculates blockchain metrics from event records
 * 
 * @param events - Array of blockchain events
 * @returns Metrics object
 */
export function calculateBlockchainMetrics(events: any[]): {
  totalEvents: number;
  eventsByType: Record<string, number>;
  dateRange: { earliest: string; latest: string } | null;
  uniqueAssets: number;
  uniqueInitiators: number;
} {
  if (!events || events.length === 0) {
    return {
      totalEvents: 0,
      eventsByType: {},
      dateRange: null,
      uniqueAssets: 0,
      uniqueInitiators: 0,
    };
  }

  const eventsByType: Record<string, number> = {};
  const uniqueAssets = new Set<string>();
  const uniqueInitiators = new Set<string>();
  let earliest = events[0].timestamp;
  let latest = events[0].timestamp;

  for (const event of events) {
    // Count by type
    eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;

    // Track unique assets and initiators
    if (event.assetId) uniqueAssets.add(event.assetId);
    if (event.initiatedBy) uniqueInitiators.add(event.initiatedBy);

    // Track date range
    if (event.timestamp < earliest) earliest = event.timestamp;
    if (event.timestamp > latest) latest = event.timestamp;
  }

  return {
    totalEvents: events.length,
    eventsByType,
    dateRange: { earliest, latest },
    uniqueAssets: uniqueAssets.size,
    uniqueInitiators: uniqueInitiators.size,
  };
}

/**
 * Sanitizes input data to prevent injection attacks
 * 
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"`;]/g, '') // Remove potential SQL/script injection characters
    .slice(0, 1000); // Limit length
}

/**
 * Validates ISO 8601 timestamp
 * 
 * @param timestamp - Timestamp to validate
 * @returns True if valid
 */
export function isValidTimestamp(timestamp: string): boolean {
  if (!timestamp) return false;

  const date = new Date(timestamp);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Generates a unique request ID for tracking
 * 
 * @returns Unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Chunks an array into smaller arrays
 * 
 * @param array - Array to chunk
 * @param chunkSize - Size of each chunk
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
 * Delays execution for specified milliseconds
 * 
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async operation with exponential backoff
 * 
 * @param operation - Async function to retry
 * @param maxAttempts - Maximum retry attempts
 * @param baseDelay - Base delay in milliseconds
 * @returns Operation result
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts - 1) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        await delay(delayMs);
      }
    }
  }

  throw lastError!;
}
