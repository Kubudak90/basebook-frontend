export interface Token {
  symbol: string;
  name: string;
  logo: string; // Emoji or URL
  address: string;
  decimals: number;
}

export interface Bin {
  id: number;
  price: number;
  liquidityX: number;
  liquidityY: number;
  isCurrent: boolean;
}

export interface Pool {
  id: string;
  tokenX: Token;
  tokenY: Token;
  binStep: number;
  activeBinId: number;
  tvl: number;
  volume24h: number;
  apr: number;
}

export interface UserBinPosition {
  binId: number;
  amountX: number;
  amountY: number;
  priceMin: number;
  priceMax: number;
  isCurrent: boolean;
}

export enum LiquidityShape {
  SPOT = 'Spot',
  CURVE = 'Curve',
  BID_ASK = 'Bid-Ask',
  WIDE = 'Wide'
}