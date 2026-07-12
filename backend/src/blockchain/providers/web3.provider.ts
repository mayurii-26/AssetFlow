/**
 * Web3 Provider Service
 * 
 * Singleton class for managing Web3 connections and contract interactions.
 */

import { Web3, Contract, ContractAbi } from 'web3';
import { 
  getBlockchainConfig, 
  getContractABI, 
  validateBlockchainConfig,
  BlockchainConfig 
} from '../config/blockchain.config';

/**
 * Transaction options interface
 */
export interface TransactionOptions {
  from?: string;
  gas?: number;
  gasPrice?: string;
  value?: string;
}

/**
 * Transaction result interface
 */
export interface TransactionResult {
  transactionHash: string;
  blockNumber?: number;
  status: boolean;
  gasUsed?: number;
  effectiveGasPrice?: number;
}

/**
 * Web3Provider - Singleton class for blockchain interactions
 */
export class Web3Provider {
  private static instance: Web3Provider | null = null;
  private web3: Web3 | null = null;
  private contract: Contract<ContractAbi> | null = null;
  private config: BlockchainConfig | null = null;
  private isInitialized = false;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): Web3Provider {
    if (!Web3Provider.instance) {
      Web3Provider.instance = new Web3Provider();
    }
    return Web3Provider.instance;
  }

  /**
   * Initialize the Web3 provider and connect to RPC
   * @throws {Error} If initialization fails
   */
  public async initialize(): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('Web3Provider already initialized');
        return;
      }

      // Load configuration
      this.config = getBlockchainConfig();

      // Validate configuration
      if (!validateBlockchainConfig(this.config)) {
        throw new Error('Invalid blockchain configuration');
      }

      // Initialize Web3 instance
      this.web3 = new Web3(this.config.rpcUrl);

      // Test connection
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to blockchain RPC');
      }

      // Initialize contract only if address is configured
      if (this.config.contractAddress) {
        const abi = getContractABI();
        this.contract = new this.web3.eth.Contract(
          abi as ContractAbi,
          this.config.contractAddress
        );
        console.log(`Contract address: ${this.config.contractAddress}`);
      } else {
        console.warn('BLOCKCHAIN_CONTRACT_ADDRESS not set — contract calls disabled. Deploy the contract and set the address in .env to enable on-chain recording.');
      }

      this.isInitialized = true;
      console.log('Web3Provider initialized successfully');
      console.log(`Connected to chain ID: ${this.config.chainId}`);
    } catch (error) {
      this.isInitialized = false;
      console.error('Web3Provider initialization error:', error);
      throw new Error(
        `Failed to initialize Web3Provider: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Test blockchain connection
   */
  private async testConnection(): Promise<boolean> {
    try {
      if (!this.web3) {
        return false;
      }
      
      const chainId = await this.web3.eth.getChainId();
      console.log(`Connected to blockchain with chain ID: ${chainId}`);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get the Web3 instance
   * @throws {Error} If provider is not initialized
   */
  public getWeb3(): Web3 {
    if (!this.isInitialized || !this.web3) {
      throw new Error('Web3Provider not initialized. Call initialize() first.');
    }
    return this.web3;
  }

  /**
   * Get the AssetRegistry contract instance
   * @throws {Error} If provider is not initialized
   */
  public getContract(): Contract<ContractAbi> {
    if (!this.isInitialized || !this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }
    return this.contract;
  }

  /**
   * Get the current account/signer
   * @returns Account address or null if no private key configured
   */
  public async getAccount(): Promise<string | null> {
    try {
      if (!this.isInitialized || !this.web3 || !this.config) {
        throw new Error('Web3Provider not initialized');
      }

      // If private key is configured, derive account from it
      if (this.config.privateKey) {
        const account = this.web3.eth.accounts.privateKeyToAccount(this.config.privateKey);
        return account.address;
      }

      // Otherwise, try to get the first account from the provider
      const accounts = await this.web3.eth.getAccounts();
      if (accounts && accounts.length > 0) {
        return accounts[0];
      }

      return null;
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  /**
   * Send a transaction with error handling
   * @param method Contract method to call
   * @param params Method parameters
   * @param options Transaction options
   * @returns Transaction result
   */
  public async sendTransaction(
    method: string,
    params: any[],
    options?: TransactionOptions
  ): Promise<TransactionResult> {
    try {
      if (!this.isInitialized || !this.web3 || !this.contract || !this.config) {
        throw new Error('Web3Provider not initialized');
      }

      // Get account
      const fromAccount = options?.from || await this.getAccount();
      if (!fromAccount) {
        throw new Error('No account available for transaction');
      }

      // Prepare transaction options
      const txOptions: TransactionOptions = {
        from: fromAccount,
        gas: options?.gas || this.config.gasLimit,
        gasPrice: options?.gasPrice || this.config.gasPrice,
        value: options?.value || '0',
      };

      console.log(`Sending transaction: ${method}(${params.join(', ')})`);

      // Get the contract method
      const contractMethod = (this.contract.methods as any)[method];
      if (!contractMethod) {
        throw new Error(`Method ${method} not found on contract`);
      }

      // Send transaction
      const receipt = await contractMethod(...params).send(txOptions);

      console.log(`Transaction successful: ${receipt.transactionHash}`);

      return {
        transactionHash: receipt.transactionHash as string,
        blockNumber: receipt.blockNumber ? Number(receipt.blockNumber) : undefined,
        status: receipt.status === BigInt(1) || receipt.status === true,
        gasUsed: receipt.gasUsed ? Number(receipt.gasUsed) : undefined,
        effectiveGasPrice: receipt.effectiveGasPrice ? Number(receipt.effectiveGasPrice) : undefined,
      };
    } catch (error) {
      console.error(`Transaction error for ${method}:`, error);
      throw new Error(
        `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Call a view/pure contract method (no transaction)
   * @param method Contract method to call
   * @param params Method parameters
   * @returns Method result
   */
  public async call(method: string, params: any[]): Promise<any> {
    try {
      if (!this.isInitialized || !this.contract) {
        throw new Error('Web3Provider not initialized');
      }

      console.log(`Calling view method: ${method}(${params.join(', ')})`);

      // Get the contract method
      const contractMethod = (this.contract.methods as any)[method];
      if (!contractMethod) {
        throw new Error(`Method ${method} not found on contract`);
      }

      // Call method
      const result = await contractMethod(...params).call();

      return result;
    } catch (error) {
      console.error(`Call error for ${method}:`, error);
      throw new Error(
        `Contract call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get current block number
   */
  public async getBlockNumber(): Promise<number> {
    try {
      if (!this.isInitialized || !this.web3) {
        throw new Error('Web3Provider not initialized');
      }

      const blockNumber = await this.web3.eth.getBlockNumber();
      return Number(blockNumber);
    } catch (error) {
      console.error('Error getting block number:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  public async getTransactionReceipt(txHash: string) {
    try {
      if (!this.isInitialized || !this.web3) {
        throw new Error('Web3Provider not initialized');
      }

      return await this.web3.eth.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Check if provider is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    if (Web3Provider.instance) {
      Web3Provider.instance.isInitialized = false;
      Web3Provider.instance.web3 = null;
      Web3Provider.instance.contract = null;
      Web3Provider.instance.config = null;
      Web3Provider.instance = null;
    }
  }
}

// Export singleton instance getter
export const getWeb3Provider = () => Web3Provider.getInstance();
