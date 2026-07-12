# AssetFlow Blockchain Infrastructure

On-chain audit trail powered by Hardhat and Solidity.

## Setup

```bash
cd backend/blockchain
npm install
```

## Development Workflow

### 1. Start local blockchain node
```bash
npm run node
```
This starts a Hardhat node on `http://localhost:8545` with chainId `31337`.

### 2. Compile contracts
```bash
npm run compile
```

### 3. Deploy AssetRegistry contract
```bash
npm run deploy
```
Save the deployed contract address to `.env`:
```
BLOCKCHAIN_CONTRACT_ADDRESS=0x...
```

## Smart Contract

**AssetRegistry.sol** — Immutable event log for asset lifecycle tracking.

### Functions

- `recordEvent(assetId, eventType, eventHash, performer, metadata)` — Write a new event to the chain
- `getAssetHistory(assetId)` — Retrieve all events for an asset
- `verifyHash(assetId, eventHash)` — Verify if a hash exists in asset history
- `getEventCount(assetId)` — Get total event count

### Events

- `AssetEventRecorded` — Emitted when a new event is recorded

## Integration

Use `web3` or `ethers.js` from your Express backend to interact with the deployed contract.

Example:
```typescript
import Web3 from 'web3';

const web3 = new Web3('http://localhost:8545');
const contract = new web3.eth.Contract(ABI, contractAddress);

await contract.methods.recordEvent(
  'ASSET_001',
  'ALLOCATED',
  eventHash,
  userId,
  metadata
).send({ from: account });
```
