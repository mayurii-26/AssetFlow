# Web3 Provider & Blockchain Configuration

This document describes the Web3 provider and blockchain configuration setup for AssetFlow.

## Overview

The Web3 integration consists of:

1. **blockchain.config.ts** - Type-safe configuration service for blockchain environment variables
2. **web3.provider.ts** - Singleton Web3 provider for contract interactions
3. **BlockchainEvent** model - Prisma model for storing blockchain event records

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_CHAIN_ID=31337
BLOCKCHAIN_CONTRACT_ADDRESS=0x...  # Set after deployment
BLOCKCHAIN_PRIVATE_KEY=0x...       # Optional: For signing transactions
BLOCKCHAIN_GAS_LIMIT=3000000       # Optional: Default gas limit
BLOCKCHAIN_GAS_PRICE=               # Optional: Gas price in wei
BLOCKCHAIN_SECRET_KEY=assetflow-blockchain-secret
```

## Usage

### Initialize Web3 Provider

```typescript
import { getWeb3Provider } from './blockchain';

// Initialize on app startup
const web3Provider = getWeb3Provider();
await web3Provider.initialize();
```

### Send Transactions

```typescript
import { getWeb3Provider } from './blockchain';

const web3Provider = getWeb3Provider();

// Record an asset event on-chain
const result = await web3Provider.sendTransaction(
  'recordEvent',
  [
    'ASSET-001',           // assetId
    'CREATED',             // eventType
    'abc123...',           // eventHash
    'user-123',            // performer
    '{"status":"active"}'  // metadata (JSON string)
  ]
);

console.log('Transaction hash:', result.transactionHash);
console.log('Block number:', result.blockNumber);
```

### Call View Methods

```typescript
import { getWeb3Provider } from './blockchain';

const web3Provider = getWeb3Provider();

// Get asset history
const history = await web3Provider.call('getAssetHistory', ['ASSET-001']);

// Verify hash
const exists = await web3Provider.call('verifyHash', ['ASSET-001', 'abc123...']);

// Get event count
const count = await web3Provider.call('getEventCount', ['ASSET-001']);
```

### Store Blockchain Events in Database

After recording an event on-chain, store it in the database:

```typescript
import { prisma } from './lib/prisma';

await prisma.blockchainEvent.create({
  data: {
    assetId: 'ASSET-001',
    eventType: 'CREATED',
    eventHash: 'abc123...',
    transactionHash: result.transactionHash,
    blockNumber: BigInt(result.blockNumber || 0),
    performedBy: 'user-123',
    department: 'IT',
    metadata: { status: 'active' },
    timestamp: new Date(),
    verificationStatus: 'VERIFIED',
    status: 'SUCCESS',
  },
});
```

### Query Blockchain Events

```typescript
import { prisma } from './lib/prisma';

// Get all events for an asset
const events = await prisma.blockchainEvent.findMany({
  where: { assetId: 'ASSET-001' },
  orderBy: { timestamp: 'desc' },
});

// Get events by type
const transfers = await prisma.blockchainEvent.findMany({
  where: { eventType: 'TRANSFERRED' },
});

// Get events by department
const deptEvents = await prisma.blockchainEvent.findMany({
  where: { department: 'IT' },
});
```

## API Reference

### Web3Provider Methods

#### `initialize()`
Initialize the Web3 provider and connect to RPC.

**Returns:** `Promise<void>`

**Throws:** `Error` if configuration is invalid or connection fails

#### `getWeb3()`
Get the Web3 instance.

**Returns:** `Web3`

**Throws:** `Error` if not initialized

#### `getContract()`
Get the AssetRegistry contract instance.

**Returns:** `Contract<ContractAbi>`

**Throws:** `Error` if not initialized

#### `getAccount()`
Get the current account/signer address.

**Returns:** `Promise<string | null>`

#### `sendTransaction(method, params, options?)`
Send a transaction to the contract.

**Parameters:**
- `method: string` - Contract method name
- `params: any[]` - Method parameters
- `options?: TransactionOptions` - Transaction options

**Returns:** `Promise<TransactionResult>`

**Throws:** `Error` if transaction fails

#### `call(method, params)`
Call a view/pure contract method (no transaction).

**Parameters:**
- `method: string` - Contract method name
- `params: any[]` - Method parameters

**Returns:** `Promise<any>`

**Throws:** `Error` if call fails

#### `getBlockNumber()`
Get current block number.

**Returns:** `Promise<number>`

#### `isReady()`
Check if provider is initialized.

**Returns:** `boolean`

### Configuration Functions

#### `getBlockchainConfig()`
Get blockchain configuration from environment variables.

**Returns:** `BlockchainConfig`

**Throws:** `Error` if required variables are missing

#### `validateBlockchainConfig(config)`
Validate blockchain configuration.

**Parameters:**
- `config: BlockchainConfig` - Configuration to validate

**Returns:** `boolean`

#### `getContractABI()`
Get the AssetRegistry contract ABI.

**Returns:** `ContractAbi`

## Database Schema

### BlockchainEvent Model

```prisma
model BlockchainEvent {
  id                String   @id @default(cuid())
  assetId           String
  eventType         String
  eventHash         String   @unique
  transactionHash   String   @unique
  blockNumber       BigInt?
  performedBy       String
  department        String?
  metadata          Json?
  timestamp         DateTime @default(now())
  verificationStatus String  @default("VERIFIED")
  status            String   @default("SUCCESS")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("blockchain_events")
}
```

## Error Handling

All methods include comprehensive error handling:

```typescript
try {
  const result = await web3Provider.sendTransaction('recordEvent', [
    assetId, eventType, eventHash, performer, metadata
  ]);
  console.log('Success:', result.transactionHash);
} catch (error) {
  console.error('Transaction failed:', error.message);
  // Handle error appropriately
}
```

## Initialization in Express App

Add to `src/index.ts`:

```typescript
import { getWeb3Provider } from './blockchain';

async function startServer() {
  // Initialize Web3 provider
  try {
    const web3Provider = getWeb3Provider();
    await web3Provider.initialize();
    console.log('✓ Web3 provider initialized');
  } catch (error) {
    console.error('✗ Web3 initialization failed:', error);
    // Decide if app should continue without blockchain
  }

  // Start Express server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
```

## Testing

Before using the Web3 provider:

1. Start Hardhat local node:
   ```bash
   npm run blockchain:node
   ```

2. Deploy the AssetRegistry contract:
   ```bash
   npm run blockchain:deploy
   ```

3. Copy the contract address to `.env`:
   ```bash
   BLOCKCHAIN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

4. Run migrations to create the blockchain_events table:
   ```bash
   npm run db:migrate
   ```

## Production Considerations

1. **Private Key Security**: Never commit private keys. Use environment variables or a secrets manager.

2. **Gas Management**: Monitor gas prices and adjust `BLOCKCHAIN_GAS_PRICE` accordingly.

3. **Error Recovery**: Implement retry logic for failed transactions.

4. **Event Sync**: Ensure blockchain events are synced with the database.

5. **Monitoring**: Log all blockchain interactions for audit purposes.

6. **Network Selection**: Update `BLOCKCHAIN_RPC_URL` and `BLOCKCHAIN_CHAIN_ID` for mainnet/testnet.
