import { Token, Pool } from './types';

export const TOKENS: Record<string, Token> = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
  },
  BRETT: {
    symbol: 'BRETT',
    name: 'Brett',
    logo: 'https://assets.coingecko.com/coins/images/35560/standard/brett.png',
    address: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
    decimals: 18,
  },
  DEGEN: {
    symbol: 'DEGEN',
    name: 'Degen',
    logo: 'https://assets.coingecko.com/coins/images/34526/standard/degen.jpeg',
    address: '0x4ed4E862860bED51a9570b96d89aF5E1B0Efefed',
    decimals: 18,
  }
};

export const POOLS: Pool[] = [
  {
    id: 'ETH-USDC',
    tokenX: TOKENS.ETH,
    tokenY: TOKENS.USDC,
    binStep: 10, // 0.1%
    activeBinId: 8388608, // Center ID for Trader Joe math usually
    tvl: 5240000,
    volume24h: 1200000,
    apr: 12.5
  },
  {
    id: 'BRETT-ETH',
    tokenX: TOKENS.BRETT,
    tokenY: TOKENS.ETH,
    binStep: 20, // 0.2%
    activeBinId: 8388608,
    tvl: 890000,
    volume24h: 450000,
    apr: 45.2
  },
  {
    id: 'DEGEN-ETH',
    tokenX: TOKENS.DEGEN,
    tokenY: TOKENS.ETH,
    binStep: 25,
    activeBinId: 8388608,
    tvl: 120000,
    volume24h: 80000,
    apr: 88.9
  }
];

// Helper to calculate price from Bin ID (Simplified for visualization)
// Price = (1 + binStep / 10000) ^ (binId - activeBinId) * currentPrice
export const calculatePriceFromBin = (binId: number, activeId: number, currentPrice: number, binStep: number): number => {
  const power = binId - activeId;
  const base = 1 + (binStep / 10000);
  return currentPrice * Math.pow(base, power);
};