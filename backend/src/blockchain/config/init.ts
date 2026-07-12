/**
 * Web3 Initialization Helper
 * 
 * Use this to initialize the Web3 provider in your Express app.
 */

import { getWeb3Provider } from '../providers/web3.provider';

/**
 * Initialize Web3 provider with error handling
 * @param required If true, will throw error on failure. If false, logs warning and continues.
 * @returns Promise<boolean> - True if initialized successfully
 */
export async function initializeWeb3(required = false): Promise<boolean> {
  try {
    console.log('🔗 Initializing Web3 provider...');
    
    const web3Provider = getWeb3Provider();
    await web3Provider.initialize();
    
    const account = await web3Provider.getAccount();
    console.log('✓ Web3 provider initialized');
    console.log(`  Account: ${account || 'No account configured'}`);
    
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (required) {
      console.error('✗ Web3 initialization failed (required):', message);
      throw error;
    } else {
      console.warn('⚠ Web3 initialization failed (optional):', message);
      console.warn('  Application will continue without blockchain features');
      return false;
    }
  }
}

/**
 * Check if Web3 provider is ready
 * @returns boolean
 */
export function isWeb3Ready(): boolean {
  try {
    const web3Provider = getWeb3Provider();
    return web3Provider.isReady();
  } catch {
    return false;
  }
}

/**
 * Middleware to check if Web3 is available
 * Use this in routes that require blockchain functionality
 */
export function requireWeb3(req: any, res: any, next: any) {
  if (!isWeb3Ready()) {
    return res.status(503).json({
      success: false,
      error: 'Blockchain service unavailable',
      message: 'Web3 provider is not initialized',
    });
  }
  next();
}
