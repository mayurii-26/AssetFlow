# AssetFlow Blockchain Module

Enterprise-grade blockchain infrastructure for immutable asset tracking and verification.

## Overview

The blockchain module provides cryptographic verification, tamper-evident audit trails, and complete asset lifecycle history for the AssetFlow platform. It uses SHA-256 hashing with HMAC for data integrity and implements a chain-based structure for immutable record keeping.

## Architecture

```
blockchain/
├── constants/          # Configuration and event type definitions
│   ├── events.ts      # BLOCKCHAIN_EVENTS enum
│   ├── config.ts      # Configuration constants
│   └── index.ts       # Barrel export
├── interfaces/        # TypeScript interfaces
│   └── blockchain.interface.ts
├── dto/               # Data Transfer Objects
│   └── blockchain.dto.ts
├── events/            # Event schemas and validation
│   └── schemas.ts
├── hashing/           # Cryptographic hash service
│   └── hash.service.ts
├── utils/             # Utility functions
│   └── helpers.ts
└── index.ts           # Main module export
```

## Core Components

### 1. Constants (`constants/`)

**Event Types** (`events.ts`)
- `ASSET_CREATED` - Asset registered in system
- `ASSET_ALLOCATED` - Asset assigned to user/department
- `ASSET_TRANSFERRED` - Asset moved between users
- `ASSET_RETURNED` - Asset returned to inventory
- `MAINTENANCE_REQUESTED` - Maintenance initiated
- `MAINTENANCE_COMPLETED` - Maintenance finished
- `AUDIT_COMPLETED` - Audit process completed
- `DOCUMENT_VERIFIED` - Document verification
- `ASSET_DISPOSED` - Asset permanently retired

**Configuration** (`config.ts`)
- `HASH_CONFIG` - Hashing algorithm settings
- `EVENT_CONFIG` - Event record configuration
- `VERIFICATION_CONFIG` - Verification settings
- `BLOCKCHAIN_METADATA` - System metadata

### 2. Interfaces (`interfaces/`)

**BlockchainEvent**
Core event structure for recording blockchain events.

**BlockchainEventRecord**
Recorded event with cryptographic proof and chain linkage.

**AssetPassport**
Complete tamper-evident history for a specific asset.

**VerificationResult**
Hash verification outcome with detailed metadata.

### 3. DTOs (`dto/`)

**RecordEventDto**
- Input for creating new blockchain events

**VerifyEventDto**
- Input for verifying event integrity

**AssetHistoryDto**
- Input for querying asset blockchain history

**BulkRecordEventDto**
- Batch event recording

### 4. Event Schemas (`events/`)

**Validation System**
- Base schema validation for all events
- Event-type-specific payload schemas
- Data sanitization and normalization
- ISO 8601 timestamp validation

### 5. Hash Service (`hashing/`)

**HashService Class**

Core cryptographic operations:

```typescript
// Generate hash
const hash = hashService.generateHash(data);

// Verify hash
const isValid = hashService.verifyHash(data, expectedHash);

// Generate event hash
const eventHash = hashService.generateEventHash(event);

// Generate chain hash (linking blocks)
const chainHash = hashService.generateChainHash(currentHash, previousHash, blockNumber);

// Generate unique event ID
const eventId = hashService.generateEventId();
```

**Features:**
- SHA-256 with HMAC for enhanced security
- Deterministic payload normalization
- Constant-time comparison (timing attack prevention)
- Chain integrity verification
- Event ID generation
- Asset passport hashing

### 6. Utilities (`utils/`)

**Helper Functions**

```typescript
// Format blockchain address
formatAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6')
// Returns: '0x742d...bEb6'

// Format timestamp
formatTimestamp('2024-01-15T10:30:00Z', 'relative')
// Returns: '2 hours ago'

// Parse errors
parseBlockchainError(error)
// Returns: { type, message, code, originalError }

// Get event label
getEventTypeLabel(BLOCKCHAIN_EVENTS.ASSET_CREATED)
// Returns: 'Asset Created'

// Calculate metrics
calculateBlockchainMetrics(events)
// Returns: { totalEvents, eventsByType, dateRange, ... }

// Retry with exponential backoff
await retryWithBackoff(operation, 3, 1000)
```

## Usage Examples

### Recording a Blockchain Event

