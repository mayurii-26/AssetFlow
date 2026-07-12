/**
 * Blockchain Configuration Service
 * 
 * Provides type-safe access to blockchain environment variables and contract ABI.
 */

/**
 * Blockchain configuration interface
 */
export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  contractAddress: string | null;
  privateKey?: string;
  gasLimit?: number;
  gasPrice?: string;
}

/**
 * Contract ABI for AssetRegistry
 * This will be auto-generated after contract compilation.
 * For now, we define the core interface manually.
 */
export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'assetId', type: 'string' },
      { internalType: 'string', name: 'eventType', type: 'string' },
      { internalType: 'string', name: 'eventHash', type: 'string' },
      { internalType: 'string', name: 'performer', type: 'string' },
      { internalType: 'string', name: 'metadata', type: 'string' },
    ],
    name: 'recordEvent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'assetId', type: 'string' }],
    name: 'getAssetHistory',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'assetId', type: 'string' },
          { internalType: 'string', name: 'eventType', type: 'string' },
          { internalType: 'string', name: 'eventHash', type: 'string' },
          { internalType: 'string', name: 'performer', type: 'string' },
          { internalType: 'string', name: 'metadata', type: 'string' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        internalType: 'struct AssetRegistry.AssetEvent[]',
        name: 'events',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'assetId', type: 'string' },
      { internalType: 'string', name: 'eventHash', type: 'string' },
    ],
    name: 'verifyHash',
    outputs: [{ internalType: 'bool', name: 'exists', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'assetId', type: 'string' }],
    name: 'getEventCount',
    outputs: [{ internalType: 'uint256', name: 'count', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'string', name: 'assetId', type: 'string' },
      { indexed: false, internalType: 'string', name: 'eventType', type: 'string' },
      { indexed: false, internalType: 'string', name: 'eventHash', type: 'string' },
      { indexed: false, internalType: 'string', name: 'performer', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'AssetEventRecorded',
    type: 'event',
  },
] as const;

/**
 * Get blockchain configuration from environment variables
 * @throws {Error} If required environment variables are missing
 */
export function getBlockchainConfig(): BlockchainConfig {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
  const chainId = process.env.BLOCKCHAIN_CHAIN_ID;
  const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS ?? null;

  if (!rpcUrl) {
    throw new Error('BLOCKCHAIN_RPC_URL environment variable is not set');
  }

  if (!chainId) {
    throw new Error('BLOCKCHAIN_CHAIN_ID environment variable is not set');
  }

  const parsedChainId = parseInt(chainId, 10);
  if (isNaN(parsedChainId)) {
    throw new Error('BLOCKCHAIN_CHAIN_ID must be a valid number');
  }

  return {
    rpcUrl,
    chainId: parsedChainId,
    contractAddress,
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
    gasLimit: process.env.BLOCKCHAIN_GAS_LIMIT
      ? parseInt(process.env.BLOCKCHAIN_GAS_LIMIT, 10)
      : 3000000,
    gasPrice: process.env.BLOCKCHAIN_GAS_PRICE,
  };
}

/**
 * Validate blockchain configuration
 * @param config Blockchain configuration to validate
 * @returns True if configuration is valid
 */
export function validateBlockchainConfig(config: BlockchainConfig): boolean {
  try {
    if (!config.rpcUrl || !config.rpcUrl.startsWith('http')) {
      console.error('Invalid RPC URL');
      return false;
    }

    if (!config.chainId || config.chainId < 1) {
      console.error('Invalid chain ID');
      return false;
    }

    if (!config.contractAddress || !config.contractAddress.startsWith('0x')) {
      console.error('Invalid contract address');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Configuration validation error:', error);
    return false;
  }
}

/**
 * Get contract ABI
 * In production, this would import from compiled artifacts.
 * For now, returns the manually defined ABI.
 */
export function getContractABI() {
  return CONTRACT_ABI;
}
