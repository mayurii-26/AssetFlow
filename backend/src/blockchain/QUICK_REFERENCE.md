# Blockchain Module - Quick Reference

## File Structure

```
backend/src/blockchain/
├── constants/
│   ├── events.ts              # BLOCKCHAIN_EVENTS enum (9 event types)
│   ├── config.ts              # Configuration constants (HASH_CONFIG, EVENT_CONFIG, etc.)
│   └── index.ts               # Barrel export
├── interfaces/
│   └── blockchain.interface.ts # Core interfaces (BlockchainEvent, BlockchainEventRecord, AssetPassport, VerificationResult)
├── dto/
│   └── blockchain.dto.ts      # DTOs (RecordEventDto, VerifyEventDto, AssetHistoryDto, etc.)
├── events/
│   └── schemas.ts             # Event validation schemas and validators
├── hashing/
│   └── hash.service.ts        # HashService class with crypto operations
├── utils/
│   └── helpers.ts             # Utility functions (formatAddress, formatTimestamp, parseBlockchainError, etc.)
├── index.ts                   # Main module export
└── README.md                  # Complete documentation
```

## Key Exports

### Constants
```typescript
import { 
  BLOCKCHAIN_EVENTS,
  HASH_CONFIG,
  EVENT_CONFIG,
  VERIFICATION_CONFIG,
  BLOCKCHAIN_METADATA 
} from './blockchain';
```

### Interfaces
```typescript
import {
  BlockchainEvent,
  BlockchainEventRecord,
  AssetPassport,
  VerificationResult,
  BlockchainQueryFilter
} from './blockchain';
```

### DTOs
```typescript
import {
  RecordEventDto,
  VerifyEventDto,
  AssetHistoryDto,
  BulkRecordEventDto,
  RecordEventResponseDto,
  VerificationResponseDto
} from './blockchain';
```

### Services
```typescript
import { HashService, hashService } from './blockchain';
```

### Utilities
```typescript
import {
  formatAddress,
  formatTimestamp,
  parseBlockchainError,
  isValidEventType,
  getEventTypeLabel,
  truncateHash,
  calculateBlockchainMetrics,
  sanitizeInput,
  retryWithBackoff
} from './blockchain';
```

### Validators
```typescript
import {
  validateEvent,
  sanitizeEvent,
  BASE_EVENT_SCHEMA,
  EVENT_PAYLOAD_SCHEMAS
} from './blockchain';
```

## HashService Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `normalizePayload(payload)` | Normalize data for consistent hashing | `string` |
| `generateHash(data)` | Generate SHA-256 HMAC hash | `string` |
| `generateEventHash(event)` | Hash blockchain event | `string` |
| `generateChainHash(current, prev, block)` | Generate chain linkage hash | `string` |
| `verifyHash(data, expectedHash)` | Verify data integrity | `boolean` |
| `verifyEventHash(event, expectedHash)` | Verify event hash | `boolean` |
| `verifyChainLink(current, prev, stored, block)` | Verify chain integrity | `boolean` |
| `generateEventId()` | Create unique event ID | `string` |
| `generatePassportHash(assetId, hashes)` | Hash asset passport | `string` |
| `generateSimpleHash(data)` | SHA-256 without HMAC | `string` |

## Event Types

| Event | Description |
|-------|-------------|
| `ASSET_CREATED` | Asset registered in system |
| `ASSET_ALLOCATED` | Asset assigned to user/department |
| `ASSET_TRANSFERRED` | Asset moved between users |
| `ASSET_RETURNED` | Asset returned to inventory |
| `MAINTENANCE_REQUESTED` | Maintenance work initiated |
| `MAINTENANCE_COMPLETED` | Maintenance work finished |
| `AUDIT_COMPLETED` | Audit process completed |
| `DOCUMENT_VERIFIED` | Document verification |
| `ASSET_DISPOSED` | Asset permanently retired |

## Common Patterns

### Record Event
```typescript
const eventDto: RecordEventDto = {
  eventType: BLOCKCHAIN_EVENTS.ASSET_CREATED,
  assetId: 'AST-001',
  initiatedBy: 'user@example.com',
  payload: { /* event data */ },
};

const eventId = hashService.generateEventId();
const event = { ...eventDto, eventId, timestamp: new Date().toISOString() };
const eventHash = hashService.generateEventHash(event);
```

### Verify Event
```typescript
const isValid = hashService.verifyEventHash(event, storedHash);
if (!isValid) {
  console.error('Tampering detected!');
}
```

### Validate Schema
```typescript
const validation = validateEvent(event);
if (!validation.isValid) {
  console.error('Errors:', validation.errors);
}
```

### Query History
```typescript
const historyDto: AssetHistoryDto = {
  assetId: 'AST-001',
  eventTypes: [BLOCKCHAIN_EVENTS.ASSET_CREATED, BLOCKCHAIN_EVENTS.ASSET_ALLOCATED],
  startDate: '2024-01-01T00:00:00Z',
  limit: 50,
  sortOrder: 'desc',
};
```

## TypeScript Compliance

- ✅ Strict type checking
- ✅ JSDoc comments on all public methods
- ✅ Interface-based design
- ✅ SOLID principles
- ✅ Enum-based event types
- ✅ Comprehensive type definitions

## Security Features

- ✅ SHA-256 hashing
- ✅ HMAC authentication
- ✅ Timing-safe comparison
- ✅ Input sanitization
- ✅ Schema validation
- ✅ Chain integrity verification

## Next Steps

1. Integrate with database layer (models/repositories)
2. Create blockchain service (business logic)
3. Build API controllers and routes
4. Add authentication/authorization
5. Implement caching strategy
6. Set up monitoring and logging