```typescript
import { BLOCKCHAIN_EVENTS, RecordEventDto, hashService } from './blockchain';

// Create event DTO
const eventDto: RecordEventDto = {
  eventType: BLOCKCHAIN_EVENTS.ASSET_CREATED,
  assetId: 'AST-2024-00123',
  initiatedBy: 'john.doe@company.com',
  payload: {
    assetName: 'MacBook Pro 16"',
    category: 'Laptop',
    serialNumber: 'SN123456789',
    purchaseDate: '2024-01-15T00:00:00Z',
    purchaseValue: 2500,
  },
  metadata: {
    department: 'Engineering',
    location: 'New York Office',
    ipAddress: '192.168.1.100',
  },
};

// Generate event ID and hash
const eventId = hashService.generateEventId();
const event = {
  ...eventDto,
  eventId,
  timestamp: new Date().toISOString(),
};

const eventHash = hashService.generateEventHash(event);

console.log('Event recorded:', eventId);
console.log('Event hash:', eventHash);
```

### Verifying Event Integrity

```typescript
import { hashService, VerifyEventDto } from './blockchain';

// Verify single event
const isValid = hashService.verifyEventHash(event, storedHash);

if (!isValid) {
  console.error('Data tampering detected!');
}

// Verify chain integrity
const chainValid = hashService.verifyChainLink(
  currentHash,
  previousHash,
  storedChainHash,
  blockNumber
);
```

### Validating Event Schema

```typescript
import { validateEvent, sanitizeEvent } from './blockchain';

// Validate event structure
const validation = validateEvent(event);

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}

// Sanitize event data
const sanitizedEvent = sanitizeEvent(event);
```

### Generating Asset Passport

```typescript
import { hashService } from './blockchain';

// Collect all event hashes for an asset
const eventHashes = assetEvents.map(e => e.eventHash);

// Generate passport hash
const passportHash = hashService.generatePassportHash(
  'AST-2024-00123',
  eventHashes
);

const assetPassport = {
  assetId: 'AST-2024-00123',
  assetName: 'MacBook Pro 16"',
  currentStatus: 'allocated',
  totalEvents: eventHashes.length,
  events: assetEvents,
  generatedAt: new Date().toISOString(),
  verified: true,
  chainIntegrity: { isValid: true, brokenLinks: [], message: 'Chain intact' },
  passportHash,
};
```

## Security Features

### 1. **Cryptographic Hashing**
- SHA-256 algorithm
- HMAC for additional security
- Deterministic payload normalization

### 2. **Tamper Detection**
- Hash verification for all events
- Chain linkage between blocks
- Timing-safe comparison

### 3. **Data Integrity**
- Immutable event records
- Previous hash linking
- Block number sequencing

### 4. **Input Validation**
- Schema validation
- Type checking
- Required field enforcement
- Format validation (ISO 8601 timestamps)

### 5. **Error Handling**
- Structured error parsing
- User-friendly error messages
- Retry mechanisms with exponential backoff

## Configuration

Environment variables (`.env`):

```env
# Blockchain secret key for HMAC
BLOCKCHAIN_SECRET_KEY=your-secret-key-here

# Blockchain network identifier
BLOCKCHAIN_NETWORK=assetflow-production
```

## Best Practices

1. **Always validate events** before recording
2. **Use the HashService singleton** for consistency
3. **Verify chain integrity** periodically
4. **Store event hashes securely**
5. **Never modify recorded events**
6. **Use proper error handling**
7. **Sanitize all input data**
8. **Generate asset passports** for audits

## Testing

```typescript
import { hashService, validateEvent, BLOCKCHAIN_EVENTS } from './blockchain';

// Test hash generation
const data = { test: 'data' };
const hash1 = hashService.generateHash(data);
const hash2 = hashService.generateHash(data);
assert(hash1 === hash2, 'Hashes should be deterministic');

// Test validation
const invalidEvent = { eventType: 'INVALID' };
const result = validateEvent(invalidEvent);
assert(!result.isValid, 'Invalid events should fail validation');
```

## Integration

The blockchain module integrates with:
- **Asset Service** - Record asset lifecycle events
- **Allocation Service** - Track allocations and transfers
- **Maintenance Service** - Log maintenance activities
- **Audit Service** - Store audit results
- **Document Service** - Verify document authenticity

## Performance Considerations

- Event hashing: ~1-2ms per event
- Chain verification: O(n) for n events
- Batch operations supported via `BulkRecordEventDto`
- Consider database indexing on `assetId`, `eventType`, `timestamp`

## Future Enhancements

- [ ] External blockchain integration (Ethereum, Hyperledger)
- [ ] Smart contract support
- [ ] Multi-signature verification
- [ ] Merkle tree implementation
- [ ] Zero-knowledge proofs
- [ ] Distributed ledger support

## License

MIT License - AssetFlow Enterprise

## Support

For issues or questions, contact the AssetFlow development team.
